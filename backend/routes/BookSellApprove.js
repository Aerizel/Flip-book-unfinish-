const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const bucket = require('../FileStorage');
const db = require('../dbConnect');
const { DateTime } = require("luxon");

router.get('/GetBookRequestSell', jsonParser ,(req,res)=>{

    let all_info = [];
    let user_pic = [];
    
    db.execute(
        //Select procedure manage book from database
        "SELECT T1.bookID,T1.bookname,T1.picture,T1.sell_approve_date,T2.username "+
        "FROM ebook T1 INNER JOIN member T2 ON T1.userID=T2.userID WHERE T1.status=4;",
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

            //Format date to DD/MM/YYYY
            const dateFormat = new Date(value.sell_approve_date);
            const convertDate = String(dateFormat.getDate()).padStart(2, '0')+"/"+String(dateFormat.getMonth() + 1).padStart(2, '0')+"/"+dateFormat.getFullYear();
            const up_time = convertDate;

            const AddData = {bookID: value.bookID, bookcover: user_pic[index], bookname: value.bookname, sell_approve_date: up_time, username: value.username};
            newData.push(AddData);

        });

        res.json({status: 'ok', result: newData});        
    }
     
});



module.exports = router;