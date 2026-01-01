const db = require('../config/db');

exports.saveSignText = (req, res) => {
  const { user_id, text } = req.body;
  const sql = 'INSERT INTO transcripts (user_id,type, content) VALUES (?, ?,?)';
  db.query(sql, [user_id,'sign', text], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Sign text saved successfully', id: result.insertId });
  });
};

exports.getSignTexts = (req, res) => {
  const { user_id } = req.params;
  const sql = 'SELECT * FROM transcripts WHERE type = "sign" AND user_id = ?';
  db.query(sql, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

