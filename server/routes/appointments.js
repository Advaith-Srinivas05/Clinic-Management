const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create appointment
// SQL: INSERT INTO Appointments (...) VALUES (...)
router.post('/', async (req, res) => {
  const { Doctor_ID, Patient_ID, Date, Time, Cause_of_Visit } = req.body;
  try {
    const sql = `INSERT INTO Appointments (Doctor_ID, Patient_ID, Date, Time, Cause_of_Visit, Status) VALUES (?, ?, ?, ?, ?, 'Scheduled')`;
    const [result] = await pool.query(sql, [Doctor_ID, Patient_ID, Date, Time, Cause_of_Visit]);
    const [appts] = await pool.query(`SELECT * FROM Appointments WHERE Appt_ID = ?`, [result.insertId]);
    res.json(appts[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Get appointment queue with filters (status, doctor, date)
// SQL: SELECT a.*, p.Name as PatientName, d.Name as DoctorName FROM Appointments a JOIN Patient p ... WHERE ...
router.get('/', async (req, res) => {
  const { status, doctorId, date } = req.query;
  let conditions = [];
  let params = [];
  if (status) { conditions.push('a.Status = ?'); params.push(status); }
  if (doctorId) { conditions.push('a.Doctor_ID = ?'); params.push(doctorId); }
  if (date) { conditions.push('a.Date = ?'); params.push(date); }

  const where = conditions.length ? ('WHERE ' + conditions.join(' AND ')) : '';
  const sql = `SELECT a.*, p.Name AS PatientName, d.Name AS DoctorName
               FROM Appointments a
               LEFT JOIN Patient p ON a.Patient_ID = p.Patient_ID
               LEFT JOIN Doctor d ON a.Doctor_ID = d.Doctor_ID
               ${where}
               ORDER BY a.Date, a.Time`;
  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Edit appointment
router.put('/:id', async (req, res) => {
  try {
    const { Doctor_ID, Patient_ID, Date, Time, Cause_of_Visit, Status } = req.body;

    // If no valid fields provided, return 400
    if (!Doctor_ID && !Patient_ID && !Date && !Time && !Cause_of_Visit && !Status) {
      return res.status(400).json({ error: "No valid fields provided to update." });
    }

    const sql = `UPDATE Appointments 
                 SET Doctor_ID=?, Patient_ID=?, Date=?, Time=?, Cause_of_Visit=?, Status=?
                 WHERE Appt_ID=?`;
    await pool.query(sql, [Doctor_ID || null, Patient_ID || null, Date || null, Time || null, Cause_of_Visit || null, Status || 'Scheduled', req.params.id]);

    const [rows] = await pool.query(`SELECT * FROM Appointments WHERE Appt_ID = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating appointment:", err);
    res.status(500).json({ error: "Database update failed." });
  }
});


// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const sql = `DELETE FROM Appointments WHERE Appt_ID = ?`;
    await pool.query(sql, [req.params.id]);
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
