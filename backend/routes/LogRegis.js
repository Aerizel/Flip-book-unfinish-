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

const upload = multer({dest:''});

router.post('/Regis', upload.single('pic') ,(req,res)=>{

    let pic = 'PicProfile/default.png';

    //Check if picture has upload or not
    if(req.file) {
        //Upload user profile picture into firebase cloud
        const folder = 'PicProfile';
        const fileName = `${folder}/${Date.now()}`;
        const fileUpload = bucket.file(fileName);
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: req.file.mimetype
            }
        });

        blobStream.on('error',(err) => {
            res.json({status:'error',message: err});
        });

        blobStream.on('finish',() => {
            InsertDB();
        });

        blobStream.end(req.file.buffer);
        
        pic = fileName;
    }

    function InsertDB() {
        //Encrypt user password
        bcrypt.hash(req.body.pwd, saltRounds, function(err, hash) {
            //Insert register data into database
            let bank_name = null;
            let bank_serial = null;
            
            if(req.body.bankname!='null' && req.body.bankserial!='null'){
                bank_name = req.body.bankname;
                bank_serial = req.body.bankserial;
            }

            //Insert register data into database
            db.execute(
                "INSERT INTO member (name,surname,username,birthdate,email,password,bank_name,bank_serial,picture,user_status,nofi_status) VALUES(?,?,?,?,?,?,?,?,?,1,1)",
                [req.body.name,req.body.surname,req.body.username,req.body.birthdate,req.body.email,hash,bank_name,bank_serial,pic],
                function(err, results, fields) {
                    if(err) {
                        res.json({status:'error',message: err});
                        return
                    }
                    res.json({status: 'ok'});
                }
            );
        });
    }

});

router.post('/Login',(req,res)=>{

    db.execute(
        //Find a accont in database
        "SELECT * FROM member WHERE username=?",
        [req.body.user],
        function(err, member, fields) {
            if(err) {
                res.json({status:'error',message: err})
                return
            }

            //Check if user were found or not
            if(member.length==0) {
                res.json({status:'NonUser',message: 'no user that match the name was found.'})
                return
            } else {
                //Decrpt password and compare to the orther one from input fontend
                bcrypt.compare(req.body.password, member[0].password, function(err, login) {
                    if(login){
                        //Create token and send back to fontend
                        let token = jwt.sign({ email: member[0].email }, myth ,{ expiresIn: '7d' });
                        res.json({status: 'ok', message: 'login success', token: token, userstatus: member[0].user_status});
                    } else {
                        res.json({status: 'WrongPwd', message: 'login fail'});
                    }
                    
                });
            }    
        }
    );
});

router.post('/AddAdmin', upload.single('pic') ,(req,res)=>{

    let pic = 'PicProfile/default.png';

    //Check if picture has upload or not
    if(req.file) {
        //Upload user profile picture into firebase cloud
        const folder = 'PicProfile';
        const fileName = `${folder}/${Date.now()}`;
        const fileUpload = bucket.file(fileName);
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: req.file.mimetype
            }
        });

        blobStream.on('error',(err) => {
            console.log('error: '+err);
        });

        blobStream.on('finish',() => {
            InsertDB();
        });

        blobStream.end(req.file.buffer);
        
        pic = fileName;
    }

    function InsertDB() {

        //Encrypt user password
        bcrypt.hash(req.body.pwd, saltRounds, function(err, hash) {

            //Insert register data into database
            db.execute(
                "INSERT INTO member (name,surname,username,birthdate,email,password,picture,user_status,nofi_status) VALUES(?,?,?,?,?,?,?,2,1)",
                [req.body.name,req.body.surname,req.body.username,req.body.birthdate,req.body.email,hash,pic],
                function(err, results, fields) {
                    if(err) {
                        res.json({status:'error',message: err})
                        return
                    }
                    res.json({status: 'ok'});
                }
            );
        });
    }
});

module.exports = router;