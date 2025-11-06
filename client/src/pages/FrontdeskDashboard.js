import React, { useState, useEffect, useCallback } from "react";
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
import ConfirmationModal from "../components/ConfirmationModal";
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
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
    onCancel: null,
    showCancel: false,
    confirmText: "OK"
  });

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

  const showModal = useCallback((message, onConfirm = null, options = {}) => {
    setModalConfig({
      isOpen: true,
      message,
      onConfirm: onConfirm || (() => setModalConfig(prev => ({ ...prev, isOpen: false }))),
      onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false })),
      showCancel: options.showCancel || false,
      confirmText: options.confirmText || "OK"
    });
  }, []);

  async function handleAddPatient(data) {
    try {
      await createPatient(data);
      showModal("Patient registered successfully!");
      setShowPatientModal(false);
    } catch (error) {
      showModal(error.message || "Failed to register patient");
    }
  }

  async function handleCreateAppt(data) {
    try {
      await createAppointment(data);
      showModal("Appointment created successfully!");
      setShowApptModal(false);
      loadAppts();
    } catch (error) {
      showModal(error.message || "Failed to create appointment");
    }
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
          setAppts(data); // dynamically updates table
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

  const deleteAppointment = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/appointments/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to delete appointment';
        try {
          const errorData = await response.text();
          if (errorData) {
            const jsonError = JSON.parse(errorData);
            errorMessage = jsonError.message || errorMessage;
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }
      
      // Update the appointments list by filtering out the deleted appointment
      setAppts(appts.filter(appt => appt.Appt_ID !== id));
      return true;
    } catch (err) {
      showModal(err.message || 'Error deleting appointment. Please try again.');
      throw err;
    }
  };

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
            onDelete={(id) => {
              showModal(
                "Are you sure you want to delete this appointment?",
                async () => {
                  try {
                    await deleteAppointment(id);
                  } catch (err) {
                    console.error('Error in onDelete handler:', err);
                  }
                },
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

      {(showApptModal || editingAppt) && (
        <AppointmentFormModal
          doctors={doctors}
          onClose={() => {
            setShowApptModal(false);
            setEditingAppt(null);
          }}
          onSubmit={async (data) => {
            try {
              if (editingAppt) {
                await editAppointment(editingAppt.Appt_ID, data);
                showModal("Appointment updated successfully!");
              } else {
                await createAppointment(data);
                showModal("Appointment created successfully!");
              }
              loadAppts();
              setShowApptModal(false);
              setEditingAppt(null);
            } catch (error) {
              showModal(error.message || (editingAppt ? "Failed to update appointment" : "Failed to create appointment"));
            }
          }}
          editData={editingAppt}
        />
      )}
      
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={modalConfig.onCancel}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.message.includes("success") ? "Success" : "Confirm Action"}
        message={modalConfig.message}
        showCancel={modalConfig.showCancel}
        confirmText={modalConfig.confirmText}
      />
    </div>
  );
}