import React, { useState, useEffect } from 'react';
import { getAppointments, createPrescription, medicines, payments, searchAppointments } from '../api';
import DoctorNavbar from '../components/DoctorNavbar';
import DoctorAppointmentList from '../components/DoctorAppointmentList';
import PrescriptionWizardModal from '../components/PrescriptionWizardModal';
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
  const [showWizard, setShowWizard] = useState(false);
  const [activeAppt, setActiveAppt] = useState(null);

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

  const handleStart = (appt) => {
    setActiveAppt(appt);
    setShowWizard(true);
  };

  const handleFinishWizard = async ({ notes, items, fee }) => {
    if (!activeAppt) return;
    try {
      setLoading(true);
      let firstPrescriptionId = null;

      // Create prescription rows; stock reduction handled per call by backend
      for (const it of items) {
        for (let i = 0; i < (it.qty || 1); i++) {
          const created = await createPrescription({
            Appt_ID: activeAppt.Appt_ID,
            Doctor_ID: doctorId,
            Patient_ID: activeAppt.Patient_ID,
            Prescription: notes || '',
            Medicine_ID: it.Medicine_ID || null
          });
          if (!firstPrescriptionId && created?.Prescription_ID) {
            firstPrescriptionId = created.Prescription_ID;
          }
        }
      }

      // compute total
      const medsTotal = (items || []).reduce((sum, it) => {
        const med = meds.find(m => String(m.Medicine_ID) === String(it.Medicine_ID));
        const price = med?.Cost_to_sell ? Number(med.Cost_to_sell) : 0;
        const q = Math.max(1, Number(it.qty) || 1);
        return sum + price * q;
      }, 0);
      const totalAmount = Number(fee || 0) + medsTotal;

      await payments.make({
        Appt_ID: activeAppt.Appt_ID,
        Patient_ID: activeAppt.Patient_ID,
        Date: new Date().toISOString().slice(0, 10),
        Time: new Date().toISOString().slice(11, 19),
        Amount: totalAmount,
        Mode_of_payment: 'Cash',
        Prescription_ID: firstPrescriptionId || null
      });

      setShowWizard(false);
      setActiveAppt(null);
      await load();
      alert('Appointment completed successfully!');
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('Failed to complete appointment. Please try again.');
    } finally {
      setLoading(false);
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
              onStart={handleStart} 
            />
          )}
        </div>
      </div>
      {showWizard && activeAppt && (
        <PrescriptionWizardModal
          appt={activeAppt}
          medicines={meds}
          onClose={() => { setShowWizard(false); setActiveAppt(null); }}
          onFinish={handleFinishWizard}
        />
      )}
    </div>
  );
}