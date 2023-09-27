const express = require('express');
const router = express.Router();
//const jsonParser = bodyParser.json();
const multer = require('multer');
const bucket = require('../FileStorage');
const db = require('../dbConnect');
//const fs = require('fs');
const upload = multer({dest:''});
const { v4: uuidv4 } = require('uuid');

router.post('/UpBook', upload.single('bookcover') ,(req,res)=>{

    //Check if picture have upload and user id have a value or not
    if(req.file && req.body.userId) {
        //Upload bookcover into firebase cloud
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
            InsertDB();
        });

        blobStream.end(req.file.buffer);

        //Declare value and check value if it null or not
        let artist = null;
        let translator = null;
        let desc = null;

        req.body.artist ? artist = req.body.artist : '';
        req.body.translator ? translator = req.body.translator : '';
        req.body.desc ? desc = req.body.desc : '';
        
        let sql_command = '';
        if(req.body.status==1) {
            sql_command = "INSERT INTO ebook (userID,typeID,bookname,writer,artist,translator,description,age_restrict,picture,status) VALUES(?,?,?,?,?,?,?,?,?,?)";
        } else {
            sql_command = `INSERT INTO ebook (userID,typeID,bookname,writer,artist,translator,description,age_restrict,picture,status,comment_ch) VALUES(?,?,?,?,?,?,?,?,?,?,'${uuidv4()}')`;
        }

        function InsertDB() {
            //Insert book data into database
            db.execute(
                sql_command,
                [req.body.userId,req.body.bookType,req.body.bookname,req.body.writer,artist,translator,desc,req.body.age,fileName,req.body.status],
                function(err, results, fields) {
                    if(err) {
                        res.json({status:'ErrorDB',message: err});
                        return
                    }
                    res.json({status: 'ok'});
                }
            );
        }

    } else {
        res.json({status: 'fail', massage: 'Not found bookcover or user id'});
    }

});

router.post('/UpBookForSell' , upload.fields([{name: 'bookcover'}, {name: 'pdf'}]) ,(req,res)=>{

    let pdfFileLocate = [];
    let bookcoverFileLocate = '';
    let bookID = 0;
    

    //Check if picture and pdf file had upload and user id had a value or not
    if(req.files.bookcover && req.files.pdf && req.body.userId) {
        UploadMultipleFile();

    } else {
        res.json({status: 'fail', massage: 'Not found bookcover, pdf file or user id'});
    }

    async function UploadMultipleFile() {
        
        //Upload pdf file into firebase
        try {
            const files = req.files.pdf;
        
            const uploadPromises = files.map((file) => {
                const folder = 'bookcontent';
                const fileName = `${folder}/${Date.now()}`;
                pdfFileLocate.push(fileName);
                const fileUpload = bucket.file(fileName);
                const stream = fileUpload.createWriteStream({
                    metadata: {
                        contentType: file.mimetype
                    }
                });
        
                return new Promise((resolve, reject) => {
                    stream.on('finish', resolve);
                    stream.on('error', reject);
                    stream.end(file.buffer);
                });
            });
        
            await Promise.all(uploadPromises);
            UploadBookCover();
            
          } catch (error) {
            console.error('Error uploading files:', error);
            res.status(500).json({ error: 'An error occurred during file upload' });
          }
        
    }

    function UploadBookCover() {

        //Upload bookcover into firebase cloud
        const files = req.files.bookcover[0];
        const folder = 'bookcover';
        const fileName = `${folder}/${Date.now()}`;
        const fileUpload = bucket.file(fileName);
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: files.mimetype
            }
        });

        blobStream.on('error',(err) => {
            console.log('error: '+err);
        });

        blobStream.on('finish',() => {
            bookcoverFileLocate = fileName;
            DBinsert();
        });

        blobStream.end(files.buffer);
    }

    function DBinsert() {

        //Declare value and check value if it null or not
        let artist = null;
        let translator = null;
        let desc = null;

        req.body.artist ? artist = req.body.artist : '';
        req.body.translator ? translator = req.body.translator : '';
        req.body.desc ? desc = req.body.desc : '';

        //Create new book data in database
        db.execute(
            `INSERT INTO ebook (userID,typeID,bookname,writer,artist,translator,description,price,age_restrict,picture,status,comment_ch) VALUES(?,?,?,?,?,?,?,?,?,?,4,'${uuidv4()}')`,
            [req.body.userId,req.body.bookType,req.body.bookname,req.body.writer,artist,translator,desc,req.body.price,req.body.age,bookcoverFileLocate],
            function(err, results, fields) {
                if(err) {
                    res.json({status:'ErrorDB',message: err})
                    return
                }
                
                //Get book id after create
                db.execute(
                    "SELECT bookID FROM ebook WHERE bookname=?",
                    [req.body.bookname],
                    function(err, results, fields) {
                        if(err) {
                            res.json({status:'ErrorDB',message: err})
                            console.log('select');
                            return
                        }
                        
                        bookID = results[0].bookID;
                        
                        CreateBookContent();
                    }
                );

            }
        );
    }

    function CreateBookContent() {

        let found_err = false;

        for(i=0; i<pdfFileLocate.length; i++) {
            //Insert new book chapter data into database
            db.execute(
                "INSERT INTO ebook_content(bookID,name,ep,file) VALUES(?,?,?,?)",
                [bookID,req.body.pdfname[i],i+1,pdfFileLocate[i]],
                function(err, results, fields) {
                    if(err) {
                        found_err = true;
                        res.json({status:'ErrorDB',message: err})
                        return
                    }
                }
            );
        }

        if(!found_err) {
            res.json({status: 'ok'});
        }    
    }

});

module.exports = router;