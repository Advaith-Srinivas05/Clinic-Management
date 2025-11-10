const express = require('express');
const router = express.Router();
const pool = require('../db');

// List medicines
router.get('/', async (req, res) => {
  const sql = `SELECT * FROM Medicine ORDER BY Medicine_ID ASC`;
  try {
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Search medicines by relevance (FULLTEXT if available) or fallback LIKE; numeric -> search by ID
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0)
    return res.status(400).json({ error: "Query parameter 'q' required" });

  const isNumeric = /^\d+$/.test(q);
  try {
    if (isNumeric) {
      const [rows] = await pool.query(`SELECT * FROM Medicine WHERE Medicine_ID = ? ORDER BY Medicine_ID ASC`, [Number(q)]);
      return res.json(rows);
    }

    // FULLTEXT relevance on selected text columns
    const fulltextSql = `
      SELECT 
        m.*, 
        MATCH(m.Med_Name, m.Brand, m.Supplier, m.Type_of_Medicine) AGAINST(? IN NATURAL LANGUAGE MODE) AS relevance
      FROM Medicine m
      WHERE MATCH(m.Med_Name, m.Brand, m.Supplier, m.Type_of_Medicine) AGAINST(? IN NATURAL LANGUAGE MODE)
      ORDER BY relevance DESC, m.Medicine_ID ASC;
    `;
    const [rows] = await pool.query(fulltextSql, [q, q]);
    return res.json(rows);
  } catch (err) {
    console.error('Error searching medicines:', err);
    res.status(500).json({ error: 'Server error while searching medicines' });
  }
});

// Create medicine
router.post('/', async (req, res) => {
  const { Med_Name, Type_of_Medicine, Stock_Left, Brand, Supplier, Cost_to_buy, Cost_to_sell } = req.body;
  const sql = `INSERT INTO Medicine (Med_Name, Type_of_Medicine, Stock_Left, Brand, Supplier, Cost_to_buy, Cost_to_sell)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  try {
    const [result] = await pool.query(sql, [Med_Name, Type_of_Medicine, Stock_Left, Brand, Supplier, Cost_to_buy, Cost_to_sell]);
    const [rows] = await pool.query(`SELECT * FROM Medicine WHERE Medicine_ID = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Update medicine (admin)
router.put('/:id', async (req, res) => {
  const fields = ['Med_Name','Type_of_Medicine','Stock_Left','Brand','Supplier','Cost_to_buy','Cost_to_sell'];
  const updates = [];
  const values = [];
  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  });
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
  const sql = `UPDATE Medicine SET ${updates.join(', ')} WHERE Medicine_ID = ?`;
  try {
    values.push(req.params.id);
    await pool.query(sql, values);
    const [rows] = await pool.query(`SELECT * FROM Medicine WHERE Medicine_ID = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Delete medicine
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM Medicine WHERE Medicine_ID = ?`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
