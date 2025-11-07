import React, { useState } from "react";
import styles from "../css/AppointmentFormModal.module.css";

export default function UserFormModal({ onClose, onSubmit, submitting = false }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    doctorName: "",
    phone: "",
    email: "",
    qualifications: "",
  });

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
      phone: form.phone.trim(),
      email: form.email.trim(),
      qualifications: form.qualifications.trim(),
    };
    onSubmit(payload);
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer} style={{ width: 720, maxHeight: '80vh', margin: 'auto' }}>
        {/* Single Column (no left panel) */}
        <div className={styles.rightContainer} style={{ width: 700 }}>
          <header>
            <h1>Add Doctor</h1>
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
                  required
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
                {submitting ? 'Adding...' : 'Add Doctor'}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
}
