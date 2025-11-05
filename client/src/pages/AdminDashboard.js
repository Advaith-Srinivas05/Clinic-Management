import React, { useEffect, useState } from 'react';
import { medicines, admin } from '../api';
import LogoutButton from '../components/LogoutButton';


export default function AdminDashboard() {
  const [meds, setMeds] = useState([]);
  const [logins, setLogins] = useState([]);
  const [newDoc, setNewDoc] = useState({ username:'', password:'', doctorName:'' });

  useEffect(()=> load(), []);
  async function load() {
    setMeds(await medicines.list());
    setLogins(await admin.logins());
  }

  const createDoctor = async () => {
    await admin.createDoctor(newDoc);
    setNewDoc({ username:'', password:'', doctorName:''});
    load();
  };

  return (
    <div style={{padding:20}}>
      <h2>Admin Dashboard</h2>
      <LogoutButton />
      <h3>Create Doctor Login</h3>
      <input placeholder="username" value={newDoc.username} onChange={e=>setNewDoc({...newDoc, username: e.target.value})} />
      <input placeholder="password" value={newDoc.password} onChange={e=>setNewDoc({...newDoc, password: e.target.value})} />
      <input placeholder="doctor name" value={newDoc.doctorName} onChange={e=>setNewDoc({...newDoc, doctorName: e.target.value})} />
      <button onClick={createDoctor}>Create</button>

      <h3>Medicine Stock</h3>
      <ul>{meds.map(m => <li key={m.Medicine_ID}>{m.Med_Name} — {m.Stock_Left}</li>)}</ul>

      <h3>Logins</h3>
      <ul>{logins.map(l => <li key={l.User_ID}>{l.Username} - {l.Role} - doctor: {l.DoctorName}</li>)}</ul>
    </div>
  );
}
