const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// Admin: create doctor login
// SQL: INSERT INTO Login (Username, Password_Hash, Role, Doctor_ID) VALUES (?, ?, 'Doctor', ?)
// Also create doctor row if details provided
router.post('/create-doctor', async (req, res) => {
  const { username, password, doctorName, phone, email, qualifications, gender, dob } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let g = null;
    if (gender && ['Male','Female','Other'].includes(gender)) g = gender;
    // Basic DOB validation: expect 'YYYY-MM-DD'
    let dobVal = null;
    if (dob) {
      const m = /^\d{4}-\d{2}-\d{2}$/.test(dob);
      if (m) dobVal = dob;
    }
    const [r] = await conn.query(
      `INSERT INTO Doctor (Name, DOB, Phone_Number, Email_Id, Qualifications, Gender) VALUES (?, ?, ?, ?, ?, ?)`,
      [doctorName, dobVal, phone, email, qualifications, g]
    );
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

// Admin: delete a user login (only allowed for Doctor role)
router.delete('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid user id' });
  const conn = await pool.getConnection();
  try {
    const [[row]] = await conn.query(`SELECT Role, Doctor_ID FROM Login WHERE User_ID = ?`, [id]);
    if (!row) { conn.release(); return res.status(404).json({ error: 'User not found' }); }
    if (row.Role !== 'Doctor') { conn.release(); return res.status(403).json({ error: 'Only Doctor accounts can be deleted' }); }

    await conn.beginTransaction();
    // Delete the linked doctor record; FK from Login(Doctor_ID) should be ON DELETE CASCADE
    if (row.Doctor_ID) {
      await conn.query(`DELETE FROM Doctor WHERE Doctor_ID = ?`, [row.Doctor_ID]);
    } else {
      // Fallback: if somehow no doctor_id, delete login to avoid orphan
      await conn.query(`DELETE FROM Login WHERE User_ID = ?`, [id]);
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    try { await conn.rollback(); } catch {}
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// Admin: list doctors (for selecting when creating doctor logins)
router.get('/doctors', async (_req, res) => {
  try {
    const [rows] = await pool.query(`SELECT Doctor_ID, Name FROM Doctor ORDER BY Name`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: search doctors by name or numeric id
router.get('/doctors/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  try {
    const where = [];
    const params = [];
    if (/^\d+$/.test(q)) { where.push('Doctor_ID = ?'); params.push(parseInt(q, 10)); }
    where.push('Name LIKE ?'); params.push(`%${q}%`);
    const sql = `SELECT Doctor_ID, Name FROM Doctor WHERE ${where.join(' OR ')} ORDER BY Name`;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: get login table
router.get('/logins', async (req, res) => {
  try {
    const sql = `
      SELECT 
        l.User_ID, l.Username, l.Role, l.Doctor_ID, l.Created_On, l.Last_Active,
        d.Name as DoctorName, d.Phone_Number as DoctorPhone, d.Email_Id as DoctorEmail, d.Qualifications as DoctorQualifications,
        d.Gender as DoctorGender, d.DOB as DoctorDOB
      FROM Login l 
      LEFT JOIN Doctor d ON l.Doctor_ID = d.Doctor_ID 
      ORDER BY l.Role, l.Username
    `;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Admin: search logins by username/role/doctor name or numeric User_ID
router.get('/logins/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  try {
    const params = [];
    const where = [];
    // numeric User_ID exact
    if (/^\d+$/.test(q)) { where.push('l.User_ID = ?'); params.push(parseInt(q, 10)); }
    // username/role/doctor name LIKE
    where.push('l.Username LIKE ?'); params.push(`%${q}%`);
    where.push('l.Role LIKE ?'); params.push(`%${q}%`);
    where.push('d.Name LIKE ?'); params.push(`%${q}%`);
    where.push('d.Email_Id LIKE ?'); params.push(`%${q}%`);
    where.push('d.Phone_Number LIKE ?'); params.push(`%${q}%`);
    where.push('d.Qualifications LIKE ?'); params.push(`%${q}%`);
    const sql = `
      SELECT 
        l.User_ID, l.Username, l.Role, l.Doctor_ID, l.Created_On, l.Last_Active,
        d.Name as DoctorName, d.Phone_Number as DoctorPhone, d.Email_Id as DoctorEmail, d.Qualifications as DoctorQualifications,
        d.Gender as DoctorGender, d.DOB as DoctorDOB
      FROM Login l LEFT JOIN Doctor d ON l.Doctor_ID = d.Doctor_ID
      WHERE ${where.join(' OR ')}
      ORDER BY l.Role, l.Username
    `;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Admin: update a doctor user's login (username/password) and doctor details
router.put('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid user id' });
  const { username, password, doctorName, phone, email, qualifications, gender, dob } = req.body || {};
  const conn = await pool.getConnection();
  try {
    const [[row]] = await conn.query(`SELECT Role, Doctor_ID FROM Login WHERE User_ID = ?`, [id]);
    if (!row) { conn.release(); return res.status(404).json({ error: 'User not found' }); }
    if (row.Role !== 'Doctor') { conn.release(); return res.status(403).json({ error: 'Only Doctor accounts can be edited' }); }

    await conn.beginTransaction();
    const updates = [];
    const params = [];
    if (username) { updates.push('Username = ?'); params.push(username); }
    if (updates.length) {
      params.push(id);
      await conn.query(`UPDATE Login SET ${updates.join(', ')} WHERE User_ID = ?`, params);
    }
    if (password && password.length > 0) {
      const hash = await bcrypt.hash(password, 10);
      await conn.query(`UPDATE Login SET Password_Hash = ? WHERE User_ID = ?`, [hash, id]);
    }
    if (row.Doctor_ID) {
      const dUpdates = [];
      const dParams = [];
      if (doctorName != null) { dUpdates.push('Name = ?'); dParams.push(doctorName); }
      if (phone != null) { dUpdates.push('Phone_Number = ?'); dParams.push(phone); }
      if (email != null) { dUpdates.push('Email_Id = ?'); dParams.push(email); }
      if (qualifications != null) { dUpdates.push('Qualifications = ?'); dParams.push(qualifications); }
      if (gender && ['Male','Female','Other'].includes(gender)) { dUpdates.push('Gender = ?'); dParams.push(gender); }
      if (dob && /^\d{4}-\d{2}-\d{2}$/.test(dob)) { dUpdates.push('DOB = ?'); dParams.push(dob); }
      if (dUpdates.length) {
        dParams.push(row.Doctor_ID);
        await conn.query(`UPDATE Doctor SET ${dUpdates.join(', ')} WHERE Doctor_ID = ?`, dParams);
      }
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    try { await conn.rollback(); } catch {}
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// Admin: create a generic user (Admin/FrontDesk/Doctor with optional Doctor_ID)
router.post('/users', async (req, res) => {
  try {
    const { username, password, doctorId } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password are required' });
    if (!doctorId) return res.status(400).json({ error: 'doctorId is required to create Doctor users' });
    const hash = await bcrypt.hash(password, 10);
    // Force role to 'Doctor' always
    await pool.query(`INSERT INTO Login (Username, Password_Hash, Role, Doctor_ID) VALUES (?, ?, 'Doctor', ?)`, [username, hash, doctorId]);
    res.json({ ok: true });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Username already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: get login attempts (activity)
router.get('/attempts', async (req, res) => {
  try {
    const sql = `
      SELECT la.Attempt_ID, la.Username, l.Role, la.Attempt_Time, la.Success
      FROM Login_Attempts la
      LEFT JOIN Login l ON la.Username = l.Username
      ORDER BY la.Attempt_Time DESC
    `;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Search login attempts
router.get('/attempts/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  try {
    const params = [];
    let where = [];

    // map common status terms
    const qLower = q.toLowerCase();
    if (qLower === 'success' || qLower === 'successful' || qLower === 'passed') {
      where.push('la.Success = 1');
    } else if (qLower === 'fail' || qLower === 'failed' || qLower === 'unsuccessful') {
      where.push('la.Success = 0');
    }

    // username/role LIKE
    where.push('la.Username LIKE ?');
    params.push(`%${q}%`);
    where.push('l.Role LIKE ?');
    params.push(`%${q}%`);

    const sql = `
      SELECT la.Attempt_ID, la.Username, l.Role, la.Attempt_Time, la.Success
      FROM Login_Attempts la
      LEFT JOIN Login l ON la.Username = l.Username
      WHERE ${where.join(' OR ')}
      ORDER BY la.Attempt_Time DESC
    `;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
