const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const multer = require('multer');
const bucket = require('../FileStorage');
const db = require('../dbConnect');
const { DateTime } = require("luxon");

router.post('/GetEditBook', jsonParser ,(req,res) => {

    let bookProfile = [];
    let book_status = '';
    let book_age = '';
    let pic_url = '';
    let bookContent = [];
    let nextEp = 0;

    db.execute(
        "SELECT T1.bookname,T2.name typename,T1.writer,T1.artist,T1.translator,T1.description,T1.price,T1.sell_price,T1.due_sell,T1.age_restrict,T1.status,T1.message_status message,T1.picture book_pic,T1.upload_date "+
        "FROM ebook T1 INNER JOIN book_type T2 ON T1.typeID=T2.typeID WHERE T1.bookID=?; ",
        [req.body.bookID],
        function(err, results, fields) {
            if(err) {
                res.json({status:'ErrorDB',message: err})
                return
            }

            const num_status = parseInt(results[0].status);

            //Get book status from db than compare value and change value to text
            if(num_status==1) {
                book_status = 'ส่วนตัว';
            }else if(num_status==2) {
                book_status = 'ยังไม่จบ';
            } else if (num_status==3) {
                book_status = 'จบแล้ว';
            } else if (num_status==4) {
                book_status = 'รออนุมัติเพื่อวางขาย';
            } else if (num_status==5) {
                book_status = 'วางขาย';
            } else if (num_status==6) {
                book_status = 'วางขายไม่สำเร็จ';
            } else if (num_status==7) {
                book_status = 'บล็อก';
            } else {
                book_status = 'none';
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
        "SELECT T1.chID,T1.ep,T1.name,T1.up_time,T1.file,SUM(T2.view) view "+
        "FROM ebook_content T1 LEFT JOIN ebook_view T2 ON T1.chID=T2.chID "+ 
        "WHERE T1.bookID=? "+
        "GROUP BY T1.chID; ",
        [req.body.bookID],
        function(err, results, fields) {
            if(err) {
                res.json({status:'ErrorDB',message: err})
                return
            }

            let newData = [];
            let currentEp = 0;

            //Get chapter detail
            results.forEach(value => {

                let view = 0;
                if(value.view!=null) {
                    view = value.view;
                }

                //Format date to DD/MM/YYYY
                const dateFormat = new Date(value.up_time);
                const convertDate = String(dateFormat.getDate()).padStart(2, '0') + "/" + String(dateFormat.getMonth() + 1).padStart(2, '0') + "/" + dateFormat.getFullYear();
                const up_time = convertDate;

                const AddData = { chID: value.chID, chapter: value.ep, title: value.name, view: view, date: up_time, file: value.file };
                newData.push(AddData);
                currentEp = value.ep;
            });

            //Check book ep that it have only one ep or multiple ep then add number to for next ep  
            currentEp !== 0 ? nextEp = currentEp + 1 : nextEp = 1 ;

            bookContent = newData;

            SendValue();
        }
    );

    function SendValue() {
        res.json({status:'ok', bookProfile: bookProfile, picURL: pic_url , bookStatus: book_status, ageTxt: book_age, bookContent: bookContent, nextep: nextEp});
    }
    
});

const upload = multer({dest:''});

router.post('/EditBookPicture', upload.single('bookcover') ,async (req,res) => {

    try {
        //Delete old bookcover image in firebase cloud 
        await bucket.file(req.body.oldbookcover).delete();

    } catch (error) {
        res.json({status: 'error', message: error});
    }

    //Upload new bookcover image into firebase cloud
    const folder = 'bookcover';
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
        UpdateImageDB();
    });

    blobStream.end(req.file.buffer);

    function UpdateImageDB() {
        db.execute(
            `UPDATE ebook SET picture=? WHERE bookID=?;`,
            [fileName,req.body.bookID],
            function(err, results, fields) {
                if(err) {
                    res.json({status:'ErrorDB',message: err})
                    return
                }
                
                //Get bookcover url and file location from database then send back to frontend
                db.execute(
                    `SELECT picture FROM ebook WHERE bookID=?;`,
                    [req.body.bookID],
                    function(err, results, fields) {
                        if(err) {
                            res.json({status:'ErrorDB',message: err});
                            return
                        }
                        
                        GetPictureURL(results[0].picture);
                    }
                );
            }
        );
    }

    async function GetPictureURL(pictureURL) {

        let fileURL = '';

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
        
        fileURL = signedUrl;

        res.json({status: 'ok', file: pictureURL, url: fileURL});
    }
    
});

