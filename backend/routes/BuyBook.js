const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bucket = require('../FileStorage');
const jsonParser = bodyParser.json();
const db = require('../dbConnect');
const { DateTime } = require("luxon");

router.post('/GetBuyBook', jsonParser ,(req,res) => {

    let bookProfile = [];
    let pic_url = [];

    db.query("SELECT bookname,price,picture FROM ebook WHERE bookID=?",
    [req.body.bookID],
    (err,results) => {
        if (err) {
            res.json({status: 'ErrorDB', message: err});
        } else {

            let pic_locate = [];

            results.forEach((value) => {
                pic_locate.push(value.picture);
            });

            bookProfile = results;
            GetPictureURL(pic_locate);
        }
    });

    async function GetPictureURL(pictureURL) {

        //Get date from luxon and calculate date expire in 7 day 
        let currentDt = DateTime.now();
        const initialDate = DateTime.fromISO(currentDt);
        const newDate = initialDate.plus({ days: 7 });
        const formattedDate = newDate.toFormat('MM-dd-yyyy');

        //Get picture url from firebase storage
        for (const fileName of pictureURL) {
            const file = bucket.file(fileName);
            const [signedUrl] = await file.getSignedUrl({
              action: 'read',
              expires: formattedDate
            });
        
            pic_url.push(signedUrl);
        }
        
        SendValue();
    }

    function SendValue() {

        let newData = [];

        //Combine all data into one array
        for(i=0; i<bookProfile.length; i++) {
            const AddData = [{bookname: bookProfile[i].bookname, price: bookProfile[i].price, image: pic_url[i]}];
            newData = AddData;
        }
    
        res.json({status:'ok', results: newData});
    }

});

module.exports = router;