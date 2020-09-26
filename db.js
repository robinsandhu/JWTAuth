const mysql = require('mysql');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "classroom"
});

db.connect((err) => {
    if(err) throw err;
    console.log('DB Connected!!!');
});

module.exports = db;