router.post('/EditBook', jsonParser ,(req,res) => {

    //Edit value in database
    db.execute(
        `UPDATE ebook SET ${req.body.column}=? WHERE bookID=?;`,
        [req.body.value,req.body.bookID],
        function(err, results, fields) {
            if(err) {
                res.json({status:'ErrorDB',message: err});
                return
            }

            if(req.body.column === 'typeID' || req.body.column === 'status' || req.body.column === 'age_restrict') {
                SendValueBack();
            } else {
                res.json({status: 'ok'});
            }
        }
    );

    function SendValueBack() {

        if(req.body.column === 'typeID') {
            //Get book type name from database then send back to frontend
            db.execute(
                `SELECT T2.name FROM ebook T1 INNER JOIN book_type T2 ON T1.typeID=T2.typeID WHERE bookID=?;`,
                [req.body.bookID],
                function(err, results, fields) {
                    if(err) {
                        res.json({status:'ErrorDB',message: err});
                        return
                    }
                    
                    res.json({status: 'ok', newvalue: results[0].name});
                }
            );

        } else {

            //Get status and age restrict from database
            db.execute(
                `SELECT status,age_restrict FROM ebook WHERE bookID=?;`,
                [req.body.bookID],
                function(err, results, fields) {
                    if(err) {
                        res.json({status:'ErrorDB',message: err});
                        return
                    }
                    
                    //Check if is status or age restrict if is true then convert from number value to text
                    if(req.body.column === 'status') {

                        const num_status = results[0].status;
                        let book_status = '';

                        if(num_status == 1) {
                            book_status = 'ไม่เป็นสาธารณะ';
                            res.json({status: 'ok', newvalue: book_status});
                        } else if(num_status == 2) {
                            book_status = 'ยังไม่จบ';
                            res.json({status: 'ok', newvalue: book_status});
                        } else if(num_status == 3 ) {
                            book_status = 'จบแล้ว';
                            res.json({status: 'ok', newvalue: book_status});
                        }

                    } else {

                        const age = results[0].age_restrict;
                        let book_age = '';

                        if(age>=18) {
                            book_age = "ตั้งแต่ 18 ปีขึ้นไป";
                            res.json({status: 'ok', newvalue: book_age});
                        } else if(age>=12) {
                            book_age = "ตั้งแต่ 12 ปีขึ้นไป";
                            res.json({status: 'ok', newvalue: book_age});
                        } else if(age>=6) {
                            book_age = "ตั้งแต่ 6 ปีขึ้นไป";
                            res.json({status: 'ok', newvalue: book_age});
                        } else {
                            book_age = "อ่านได้ทุกวัย";
                            res.json({status: 'ok', newvalue: book_age});
                        } 
                    }
                }
            );

        }

    }

});

//Send new ebook content value from database back to frontend
function Sendvalue(bookID,res) {
    db.execute(
        "SELECT * FROM ebook_content WHERE bookID=?;",
        [bookID],
        function(err, results, fields) {
            if(err) {
                res.json({status:'ErrorDB',message: err})
                return
            }

            let newData = [];
            let currentEp = 0;
            let nextEp = 0;

            results.forEach(value => {

                //Format date to DD/MM/YYYY
                const dateFormat = new Date(value.up_time);
                const convertDate = String(dateFormat.getDate()).padStart(2, '0')+"/"+String(dateFormat.getMonth() + 1).padStart(2, '0')+"/"+dateFormat.getFullYear();
                const up_time = convertDate;

                const AddData = {chID: value.chID, chapter: value.ep, title: value.name, view: value.view, date: up_time, file: value.file};
                newData.push(AddData);
                currentEp = value.ep;

            });

            //Check book ep that it have only one ep or multiple ep then add number to for next ep  
            currentEp !== 0 ? nextEp = currentEp + 1 : nextEp = 1 ;

            
            res.json({status: 'ok', newvalue: newData, nextep: nextEp});
        }
    );
}

router.post('/UploadChapter', upload.single('bookcontent') ,(req,res) => {

    //Check if picture has upload and user id have a value or not
    if(req.file && req.body.bookID) {
        //Upload new pdf file into firebase cloud
        const folder = 'bookcontent';
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
            InsertEbook();
        });

        blobStream.end(req.file.buffer);

        function InsertEbook() {
            //Insert new book chapter data into database
            db.execute(
                "INSERT INTO ebook_content(bookID,name,ep,file) VALUES(?,?,?,?)",
                [req.body.bookID,req.body.chaptername,req.body.ep,fileName],
                function(err, results, fields) {
                    if(err) {
                        res.json({status:'ErrorDB',message: err})
                        return
                    }

                    Sendvalue(req.body.bookID,res);
                }
            );
        }

    } else {
        res.json({status: 'fail', massage: 'Not found content file or book id'});
    }
});

