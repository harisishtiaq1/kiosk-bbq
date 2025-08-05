const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /create-order
router.post('/create-order', (req, res) => {
  const { cart, total, payment_method, session_id } = req.body;

  if (!cart || cart.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty.' });
  }

  let completed = 0;

  cart.forEach((item, index) => {
    db.query(
      `INSERT INTO orders (session_id, item_id, price, quantity, payment_method) VALUES (?, ?, ?, ?, ?)`,
      [session_id, item.id, item.price, item.quantity, payment_method],
      (err, result) => {
        if (err) {
          console.error('Order creation error:', err);
          return res.status(500).json({ success: false, message: 'Failed to create order.' });
        }

        completed++;
        if (completed === cart.length) {
          // Delete cart items after order is inserted
          db.query(
            `DELETE FROM cart WHERE session_id = ?`,
            [session_id],
            (err2, result2) => {
              if (err2) {
                console.error('Error deleting cart:', err2);
                return res.status(500).json({ success: false, message: 'Order placed, but failed to clear cart.' });
              }

              // All done
              return res.json({
                success: true,
                message: 'Order has been successfully placed. Please collect it from the counter.',
                redirect: '/selection'
              });
            }
          );
        }
      }
    );
  });
});

module.exports = router;
