import React, { useState, useEffect } from "react";
import {
  createPatient,
  searchPatients,
} from "../api";
import PatientForm from "../components/PatientForm";
import PatientList from "../components/PatientList";
import PatientFormModal from "../components/PatientFormModal";
import Navbar from "../components/Navbar";
import styles from "../css/FrontdeskDashboard.module.css";

export default function FrontdeskPatientSearch({ user }) {
  const [patients, setPatients] = useState([]);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  // Load patients
  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    try {
      const data = await searchPatients(""); // get all patients
      setPatients(data);
    } catch (err) {
      console.error("Error loading patients:", err);
    }
  }

  // Add new patient
  async function handleAddPatient(data) {
    await createPatient(data);
    alert("Patient registered successfully!");
    setShowPatientForm(false);
    loadPatients();
  }

  // Update existing patient
  async function handleUpdatePatient(id, data) {
    try {
      await fetch(`http://localhost:4000/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      alert("Patient updated successfully!");
      setEditingPatient(null);
      loadPatients();
    } catch (err) {
      console.error("Error updating patient:", err);
    }
  }

  // Delete patient
  async function handleDeletePatient(id) {
    if (!window.confirm("Delete this patient?")) return;
    try {
      await fetch(`http://localhost:4000/patients/${id}`, { method: "DELETE" });
      alert("Patient deleted successfully!");
      loadPatients();
    } catch (err) {
      console.error("Error deleting patient:", err);
    }
  }

  // 🔍 Dynamic search
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        setLoading(true);
        try {
          const data = await searchPatients(searchTerm);
          setPatients(data);
        } catch (err) {
          console.error("Search failed:", err);
        } finally {
          setLoading(false);
        }
      } else {
        loadPatients();
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.materialTable}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>PATIENT RECORDS</span>

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
          </div>
        )}

        <div className={styles.tableContent}>
          <PatientList
            patients={patients}
            onEdit={(patient) => setEditingPatient(patient)}
            onDelete={handleDeletePatient}
          />
        </div>
      </div>

      {showPatientForm && (
        <div className={styles.formCard}>
          <h3>Register Patient</h3>
          <PatientForm onSubmit={handleAddPatient} />
        </div>
      )}

      {(showPatientModal || editingPatient) && (
        <PatientFormModal
          onClose={() => {
            setShowPatientModal(false);
            setEditingPatient(null);
          }}
          onSubmit={(data) => {
            if (editingPatient)
              handleUpdatePatient(editingPatient.Patient_ID, data);
            else handleAddPatient(data);
          }}
          editData={editingPatient}
        />
      )}
    </div>
  );
}