// PatientForm.js
import React, { useState } from 'react';

export default function PatientForm({ onSubmit }) {
  const [form, setForm] = useState({
    Name: '',
    DOB: '',
    Gender: 'Male',
    Height: '',
    Weight: '',
    Blood_Group: '',
    Phone_Number: '',
    Mothers_Name: '',
    Fathers_Name: '',
    Profession: '',
    Portfolio: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({
      Name: '', DOB: '', Gender: 'Male', Height: '', Weight: '', Blood_Group: '',
      Phone_Number: '', Mothers_Name: '', Fathers_Name: '', Profession: '', Portfolio: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <input name="Name" placeholder="Name" value={form.Name} onChange={handleChange} required />
      <input name="DOB" type="date" value={form.DOB} onChange={handleChange} />
      <select name="Gender" value={form.Gender} onChange={handleChange}>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
      </select>
      <input name="Height" placeholder="Height (cm)" value={form.Height} onChange={handleChange} />
      <input name="Weight" placeholder="Weight (kg)" value={form.Weight} onChange={handleChange} />
      <input name="Blood_Group" placeholder="Blood Group" value={form.Blood_Group} onChange={handleChange} />
      <input name="Phone_Number" placeholder="Phone Number" value={form.Phone_Number} onChange={handleChange} required />
      <input name="Mothers_Name" placeholder="Mother's Name" value={form.Mothers_Name} onChange={handleChange} />
      <input name="Fathers_Name" placeholder="Father's Name" value={form.Fathers_Name} onChange={handleChange} />
      <input name="Profession" placeholder="Profession" value={form.Profession} onChange={handleChange} />
      <textarea name="Portfolio" placeholder="Portfolio / Notes" value={form.Portfolio} onChange={handleChange}></textarea>
      <button type="submit">Add Patient</button>
    </form>
  );
}
