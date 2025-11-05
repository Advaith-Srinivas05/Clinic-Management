const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// Admin: create doctor login
// SQL: INSERT INTO Login (Username, Password_Hash, Role, Doctor_ID) VALUES (?, ?, 'Doctor', ?)
// Also create doctor row if details provided
router.post('/create-doctor', async (req, res) => {
  const { username, password, doctorName, phone, email, qualifications } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(`INSERT INTO Doctor (Name, Phone_Number, Email_Id, Qualifications) VALUES (?, ?, ?, ?)`, [doctorName, phone, email, qualifications]);
    const doctorId = r.insertId;
    const hash = await bcrypt.hash(password, 10);
    await conn.query(`INSERT INTO Login (Username, Password_Hash, Role, Doctor_ID) VALUES (?, ?, 'Doctor', ?)`, [username, hash, doctorId]);
    await conn.commit();
    res.json({ ok: true, doctorId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// Admin: get login table
router.get('/logins', async (req, res) => {
  try {
    const sql = `SELECT l.User_ID, l.Username, l.Role, l.Doctor_ID, l.Created_On, l.Last_Active, d.Name as DoctorName FROM Login l LEFT JOIN Doctor d ON l.Doctor_ID = d.Doctor_ID ORDER BY l.Role`;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
