const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const bucket = require('../FileStorage');
const db = require('../dbConnect');
const { DateTime } = require("luxon");

router.post('/GetBookDetail', jsonParser ,(req,res) => {

    let bookProfile = [];
    let upload_date = ''
    let book_status = '';
    let pic_url = [];
    let user_activity = '';
    let bookContent = [];
    let block_message = false;
    let bookComment = [];

    (async () => {
        try {
            await GetAllData();
            SendValue();
        } catch (error) {
            res.json({ status: 'Error in get all data', message: error });
            console.log(error);
        }
    })();

    async function GetAllData() {
        return new Promise(async (resolve, reject) => {
            try {
                const bookInfo = await queryAsync(
                    "SELECT T1.bookname,T2.name typename,T1.writer,T1.artist,T1.translator,T1.description,T1.price,T1.sell_price,T1.due_sell,T1.age_restrict,T1.status,T1.picture book_pic,T1.upload_date,T1.comment_ch,T3.username,CONCAT(T3.name,' ',T3.surname) real_name,T3.picture owner_pic "+
                    "FROM ebook T1 INNER JOIN book_type T2 ON T1.typeID=T2.typeID INNER JOIN member T3 ON T1.userID=T3.userID WHERE T1.bookID=?;",
                    [req.body.bookID]
                )

                bookProfile = bookInfo[0];

                //Get book status from db than compare value and change value to text
                const num_status = bookInfo[0].status;
                if(num_status==2) {
                    book_status = 'ยังไม่จบ';
                } else if (num_status==3) {
                    book_status = 'จบแล้ว';
                } else if (num_status==5) {
                    book_status = 'วางขาย';
                } else {
                    book_status = 'none';
                }

                //Format upload date to DD/MM/YYYY
                const dateFormat = new Date(bookInfo[0].upload_date);
                const convertDate = String(dateFormat.getDate()).padStart(2, '0') + "/" + String(dateFormat.getMonth() + 1).padStart(2, '0') + "/" + dateFormat.getFullYear();
                upload_date = convertDate;

                //Get picture url
                const picture = [bookInfo[0].owner_pic,bookInfo[0].book_pic];
                pic_url = await GetUrl(picture);

                //Get user activity data
                const user_activity_data = await queryAsync(
                    "SELECT follow_date,score FROM user_activity WHERE userID=? AND bookID=?; ",
                    [req.body.userID,req.body.bookID]
                )

                if(user_activity_data[0]) {
                    user_activity = user_activity_data[0];
                } else {
                    user_activity = 'null';
                }
                

                //Get book content
                const bookContentData = await queryAsync(
                    "SELECT T1.chID,T1.ep,T1.name,T1.up_time,T1.file,SUM(T2.view) view "+
                    "FROM ebook_content T1 LEFT JOIN ebook_view T2 ON T1.chID=T2.chID "+ 
                    "WHERE T1.bookID=? "+
                    "GROUP BY T1.chID; ",
                    [req.body.bookID]
                )
                
                let newContentData = [];

                //Get chapter detail
                bookContentData.forEach(value => {
                    
                    let view = 0;

                    if(value.view!=null) {
                        view = value.view;
                    }

                    //Format date to DD/MM/YYYY
                    const dateFormat = new Date(value.up_time);
                    const convertDate = String(dateFormat.getDate()).padStart(2, '0') + "/" + String(dateFormat.getMonth() + 1).padStart(2, '0') + "/" + dateFormat.getFullYear();
                    const up_time = convertDate;

                    newContentData.push({chID: value.chID, chapter: value.ep, title: value.name, view: view, date: up_time, file: value.file });
                    
                });

                bookContent = newContentData;

                const blockMessageStatus = await queryAsync(
                    "SELECT COUNT(banuserID) total "+
                    "FROM ebook_block_comment WHERE banuserID=? "+ 
                    "AND ownerID IN (SELECT T1.userID FROM member T1 INNER JOIN ebook T2 ON T1.userID=T2.userID WHERE T2.bookID=?); ",
                    [req.body.userID,req.body.bookID]
                )

                if(blockMessageStatus[0].total === 1) {
                    block_message = true;
                }

                //Get comment histoty
                const commentData = await queryAsync(
                    "SELECT (T2.username) author,T2.picture,T1.commID,T1.message,T1.reply,T1.send_time time "+
                    "FROM ebook_comment T1 LEFT JOIN member T2 ON T1.userID=T2.userID "+  
                    "WHERE T1.bookID=? "+
                    "ORDER BY T1.send_time DESC; ",
                    [req.body.bookID]
                )

                let profileLocate = [];
                let newbookComment = [];

                for(let i=0; i<commentData.length; i++) {
                    profileLocate.push(commentData[i].picture);
                }

                const profileURL = await GetUrl(profileLocate);

                commentData.forEach((value,index)=>{
                    newbookComment.push({author: value.author, picture: profileURL[index], commID: value.commID, message: value.message, reply: value.reply, time: value.time });
                });

                bookComment = newbookComment;

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

        } catch(err) {
            throw err;
        }
    }

    function SendValue() {
        res.json({status:'ok', bookProfile: bookProfile, upload_date: upload_date, picOwner: pic_url[0], picBook: pic_url[1], bookStatus: book_status, user_activity: user_activity, bookContent: bookContent, block_message: block_message, bookComment: bookComment});
    }

});

//Check if there are row in table user_activity that match to user id and book id
async function CheckUserActivity(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results[0].total);
            }
        });
    });
    
}

