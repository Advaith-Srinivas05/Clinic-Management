// AppointmentFormModal.js
import React, { useState, useEffect } from "react";
import styles from "../css/AppointmentFormModal.module.css";
import { searchPatients } from "../api";

export default function AppointmentFormModal({ doctors, onClose, onSubmit }) {
  const [form, setForm] = useState({
    Doctor_ID: doctors.length ? doctors[0].Doctor_ID : "",
    Patient_ID: "",
    Date: "",
    Time: "",
    Cause_of_Visit: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // search debounce
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert("Please select a patient.");
      return;
    }
    onSubmit({
      ...form,
      Patient_ID: selectedPatient.Patient_ID,
    });
    setForm({
      Doctor_ID: doctors.length ? doctors[0].Doctor_ID : "",
      Patient_ID: "",
      Date: "",
      Time: "",
      Cause_of_Visit: "",
    });
    setSearchTerm("");
    setSelectedPatient(null);
    onClose(); // ✅ close modal after submit
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        {/* Left side */}
        <div className={styles.leftContainer}>
          <h1>
            <i className="fas fa-calendar-alt"></i> CLINIC
          </h1>
          <div className={styles.imageBox}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
              alt="appointment-illustration"
            />
          </div>
        </div>

        {/* Right side */}
        <div className={styles.rightContainer}>
          <header>
            <h1>Add Appointment</h1>
          </header>

          <form onSubmit={handleSubmit}>
            {/* Doctor Dropdown */}
            <div className={styles.set}>
              <div>
                <label htmlFor="Doctor_ID">Doctor</label>
                <select
                  name="Doctor_ID"
                  value={form.Doctor_ID}
                  onChange={(e) =>
                    setForm({ ...form, Doctor_ID: e.target.value })
                  }
                  required
                >
                  {doctors.map((d) => (
                    <option key={d.Doctor_ID} value={d.Doctor_ID}>
                      {d.Name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Patient Search */}
            <div className={styles.set}>
              <div style={{ position: "relative" }}>
                <label>Search Patient</label>
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {loading && (
                  <div className={styles.loading}>Searching...</div>
                )}
                {searchResults.length > 0 && (
                  <div className={styles.searchDropdown}>
                    {searchResults.map((p) => (
                      <div
                        key={p.Patient_ID}
                        className={styles.searchItem}
                        onClick={() => {
                          setSelectedPatient(p);
                          setSearchTerm(p.Name);
                          setSearchResults([]);
                        }}
                      >
                        {p.Name} — {p.Phone_Number}
                      </div>
                    ))}
                  </div>
                )}
                {selectedPatient && (
                  <div className={styles.selected}>
                    Selected: <b>{selectedPatient.Name}</b>
                  </div>
                )}
              </div>
            </div>

            {/* Date / Time */}
            <div className={styles.set}>
              <div>
                <label htmlFor="Date">Date</label>
                <input
                  type="date"
                  name="Date"
                  value={form.Date}
                  onChange={(e) =>
                    setForm({ ...form, Date: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label htmlFor="Time">Time</label>
                <input
                  type="time"
                  name="Time"
                  value={form.Time}
                  onChange={(e) =>
                    setForm({ ...form, Time: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Cause */}
            <div>
              <label htmlFor="Cause_of_Visit">Cause of Visit</label>
              <textarea
                name="Cause_of_Visit"
                value={form.Cause_of_Visit}
                onChange={(e) =>
                  setForm({ ...form, Cause_of_Visit: e.target.value })
                }
                placeholder="Describe symptoms or reason..."
              ></textarea>
            </div>

            <footer className={styles.footer}>
              <button
                type="button"
                className={styles.cancel}
                onClick={() => {
                  setSearchTerm("");
                  setSelectedPatient(null);
                  onClose(); // ✅ closes without submitting
                }}
              >
                Cancel
              </button>
              <button type="submit" className={styles.submit}>
                Add Appointment
              </button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
}