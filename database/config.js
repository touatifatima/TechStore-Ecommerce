var mysql = require('mysql2');
var connection = mysql.createConnection({
  host     : 'localhost',
  port     : '3306',
  user     : 'root',
  password : 'zohor2002',
  //socket   : '/Applications/MAMP/tmp/mysql/mysql.sock',
  database : 'jsp_eCommerce'
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