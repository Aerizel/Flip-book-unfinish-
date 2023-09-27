const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const db = require('../dbConnect');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const myth = 'after-login';
const bucket = require('../FileStorage');
const { DateTime } = require("luxon");

router.post('/CheckToken', jsonParser ,(req,res)=>{
    
    //Check token from fontend that is still valid or not
    try{
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token, myth);
        res.json({status: 'ok' , decoded});
    }catch(err) {
        res.json({status: 'error', message: err})
    }
     
});

router.post('/GetIDUser', jsonParser ,(req,res)=>{
    
    db.execute(
        //Select user data from database
        "SELECT userID FROM member WHERE email=?",
        [req.body.email],
        function(err, result, fields) {
            if(err) {
                res.json({status:'error db',message: err})
                return
            }
            
            res.json({status: 'ok',result: result[0].userID});
        }
    );
     
});

router.post('/GetProfileComment', jsonParser ,(req,res)=>{
    
    db.execute(
        //Select user data from database
        "SELECT userID,username,picture FROM member WHERE email=?",
        [req.body.email],
        function(err, results, fields) {
            if(err) {
                res.json({status:'error db',message: err})
                return
            }

            GetUserImage(results[0].picture);

            async function GetUserImage(imageLocation) {
                try {
                    //Get date from luxon and calculate date expire in 7 day 
                    let currentDt = DateTime.now();
                    const initialDate = DateTime.fromISO(currentDt);
                    const newDate = initialDate.plus({ days: 7 });
                    const formattedDate = newDate.toFormat('MM-dd-yyyy');
        
                    const imageURL = imageLocation;
                    const imagefile = imageURL;
        
                    //console.log(imagefile);
                    //Get picture url from firebase storage
                    const file = bucket.file(imagefile);
                    const [signedUrl] = await file.getSignedUrl({
                        action: 'read',
                        expires: formattedDate
                    });
                    
                    const url = signedUrl;
                    sendback(url);
                    
                } catch (error) {
                    res.json({status:'error get img',message: error});
                }
                
            }
        
            function sendback(url) {
                res.json({status: 'ok' , userID: results[0].userID, username: results[0].username, url: url});
            }
        }
    );
     
});

router.post('/NevSideProfile', jsonParser , (req,res)=>{

    let username = '';
    let real_name = '';
    let url = '';
    let user_status = 0;

    //Check token from fontend that is still valid or not
    try{
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, myth);

        db.execute(
            //Select user data from database
            "SELECT username,name,surname,picture,user_status FROM member WHERE email=?; ",
            [decoded.email],
            function(err, result, fields) {
                if(err) {
                    res.json({status:'error db',message: err});
                    return
                }

                //concatenate name and surname into one
                real_name = result[0].name+' '+result[0].surname;
                username = result[0].username;
                user_status = result[0].user_status;
                const imageLocation = result[0].picture;

                GetUserImage(imageLocation);
            }
        );

    }catch(err) {
        res.json({status: 'error', message: err})
    }

    async function GetUserImage(imageLocation) {
        try {
            //Get date from luxon and calculate date expire in 7 day 
            let currentDt = DateTime.now();
            const initialDate = DateTime.fromISO(currentDt);
            const newDate = initialDate.plus({ days: 7 });
            const formattedDate = newDate.toFormat('MM-dd-yyyy');

            const imageURL = imageLocation;
            const imagefile = imageURL;

            //console.log(imagefile);
            //Get picture url from firebase storage
            const file = bucket.file(imagefile);
            const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: formattedDate
            });
            
            url = signedUrl;
            sendback();
            
        } catch (error) {
            res.json({status:'error get img',message: error});
        }
        
    }

    function sendback() {
        res.json({status: 'ok' , username: username, real_name: real_name, url: url, user_status: user_status});
    }
    
});

/*router.post('/NevSideProfile', jsonParser , (req,res)=>{


    let real_name = '';
     
    db.execute(
        //Select user data from database
        "SELECT username,name,surname,picture FROM member WHERE email=?",
        [req.body.email],
        function(err, result, fields) {
            if(err) {
                res.json({status:'error db',message: err})
                return
            }

            //concatenate name and surname into one
            real_name = result[0].name+' '+result[0].surname;
            res.json({username: result[0].username, name: real_name, picture: result[0].picture});
        }
    );
});*/

router.post('/CheckPassword', jsonParser ,(req,res) => {

    db.execute(
        //Find a accont in database
        "SELECT password FROM member WHERE email=?",
        [req.body.email],
        function(err, member, fields) {
            if(err) {
                res.json({status:'error',message: err})
                return
            }
            if(member.length==0) {
                res.json({status:'NonUser',message: 'no user that match the name was found.'})
                return
            }

            //Decrpt password and compare to the orther one from input fontend
            bcrypt.compare(req.body.password, member[0].password, function(err, correct) {
                if(correct){
                    res.json({status: 'ok'});
                } else {
                    res.json({status: 'WrongPwd'});
                }
                
            });
        }
    );

});

module.exports = router;