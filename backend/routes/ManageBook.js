const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const bucket = require('../FileStorage');
const db = require('../dbConnect');
const { DateTime } = require("luxon");

router.post('/GetManageBook', jsonParser, (req, res) => {

    let bookProfile = [];
    let book_status = [];
    let comment = []; 
    let book_review = [];
    let formatDate = [];
    let pic_url = [];

    db.execute(
        "SELECT T1.bookID,T1.picture,T1.bookname,T1.picture,T1.book_like,T1.book_dislike,T1.status,T1.upload_date,COUNT(T4.buybookID) buy_total,SUM(T3.view) view_total " +
        "FROM ebook T1 LEFT JOIN ebook_content T2 ON T1.bookID=T2.bookID " +
        "LEFT JOIN ebook_view T3 ON T2.chID=T3.chID " +
        "LEFT JOIN buy_book T4 ON T1.bookID=T4.bookID " +
        "WHERE T1.userID=? " +
        "GROUP BY T1.bookID; ",
        [req.body.userID],
        function (err, results, fields) {
            if (err) {
                res.json({ status: 'ErrorDB', message: err })
                return
            }

            let bookID = [];
            let pic_locate = [];

            results.forEach((value) => {

                //Get book status from db than compare value and change value to text
                if (value.status == 1)
                    book_status.push('ส่วนตัว');
                else if (value.status == 2) {
                    book_status.push('ยังไม่จบ');
                } else if (value.status == 3) {
                    book_status.push('จบแล้ว');
                } else if (value.status == 4) {
                    book_status.push('รออนุมัติเพื่อวางขาย');
                } else if (value.status == 5) {
                    book_status.push('วางขาย');
                } else if (value.status == 6) {
                    book_status.push('วางขายไม่สำเร็จ');
                } else if (value.status == 7) {
                    book_status.push('บล็อก');
                } else {
                    book_status.push('none');
                }

                //Format date
                const dateFormat = new Date(value.upload_date);
                const convertDate = String(dateFormat.getDate()).padStart(2, '0') + "/" + String(dateFormat.getMonth() + 1).padStart(2, '0') + "/" + dateFormat.getFullYear();
                formatDate.push(convertDate);

                pic_locate.push(value.picture);
                bookID.push(value.bookID);

            });

            bookProfile = results;
            CallBookReview(bookID,pic_locate);
        }
    );

    async function GetBookReviews(value) {
        const bookReviews = [];
        const commentTotal = [];

        for (let i = 0; i < value.length; i++) {
            try {
                const [reviewData] = await queryAsync(
                    "SELECT (SELECT COUNT(score) FROM user_activity WHERE bookID=? AND score=1) like_total," +
                    "(SELECT COUNT(score) FROM user_activity WHERE bookID=? AND score=2) dislike_total," +
                    "(SELECT COUNT(score) FROM user_activity WHERE bookID=? AND score<>0) score_total, " +
                    "(SELECT COUNT(message) FROM ebook_comment WHERE bookID=?) message_total "+
                    "FROM user_activity " +
                    "GROUP BY like_total, dislike_total, score_total, message_total; ",
                    [value[i], value[i], value[i], value[i]]
                );

                const percent = Math.round((reviewData.like_total / reviewData.score_total) * 100);
                let reviewText = '';

                if (percent >= 80) {
                    reviewText = 'ดีมาก';
                } else if (percent >= 70) {
                    reviewText = 'ดี';
                } else if (percent >= 50) {
                    reviewText = 'ค่อนข้างดี';
                } else if (percent >= 40) {
                    reviewText = 'ค่อนข้างแย่';
                } else if (percent >= 20) {
                    reviewText = 'แย่';
                } else if (percent < 20 && percent !== 0) {
                    reviewText = 'แย่มาก';
                } else {
                    reviewText = 'ยังไม่มีคะแนน';
                }

                bookReviews.push(reviewText);
                commentTotal.push(reviewData.message_total);
                
            } catch (error) {
                console.error("Error processing book review:", error);
                bookReviews.push('Error');
            }
        }

        return [bookReviews,commentTotal];
    }

    function queryAsync(sql, params) {
        return new Promise((resolve, reject) => {
            db.execute(sql, params, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    async function CallBookReview(id,pic_locate) {
        [book_review,comment] = await GetBookReviews(id);
        GetPictureURL(pic_locate);
    }

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
        for (i = 0; i < bookProfile.length; i++) {

            let AddData = null;

            let view = 0;
            if (bookProfile[i].view_total != null) {
                view = bookProfile[i].view_total;
            }

            if (book_status[i] == 'วางขาย') {
                AddData = { bookID: bookProfile[i].bookID, bookname: bookProfile[i].bookname, url: pic_url[i], status: book_status[i], statusnum: bookProfile[i].status, comment: comment[i], score: book_review[i], date: formatDate[i], sell: bookProfile[i].buy_total};
            } else {
                AddData = { bookID: bookProfile[i].bookID, bookname: bookProfile[i].bookname, url: pic_url[i], status: book_status[i], statusnum: bookProfile[i].status, comment: comment[i], score: book_review[i], date: formatDate[i], view: view};
            }

            newData.push(AddData);
        }

        res.json({ status: 'ok', results: newData });
    }
});

module.exports = router;
