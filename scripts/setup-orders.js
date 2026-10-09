require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jsp_eCommerce',
    multipleStatements: true
  });

  try {
    await connection.query(fs.readFileSync(path.join(__dirname, '../sql/orders.sql'), 'utf8'));
    console.log('Order tables are ready. Existing order data was preserved.');
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error('Order database setup failed:', error.message);
  process.exitCode = 1;
});