router.post('/EditChapter', upload.single('bookcontent') ,async (req,res) => {


    //Check file and chaptername that which one of them have value or not 
    if(req.file && req.body.chaptername) {

        //Upload new pdf file into firebase cloud
        const folder = 'bookcontent';
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
            DeleteAndSendBoth();
        });

        blobStream.end(req.file.buffer);
        
        async function DeleteAndSendBoth() {
            try {

                //Delete old pdf file in firebase cloud 
                await bucket.file(req.body.oldfile).delete();

                //Update new file location and new chapter name
                db.execute(
                    "UPDATE ebook_content SET name=?,file=? WHERE chID=?;",
                    [req.body.chaptername,fileName,req.body.chID],
                    function(err, results, fields) {
                        if(err) {
                            res.json({status:'ErrorDB',message: err})
                            return
                        }

                        Sendvalue(req.body.bookID,res);
                    }
                );

            } catch (error) {
                res.json({status: 'error', message: error});
            }
        }

    } else if(req.file && !req.body.chaptername) {

        //Upload new pdf file into firebase cloud
        const folder = 'bookcontent';
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
            UploadContentValidfileOnly();
        });

        blobStream.end(req.file.buffer);

        async function UploadContentValidfileOnly() {

            try {
                //Delete old pdf file in firebase cloud 
                await bucket.file(req.body.oldfile).delete();
                
                //Update new file location
                db.execute(
                    "UPDATE ebook_content SET file=? WHERE chID=?;",
                    [fileName,req.body.chID],
                    function(err, results, fields) {
                        if(err) {
                            res.json({status:'ErrorDB',message: err})
                            return
                        }

                        Sendvalue(req.body.bookID,res);
                    }
                );

            } catch (error) {
                res.json({status: 'error', message: error});
            }
        }
    
    } else if(!req.file && req.body.chaptername) {
        
        //Update new chapter name
        db.execute(
            "UPDATE ebook_content SET name=? WHERE chID=?;",
            [req.body.chaptername,req.body.chID],
            function(err, results, fields) {
                if(err) {
                    res.json({status:'ErrorDB',message: err})
                    return
                }

                Sendvalue(req.body.bookID,res);
            }
        );

    } else {
        res.json({status: 'fail', massage: 'Not found content file and chapter name'});
    }
});

router.post('/DeleteChapter', jsonParser , async (req,res) => {

    try {
        //Delete pdf file in firebase cloud 
        await bucket.file(req.body.oldfile).delete();
        DeleteChapter();
    } catch (error) {
        res.json({status: 'error', message: error});
    }

    function DeleteChapter() {
        //Delete chapter in database
        db.execute(
            "DELETE FROM ebook_content WHERE chID=?",
            [req.body.chID],
            function(err, results, fields) {
                if(err) {
                    res.json({status:'ErrorDB',message: err})
                    return
                }

                Sendvalue(req.body.bookID,res);
            }
        );
    }
    
});

router.post('/DeleteBook', jsonParser , async (req,res) => {

    //Get book pdf file location from database
    db.execute(
        "SELECT file FROM ebook_content WHERE bookID=?",
        [req.body.bookID],
        function(err, results, fields) {
            if(err) {
                res.json({status:'ErrorDB',message: err})
                return
            }

            let url = [];

            results.forEach(value => {
                url.push(value.file);
            });

            DeleteAll(url);
        }
    );

    async function DeleteAll(pdfURL) {

        //Check if there are pdf that got upload or not, if yes delete all of it
        if(pdfURL.length) {
            //Delete bookcover image in firebase cloud
            await bucket.file(req.body.oldpicture).delete();

            //Loop all book pdf file and and delete in firebase cloud 
            for(const fileName of pdfURL) {
                try {
                    await bucket.file(fileName).delete();
                } catch (error) {
                    res.json({status: 'error', message: error});
                }
            }
            DeleteBookDB();
        } else {
            //Delete bookcover image in firebase cloud
            await bucket.file(req.body.oldpicture).delete();
            DeleteBookDB();
        }
    
        function DeleteBookDB() {
            //Delete chapter in database
            db.execute(
                "DELETE FROM ebook WHERE bookID=?",
                [req.body.bookID],
                function(err, results, fields) {
                    if(err) {
                        res.json({status:'ErrorDB',message: err})
                        return
                    }
    
                    res.json({status:'ok'});
                }
            );
        }
    }

});

router.post('/CancelRequestForSell', jsonParser , async (req,res) => {

    //Get book pdf file location from database
    db.execute(
        "UPDATE ebook SET status=6,message_status='ผู้ใช้กดยกเลิกคำขออนุญาติวางขายหนังสือ' WHERE bookID=?",
        [req.body.bookID],
        function(err, results, fields) {
            if(err) {
                res.json({status:'ErrorDB',message: err})
                return
            }

            res.json({status:'ok'});
        }
    );

});

router.post('/RequestForSell', jsonParser , async (req,res) => {

    //Get book pdf file location from database
    db.execute(
        "UPDATE ebook SET status=4,message_status='' WHERE bookID=?",
        [req.body.bookID],
        function(err, results, fields) {
            if(err) {
                res.json({status:'ErrorDB',message: err})
                return
            }

            res.json({status:'ok'});
        }
    );
    
});

module.exports = router;