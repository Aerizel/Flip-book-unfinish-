const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const db = require('../dbConnect');
//const { DateTime } = require("luxon");

router.post('/GetStatisticPubliser', jsonParser, (req, res) => {

    let totalReadBuy = '';
    let viewPerMonth = [];
    let buyPerMonth = [];
    let readRanking = null;
    let buyRanking = null;


    db.query("SELECT SUM(T3.view) total_view,COUNT(T4.bookID) total_sell " +
        "FROM ebook T1 INNER JOIN ebook_content T2 ON T1.bookID=T2.bookID " +
        "LEFT JOIN ebook_view T3 ON T2.chID=T3.chID " +
        "LEFT JOIN buy_book T4 ON T1.bookID=T4.bookID " +
        "WHERE T1.userID=?; ",
        [req.body.userID],
        (err, results) => {
            if (err) {
                res.json({ status: 'ErrorDB', message: err });
            } else {
                totalReadBuy = results[0];
                GetGraphData();
            }
        });


    function GetGraphData() {

        const currentYear = new Date().getFullYear();

        for (let i = 1; i <= 12; i++) {
            db.query("SELECT SUM(T3.view) total_view " +
                "FROM ebook T1 RIGHT JOIN ebook_content T2 ON T1.bookID=T2.bookID " +
                "INNER JOIN ebook_view T3 ON T2.chID=T3.chID " +
                `WHERE T1.userID=? AND (date BETWEEN '${currentYear}-${String(i).padStart(2, '0')}-01 00:00:00' AND '${currentYear}-${String(i).padStart(2, '0')}-31 23:59:59') ;`,
                [req.body.userID],
                (err, results) => {
                    if (err) {
                        res.json({ status: 'ErrorDB', message: err });
                    } else {

                        if (results[0].total_view) {
                            viewPerMonth.push(results[0].total_view);
                        } else {
                            viewPerMonth.push('0');
                        }

                        if (i == 12) {
                            GetBuyGraph();
                        }

                    }
                });
        }

        function GetBuyGraph() {
            for (let i = 1; i <= 12; i++) {
                db.query("SELECT COUNT(T2.bookID) total_buy " +
                    "FROM ebook T1 RIGHT JOIN buy_book T2 ON T1.bookID=T2.bookID " +
                    "INNER JOIN buy_order T3 ON T2.orderID=T3.orderID " +
                    `WHERE T1.userID=? AND (T3.success_date BETWEEN '${currentYear}-${String(i).padStart(2, '0')}-01 00:00:00' AND '${currentYear}-${String(i).padStart(2, '0')}-31 23:59:59') ;`,
                    [req.body.userID],
                    (err, results) => {
                        if (err) {
                            res.json({ status: 'ErrorDB', message: err });
                        } else {

                            if (results[0].total_buy) {
                                buyPerMonth.push(results[0].total_buy);
                            } else {
                                buyPerMonth.push('0');
                            }

                            if (i == 12) {
                                GetRanking();
                            }
                        }
                    });
            }
        }

    }

    function GetRanking() {

        db.query(
            "SELECT T1.bookname,SUM(T3.view) view_total " +
            "FROM ebook T1 LEFT JOIN ebook_content T2 ON T1.bookID=T2.bookID " +
            "LEFT JOIN ebook_view T3 ON T2.chID=T3.chID " +
            "WHERE T1.userID=? AND T1.status IN (2,3) " +
            "GROUP BY T1.bookname " +
            "ORDER BY view_total DESC; ",
            [req.body.userID],
            (err, results) => {
                if (err) {
                    res.json({ status: 'ErrorDB', message: err });
                } else {

                    let newData = [];

                    results.forEach((value) => {
                        if (value.view_total != null) {
                            newData.push({ bookname: value.bookname, view_total: value.view_total });
                        } else {
                            newData.push({ bookname: value.bookname, view_total: '0' });
                        }
                    });

                    readRanking = newData;
                    GetBuy();
                }
            });

        function GetBuy() {
            db.query(
                "SELECT T1.bookname,COUNT(T2.buybookID) buy_total " +
                "FROM ebook T1 LEFT JOIN buy_book T2 ON T1.bookID=T2.bookID " +
                "WHERE T1.userID=? AND T1.status=5 " +
                "GROUP BY T1.bookname " +
                "ORDER BY buy_total DESC; ",
                [req.body.userID],
                (err, results) => {
                    if (err) {
                        res.json({ status: 'ErrorDB', message: err });
                    } else {
                        buyRanking = results;
                        SendValue();
                    }
                });
        }
    }

    function SendValue() {
        res.json({ status: 'ok', totalReadBuy: totalReadBuy, readGraph: viewPerMonth, buyGraph: buyPerMonth, read: readRanking, buy: buyRanking });
    }
});

