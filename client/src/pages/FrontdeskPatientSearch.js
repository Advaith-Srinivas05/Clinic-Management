import React, { useState, useEffect, useCallback } from "react";
import {
  createPatient,
  searchPatients,
} from "../api";
import PatientForm from "../components/PatientForm";
import PatientList from "../components/PatientList";
import PatientFormModal from "../components/PatientFormModal";
import Navbar from "../components/Navbar";
import ConfirmationModal from "../components/ConfirmationModal";
import styles from "../css/FrontdeskDashboard.module.css";

export default function FrontdeskPatientSearch({ user }) {
  const [patients, setPatients] = useState([]);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
    showCancel: false,
    confirmText: "OK"
  });

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

  const showModal = useCallback((message, onConfirm = null, options = {}) => {
    setModalConfig({
      isOpen: true,
      message,
      onConfirm: onConfirm || (() => setModalConfig(prev => ({ ...prev, isOpen: false }))),
      showCancel: options.showCancel || false,
      confirmText: options.confirmText || "OK"
    });
  }, []);

  // Add new patient
  async function handleAddPatient(data) {
    try {
      await createPatient(data);
      showModal("Patient registered successfully!");
      setShowPatientModal(false);
      loadPatients();
    } catch (error) {
      showModal(error.message || "Failed to register patient");
    }
  }

  // Update existing patient
  async function handleUpdatePatient(id, data) {
    try {
      const response = await fetch(`http://localhost:4000/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update patient');
      }
      
      showModal("Patient updated successfully!");
      setEditingPatient(null);
      loadPatients();
    } catch (err) {
      console.error("Error updating patient:", err);
      showModal(err.message || "Failed to update patient");
    }
  }

  // Delete patient
  async function handleDeletePatient(id) {
    try {
      const response = await fetch(`http://localhost:4000/patients/${id}`, { 
        method: "DELETE" 
      });
      
      if (!response.ok) {
        // Try to parse error message, but don't fail if it's not JSON
        let errorMessage = 'Failed to delete patient';
        try {
          const errorData = await response.text();
          if (errorData) {
            const jsonError = JSON.parse(errorData);
            errorMessage = jsonError.message || errorMessage;
          }
        } catch (e) {
          // If we can't parse JSON, use default message
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }
      
      // Update the patients list by filtering out the deleted patient
      setPatients(patients.filter(patient => patient.Patient_ID !== id));
    } catch (err) {
      console.error("Error deleting patient:", err);
      // Show error message to the user
      showModal(err.message || 'Error deleting patient. Please try again.');
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
            onDelete={(id) => {
              showModal(
                "Are you sure you want to delete this patient? This action cannot be undone.",
                () => handleDeletePatient(id),
                { showCancel: true, confirmText: "Delete" }
              );
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
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        message={modalConfig.message}
        showCancel={modalConfig.showCancel}
        confirmText={modalConfig.confirmText}
      />
    </div>
  );
}