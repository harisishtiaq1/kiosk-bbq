const mysql = require('mysql');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',        // your MySQL username
    password: '',        // your MySQL password
    port: 3308,          // default MySQL port
    database: 'kiosk'
});
module.exports = db;