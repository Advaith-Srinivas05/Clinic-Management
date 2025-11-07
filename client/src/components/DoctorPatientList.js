import React from "react";
import styles from "../css/PatientList.module.css";

export default function DoctorPatientList({ patients, onEdit, onView }) {
  if (!patients || patients.length === 0) {
    return <div className={styles.empty}>No patients found.</div>;
  }

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
                <td>{p.DOB ? new Date(p.DOB).toLocaleDateString("en-GB") : ""}</td>
                <td>{p.Gender}</td>
                <td>{p.Blood_Group}</td>
                <td>{p.Phone_Number}</td>
                <td>{p.Profession}</td>
                <td>
                  {onView && (
                    <button type="button" className={styles.actionBtn} onClick={() => onView(p)}>
                      View
                    </button>
                  )}
                  <button type="button" className={styles.actionBtn} onClick={() => onEdit(p)}>
                    Edit
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
