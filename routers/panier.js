/*//panier
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Create a connection pool for MySQL
const pool = mysql.createPool({
    host     : 'localhost',
    port     : '3306',
    user     : 'root',
    password : 'zohor2002',
    //socket   : '/Applications/MAMP/tmp/mysql/mysql.sock',
    database : 'jsp_eCommerce',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});




// Get the contents of the user's shopping cart
router.get('/panier', async (req, res) => {
  const userId = req.user.id; // assuming you have already implemented user authentication
  try {
    const conn = await pool.getConnection();
    const [results, fields] = await conn.query('SELECT * FROM panier WHERE user_id = ?', [userId]);
    conn.release();
    res.send(results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving shopping cart items');
  }
});

// Add an item to the user's shopping cart
router.post('/panier', async (req, res) => {
  const userId = req.user.id; // assuming you have already implemented user authentication
  const productId = req.body.productId;
  const quantity = req.body.quantity;
  try {
    const conn = await pool.getConnection();
    await conn.query('INSERT INTO panier (user_id, produit_id, quantite) VALUES (?, ?, ?)', [userId, productId, quantity]);
    conn.release();
    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding item to shopping cart');
  }
});

// Update the quantity of a specific item in the user's shopping cart
router.put('/panier/:id', async (req, res) => {
  const userId = req.user.id; // assuming you have already implemented user authentication
  const itemId = req.params.id;
  const newQuantity = req.body.quantity;
  try {
    const conn = await pool.getConnection();
    await conn.query('UPDATE panier SET quantite = ? WHERE panier_id = ? AND user_id = ?', [newQuantity, itemId, userId]);
    conn.release();
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating item in shopping cart');
  }
});

// Remove a specific item from the user's shopping cart
router.delete('/panier/:id', async (req, res) => {
  const userId = req.user.id; // assuming you have already implemented user authentication
  const itemId = req.params.id;
  try {
    const conn = await pool.getConnection();
    await conn.query('DELETE FROM panier WHERE panier_id = ? AND user_id = ?', [itemId, userId]);
    conn.release();
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting item from shopping cart');
  }
});

router.get('/panier', function(req, res) {
    //res.send('<h1>About page</h1>');
    res.render('panier', {title: 'panier'});
  });
module.exports = router;*/