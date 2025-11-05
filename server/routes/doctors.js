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

module.exports = router;
