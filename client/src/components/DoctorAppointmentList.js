import React from "react";
import styles from "../css/AppointmentList.module.css";

export default function DoctorAppointmentList({ appts, onPrescribe }) {
  if (!appts || appts.length === 0) {
    return <div className={styles.empty}>No appointments found.</div>;
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.scrollContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
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
                <td>{a.Date ? new Date(a.Date).toLocaleDateString("en-GB") : ""}</td>
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
                    className={`${styles.actionBtn} ${styles.primaryBtn}`}
                    onClick={() => onPrescribe(a)}
                    disabled={a.Status === 'Completed'}
                  >
                    {a.Status === 'Completed' ? 'Completed' : 'Prescribe'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}