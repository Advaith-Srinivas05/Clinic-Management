import React, { useState, useEffect } from "react";
import {
  createPatient,
  searchPatients,
  getAppointments,
  createAppointment,
  editAppointment,
  deleteAppointment,
} from "../api";
import PatientForm from "../components/PatientForm";
import AppointmentForm from "../components/AppointmentForm";
import AppointmentList from "../components/AppointmentList";
import PatientFormModal from "../components/PatientFormModal";
import AppointmentFormModal from "../components/AppointmentFormModal";
import Navbar from "../components/Navbar";
import styles from "../css/FrontdeskDashboard.module.css";

export default function FrontdeskDashboard({ user }) {
  const [appts, setAppts] = useState([]);
  const [filters, setFilters] = useState({});
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showApptForm, setShowApptForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showApptModal, setShowApptModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [editingAppt, setEditingAppt] = useState(null);

  useEffect(() => {
    async function fetchDoctors() {
      const res = await fetch("http://localhost:4000/api/doctors");
      const data = await res.json();
      setDoctors(data);
    }
    fetchDoctors();
  }, []);

  useEffect(() => {
    loadAppts();
  }, [filters]);

  async function loadAppts() {
    const list = await getAppointments(filters);
    setAppts(list);
  }

  async function handleAddPatient(data) {
    await createPatient(data);
    alert("Patient registered successfully!");
    setShowPatientForm(false);
  }

  async function handleCreateAppt(data) {
    await createAppointment(data);
    alert("Appointment created successfully!");
    setShowApptForm(false);
    loadAppts();
  }

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        setLoading(true);
        try {
          const res = await fetch(
            `http://localhost:4000/appointments/search?q=${encodeURIComponent(
              searchTerm
            )}`
          );
          const data = await res.json();
          setAppts(data); // ✅ dynamically updates table
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        // If search is cleared, reload all appointments
        loadAppts();
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.materialTable}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>APPOINTMENTS</span>

          <div className={styles.actions}>
            <button
              className={styles.iconButton}
              title="Register patient"
              onClick={() => setShowPatientModal(true)}
            >
              <i className="material-icons">person_add</i>
            </button>
            
            <button
              className={styles.iconButton}
              title="Add appointment"
              onClick={() => setShowApptModal(true)}
            >
              <i className="material-icons">event</i>
            </button>

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
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading && <div className={styles.loading}>Searching...</div>}
            {searchResults.length > 0 && (
              <div className={styles.searchDropdown}>
                {searchResults.map((p) => (
                  <div
                    key={p.Patient_ID}
                    className={styles.searchItem}
                    onClick={() => {
                      alert(`Selected Patient: ${p.Name}`);
                      setSearchTerm("");
                      setSearchResults([]);
                    }}
                  >
                    {p.Name} — {p.Phone_Number}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={styles.tableContent}>
          <AppointmentList
            appts={appts}
            onEdit={(appt) => setEditingAppt(appt)}
            onDelete={async (id) => {
              await deleteAppointment(id);
              loadAppts();
            }}
          />
        </div>
      </div>

      {showPatientForm && (
        <div className={styles.formCard}>
          <h3>Register Patient</h3>
          <PatientForm onSubmit={handleAddPatient} />
        </div>
      )}

      {showApptForm && (
        <div className={styles.formCard}>
          <h3>Add Appointment</h3>
          <AppointmentForm onSubmit={handleCreateAppt} />
        </div>
      )}

      {showPatientModal && (
        <PatientFormModal
          onClose={() => setShowPatientModal(false)}
          onSubmit={(data) => {
            handleAddPatient(data);
            setShowPatientModal(false);
          }}
        />
      )}

      {showApptModal && (
        <AppointmentFormModal
          doctors={doctors}
          onClose={() => setShowApptModal(false)}
          onSubmit={(data) => {
            handleCreateAppt(data);
            setShowApptModal(false);
          }}
        />
      )}

      {(showApptModal || editingAppt) && (
        <AppointmentFormModal
          doctors={doctors}
          onClose={() => {
            setShowApptModal(false);
            setEditingAppt(null);
          }}
          onSubmit={async (data) => {
            await handleCreateAppt(data);
            setShowApptModal(false);
          }}
          onUpdate={async (id, data) => {
            await editAppointment(id, data);
            loadAppts();
            setEditingAppt(null);
            alert("Appointment updated successfully!");
          }}
          editData={editingAppt}
        />
      )}
      
    </div>
  );
}