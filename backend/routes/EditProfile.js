const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const multer = require('multer');
const bucket = require('../FileStorage');
const db = require('../dbConnect');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const myth = 'after-login';
const { DateTime } = require("luxon");

router.post('/GetUserProfile', jsonParser, (req, res) => {

    db.execute(
        "SELECT name,surname,username,birthdate,email,password,bank_name,bank_serial,picture FROM member WHERE email=?;",
        [req.body.email],
        function (err, results, fields) {
            if (err) {
                res.json({ status: 'ErrorDB', message: err })
                return
            }
            res.json({ status: 'ok', result: results[0] });
        }
    );
});

router.post('/EditProfile', jsonParser, (req, res) => {

    if (req.body.column === 'password') {

        //Encrypt user password
        bcrypt.hash(req.body.value, saltRounds, function (err, hash) {
            db.execute(
                `UPDATE member SET ${req.body.column}=? WHERE email=?;`,
                [hash, req.body.email],
                function (err, results, fields) {
                    if (err) {
                        res.json({ status: 'ErrorDB', message: err });
                        return
                    }

                    res.json({ status: 'ok' });
                }
            );
        });

    } else if (req.body.column === 'delete') {

        db.execute(
            `DELETE FROM member WHERE email=?;`,
            [req.body.email],
            function (err, results, fields) {
                if (err) {
                    res.json({ status: 'ErrorDB', message: err });
                    return
                }
                res.json({ status: 'ok' });
            }
        );

    } else {

        db.execute(
            `UPDATE member SET ${req.body.column}=? WHERE email=?;`,
            [req.body.value, req.body.email],
            function (err, results, fields) {
                if (err) {
                    res.json({ status: 'ErrorDB', message: err });
                    return
                }

                if (req.body.column == 'email') {
                    //Create token and send back to fontend
                    let token = jwt.sign({ email: req.body.value }, myth, { expiresIn: '7d' });
                    res.json({ status: 'ok', token: token });
                } else {
                    res.json({ status: 'ok' });
                }
            }
        );
    }

});

const upload = multer({ dest: '' });

router.post('/UpdateProfilePicture', upload.single('pic'), async (req, res) => {

    let picture = '';
    let fileURL = '';

    if (req.body.oldimage != 'PicProfile/default.png') {

        try {
            await bucket.file(req.body.oldimage).delete();
            UploadProfile();
        } catch (error) {
            if(error.errors[0].reason === 'notFound') {
                UploadProfile();
            } else {
                res.json({ status: 'error', message: error });
            }
        }

    }

    //Upload new user profile picture into firebase cloud
    async function UploadProfile() {

        const folder = 'PicProfile';
        const fileName = `${folder}/${Date.now()}`;
        const fileUpload = bucket.file(fileName);
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: req.file.mimetype
            }
        });

        blobStream.on('error', (err) => {
            res.json({ status: 'error', message: err });
        });

        blobStream.on('finish', () => {
            GetPictureURL();
        });

        blobStream.end(req.file.buffer);

        picture = fileName;

    }

    async function GetPictureURL() {

        //Get date from luxon and calculate date expire in 7 day 
        let currentDt = DateTime.now();
        const initialDate = DateTime.fromISO(currentDt);
        const newDate = initialDate.plus({ days: 7 });
        const formattedDate = newDate.toFormat('MM-dd-yyyy');

        //Get picture url from firebase storage
        const file = bucket.file(picture);
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: formattedDate
        });

        fileURL = signedUrl;
        UpdateDB();
    }

    //Update new picture url in database
    async function UpdateDB() {

        db.execute(
            "UPDATE member SET picture=? WHERE email=?;",
            [picture, req.body.email],
            function (err, results, fields) {
                if (err) {
                    res.json({ status: 'error', message: err })
                    return
                }
                res.json({ status: 'ok', url: fileURL, piclocate: picture });
            }
        );

    }

});

router.post('/GetAdminProfile', jsonParser, (req, res) => {

    let userProfile = {};
    let pic_url = '';

    (async () => {
        try {
            await GetAdminProfile();
            SendValue();
        } catch (error) {
            res.json({ status: 'Error in get admin profile', message: error });
        }
    })();

    async function GetAdminProfile() {

        return new Promise(async (resolve, reject) => {
            try {

                const userinfo = await queryAsync(
                    "SELECT name,surname,username,birthdate,email,picture FROM member WHERE userID=?;",
                    [req.body.email],
                )

                userProfile = userinfo[0];

                pic_url = await GetUrl(userinfo[0].picture);

                resolve();

            } catch (error) {
                reject(error);
            }
        });
    }

    function queryAsync(sql, params) {
        return new Promise((resolve, reject) => {
            db.query(sql, params, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    async function GetUrl(pictureURL) {

        //Get date from luxon and calculate date expire in 7 day 
        let currentDt = DateTime.now();
        const initialDate = DateTime.fromISO(currentDt);
        const newDate = initialDate.plus({ days: 7 });
        const formattedDate = newDate.toFormat('MM-dd-yyyy');

        const imagefile = pictureURL;

        try {
        
            //Get picture url from firebase storage
            const file = bucket.file(imagefile);
            const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: formattedDate
            });

            return signedUrl;

        } catch (err) {
            throw err;
        }
    }

    function SendValue() {
        res.json({ status: 'ok', userProfile: userProfile, url: pic_url });
    }

});

router.post('/DeleteAdmin', jsonParser, async (req, res) => {

    try {
        //Delete pdf file in firebase cloud 
        await bucket.file(req.body.oldfile).delete();
    } catch (error) {
        res.json({status: 'error', message: error});
    }

    db.execute(
        `DELETE FROM member WHERE userID=?;`,
        [req.body.userID],
        function (err, results, fields) {
            if (err) {
                res.json({ status: 'ErrorDB', message: err });
                return
            }
            res.json({ status: 'ok' });
        }
    );

});

module.exports = router;