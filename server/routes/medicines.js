const express = require('express');
const router = express.Router();
const pool = require('../db');

// List medicines
router.get('/', async (req, res) => {
  const sql = `SELECT * FROM Medicine ORDER BY Med_Name`;
  try {
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Update stock manually (admin)
router.put('/:id', async (req, res) => {
  const { Stock_Left } = req.body;
  const sql = `UPDATE Medicine SET Stock_Left = ? WHERE Medicine_ID = ?`;
  try {
    await pool.query(sql, [Stock_Left, req.params.id]);
    const [rows] = await pool.query(`SELECT * FROM Medicine WHERE Medicine_ID = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
