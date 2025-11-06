import React, { useState, useEffect } from 'react';
import { getAppointments, createPrescription, medicines, payments } from '../api';
import DoctorNavbar from '../components/DoctorNavbar';


export default function DoctorDashboard({ user }) {
  const doctorId = user.doctorId;
  const [appts, setAppts] = useState([]);
  const [meds, setMeds] = useState([]);

  useEffect(()=> { load(); loadMeds(); }, []);

  async function load() {
    const rows = await getAppointments({ doctorId });
    setAppts(rows);
  }
  async function loadMeds() {
    const m = await medicines.list();
    setMeds(m);
  }

  const issuePrescription = async (appt, prescriptionText, medicineId, consultCharge) => {
    // create prescription (reduces stock)
    await createPrescription({ Appt_ID: appt.Appt_ID, Doctor_ID: doctorId, Patient_ID: appt.Patient_ID, Prescription: prescriptionText, Medicine_ID: medicineId });
    // create payment (doctor assigns consultation charge + medicine price could be added on frontend via med.Cost_to_sell)
    const amount = Number(consultCharge) + (medicineId ? (meds.find(x=>x.Medicine_ID===Number(medicineId))?.Cost_to_sell || 0) : 0);
    await payments.make({ Appt_ID: appt.Appt_ID, Patient_ID: appt.Patient_ID, Date: new Date().toISOString().slice(0,10), Time: new Date().toISOString().slice(11,19), Amount: amount, Mode_of_payment: 'Cash' , Prescription_ID: null});
    await load();
  };

  return (
    <div style={{padding:20}}>
      <DoctorNavbar/>
      <h2>Doctor Dashboard (you are doctor ID: {doctorId})</h2>
      <h3>Your Queue</h3>
      <ul>
        {appts.map(a => (
          <li key={a.Appt_ID}>
            {a.Date} {a.Time} — {a.PatientName} — {a.Status}
            <div>
              <button onClick={()=>{ /* show modal: simplified prompt */ const text = prompt('Symptoms/notes'); const med = prompt('Medicine ID (or blank)'); const charge = prompt('Consult charge'); issuePrescription(a, text, med, charge); }}>Start / Issue Prescription</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
