// AppointmentForm.js
import React, { useState } from 'react';

export default function AppointmentForm({ onSubmit }) {
  const [form, setForm] = useState({
    Doctor_ID: '',
    Patient_ID: '',
    Date: '',
    Time: '',
    Cause_of_Visit: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ Doctor_ID: '', Patient_ID: '', Date: '', Time: '', Cause_of_Visit: '' });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <input name="Doctor_ID" placeholder="Doctor ID" value={form.Doctor_ID} onChange={handleChange} required />
      <input name="Patient_ID" placeholder="Patient ID" value={form.Patient_ID} onChange={handleChange} required />
      <input name="Date" type="date" value={form.Date} onChange={handleChange} required />
      <input name="Time" type="time" value={form.Time} onChange={handleChange} required />
      <textarea name="Cause_of_Visit" placeholder="Cause of Visit" value={form.Cause_of_Visit} onChange={handleChange}></textarea>
      <button type="submit">Create Appointment</button>
    </form>
  );
}
