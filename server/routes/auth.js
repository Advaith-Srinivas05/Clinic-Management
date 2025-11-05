const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_me';

// Login endpoint
// SQL: SELECT Password_Hash, Role, Doctor_ID FROM Login WHERE Username = ?
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const sql = `SELECT User_ID, Username, Password_Hash, Role, Doctor_ID FROM Login WHERE Username = ?`;
    const [rows] = await pool.query(sql, [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.Password_Hash);
    // record login attempt
    await pool.query(`INSERT INTO Login_Attempts (Username, Success) VALUES (?, ?)`, [username, ok?1:0]);

    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    // Update last active
    await pool.query(`UPDATE Login SET Last_Active = NOW() WHERE User_ID = ?`, [user.User_ID]);

    const token = jwt.sign({ userId: user.User_ID, role: user.Role, doctorId: user.Doctor_ID }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, role: user.Role, doctorId: user.Doctor_ID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
