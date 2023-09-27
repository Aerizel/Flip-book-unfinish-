const mysql2 = require('mysql2');
require('dotenv').config();

const User = process.env.USER;
const Host = process.env.HOST;
const Port = process.env.PORT;
const Password = process.env.PASSWORD;
const Database = process.env.DATABASE;

/*console.log("This is url db : "+User,Host,Port,Password,Database);*/

const connection = mysql2.createConnection({
    user: User,
    host: Host,
    port: Port,
    password: Password,
    database: Database
})

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;