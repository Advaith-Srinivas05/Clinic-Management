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
import LogoutButton from "../components/LogoutButton";
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

  // Search input (debounced)
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        setLoading(true);
        const res = await searchPatients(searchTerm);
        setSearchResults(res);
        setLoading(false);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  return (
    <div className={styles.page}>
      <LogoutButton />

      <div className={styles.materialTable}>
        {/* ===== Header ===== */}
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Appointments</span>

          <div className={styles.actions}>
            {/* Add patient */}
            <button
              className={styles.iconButton}
              title="Register patient"
              onClick={() => {
                setShowPatientForm(!showPatientForm);
                setShowApptForm(false);
              }}
            >
              <i className="material-icons">person_add</i>
            </button>

            {/* Add appointment */}
            <button
              className={styles.iconButton}
              title="Add appointment"
              onClick={() => {
                setShowApptForm(!showApptForm);
                setShowPatientForm(false);
              }}
            >
              <i className="material-icons">event</i>
            </button>

            {/* Search toggle */}
            <button
              className={styles.iconButton}
              title="Search"
              onClick={() => setShowSearch(!showSearch)}
            >
              <i className="material-icons">search</i>
            </button>
          </div>
        </div>

        {/* ===== Search bar ===== */}
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

        {/* ===== Appointment Table ===== */}
        <div className={styles.tableContent}>
          <AppointmentList
            appts={appts}
            onEdit={async (id, data) => {
              await editAppointment(id, data);
              loadAppts();
            }}
            onDelete={async (id) => {
              await deleteAppointment(id);
              loadAppts();
            }}
          />
        </div>
      </div>

      {/* ===== Register Patient Modal ===== */}
      {showPatientForm && (
        <div className={styles.formCard}>
          <h3>Register Patient</h3>
          <PatientForm onSubmit={handleAddPatient} />
        </div>
      )}

      {/* ===== Add Appointment Modal ===== */}
      {showApptForm && (
        <div className={styles.formCard}>
          <h3>Add Appointment</h3>
          <AppointmentForm onSubmit={handleCreateAppt} />
        </div>
      )}
    </div>
  );
}