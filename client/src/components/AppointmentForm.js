import React, { useState, useEffect } from "react";
import { searchPatients } from "../api";

export default function AppointmentForm({ onSubmit }) {
  const [form, setForm] = useState({
    Doctor_ID: "",
    Patient_ID: "",
    Date: "",
    Time: "",
    Cause_of_Visit: "",
  });

  const [doctorQuery, setDoctorQuery] = useState("");
  const [patientQuery, setPatientQuery] = useState("");
  const [doctorResults, setDoctorResults] = useState([]);
  const [patientResults, setPatientResults] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Debounced search for doctors & patients
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (doctorQuery.trim()) {
        const res = await searchPatients(doctorQuery); // reuse API for doctors too
        setDoctorResults(res.filter((r) => r.Qualifications)); // doctors only
      } else {
        setDoctorResults([]);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [doctorQuery]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (patientQuery.trim()) {
        const res = await searchPatients(patientQuery);
        setPatientResults(res);
      } else {
        setPatientResults([]);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [patientQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedPatient) {
      alert("Please select both doctor and patient");
      return;
    }
    onSubmit({
      Doctor_ID: selectedDoctor.Doctor_ID,
      Patient_ID: selectedPatient.Patient_ID,
      Date: form.Date,
      Time: form.Time,
      Cause_of_Visit: form.Cause_of_Visit,
    });
    setForm({ Doctor_ID: "", Patient_ID: "", Date: "", Time: "", Cause_of_Visit: "" });
    setSelectedDoctor(null);
    setSelectedPatient(null);
    setDoctorQuery("");
    setPatientQuery("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Doctor search */}
      <div style={{ position: "relative" }}>
        <input
          placeholder="Search Doctor (name or phone)"
          value={doctorQuery}
          onChange={(e) => setDoctorQuery(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />
        {doctorQuery && doctorResults.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "38px",
              left: 0,
              width: "100%",
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "6px",
              zIndex: 10,
              maxHeight: "150px",
              overflowY: "auto",
            }}
          >
            {doctorResults.map((d) => (
              <div
                key={d.Doctor_ID}
                style={{ padding: "6px 10px", cursor: "pointer" }}
                onClick={() => {
                  setSelectedDoctor(d);
                  setDoctorQuery(d.Name);
                  setDoctorResults([]);
                }}
              >
                {d.Name} — {d.Phone_Number}
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedDoctor && (
        <div style={{ fontSize: "0.9em", color: "green" }}>
          Selected Doctor: <b>{selectedDoctor.Name}</b>
        </div>
      )}

      {/* Patient search */}
      <div style={{ position: "relative" }}>
        <input
          placeholder="Search Patient (name or phone)"
          value={patientQuery}
          onChange={(e) => setPatientQuery(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />
        {patientQuery && patientResults.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "38px",
              left: 0,
              width: "100%",
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "6px",
              zIndex: 10,
              maxHeight: "150px",
              overflowY: "auto",
            }}
          >
            {patientResults.map((p) => (
              <div
                key={p.Patient_ID}
                style={{ padding: "6px 10px", cursor: "pointer" }}
                onClick={() => {
                  setSelectedPatient(p);
                  setPatientQuery(p.Name);
                  setPatientResults([]);
                }}
              >
                {p.Name} — {p.Phone_Number}
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedPatient && (
        <div style={{ fontSize: "0.9em", color: "green" }}>
          Selected Patient: <b>{selectedPatient.Name}</b>
        </div>
      )}

      {/* Rest of fields */}
      <input
        type="date"
        name="Date"
        value={form.Date}
        onChange={(e) => setForm({ ...form, Date: e.target.value })}
        required
      />
      <input
        type="time"
        name="Time"
        value={form.Time}
        onChange={(e) => setForm({ ...form, Time: e.target.value })}
        required
      />
      <textarea
        placeholder="Cause of Visit"
        name="Cause_of_Visit"
        value={form.Cause_of_Visit}
        onChange={(e) => setForm({ ...form, Cause_of_Visit: e.target.value })}
        style={{ resize: "none" }}
      />
      <button type="submit">Create Appointment</button>
    </form>
  );
}
