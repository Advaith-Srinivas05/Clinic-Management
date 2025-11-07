import React, { useEffect, useState, useCallback } from "react";
import DoctorNavbar from "../components/DoctorNavbar";
import DoctorPatientList from "../components/DoctorPatientList";
import PatientFormModal from "../components/PatientFormModal";
import ConfirmationModal from "../components/ConfirmationModal";
import { searchPatients, getAppointments } from "../api";
import styles from "../css/DoctorPatientSearch.module.css";
import tableStyles from "../css/AppointmentList.module.css";

export default function DoctorPatientSearch({ user }) {
  const storedDoctorId = typeof window !== 'undefined' ? localStorage.getItem('doctorId') : null;
  const doctorId = (user && user.doctorId != null)
    ? user.doctorId
    : (storedDoctorId != null ? Number(storedDoctorId) : undefined);

  const [patients, setPatients] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyAppts, setHistoryAppts] = useState([]);
  const [historyPatient, setHistoryPatient] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
    showCancel: false,
    confirmText: "OK",
  });

  useEffect(() => {
    loadPatientsForDoctor();
  }, [doctorId]);

  async function getDoctorPatientIdSet() {
    if (doctorId == null) return new Set();
    const appts = await getAppointments({ doctorId });
    const ids = new Set(appts.map((a) => a.Patient_ID));
    return ids;
  }

  async function loadPatientsForDoctor() {
    try {
      setLoading(true);
      const ids = await getDoctorPatientIdSet();
      const all = await searchPatients("");
      const filtered = all.filter((p) => ids.has(p.Patient_ID));
      setPatients(filtered);
    } catch (err) {
      console.error("Error loading patients for doctor:", err);
    } finally {
      setLoading(false);
    }
  }

  const showModal = useCallback((message, onConfirm = null, options = {}) => {
    setModalConfig({
      isOpen: true,
      message,
      onConfirm: onConfirm || (() => setModalConfig((prev) => ({ ...prev, isOpen: false }))),
      showCancel: options.showCancel || false,
      confirmText: options.confirmText || "OK",
    });
  }, []);

  async function openHistory(patient) {
    try {
      setLoading(true);
      const all = await getAppointments({ doctorId });
      const filtered = (all || [])
        .filter((a) => String(a.Patient_ID) === String(patient.Patient_ID))
        .sort((a, b) => {
          const ad = new Date(`${a.Date}T${a.Time || "00:00:00"}`);
          const bd = new Date(`${b.Date}T${b.Time || "00:00:00"}`);
          return bd - ad; // newest first
        });
      setHistoryPatient(patient);
      setHistoryAppts(filtered);
      setHistoryOpen(true);
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        setLoading(true);
        try {
          const ids = await getDoctorPatientIdSet();
          const data = await searchPatients(searchTerm);
          setPatients(data.filter((p) => ids.has(p.Patient_ID)));
        } catch (err) {
          console.error("Search failed:", err);
        } finally {
          setLoading(false);
        }
      } else {
        loadPatientsForDoctor();
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchTerm, doctorId]);

  return (
    <div className={styles.page}>
      <DoctorNavbar />
      <div className={styles.materialTable}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>MY PATIENTS</span>

          <div className={styles.actions}>
            <button
              className={styles.iconButton}
              title="Search"
              onClick={() => setShowSearch(!showSearch)}
            >
              <i className="material-icons">search</i>
            </button>
          </div>
        </div>

        {showSearch && (
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading && <div className={styles.loading}>Searching...</div>}
          </div>
        )}

        <div className={styles.tableContent}>
          <DoctorPatientList
            patients={patients}
            onEdit={(patient) => setEditingPatient(patient)}
            onView={(p) => openHistory(p)}
          />
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        message={modalConfig.message}
        showCancel={modalConfig.showCancel}
        confirmText={modalConfig.confirmText}
      />

      {editingPatient && (
        <PatientFormModal
          onClose={() => setEditingPatient(null)}
          onSubmit={(data) => handleUpdatePatient(editingPatient.Patient_ID, data)}
          editData={editingPatient}
        />
      )}

      {historyOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: 10, width: '90%', maxWidth: 900, maxHeight: '80vh', overflow: 'auto' }}>
            <div className={styles.tableHeader} style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <span className={styles.tableTitle}>{historyPatient?.Name} — History</span>
              <div className={styles.actions}>
                <button className={styles.iconButton} onClick={() => setHistoryOpen(false)} title="Close">
                  <i className="material-icons">close</i>
                </button>
              </div>
            </div>
            <div className={styles.tableContent}>
              {historyAppts && historyAppts.length > 0 ? (
                <div className={tableStyles.tableWrapper}>
                  <div className={tableStyles.scrollContainer}>
                    <table className={tableStyles.table}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Status</th>
                          <th>Cause</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyAppts.map((a) => (
                          <tr key={a.Appt_ID}>
                            <td>{a.Appt_ID}</td>
                            <td>{a.Date ? new Date(a.Date).toLocaleDateString('en-GB') : ''}</td>
                            <td>{a.Time}</td>
                            <td>
                              <span className={`${tableStyles.status} ${
                                a.Status === 'Completed' ? tableStyles.completed : a.Status === 'Cancelled' ? tableStyles.cancelled : tableStyles.scheduled
                              }`}>
                                {a.Status}
                              </span>
                            </td>
                            <td>{a.Cause_of_Visit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className={tableStyles.empty}>No history found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
