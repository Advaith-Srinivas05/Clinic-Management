import React, { useState } from "react";
import styles from "../css/AppointmentFormModal.module.css";

export default function MedicineFormModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    Med_Name: "",
    Type_of_Medicine: "",
    Brand: "",
    Supplier: "",
    Stock_Left: 0,
    Cost_to_buy: 0,
    Cost_to_sell: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "Stock_Left" || name === "Cost_to_buy" || name === "Cost_to_sell" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.Med_Name) return;
    onSubmit({
      Med_Name: form.Med_Name,
      Type_of_Medicine: form.Type_of_Medicine,
      Brand: form.Brand,
      Supplier: form.Supplier,
      Stock_Left: Number(form.Stock_Left) || 0,
      Cost_to_buy: Number(form.Cost_to_buy) || 0,
      Cost_to_sell: Number(form.Cost_to_sell) || 0,
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        {/* Left Side */}
        <div className={styles.leftContainer}>
          <h1>
            <i className="fas fa-pills"></i> CLINIC
          </h1>
          <div className={styles.imageBox}>
            {/* optional image slot */}
          </div>
        </div>

        {/* Right Side */}
        <div className={styles.rightContainer} style={{ width: 700 }}>
          <header>
            <h1>Add Medicine</h1>
          </header>

          <form onSubmit={handleSubmit}>
            <div className={styles.set}>
              <div>
                <label>Name</label>
                <input
                  name="Med_Name"
                  value={form.Med_Name}
                  onChange={handleChange}
                  placeholder="Medicine name"
                  required
                />
              </div>
              <div>
                <label>Type</label>
                <select
                  name="Type_of_Medicine"
                  value={form.Type_of_Medicine}
                  onChange={handleChange}
                >
                  <option value="">Select type</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Drops">Drops</option>
                  <option value="Powder">Powder</option>
                  <option value="Inhaler">Inhaler</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className={styles.set}>
              <div>
                <label>Brand</label>
                <input
                  name="Brand"
                  value={form.Brand}
                  onChange={handleChange}
                  placeholder="Brand"
                />
              </div>
              <div>
                <label>Supplier</label>
                <input
                  name="Supplier"
                  value={form.Supplier}
                  onChange={handleChange}
                  placeholder="Supplier"
                />
              </div>
            </div>

            <div className={styles.set}>
              <div>
                <label>Stock Left</label>
                <input
                  type="number"
                  name="Stock_Left"
                  value={form.Stock_Left}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div>
                <label>Cost to Buy</label>
                <input
                  type="number"
                  step="0.01"
                  name="Cost_to_buy"
                  value={form.Cost_to_buy}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className={styles.set}>
              <div>
                <label>Cost to Sell</label>
                <input
                  type="number"
                  step="0.01"
                  name="Cost_to_sell"
                  value={form.Cost_to_sell}
                  onChange={handleChange}
                  min="0"
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
              <button type="submit" className={styles.submit}>
                Add Medicine
              </button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
}
