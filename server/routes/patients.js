const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create patient (frontdesk)
// SQL: INSERT INTO Patient (...) VALUES (...)
router.post('/', async (req, res) => {
  const { Name, DOB, Gender, Height, Weight, Blood_Group, Phone_Number, Mothers_Name, Fathers_Name, Profession, Portfolio } = req.body;
  try {
    const sql = `INSERT INTO Patient (Name, DOB, Gender, Height, Weight, Blood_Group, Phone_Number, Mothers_Name, Fathers_Name, Profession, Portfolio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [Name, DOB, Gender, Height, Weight, Blood_Group, Phone_Number, Mothers_Name, Fathers_Name, Profession, Portfolio]);
    const [rows] = await pool.query(`SELECT * FROM Patient WHERE Patient_ID = ?`, [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search patients by name / phone (simple search box)
// SQL: SELECT * FROM Patient WHERE Name LIKE ? OR Phone_Number LIKE ?
router.get('/search', async (req, res) => {
  const q = `%${req.query.q || ''}%`;
  try {
    const sql = `SELECT * FROM Patient WHERE Name LIKE ? OR Phone_Number LIKE ? ORDER BY Name LIMIT 100`;
    const [rows] = await pool.query(sql, [q, q]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get patient by id
router.get('/:id', async (req, res) => {
  try {
    const sql = `SELECT * FROM Patient WHERE Patient_ID = ?`;
    const [rows] = await pool.query(sql, [req.params.id]);
    res.json(rows[0] || null);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Update patient
// SQL: UPDATE Patient SET ... WHERE Patient_ID = ?
router.put('/:id', async (req, res) => {
  const { Name, DOB, Gender, Height, Weight, Blood_Group, Phone_Number, Mothers_Name, Fathers_Name, Profession, Portfolio } = req.body;
  try {
    const sql = `UPDATE Patient SET Name=?, DOB=?, Gender=?, Height=?, Weight=?, Blood_Group=?, Phone_Number=?, Mothers_Name=?, Fathers_Name=?, Profession=?, Portfolio=? WHERE Patient_ID=?`;
    await pool.query(sql, [Name, DOB, Gender, Height, Weight, Blood_Group, Phone_Number, Mothers_Name, Fathers_Name, Profession, Portfolio, req.params.id]);
    const [rows] = await pool.query(`SELECT * FROM Patient WHERE Patient_ID = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Delete patient
// SQL: DELETE FROM Patient WHERE Patient_ID = ?
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // First, delete related records to maintain referential integrity
    const deleteQueries = [
      'DELETE FROM Payments WHERE Patient_ID = ?',
      'DELETE FROM Prescription WHERE Patient_ID = ?',
      'DELETE FROM Appointments WHERE Patient_ID = ?',
      'DELETE FROM Patient WHERE Patient_ID = ?'
    ];

    for (const query of deleteQueries) {
      await connection.query(query, [req.params.id]);
    }
    
    await connection.commit();
    res.json({ message: 'Patient and all related records deleted successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('Error deleting patient:', err);
    res.status(500).json({ 
      error: 'Failed to delete patient',
      details: err.message 
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
