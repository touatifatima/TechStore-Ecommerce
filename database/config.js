require('dotenv').config();
var mysql = require('mysql2');
var connection = mysql.createConnection({
  host     : process.env.DB_HOST || 'localhost',
  port     : Number(process.env.DB_PORT || 3306),
  user     : process.env.DB_USER || 'root',
  password : process.env.DB_PASSWORD || '',
  //socket   : '/Applications/MAMP/tmp/mysql/mysql.sock',
  database : process.env.DB_NAME || 'jsp_eCommerce'
});

connection.connect(function(err) {
    if (err){
      console.log(err);
      //throw err;
    } else {
      console.log('DB connected :)');
    }
});

module.exports = connection;
