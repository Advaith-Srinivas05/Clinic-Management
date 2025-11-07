import React, { useEffect, useState } from 'react';
import DoctorNavbar from '../components/DoctorNavbar';
import { doctors } from '../api';
import styles from '../css/FrontdeskDashboard.module.css';
import tableStyles from '../css/AppointmentList.module.css';

export default function DoctorStats({ user }) {
  const storedDoctorId = typeof window !== 'undefined' ? localStorage.getItem('doctorId') : null;
  const doctorId = (user && user.doctorId != null)
    ? user.doctorId
    : (storedDoctorId != null ? Number(storedDoctorId) : undefined);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    totalsByStatus: {},
    uniquePatients: 0,
    revenue: 0,
    upcomingToday: 0,
    upcomingWeek: 0,
    avgApptsPerDay: 0,
    topMedicines: [],
    recentAppointments: []
  });

  useEffect(() => {
    async function load() {
      if (doctorId == null) { setLoading(false); return; }
      setLoading(true);
      setError('');
      try {
        const res = await doctors.stats(doctorId);
        setData(res || {});
      } catch (e) {
        setError(e?.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [doctorId]);

  const s = data || {};
  const t = s.totalsByStatus || {};

  return (
    <div className={styles.page}>
      <DoctorNavbar />
      <div className={styles.materialTable}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>MY STATISTICS</span>
        </div>
        <div className={styles.tableContent}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading stats...</div>
          ) : error ? (
            <div style={{ padding: '20px', color: 'red' }}>{error}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>Appointments</div>
                <div className={styles.cardBody}>
                  <div>Scheduled: <b>{t.Scheduled || 0}</b></div>
                  <div>Completed: <b>{t.Completed || 0}</b></div>
                  <div>Cancelled: <b>{t.Cancelled || 0}</b></div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>Patients</div>
                <div className={styles.cardBody}>
                  <div>Unique Patients: <b>{s.uniquePatients || 0}</b></div>
                  <div>Avg Appts/Day (30d): <b>{Number(s.avgApptsPerDay || 0).toFixed(2)}</b></div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>Revenue</div>
                <div className={styles.cardBody}>
                  <div>Total: <b>₹{Number(s.revenue || 0).toFixed(2)}</b></div>
                  <div>Upcoming Today: <b>{s.upcomingToday || 0}</b></div>
                  <div>Upcoming (7d): <b>{s.upcomingWeek || 0}</b></div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>Top Medicines</div>
                <div className={styles.cardBody}>
                  {Array.isArray(s.topMedicines) && s.topMedicines.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {s.topMedicines.map((m, idx) => (
                        <li key={idx}>{m.Med_Name} — {m.count}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className={tableStyles.empty}>No data</div>
                  )}
                </div>
              </div>

              <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
                <div className={styles.cardHeader}>Recent Appointments</div>
                <div className={styles.cardBody}>
                  {Array.isArray(s.recentAppointments) && s.recentAppointments.length > 0 ? (
                    <div className={tableStyles.tableWrapper}>
                      <div className={tableStyles.scrollContainer}>
                        <table className={tableStyles.table}>
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Date</th>
                              <th>Time</th>
                              <th>Status</th>
                              <th>Patient</th>
                              <th>Cause</th>
                            </tr>
                          </thead>
                          <tbody>
                            {s.recentAppointments.map((a) => (
                              <tr key={a.Appt_ID}>
                                <td>{a.Appt_ID}</td>
                                <td>{a.Date ? new Date(a.Date).toLocaleDateString('en-GB') : ''}</td>
                                <td>{a.Time}</td>
                                <td>{a.Status}</td>
                                <td>{a.PatientName}</td>
                                <td>{a.Cause_of_Visit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className={tableStyles.empty}>No recent appointments</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
