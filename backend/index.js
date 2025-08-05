const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // your MySQL username
  password: '',        // your MySQL password
  port: 3308,          // default MySQL port
  database: 'kiosk'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected!');
});
const orderRoutes = require('./routes/order'); // adjust this path based on your project structure
app.use('/', orderRoutes);

app.get('/categories', (req, res) => {
  db.query('SELECT * FROM categories', (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

app.get('/items', (req, res) => {
  const categoryId = req.query.category_id;

  if (categoryId) {
    db.query('SELECT * FROM items WHERE cat_id = ?', [categoryId], (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result);
    });
  } else {
    db.query('SELECT * FROM items', (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result);
    });
  }
});
app.get('/item/:id', (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM items WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).json({ message: 'Item not found' });

    res.json(result[0]);
  });
});
// app.post('/add-to-cart')
app.post('/add-to-cart', async (req, res) => {
  const {
    product_id,
    session_id,
    user_id,
    variations,
    quantity,
    price,
    total_price
  } = req.body;

  try {
    await db.query(
      `INSERT INTO cart 
        (product_id, session_id, user_id, variations, quantity, price, total_price) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [product_id, session_id, user_id, variations, quantity, price, total_price]
    );

    res.status(200).json({ message: 'Added to cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});
app.get('/cart', (req, res) => {
  const session_id = req.query.session_id;

  if (!session_id) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  const sql = `
    SELECT c.*, i.title, i.photo 
    FROM cart c 
    JOIN items i ON c.product_id = i.id
    WHERE c.session_id = ?
  `;

  db.query(sql, [session_id], (err, results) => {
    if (err) {
      console.error('Error fetching cart:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const total = results.reduce((sum, item) => sum + item.total_price, 0);
    res.json({ items: results, total });
  });
});
app.delete('/cart/:id', (req, res) => {
  const itemId = req.params.id;
  const sessionId = req.query.session_id;

  const sql = 'DELETE FROM cart WHERE id = ? AND session_id = ?';

  db.query(sql, [itemId, sessionId], (err, result) => {
    if (err) {
      console.error('Failed to delete item:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  });
});
// Start server
app.listen(5000, () => {
  console.log('Server started on port 5000');
});
