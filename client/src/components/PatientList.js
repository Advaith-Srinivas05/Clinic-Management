import React, { useState } from "react";
import styles from "../css/PatientList.module.css";
import ConfirmationModal from "./ConfirmationModal";

export default function PatientList({ patients, onEdit, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  if (!patients || patients.length === 0) {
    return <div className={styles.empty}>No patients found.</div>;
  }

  const handleDeleteClick = (patient) => {
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (patientToDelete) {
      onDelete(patientToDelete.Patient_ID);
      setShowDeleteModal(false);
      setPatientToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPatientToDelete(null);
  };

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.scrollContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Blood Group</th>
              <th>Phone</th>
              <th>Profession</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((p) => (
              <tr key={p.Patient_ID}>
                <td>{p.Patient_ID}</td>
                <td>{p.Name}</td>
                <td>
                  {p.DOB ? new Date(p.DOB).toLocaleDateString("en-GB") : ""}
                </td>
                <td>{p.Gender}</td>
                <td>{p.Blood_Group}</td>
                <td>{p.Phone_Number}</td>
                <td>{p.Profession}</td>
                <td>
                  <button
                    className={styles.actionBtn}
                    onClick={() => onEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDeleteClick(p)}
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
        title="Delete Patient"
        message={`Are you sure you want to delete ${patientToDelete?.Name}? This action cannot be undone.`}
      />
    </div>
  );
}