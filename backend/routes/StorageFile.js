const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const bucket = require('../FileStorage');
const { DateTime } = require("luxon");

router.post('/GetStorageFile', jsonParser , async (req,res)=>{
    
    //Get date from luxon and calculate date expire in 7 day 
    let currentDt = DateTime.now();
    const initialDate = DateTime.fromISO(currentDt);
    const newDate = initialDate.plus({ days: 7 });
    const formattedDate = newDate.toFormat('MM-dd-yyyy');

    const imageURL = req.body.imageURL;
    const imagefile = imageURL;
    const arrLength = imagefile.length;
    const fileURL = [];

    //Check request file from frontend that have more then one file or not
    if(arrLength == 1) {
        //Get picture url from firebase storage
        const file = bucket.file(imagefile.toString());
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: formattedDate
        });
        
        fileURL.push(signedUrl);

        res.json({status: 'ok' ,imageURL: fileURL});

    } else {
        //Get picture url from firebase storage
        for (const fileName of imagefile) {
            const file = bucket.file(fileName);
            const [signedUrl] = await file.getSignedUrl({
              action: 'read',
              expires: formattedDate
            });
        
            fileURL.push(signedUrl);
        }

        res.json({status: 'ok' ,imageURL: fileURL});
    }
     
});

router.post('/GetPdfFile', jsonParser , async (req,res)=>{

    const file = bucket.file(req.body.pdfURL);

    try {
        file.download().then(downloadResponse => {
            //res.json({status: 'ok' ,pdffile: downloadResponse[0]});
            res.send(downloadResponse[0]);
        });        
    } catch (error) {
        //res.json({status: 'error' ,message: error});
        res.send(error);
    }

});

module.exports = router;