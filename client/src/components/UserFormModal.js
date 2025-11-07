import React, { useState } from "react";
import styles from "../css/AppointmentFormModal.module.css";
import pfStyles from "../css/PatientFormModal.module.css";

export default function UserFormModal({ onClose, onSubmit, submitting = false, editData = null }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    doctorName: "",
    dob: "",
    phone: "",
    email: "",
    qualifications: "",
    gender: "",
  });

  React.useEffect(() => {
    if (editData) {
      setForm({
        username: editData.Username || "",
        password: "",
        doctorName: editData.DoctorName || "",
        dob: editData.DoctorDOB ? String(editData.DoctorDOB).slice(0, 10) : "",
        phone: editData.DoctorPhone || "",
        email: editData.DoctorEmail || "",
        qualifications: editData.DoctorQualifications || "",
        gender: editData.DoctorGender || "",
      });
    }
  }, [editData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      username: form.username.trim(),
      password: form.password,
      doctorName: form.doctorName.trim(),
      dob: form.dob || undefined,
      phone: form.phone.trim(),
      email: form.email.trim(),
      qualifications: form.qualifications.trim(),
      gender: form.gender || undefined,
    };
    onSubmit(payload);
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer} style={{ width: 720, maxHeight: '80vh', margin: 'auto' }}>
        {/* Single Column (no left panel) */}
        <div className={styles.rightContainer} style={{ width: 700 }}>
          <header>
            <h1>{editData ? 'Edit Doctor' : 'Add Doctor'}</h1>
          </header>

          <form onSubmit={handleSubmit}>
            <div className={styles.set} style={{ gap: 16 }}>
              <div>
                <label>Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required={!editData}
                />
              </div>
            </div>

            <div className={styles.set} style={{ gap: 16 }}>
              <div>
                <label>Doctor Name</label>
                <input
                  name="doctorName"
                  value={form.doctorName}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <label>Phone Number</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                />
              </div>
            </div>

            <div className={styles.set} style={{ gap: 16 }}>
              <div>
                <label>Gender</label>
                <div className={pfStyles.radioContainer} style={{ marginTop: 6 }}>
                  <input
                    type="radio"
                    id="genderMale"
                    name="gender"
                    value="Male"
                    checked={form.gender === 'Male'}
                    onChange={handleChange}
                  />
                  <label htmlFor="genderMale">Male</label>

                  <input
                    type="radio"
                    id="genderFemale"
                    name="gender"
                    value="Female"
                    checked={form.gender === 'Female'}
                    onChange={handleChange}
                  />
                  <label htmlFor="genderFemale">Female</label>

                  <input
                    type="radio"
                    id="genderOther"
                    name="gender"
                    value="Other"
                    checked={form.gender === 'Other'}
                    onChange={handleChange}
                  />
                  <label htmlFor="genderOther">Other</label>
                </div>
              </div>
              <div>
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.set} style={{ gap: 16 }}>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label>Qualifications</label>
                <input
                  name="qualifications"
                  value={form.qualifications}
                  onChange={handleChange}
                  placeholder="e.g., MBBS, MD"
                />
              </div>
            </div>

            <footer className={styles.footer}>
              <button
                type="button"
                className={styles.cancel}
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className={styles.submit} disabled={submitting}>
                {submitting ? (editData ? 'Saving...' : 'Adding...') : (editData ? 'Save Changes' : 'Add Doctor')}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
}
