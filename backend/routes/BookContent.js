const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const db = require('../dbConnect');

router.post('/UpdateViewCount', jsonParser ,(req,res) => {

    db.execute(
        "CALL UpdateView(?,?);",
        [req.body.chID,req.body.bookID],
        function(err, results, fields) {
            if(err) {
                res.json({status:'ErrorDB',message: err})
                return
            }
            res.json({status: 'ok'});
        }
    );
});

module.exports = router;