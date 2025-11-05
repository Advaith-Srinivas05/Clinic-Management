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

export default function FrontdeskDashboard({ user }) {
  const [appts, setAppts] = useState([]);
  const [filters, setFilters] = useState({});
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showApptForm, setShowApptForm] = useState(false);
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
    alert("Patient added successfully!");
    setShowPatientForm(false);
  }

  async function handleCreateAppt(data) {
    await createAppointment(data);
    alert("Appointment created successfully!");
    setShowApptForm(false);
    loadAppts();
  }

  // 🔍 Dynamic search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        setLoading(true);
        const res = await searchPatients(searchTerm);
        setSearchResults(res);
        setLoading(false);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <div style={{ position: "relative", padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              setShowPatientForm(!showPatientForm);
              setShowApptForm(false);
            }}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              background: "#4caf50",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {showPatientForm ? "Close" : "Register Patient"}
          </button>

          <button
            onClick={() => {
              setShowApptForm(!showApptForm);
              setShowPatientForm(false);
            }}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              background: "#1976d2",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {showApptForm ? "Close" : "Add Appointment"}
          </button>
        </div>

        {/* 🔍 Search Bar */}
        <div style={{ position: "relative", width: "300px", marginRight: "60px" }}>
          <input
            type="text"
            placeholder="Search patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
          {searchTerm && searchResults.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "38px",
                left: 0,
                width: "100%",
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "6px",
                maxHeight: "200px",
                overflowY: "auto",
                zIndex: 100,
              }}
            >
              {searchResults.map((p) => (
                <div
                  key={p.Patient_ID}
                  style={{
                    padding: "6px 10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                  onClick={() => {
                    alert(`Patient selected: ${p.Name}`);
                    setSearchTerm("");
                    setSearchResults([]);
                  }}
                >
                  {p.Name} — {p.Phone_Number}
                </div>
              ))}
              {loading && <div style={{ padding: "6px 10px" }}>Loading...</div>}
            </div>
          )}
        </div>

        <LogoutButton />
      </div>

      {/* ===== Forms (modals) ===== */}
      {showPatientForm && (
        <div
          style={{
            background: "#f8f9fa",
            padding: 20,
            borderRadius: 10,
            marginBottom: 20,
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Register Patient</h3>
          <PatientForm onSubmit={handleAddPatient} />
        </div>
      )}

      {showApptForm && (
        <div
          style={{
            background: "#f8f9fa",
            padding: 20,
            borderRadius: 10,
            marginBottom: 20,
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Add Appointment</h3>
          <AppointmentForm onSubmit={handleCreateAppt} />
        </div>
      )}

      {/* ===== Main Appointment List ===== */}
      <div style={{ marginTop: 10 }}>
        <h2>Appointments</h2>
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
  );
}