router.post('/SaveLikeStatus', jsonParser , async (req,res) => {

    let checkStatus = 0;

    try {
        checkStatus = await CheckUserActivity(
            "SELECT COUNT(uaID) total FROM user_activity WHERE userID=? AND bookID=?; ",
            [req.body.userID,req.body.bookID]
        );
    } catch (error) {
        res.json({status: 'error'});
    }

    if(checkStatus===1) {
        db.query("UPDATE user_activity SET score=? WHERE userID=? AND bookID=?; ", 
        [req.body.likestatus,req.body.userID,req.body.bookID], 
        (err, results) => {
            if (err) {
                res.json({status: 'error db', message: err});
            } else {
                res.json({status: 'ok'});
            }
        });
    } else {
        db.query("INSERT INTO user_activity (userID,bookID,score) VALUES(?,?,?); ", 
        [req.body.userID,req.body.bookID,req.body.likestatus], 
        (err, results) => {
            if (err) {
                res.json({status: 'error db', message: err});
            } else {
                res.json({status: 'ok'});
            }
        });
    }

});

router.post('/SaveFollowStatus', jsonParser , async (req,res) => {

    let checkStatus = 0;
    let follow_date = null;

    try {
        checkStatus = await CheckUserActivity(
            "SELECT COUNT(uaID) total FROM user_activity WHERE userID=? AND bookID=?; ",
            [req.body.userID,req.body.bookID]
        );
    } catch (error) {
        res.json({status: 'error'});
    }

    req.body.date!==null ? follow_date = req.body.date : follow_date = null;

    if(checkStatus===1) {
        db.query("UPDATE user_activity SET follow_date=? WHERE userID=? AND bookID=?; ", 
        [follow_date,req.body.userID,req.body.bookID], 
        (err, results) => {
            if (err) {
                res.json({status: 'error db', message: err});
            } else {
                res.json({status: 'ok'});
            }
        });
    } else {
        db.query("INSERT INTO user_activity (userID,bookID,follow_date) VALUES(?,?,?); ", 
        [req.body.userID,req.body.bookID,follow_date], 
        (err, results) => {
            if (err) {
                res.json({status: 'error db', message: err});
            } else {
                res.json({status: 'ok'});
            }
        });
    }

});

router.post('/DeleteMessage', jsonParser , (req,res) =>{

    //console.log(req.body.time+" , "+req.body.author);

    db.query("DELETE T1 FROM ebook_comment T1 INNER JOIN member T2 ON T1.userID=T2.userID "+ 
        "WHERE T1.message=? AND T2.username=?; ", 
        [req.body.message,req.body.author], 
        (err, results) => {
            if (err) {
                res.json({status: 'error db', message: err});
            } else {
                res.json({status: 'ok'});
            }
        });
});

router.post('/BlockUser', jsonParser , (req,res) =>{

    (async () => {
        try {
            await BlockUserMethod();
            SendValue();
        } catch (error) {
            res.json({ status: 'Error in process while attemped to block user', message: error });
            //console.log(error);
        }
    })();

    async function BlockUserMethod() {
        return new Promise(async (resolve, reject) => {
            try {

                await queryAsync(
                    "DELETE T1 FROM ebook_comment T1 INNER JOIN ebook T2 ON T1.bookID=T2.bookID "+
                    "WHERE T1.userID IN (SELECT userID FROM member WHERE username=?) "+
                    "AND T2.userID IN (SELECT userID FROM member WHERE username=?); ",
                    [req.body.banUsername,req.body.ownerName]
                );

                const userID = await queryAsync(
                    "SELECT userID banID,(SELECT userID FROM member WHERE username=?) ownerID FROM member WHERE username=?; ",
                    [req.body.ownerName,req.body.banUsername]
                );

                await queryAsync(
                    "INSERT INTO ebook_block_comment (banuserID,ownerID) VALUES(?,?); ",
                    [userID[0].banID,userID[0].ownerID]
                );

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

    function SendValue() {
        res.json({status:'ok'});
    }
    
});

module.exports = router;