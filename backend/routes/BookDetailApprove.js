const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const bucket = require('../FileStorage');
const db = require('../dbConnect');
const { DateTime } = require("luxon");

router.post('/GetBookDetailApprove', jsonParser ,(req,res) => {

    let bookProfile = [];
    let book_age = '';
    let pic_url = '';
    let bookContent = [];

    db.execute(
        "SELECT T1.bookname,T2.name typename,T1.writer,T1.artist,T1.translator,T1.description,T1.price,T1.sell_price,T1.due_sell,T1.age_restrict,T1.picture book_pic,T1.upload_date "+
        "FROM ebook T1 INNER JOIN book_type T2 ON T1.typeID=T2.typeID WHERE T1.bookID=?; ",
        [req.body.bookID],
        function(err, results, fields) {
            if(err) {
                res.json({status:'ErrorDB',message: err})
                return
            }

            //Get age restrict from db than compare and change to text
            const age = results[0].age_restrict;

            if (age>=18) {
                book_age = "ตั้งแต่ 18 ปีขึ้นไป";
            } else if(age>=12) {
                book_age = "ตั้งแต่ 12 ปีขึ้นไป";
            } else if(age>=6) {
                book_age = "ตั้งแต่ 6 ปีขึ้นไป";
            } else {
                book_age = "อ่านได้ทุกวัย";
            }
            
            bookProfile = results[0];
            GetPictureURL(results[0].book_pic);
        }
    );

    async function GetPictureURL(pictureURL) {

        //Get date from luxon and calculate date expire in 7 day 
        let currentDt = DateTime.now();
        const initialDate = DateTime.fromISO(currentDt);
        const newDate = initialDate.plus({ days: 7 });
        const formattedDate = newDate.toFormat('MM-dd-yyyy');

        //Get picture url from firebase storage
        const file = bucket.file(pictureURL);
        const [signedUrl] = await file.getSignedUrl({
          action: 'read',
          expires: formattedDate
        });
    
        pic_url = signedUrl;

    }

    db.execute(
        "SELECT * FROM ebook_content WHERE bookID=?;",
        [req.body.bookID],
        function(err, results, fields) {
            if(err) {
                res.json({status:'ErrorDB',message: err})
                return
            }

            let newData = [];

            //Get chapter detail
           
            results.forEach(value => {
                //Format date to DD/MM/YYYY
                const dateFormat = new Date(value.up_time);
                const convertDate = String(dateFormat.getDate()).padStart(2, '0') + "/" + String(dateFormat.getMonth() + 1).padStart(2, '0') + "/" + dateFormat.getFullYear();
                const up_time = convertDate;

                const AddData = { chID: value.chID, chapter: value.ep, title: value.name, date: up_time, file: value.file };
                newData.push(AddData);
            });

            bookContent = newData;

            SendValue();
        }
    );

    function SendValue() {
        res.json({status:'ok', bookProfile: bookProfile, picURL: pic_url , bookStatus: 'ขอวางขาย', ageTxt: book_age, bookContent: bookContent});
    }
});

router.post('/SellApprove', jsonParser ,(req,res)=>{

    //Update book status in database
    db.execute(
        "UPDATE ebook SET status=5 WHERE bookID=?;",
        [req.body.bookID],
        function(err, result, fields) {
            if(err) {
                res.json({status:'error db',message: err})
                return
            }
            
            res.json({status: 'ok'});
        }
    );
});

router.post('/SellNotApprove', jsonParser ,(req,res)=>{

    console.log(req.body.bookID+' , '+req.body.reason);

    //Update book status in database
    db.execute(
        "UPDATE ebook SET status=6,message_status=? WHERE bookID=?; ",
        [req.body.reason,req.body.bookID],
        function(err, result, fields) {
            if(err) {
                res.json({status:'error db',message: err});
                return
            }
            
            res.json({status: 'ok'});
        }
    );
});

module.exports = router;