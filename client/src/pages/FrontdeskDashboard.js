import React, { useState, useEffect } from 'react';
import { createPatient, searchPatients, getAppointments, createAppointment, editAppointment, deleteAppointment } from '../api';
import PatientForm from '../components/PatientForm';
import AppointmentForm from '../components/AppointmentForm';
import AppointmentList from '../components/AppointmentList';
import LogoutButton from '../components/LogoutButton';

export default function FrontdeskDashboard({ user }) {
  const [patients, setPatients] = useState([]);
  const [appts, setAppts] = useState([]);
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState({});

  useEffect(()=> {
    loadAppts();
  }, [filters]);

  const loadAppts = async () => {
    const list = await getAppointments(filters);
    setAppts(list);
  };

  const doSearch = async () => {
    const res = await searchPatients(q);
    setPatients(res);
  };

  const addPatient = async (data) => {
    const p = await createPatient(data);
    setPatients(prev => [p, ...prev]);
  };

  const createAppt = async (data) => {
    await createAppointment(data);
    loadAppts();
  };

  return (
    <div style={{padding:20}}>
      <h2>Frontdesk Dashboard</h2>
      <LogoutButton />
      <div style={{display:'flex', gap:20}}>
        <div style={{flex:1}}>
          <h3>Register patient</h3>
          <PatientForm onSubmit={addPatient} />
        </div>
        <div style={{flex:1}}>
          <h3>Search patient</h3>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="name or phone"/>
          <button onClick={doSearch}>Search</button>
          <ul>{patients.map(p=><li key={p.Patient_ID}>{p.Name} — {p.Phone_Number}</li>)}</ul>
        </div>
      </div>

      <hr/>
      <h3>Appointments</h3>
      <AppointmentForm onSubmit={createAppt} />
      <AppointmentList appts={appts} onEdit={async (id, data)=>{ await editAppointment(id, data); loadAppts(); }} onDelete={async id=>{ await deleteAppointment(id); loadAppts(); }} />
    </div>
  );
}
