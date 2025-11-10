const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create prescription; reduce stock of selected medicine by 1
// SQL INSERT and UPDATE Medicine stock
router.post('/', async (req, res) => {
  const { Appt_ID, Doctor_ID, Patient_ID, Prescription, Medicine_ID } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const insSql = `INSERT INTO Prescription (Appt_ID, Doctor_ID, Patient_ID, Prescription, Medicine_ID) VALUES (?, ?, ?, ?, ?)`;
    const [r] = await conn.query(insSql, [Appt_ID, Doctor_ID, Patient_ID, Prescription, Medicine_ID]);
    // Stock reduction is handled by DB trigger on Prescription insert
    // attach prescription id to appointment
    await conn.query(`UPDATE Appointments SET Prescription_ID = ? WHERE Appt_ID = ?`, [r.insertId, Appt_ID]);

    await conn.commit();
    const [rows] = await pool.query(`SELECT * FROM Prescription WHERE Prescription_ID = ?`, [r.insertId]);
    res.json(rows[0]);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

module.exports = router;
