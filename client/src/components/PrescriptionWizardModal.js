import React, { useState } from "react";
import styles from "../css/PatientFormModal.module.css";

export default function PrescriptionWizardModal({ appt, medicines, onClose, onFinish }) {
  const [step, setStep] = useState(1);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);
  const [fee, setFee] = useState("");

  const addItem = () => {
    setItems((prev) => [...prev, { Medicine_ID: "", qty: 1 }]);
  };

  const updateItem = (idx, field, value) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const next = () => {
    setStep(2);
  };

  const finish = () => {
    const parsedFee = Number(fee) || 0;
    const cleanItems = items
      .filter((it) => it.Medicine_ID)
      .map((it) => ({ Medicine_ID: Number(it.Medicine_ID), qty: Math.max(1, Number(it.qty) || 1) }));
    onFinish({ notes, items: cleanItems, fee: parsedFee });
  };

  const calcMedsTotal = () => {
    return items.reduce((sum, it) => {
      const med = medicines.find((m) => String(m.Medicine_ID) === String(it.Medicine_ID));
      const price = med?.Cost_to_sell ? Number(med.Cost_to_sell) : 0;
      const q = Math.max(1, Number(it.qty) || 1);
      return sum + price * q;
    }, 0);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        <div className={styles.leftContainer}>
          <h1>
            <i className="fas fa-pills"></i>
            PRESCRIPTION
          </h1>
          <div style={{ padding: "16px", color: "#eee" }}>
            <div>Appt #{appt?.Appt_ID}</div>
            <div>Patient: {appt?.PatientName || appt?.Patient_ID}</div>
          </div>
        </div>

        <div className={styles.rightContainer}>
          {step === 1 && (
            <div>
              <header>
                <h1>Assign Prescription</h1>
              </header>
              <div className={styles.set}>
                <div style={{ width: "100%" }}>
                  <label>Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write diagnosis or notes..."
                  />
                </div>
              </div>

              <div>
                <label>Medicines</label>
                {items.map((it, idx) => (
                  <div key={idx} className={styles.set}>
                    <div>
                      <select
                        value={it.Medicine_ID}
                        onChange={(e) => updateItem(idx, "Medicine_ID", e.target.value)}
                      >
                        <option value="">Select medicine</option>
                        {medicines.map((m) => (
                          <option key={m.Medicine_ID} value={m.Medicine_ID}>
                            {m.Med_Name} (₹{m.Cost_to_sell})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="number"
                        min={1}
                        value={it.qty}
                        onChange={(e) => updateItem(idx, "qty", e.target.value)}
                        placeholder="Qty"
                      />
                    </div>
                    <div>
                      <button type="button" className={styles.cancel} onClick={() => removeItem(idx)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className={styles.submit} onClick={addItem}>
                  + Add medicine
                </button>
              </div>

              <footer className={styles.footer}>
                <button type="button" className={styles.cancel} onClick={onClose}>
                  Cancel
                </button>
                <button type="button" className={styles.submit} onClick={next}>
                  Next
                </button>
              </footer>
            </div>
          )}

          {step === 2 && (
            <div>
              <header>
                <h1>Consultation Fee</h1>
              </header>
              <div className={styles.set}>
                <div>
                  <label>Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    placeholder="Consultation fee"
                  />
                </div>
                <div>
                  <label>Total</label>
                  <input disabled value={(calcMedsTotal() + (Number(fee) || 0)).toFixed(2)} />
                </div>
              </div>

              <footer className={styles.footer}>
                <button type="button" className={styles.cancel} onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="button" className={styles.submit} onClick={finish}>
                  Finish Appointment
                </button>
              </footer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
