const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();
/////////////////
const { saveSpeechText, getSpeechTexts } = require('../controllers/speechController');
const { saveSignText, getSignTexts } = require('../controllers/signController');
// 🧾 REGISTER USER
router.post('/register', async (req, res) => {
 const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, hashedPassword], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY')
          return res.status(400).json({ error: 'Email already registered' });
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'User registered successfully ✅' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔐 LOGIN USER
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful ✅',  user: { id: user.id ,name :user.name} });
  });
});

// 🧑‍💻 (Optional) Get All Users
router.get('/users', (req, res) => {
  db.query('SELECT id, name, email, created_at FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


/////routers
// Speech routes
router.post('/speech/save', saveSpeechText);
router.get('/speech/list/:user_id', getSpeechTexts);

// Sign routes
router.post('/sign/save', saveSignText);
router.get('/sign/list/:user_id', getSignTexts);

module.exports = router;
