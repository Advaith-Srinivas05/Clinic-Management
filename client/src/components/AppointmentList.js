// AppointmentList.js
import React, { useState } from "react";
import styles from "../css/AppointmentList.module.css";
import ConfirmationModal from "./ConfirmationModal";

export default function AppointmentList({ appts, onEdit, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  if (!appts || appts.length === 0) {
    return <div className={styles.empty}>No appointments found.</div>;
  }

  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (appointmentToDelete) {
      onDelete(appointmentToDelete.Appt_ID);
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAppointmentToDelete(null);
  };

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.scrollContainer}>
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
                <td>
                  {a.Date ? new Date(a.Date).toLocaleDateString("en-GB") : ""}
                </td>
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
                    onClick={() => onEdit(a)}
                  >
                    Edit
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDeleteClick(a)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Appointment"
        message={`Are you sure you want to delete appointment #${appointmentToDelete?.Appt_ID}? This action cannot be undone.`}
      />
    </div>
  );
}