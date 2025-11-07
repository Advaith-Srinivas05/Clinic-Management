const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all doctors
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT Doctor_ID, Name, Qualifications FROM Doctor"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).json({ error: "Database error fetching doctors" });
  }
});
router.get('/:id/stats', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid doctor id' });
  try {
    const [statusRows] = await pool.query(
      `SELECT Status, COUNT(*) as count FROM Appointments WHERE Doctor_ID = ? GROUP BY Status`,
      [id]
    );

    const [[{ uniquePatients }]] = await pool.query(
      `SELECT COUNT(DISTINCT Patient_ID) as uniquePatients FROM Appointments WHERE Doctor_ID = ?`,
      [id]
    );

    const [[{ revenue }]] = await pool.query(
      `SELECT COALESCE(SUM(p.Amount), 0) as revenue
       FROM Payments p
       JOIN Appointments a ON p.Appt_ID = a.Appt_ID
       WHERE a.Doctor_ID = ?`,
      [id]
    );

    const [[{ upcomingToday }]] = await pool.query(
      `SELECT COUNT(*) as upcomingToday FROM Appointments WHERE Doctor_ID = ? AND Date = CURDATE() AND Status = 'Scheduled'`,
      [id]
    );
    const [[{ upcomingWeek }]] = await pool.query(
      `SELECT COUNT(*) as upcomingWeek FROM Appointments WHERE Doctor_ID = ? AND Date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND Status = 'Scheduled'`,
      [id]
    );

    const [[{ avgApptsPerDay }]] = await pool.query(
      `SELECT COALESCE(AVG(cnt),0) as avgApptsPerDay FROM (
         SELECT Date, COUNT(*) as cnt
         FROM Appointments
         WHERE Doctor_ID = ? AND Date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY Date
       ) t`,
      [id]
    );

    const [topMedicines] = await pool.query(
      `SELECT m.Med_Name, COUNT(*) as count
       FROM Prescription pr
       JOIN Medicine m ON pr.Medicine_ID = m.Medicine_ID
       WHERE pr.Doctor_ID = ? AND pr.Medicine_ID IS NOT NULL
       GROUP BY pr.Medicine_ID, m.Med_Name
       ORDER BY count DESC
       LIMIT 5`,
      [id]
    );

    const [recentAppointments] = await pool.query(
      `SELECT a.Appt_ID, a.Date, a.Time, a.Status, a.Cause_of_Visit, p.Name AS PatientName
       FROM Appointments a
       LEFT JOIN Patient p ON a.Patient_ID = p.Patient_ID
       WHERE a.Doctor_ID = ?
       ORDER BY a.Date DESC, a.Time DESC
       LIMIT 10`,
      [id]
    );

    const totalsByStatus = statusRows.reduce((acc, r) => { acc[r.Status] = r.count; return acc; }, {});
    res.json({ totalsByStatus, uniquePatients, revenue, upcomingToday, upcomingWeek, avgApptsPerDay, topMedicines, recentAppointments });
  } catch (err) {
    console.error('Error fetching doctor stats:', err);
    res.status(500).json({ error: 'Database error fetching stats' });
  }
});

module.exports = router;
