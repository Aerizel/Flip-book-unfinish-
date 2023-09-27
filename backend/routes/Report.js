const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const multer = require('multer');
const bucket = require('../FileStorage');
const db = require('../dbConnect');
const { DateTime } = require("luxon");
const { v4: uuidv4 } = require('uuid');

const upload = multer({dest:''});

router.post('/SendReport', upload.single('pictureEvident') ,(req,res)=> {

    let picture_location = null;
    let other_report_type = null;

    //Check if other report type had value or not
    req.body.otherReport != 'null' ? other_report_type = req.body.otherReport  : '' ;

    //Check if picture evident had upload or not
    if(req.file) {
        
        //Upload picture evident into firebase cloud
        const folder = 'PicEvident';
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
            picture_location = fileName;
            InsertReportIntoDB();
        });

        blobStream.end(req.file.buffer);
    } else {
        InsertReportIntoDB();
    }

    //console.log(req.body.reportType,'+',req.body.userID,'+',other_report_type,'+',req.body.reportDetail,'+',picture_location);

    function InsertReportIntoDB() {
        db.execute(
            //Insert report data into database
            "INSERT INTO report (reporttypeID,userID,other_report_type,detail,pic_e) VALUES(?,?,?,?,?) ",
            [req.body.reportType,req.body.userID,other_report_type,req.body.reportDetail,picture_location],
            function(err, result, fields) {
                if(err) {
                    res.json({status:'error db',message: err});
                    console.log(err);
                    return
                }

                res.json({status:'ok'}) 
            }
        );
    }

});

router.get('/GetReportFromUser', jsonParser ,(req,res)=> {

    let all_info = [];
    let user_pic = [];
    
    db.execute(
        //Select report from database
        "SELECT T1.username,T1.picture,T2.reportID,T2.other_report_type,T2.report_date,T3.typename "+
        "FROM member T1 INNER JOIN report T2 ON T1.userID=T2.userID "+
        "INNER JOIN report_type T3 ON T2.reporttypeID=T3.reporttypeID "+
        "WHERE T2.status=1; ",
        function(err, result, fields) {
            if(err) {
                res.json({status:'error db',message: err});
                return
            }

            if(result.length!=0) {
                all_info = result;
                GetPictureURL(result);
            } else {
                res.json({status:'datanotfound'})
            }  
        }
    );

    async function GetPictureURL(pictureURL) {

        //Get date from luxon and calculate date expire in 7 day 
        let currentDt = DateTime.now();
        const initialDate = DateTime.fromISO(currentDt);
        const newDate = initialDate.plus({ days: 7 });
        const formattedDate = newDate.toFormat('MM-dd-yyyy');

        //Get picture url from firebase storage
        for (const index in pictureURL) {
            if (pictureURL.hasOwnProperty(index)) {
                const file = bucket.file(pictureURL[index].picture);
                const [signedUrl] = await file.getSignedUrl({
                  action: 'read',
                  expires: formattedDate
                });
            
                user_pic.push(signedUrl);
            }
        }

        sendValueBack();
    }

    function sendValueBack() {

        let newData = [];

        all_info.forEach((value,index) => {

            function padTo2Digits(num) {
                return num.toString().padStart(2, '0');
            }

            //Format date to DD/MM/YYYY
            const dateFormat = new Date(value.report_date);
            const convertDate = String(dateFormat.getDate()).padStart(2, '0')+"/"+String(dateFormat.getMonth() + 1).padStart(2, '0')+"/"+dateFormat.getFullYear()+" "+padTo2Digits(dateFormat.getHours())+":"+padTo2Digits(dateFormat.getMinutes())+":"+padTo2Digits(dateFormat.getSeconds());
            const up_time = convertDate;

            const AddData = {reportID: value.reportID, username: value.username, pic_url: user_pic[index], date: up_time, type: value.typename, otherType: value.other_report_type};
            newData.push(AddData);

        });

        res.json({status: 'ok', result: newData});        
    }
     
});

function GetReportDetail(reportID,res) {

    let all_info = [];
    let pic_url = [];
    
    db.execute(
        //Select report from database
        "SELECT T1.username,T1.picture,T2.reportID,T2.other_report_type,T2.detail,T2.pic_e,T2.chat_ch,T2.report_date,T2.status,T3.typename "+
        "FROM member T1 INNER JOIN report T2 ON T1.userID=T2.userID "+
        "INNER JOIN report_type T3 ON T2.reporttypeID=T3.reporttypeID "+
        "WHERE reportID=? AND (T2.status=1 OR T2.status=2); ",
        [reportID],
        function(err, results, fields) {
            if(err) {
                res.json({status:'error db',message: err});
                return
            }

            let picture_location = [];

            all_info = results[0];
            picture_location[0] = results[0].picture;
            if(results[0].pic_e) {
                picture_location[1] = results[0].pic_e;
            } 
            GetPictureURL(picture_location);
        }
    );

    async function GetPictureURL(pictureURL) {

        //Get date from luxon and calculate date expire in 7 day 
        let currentDt = DateTime.now();
        const initialDate = DateTime.fromISO(currentDt);
        const newDate = initialDate.plus({ days: 7 });
        const formattedDate = newDate.toFormat('MM-dd-yyyy');

        //Get picture url from firebase storage
        for (const index in pictureURL) {

            const file = bucket.file(pictureURL[index]);
            const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: formattedDate
            });
            
            pic_url.push(signedUrl);

        }

        sendValueBack();
    }

    function sendValueBack() {

        function padTo2Digits(num) {
            return num.toString().padStart(2, '0');
        }

        //Format date to DD/MM/YYYY
        const dateFormat = new Date(all_info.report_date);
        const convertDate = String(dateFormat.getDate()).padStart(2, '0')+"/"+String(dateFormat.getMonth() + 1).padStart(2, '0')+"/"+dateFormat.getFullYear()+" เวลา "+padTo2Digits(dateFormat.getHours())+":"+padTo2Digits(dateFormat.getMinutes())+":"+padTo2Digits(dateFormat.getSeconds());
        const up_time = convertDate;


        const AddData = {username: all_info.username, pic_user: pic_url[0], reportID: all_info.reportID, detail: all_info.detail, date: up_time, type: all_info.typename, otherType: all_info.other_report_type, reportStatus: all_info.status, pic_e: pic_url[1], chat_ch: all_info.chat_ch};

        res.json({status: 'ok', result: AddData}); 
    }
}


