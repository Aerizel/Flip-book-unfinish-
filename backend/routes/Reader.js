const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bucket = require('../FileStorage');
const jsonParser = bodyParser.json();
const db = require('../dbConnect');
const { DateTime } = require("luxon");

router.get('/GetAllBook', jsonParser ,(req,res) => {

    let bookProfile = [];
    let pic_url = [];
    let book_review = [];
    let score_percent = [];
    let scoreTotal = [];

    (async () => {
        try {
            await GetAllData();
            SendValue();
        } catch (error) {
            res.json({ status: 'Error in get all data', message: error });
        }
    })();

    async function GetAllData() {
        return new Promise(async (resolve, reject) => {
            try {

                //Get book infomation
                const bookInfo = await queryAsync(
                    "SELECT ebook.bookID,bookname,writer,price,picture "+ 
                    "FROM ebook LEFT JOIN ebook_content ON ebook.bookID=ebook_content.bookID "+
                    "WHERE status!=1 AND status!=4 AND status!=6 "+
                    "GROUP BY ebook.bookID "+
                    "HAVING COUNT(ebook_content.bookID)<>0; "
                )

                bookProfile = bookInfo;

                let pic_locate = [];
                let bookID = [];

                //Loop through book info value to get book id and picture from array
                for(let i=0; i<bookInfo.length; i++) {
                    pic_locate.push(bookInfo[i].picture);
                    bookID.push(bookInfo[i].bookID);
                }
                
                [book_review,scoreTotal,score_percent] = await GetBookReviews(bookID);

                //Get book review score in database then convert from number to text
                async function GetBookReviews(value) {
                    
                    const bookReviews = [];
                    const scoreTotal = [];
                    const scorePercent = [];
                    for (let i = 0; i < value.length; i++) {
                        try {
                            const [reviewData] = await queryAsync(
                                "SELECT (SELECT COUNT(score) FROM user_activity WHERE bookID=? AND score=1) like_total," +
                                "(SELECT COUNT(score) FROM user_activity WHERE bookID=? AND score=2) dislike_total," +
                                "(SELECT COUNT(score) FROM user_activity WHERE bookID=? AND score<>0) score_total " +
                                "FROM user_activity " +
                                "GROUP BY like_total, dislike_total, score_total",
                                [value[i], value[i], value[i], value[i]]
                            );
            
                            const percent = Math.round((reviewData.like_total / reviewData.score_total) * 100);
                            scorePercent.push(percent);
                            
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
                            scoreTotal.push(reviewData.score_total);
                            
                        } catch (error) {
                            console.error("Error processing book review:", error);
                            bookReviews.push('Error');
                        }
                    }
            
                    return [bookReviews,scoreTotal,scorePercent];
                }

                pic_url = await GetUrl(pic_locate);

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

        let newData = [];

        //Combine all data into one array
        for(i=0; i<bookProfile.length; i++) {
            const AddData = {id: bookProfile[i].bookID, bookname: bookProfile[i].bookname, writer: bookProfile[i].writer, price: bookProfile[i].price, review: scoreTotal[i], review_percent: score_percent[i], review_text: book_review[i], image: pic_url[i]};
            newData.push(AddData);
        }
    
        res.json({status:'ok', results: newData});
    }

});

module.exports = router;