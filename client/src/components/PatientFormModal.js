import React, { useState, useEffect } from "react";
import styles from "../css/PatientFormModal.module.css";
import registerImg from "../img/register.png";

export default function PatientFormModal({ onClose, onSubmit, editData }) {
  const [form, setForm] = useState({
    Name: "",
    DOB: "",
    Gender: "Male",
    Height: "",
    Weight: "",
    Blood_Group: "A+",
    Phone_Number: "",
    Mothers_Name: "",
    Fathers_Name: "",
    Profession: "",
    Portfolio: "",
  });
  // BMI state for display
  const [bmi, setBmi] = useState("");

  // Initialize form with editData if it exists
  useEffect(() => {
    if (editData) {
      // Format the date for the date input (YYYY-MM-DD)
      const formattedDate = editData.DOB 
        ? new Date(editData.DOB).toISOString().split('T')[0]
        : '';
      setForm({
        Name: editData.Name || "",
        DOB: formattedDate,
        Gender: editData.Gender || "Male",
        Height: editData.Height || "",
        Weight: editData.Weight || "",
        Blood_Group: editData.Blood_Group || "A+",
        Phone_Number: editData.Phone_Number || "",
        Mothers_Name: editData.Mothers_Name || "",
        Fathers_Name: editData.Fathers_Name || "",
        Profession: editData.Profession || "",
        Portfolio: editData.Portfolio || "",
      });
      if (editData.BMI !== undefined && editData.BMI !== null && editData.BMI !== "") {
        setBmi(Number(editData.BMI).toFixed(2));
      } else {
        setBmi("");
      }
    }
  }, [editData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        {/* Left Panel */}
        <div className={styles.leftContainer}>
          <h1>
            <i className="fas fa-user-md"></i>
            CLINIC
          </h1>
          <div className={styles.imageBox}>
            <img
              src={registerImg}
              alt="clinic-illustration"
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className={styles.rightContainer}>
          <header>
            <h1>{editData ? 'Edit Patient' : 'Register New Patient'}</h1>
          </header>

          <form onSubmit={handleSubmit}>
            <div className={styles.set}>
              <div>
                <label htmlFor="Name">Name</label>
                <input
                  name="Name"
                  value={form.Name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                />
              </div>
              <div>
                <label htmlFor="DOB">Date of Birth</label>
                <input
                  type="date"
                  name="DOB"
                  value={form.DOB}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.set}>
              <div>
                <label>Gender</label>
                <div className={styles.radioContainer}>
                  <input
                    type="radio"
                    id="male"
                    name="Gender"
                    value="Male"
                    checked={form.Gender === "Male"}
                    onChange={handleChange}
                  />
                  <label htmlFor="male">Male</label>
                  <input
                    type="radio"
                    id="female"
                    name="Gender"
                    value="Female"
                    checked={form.Gender === "Female"}
                    onChange={handleChange}
                  />
                  <label htmlFor="female">Female</label>
                  <input
                    type="radio"
                    id="other"
                    name="Gender"
                    value="Other"
                    checked={form.Gender === "Other"}
                    onChange={handleChange}
                  />
                  <label htmlFor="other">Other</label>
                </div>
              </div>

              <div>
                <label htmlFor="Blood_Group">Blood Group</label>
                <select
                  name="Blood_Group"
                  value={form.Blood_Group}
                  onChange={handleChange}
                  required
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className={styles.set} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label htmlFor="Height">Height (cm)</label>
                <input
                  type="number"
                  name="Height"
                  value={form.Height}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label htmlFor="Weight">Weight (kg)</label>
                <input
                  type="number"
                  name="Weight"
                  value={form.Weight}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                />
              </div>
              {editData && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label htmlFor="BMI">BMI (auto-calculated)</label>
                  <input
                    name="BMI"
                    value={bmi}
                    readOnly
                    style={{ width: '100%', background: '#f5f5f5', color: '#333' }}
                  />
                </div>
              )}
            </div>

            <div className={styles.set}>
              <div>
                <label htmlFor="Phone_Number">Phone</label>
                <input
                  name="Phone_Number"
                  value={form.Phone_Number}
                  onChange={handleChange}
                  placeholder="Phone Number"
                />
              </div>
              <div>
                <label htmlFor="Profession">Profession</label>
                <input
                  name="Profession"
                  value={form.Profession}
                  onChange={handleChange}
                  placeholder="Occupation"
                />
              </div>
            </div>

            <div className={styles.set}>
              <div>
                <label htmlFor="Mothers_Name">Mother’s Name</label>
                <input
                  name="Mothers_Name"
                  value={form.Mothers_Name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="Fathers_Name">Father’s Name</label>
                <input
                  name="Fathers_Name"
                  value={form.Fathers_Name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="Portfolio">Portfolio / Notes</label>
              <textarea
                name="Portfolio"
                value={form.Portfolio}
                onChange={handleChange}
                placeholder="Medical history or notes..."
              ></textarea>
            </div>

            <footer className={styles.footer}>
              <button type="button" className={styles.cancel} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={styles.submit}>
                {editData ? 'Save Changes' : 'Add Patient'}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
}