router.post('/GetReportDetail', jsonParser ,(req,res)=> {
     GetReportDetail(req.body.reportID,res);
});

router.post('/CheckReport', jsonParser ,(req,res)=> {

    db.execute(
        //Check if thare are report that are still in process in database
        "SELECT reportID FROM report WHERE userID=? AND (status=1 OR status=2); ",
        [req.body.userID],
        function(err, result, fields) {
            if(err) {
                res.json({status:'error db',message: err});
                return
            }

            //If there are report in process then get report value detail
            if(result.length>0) {
                GetReportDetail(result[0].reportID,res);
            } else {
                res.json({status:'report not found'})
            }
        }
    );
});

router.post('/AcceptReport', jsonParser ,(req,res)=> {
    db.execute(
        //Update report in datebase
        `UPDATE report SET adminID=?,chat_ch='${uuidv4()}',status=2 WHERE reportID=?; `,
        [req.body.adminID,req.body.reportID],
        function(err, result, fields) {
            if(err) {
                res.json({status:'error db',message: err});
                return
            }

            res.json({status:'ok'})
        }
    );
});

router.post('/GetMyReportAccept', jsonParser ,(req,res)=> {

    let all_info = [];
    let user_pic = [];

    db.execute(
        //Select report from database
        "SELECT T1.username,T1.picture,T2.reportID,T2.other_report_type,T2.report_date,T2.status,T3.typename "+
        "FROM member T1 INNER JOIN report T2 ON T1.userID=T2.userID "+
        "INNER JOIN report_type T3 ON T2.reporttypeID=T3.reporttypeID "+
        "WHERE T2.adminID=? AND T2.status<>3; ",
        [req.body.adminID],
        function(err, result, fields) {
            if(err) {
                res.json({status:'error db',message: err});
                return
            }

            if(result.length!=0) {
                all_info = result;
                GetPictureURL(result);
            } else {
                res.json({status:'datanotfound'})
            }  
        }
    );

    async function GetPictureURL(pictureURL) {

        //Get date from luxon and calculate date expire in 7 day 
        let currentDt = DateTime.now();
        const initialDate = DateTime.fromISO(currentDt);
        const newDate = initialDate.plus({ days: 7 });
        const formattedDate = newDate.toFormat('MM-dd-yyyy');

        //Get picture url from firebase storage
        for (const index in pictureURL) {
            if (pictureURL.hasOwnProperty(index)) {
                const file = bucket.file(pictureURL[index].picture);
                const [signedUrl] = await file.getSignedUrl({
                  action: 'read',
                  expires: formattedDate
                });
            
                user_pic.push(signedUrl);
            }
        }

        sendValueBack();
    }

    function sendValueBack() {

        let newData = [];

        all_info.forEach((value,index) => {

            function padTo2Digits(num) {
                return num.toString().padStart(2, '0');
            }

            //Format date to DD/MM/YYYY
            const dateFormat = new Date(value.report_date);
            const convertDate = String(dateFormat.getDate()).padStart(2, '0')+"/"+String(dateFormat.getMonth() + 1).padStart(2, '0')+"/"+dateFormat.getFullYear()+" "+padTo2Digits(dateFormat.getHours())+":"+padTo2Digits(dateFormat.getMinutes())+":"+padTo2Digits(dateFormat.getSeconds());
            const up_time = convertDate;

            const AddData = {reportID: value.reportID, username: value.username, pic_url: user_pic[index], date: up_time, type: value.typename, otherType: value.other_report_type, reportStatus: value.status};
            newData.push(AddData);

        });

        res.json({status: 'ok', result: newData});        
    }
     
});

router.post('/GetMessageReport', jsonParser ,(req,res)=> {

    db.execute(
        //Select message report from datebase
        "SELECT T2.username,T2.user_status status,T1.message,T1.send_time FROM report_chat T1 LEFT JOIN member T2 ON T1.userID=T2.userID WHERE reportID=?;",
        [req.body.reportID],
        function(err, results, fields) {
            if(err) {
                res.json({status:'error db',message: err});
                return
            }

            let newData = [];

            results.forEach((value)=>{
                let username = '';
                
                if(value.status==2) {
                    username = 'Admin';
                } else {
                    username = value.username;
                }

                const AddData = {author: username, message: value.message, time: value.send_time};
                newData.push(AddData);
            });

            res.json({status: 'ok', result: newData}); 
        }
    );
});

router.post('/ReportComplete', jsonParser ,(req,res)=> {
    db.execute(
        //Update report in datebase
        "UPDATE report SET status=3 WHERE reportID=?; ",
        [req.body.reportID],
        function(err, result, fields) {
            if(err) {
                res.json({status:'error db',message: err});
                return
            }

            res.json({status:'ok'})
        }
    );
});

module.exports = router;