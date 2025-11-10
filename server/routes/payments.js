const express = require('express');
const router = express.Router();
const pool = require('../db');

// Make payment - inserts into Payments and updates Appointments.Status to 'Completed'
// SQL: INSERT INTO Payments (...) and UPDATE Appointments SET Status='Completed', Payment_ID = ?
router.post('/', async (req, res) => {
  const { Appt_ID, Patient_ID, Date, Time, Amount, Mode_of_payment, Prescription_ID } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const insSql = `INSERT INTO Payments (Appt_ID, Patient_ID, Date, Time, Amount, Mode_of_payment, Prescription_ID) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [r] = await conn.query(insSql, [Appt_ID, Patient_ID, Date, Time, Amount, Mode_of_payment, Prescription_ID]);

    // Link payment to appointment; Status will be set by DB trigger
    await conn.query(`UPDATE Appointments SET Payment_ID = ? WHERE Appt_ID = ?`, [r.insertId, Appt_ID]);

    await conn.commit();
    const [rows] = await pool.query(`SELECT * FROM Payments WHERE Payment_ID = ?`, [r.insertId]);
    res.json(rows[0]);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// List payments (admin view) - optional filters by doctor
router.get('/', async (req, res) => {
  const { doctorId } = req.query;
  const sql = `SELECT pay.*, a.Doctor_ID FROM Payments pay LEFT JOIN Appointments a ON pay.Appt_ID = a.Appt_ID ${doctorId ? ' WHERE a.Doctor_ID = ?' : ''} ORDER BY pay.Date DESC`;
  try {
    const params = doctorId ? [doctorId] : [];
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
