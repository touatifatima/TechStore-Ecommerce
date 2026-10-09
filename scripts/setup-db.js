require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const name = process.env.DB_NAME || 'jsp_eCommerce';
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });
  try {
    await connection.query('CREATE DATABASE IF NOT EXISTS ' + connection.escapeId(name));
    await connection.changeUser({ database: name });
    const [tables] = await connection.query('SHOW TABLES');
    if (tables.length) throw new Error('Database is not empty. No tables were changed. Use a new DB_NAME for sample data.');
    await connection.query(fs.readFileSync(path.join(__dirname, '../sql/ecommerce.sql'), 'utf8'));
    // Convert the inherited sample catalog to the TechStore computer-hardware catalog.
    const catalog = require('./seed-tech-catalog');
    await catalog.seed(connection);
    console.log('TechStore database and computer-hardware catalog created successfully.');
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error('Database setup failed:', error.message);
  process.exitCode = 1;
});