router.post('/GetStatisticAdmin', jsonParser, (req, res) => {

    let reportStatistics = '';
    let userStatistics = {};
    let bookStatistics = {};

    (async () => {
        try {
            await GetAllData();
            SendValue();
        } catch (error) {
            res.json({ status: 'ErrorDB', message: error });
        }
    })();

    async function GetAllData() {
        return new Promise(async (resolve, reject) => {
            try {
                const report = await queryAsync(
                    "SELECT (SELECT COUNT(reportID) FROM report WHERE status=1) report,(SELECT COUNT(reportID) "+
                    "FROM report WHERE status=2 AND adminID=?) report_acc, (SELECT COUNT(bookID) FROM ebook WHERE status=4) sell_approve " +
                    "FROM report GROUP BY report,report_acc,sell_approve; ",
                    [req.body.userID]);

                reportStatistics = report[0];

                const userTotal = await queryAsync(
                    "SELECT COUNT(userID) user_total FROM member ;",
                )
                
                userStatistics = userTotal[0];

                const aboutbook = await queryAsync(
                    "SELECT COUNT(bookID) book_total,(SELECT COUNT(bookID) FROM ebook WHERE status=5) booksell_total, "+ 
                    "(SELECT COUNT(bookID) FROM ebook WHERE status IN (2,3)) bookfree_total FROM ebook; "
                );

                const typeamount = await queryAsync(
                    "SELECT T2.name typename,COUNT(T1.bookID) amount FROM ebook T1 RIGHT JOIN book_type T2 ON T1.typeID=T2.typeID GROUP BY T2.name; "
                );

                const readRankingResult = await queryAsync(
                    "SELECT T1.bookname,SUM(T3.view) view_total " +
                    "FROM ebook T1 INNER JOIN ebook_content T2 ON T1.bookID=T2.bookID " +
                    "INNER JOIN ebook_view T3 ON T2.chID=T3.chID " +
                    "WHERE T1.status IN (2,3) " +
                    "GROUP BY T1.bookname " +
                    "ORDER BY view_total DESC ;"
                );

                const sellRankingResult = await queryAsync(
                    "SELECT T1.bookname,COUNT(T2.buybookID) buy_total " +
                    "FROM ebook T1 LEFT JOIN buy_book T2 ON T1.bookID=T2.bookID " +
                    "WHERE T1.status=5 " +
                    "GROUP BY T1.bookname " +
                    "ORDER BY buy_total DESC ;"
                );

                const bookTypeRanking = await queryAsync(
                    "SELECT T2.name type_name,SUM(T4.view) total_view,COUNT(T5.bookID) total_sell,((SUM(T4.view))+(COUNT(T5.bookID))) sellbuy_total "+ 
                    "FROM ebook T1 RIGHT JOIN book_type T2 ON T1.typeID=T2.typeID "+
                    "LEFT JOIN ebook_content T3 ON T1.bookID=T3.bookID "+ 
                    "LEFT JOIN ebook_view T4 ON T3.chID=T4.chID "+
                    "LEFT JOIN buy_book T5 ON T1.bookID=T5.bookID "+
                    "GROUP BY T2.name "+
                    "ORDER BY sellbuy_total DESC; "
                );

                bookStatistics = {aboutbook: aboutbook[0], typeamount: typeamount, readRanking: readRankingResult, sellRanking: sellRankingResult, booktypeRanking: bookTypeRanking};

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
        res.json({ status: 'ok', reportStatistics: reportStatistics, userStatistics: userStatistics, bookStatistics: bookStatistics });
    }

});

module.exports = router;