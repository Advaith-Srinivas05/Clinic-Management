import React, { useState, useEffect } from 'react';
import { getAppointments, createPrescription, medicines, payments, searchAppointments } from '../api';
import DoctorNavbar from '../components/DoctorNavbar';
import DoctorAppointmentList from '../components/DoctorAppointmentList';
import styles from '../css/FrontdeskDashboard.module.css';

export default function DoctorDashboard({ user }) {
  const storedDoctorId = typeof window !== 'undefined' ? localStorage.getItem('doctorId') : null;
  const doctorId = (user && user.doctorId != null)
    ? user.doctorId
    : (storedDoctorId != null ? Number(storedDoctorId) : undefined);
  const [appts, setAppts] = useState([]);
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { 
    load(); 
    loadMeds(); 
  }, [doctorId]);

  async function load() {
    try {
      setLoading(true);
      if (doctorId == null) { setAppts([]); return; }
      const rows = await getAppointments(doctorId ? { doctorId } : {});
      setAppts(rows);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMeds() {
    try {
      const m = await medicines.list();
      setMeds(m);
    } catch (error) {
      console.error('Error loading medicines:', error);
    }
  }

  const handlePrescribe = async (appt) => {
    const prescriptionText = prompt('Enter prescription details:');
    if (!prescriptionText) return;
    
    const medicineId = prompt('Enter Medicine ID (or leave blank):');
    const consultCharge = prompt('Enter consultation charge:');
    
    if (consultCharge === null) return;

    try {
      await createPrescription({ 
        Appt_ID: appt.Appt_ID, 
        Doctor_ID: doctorId, 
        Patient_ID: appt.Patient_ID, 
        Prescription: prescriptionText, 
        Medicine_ID: medicineId || null 
      });

      const amount = Number(consultCharge) + 
        (medicineId ? (meds.find(x => x.Medicine_ID === Number(medicineId))?.Cost_to_sell || 0) : 0);
      
      await payments.make({ 
        Appt_ID: appt.Appt_ID, 
        Patient_ID: appt.Patient_ID, 
        Date: new Date().toISOString().slice(0, 10), 
        Time: new Date().toISOString().slice(11, 19), 
        Amount: amount, 
        Mode_of_payment: 'Cash',
        Prescription_ID: null
      });
      
      await load();
      alert('Prescription and payment recorded successfully!');
    } catch (error) {
      console.error('Error issuing prescription:', error);
      alert('Failed to issue prescription. Please try again.');
    }
  };

  const debouncedSearch = async () => {
    if (searchTerm.trim().length > 0) {
      setLoading(true);
      try {
        const results = await searchAppointments(searchTerm);
        const filtered = (results || []).filter((a) => String(a.Doctor_ID) === String(doctorId));
        setAppts(filtered);
      } catch (error) {
        console.error('Error searching appointments:', error);
      } finally {
        setLoading(false);
      }
    } else {
      await load();
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(debouncedSearch, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, doctorId]);

  return (
    <div className={styles.page}>
      <DoctorNavbar />
      <div className={styles.materialTable}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>MY APPOINTMENTS</span>
          <div className={styles.actions}>
            <button
              className={styles.iconButton}
              title="Search"
              onClick={() => setShowSearch(!showSearch)}
            >
              <i className="material-icons">search</i>
            </button>
          </div>
        </div>
        {showSearch && (
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading && <div className={styles.loading}>Searching...</div>}
          </div>
        )}
        <div className={styles.tableContent}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading appointments...</div>
          ) : (
            <DoctorAppointmentList 
              appts={appts} 
              onPrescribe={handlePrescribe} 
            />
          )}
        </div>
      </div>
    </div>
  );
}