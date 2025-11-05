// AppointmentList.js
import React from "react";
import styles from "../css/AppointmentList.module.css";

export default function AppointmentList({ appts, onEdit, onDelete }) {
  if (!appts || appts.length === 0) {
    return <div className={styles.empty}>No appointments found.</div>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Cause</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {appts.map((a) => (
            <tr key={a.Appt_ID}>
              <td>{a.Appt_ID}</td>
              <td>{a.PatientName || a.Patient_ID}</td>
              <td>{a.DoctorName || a.Doctor_ID}</td>
              <td>{a.Date ? new Date(a.Date).toLocaleDateString() : ""}</td>
              <td>{a.Time}</td>
              <td>
                <span
                  className={`${styles.status} ${
                    a.Status === "Completed"
                      ? styles.completed
                      : a.Status === "Cancelled"
                      ? styles.cancelled
                      : styles.scheduled
                  }`}
                >
                  {a.Status}
                </span>
              </td>
              <td>{a.Cause_of_Visit}</td>
              <td>
                <button
                  className={styles.actionBtn}
                  onClick={() => {
                    const newStatus = prompt(
                      "Edit appointment status (Scheduled / Completed / Cancelled):",
                      a.Status
                    );
                    if (newStatus) {
                      onEdit(a.Appt_ID, { ...a, Status: newStatus });
                    }
                  }}
                >
                  Edit
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => {
                    if (window.confirm("Delete this appointment?"))
                      onDelete(a.Appt_ID);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}