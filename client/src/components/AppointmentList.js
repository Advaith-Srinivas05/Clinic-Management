// AppointmentList.js
import React, { useState } from 'react';

export default function AppointmentList({ appts, onEdit, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const startEdit = (appt) => {
    setEditing(appt.Appt_ID);
    setForm({ ...appt });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
  try {
    // Keep only valid DB fields
    const clean = {
      Doctor_ID: form.Doctor_ID,
      Patient_ID: form.Patient_ID,
      Date: form.Date,
      Time: form.Time,
      Cause_of_Visit: form.Cause_of_Visit,
      Status: form.Status,
    };
    await onEdit(editing, clean);
    setEditing(null);
  } catch (err) {
    console.error("Error saving appointment:", err);
    alert(err.error || "Failed to save appointment");
  }
};


  return (
    <div>
      <table border="1" cellPadding="5" style={{ width: '100%', marginTop: 10 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Cause</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appts.map((a) => (
            <tr key={a.Appt_ID}>
              <td>{a.Appt_ID}</td>
              <td>{a.PatientName || a.Patient_ID}</td>
              <td>{a.DoctorName || a.Doctor_ID}</td>
              <td>
                {editing === a.Appt_ID ? (
                  <input name="Date" value={form.Date} onChange={handleChange} />
                ) : (
                  a.Date
                )}
              </td>
              <td>
                {editing === a.Appt_ID ? (
                  <input name="Time" value={form.Time} onChange={handleChange} />
                ) : (
                  a.Time
                )}
              </td>
              <td>
                {editing === a.Appt_ID ? (
                  <select name="Status" value={form.Status} onChange={handleChange}>
                    <option>Scheduled</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                ) : (
                  a.Status
                )}
              </td>
              <td>
                {editing === a.Appt_ID ? (
                  <input name="Cause_of_Visit" value={form.Cause_of_Visit} onChange={handleChange} />
                ) : (
                  a.Cause_of_Visit
                )}
              </td>
              <td>
                {editing === a.Appt_ID ? (
                  <>
                    <button onClick={save}>Save</button>
                    <button onClick={() => setEditing(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(a)}>Edit</button>
                    <button onClick={() => onDelete(a.Appt_ID)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}