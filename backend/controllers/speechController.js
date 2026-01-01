const db = require('../config/db');

// speechController.js
exports.saveSpeechText = (req, res) => {
  const { user_id, text } = req.body; // include user_id if needed
  const sql = 'INSERT INTO transcripts (user_id, type, content) VALUES (?, ?, ?)';
  db.query(sql, [user_id, 'speech', text], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Speech text saved successfully', id: result.insertId });
  });
};


exports.getSpeechTexts = (req, res) => {
  const { user_id } = req.params;
  const sql = 'SELECT * FROM transcripts WHERE type = "speech" AND user_id = ?';
  db.query(sql, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

