const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const bucket = require('../FileStorage');
const db = require('../dbConnect');
const { DateTime } = require("luxon");

router.get('/GetManageAdmin', jsonParser, (req, res) => {

    let adminData = [];
    let picture_url = [];

    (async () => {
        try {
            await GetManageAdmin();
            SendValue();
        } catch (error) {
            res.json({ status: 'Error in get manage admin data', message: error });
        }
    })();

    async function GetManageAdmin() {
        return new Promise(async (resolve, reject) => {
            try {

                const adminInfo = await queryAsync(
                    "SELECT userID,CONCAT(name,' ',surname) real_name,username,picture FROM member WHERE user_status=2; "
                );

                adminData = adminInfo;

                let picture_locate = [];

                for (let i = 0; i < adminInfo.length; i++) {
                    picture_locate.push(adminInfo[i].picture);
                }

                //Get picture url
                let pic_url = await GetUrl(picture_locate);
                picture_url = pic_url;

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

        try {
            //Get date from luxon and calculate date expire in 7 day 
            let currentDt = DateTime.now();
            const initialDate = DateTime.fromISO(currentDt);
            const newDate = initialDate.plus({ days: 7 });
            const formattedDate = newDate.toFormat('MM-dd-yyyy');

            let pic_url = [];

            //Get picture url from firebase storage
            for (const fileName of pictureURL) {
                const file = bucket.file(fileName);
                const [signedUrl] = await file.getSignedUrl({
                    action: 'read',
                    expires: formattedDate
                });
        
                pic_url.push(signedUrl);
            }

            return pic_url;

        } catch (err) {
            throw err;
        }
        
    }

    function SendValue() {
        let newData = [];

        for (let i = 0; i < adminData.length; i++) {
            newData.push({ status: 'ok', userID: adminData[i].userID, real_name: adminData[i].real_name, username: adminData[i].username, picture_locate: adminData[i].picture, url: picture_url[i] });
        };

        res.json({ status: 'ok', results: newData });
    }

});

module.exports = router;