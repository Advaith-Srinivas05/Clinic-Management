import React, { useEffect, useState } from 'react';
import DoctorNavbar from '../components/DoctorNavbar';
import { doctors } from '../api';
import styles from '../css/FrontdeskDashboard.module.css';
import tableStyles from '../css/AppointmentList.module.css';
import cardStyles from '../css/StatsCard.module.css';

export default function DoctorStats({ user }) {
  const storedDoctorId = typeof window !== 'undefined' ? localStorage.getItem('doctorId') : null;
  const doctorId = (storedDoctorId != null)
    ? Number(storedDoctorId)
    : (user && user.doctorId != null ? user.doctorId : undefined);

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
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '2rem',
              padding: '1rem'
            }}>
              <div className={cardStyles.box}>
                <h2 className={cardStyles.title}>Appointments</h2>
                <ul className={cardStyles.list}>
                  <li className={cardStyles.listItem}>
                    Scheduled<span className={cardStyles.value}>{t.Scheduled || 0}</span>
                  </li>
                  <li className={cardStyles.listItem}>
                    Completed<span className={cardStyles.value}>{t.Completed || 0}</span>
                  </li>
                  <li className={cardStyles.listItem}>
                    Cancelled<span className={cardStyles.value}>{t.Cancelled || 0}</span>
                  </li>
                </ul>
              </div>

              <div className={cardStyles.box}>
                <h2 className={cardStyles.title}>Patients</h2>
                <ul className={cardStyles.list}>
                  <li className={cardStyles.listItem}>
                    Unique Patients<span className={cardStyles.value}>{s.uniquePatients || 0}</span>
                  </li>
                  <li className={cardStyles.listItem}>
                    Avg Appts/Day (30d)<span className={cardStyles.value}>{Number(s.avgApptsPerDay || 0).toFixed(2)}</span>
                  </li>
                </ul>
              </div>

              <div className={cardStyles.box}>
                <h2 className={cardStyles.title}>Revenue</h2>
                <ul className={cardStyles.list}>
                  <li className={cardStyles.listItem}>
                    Total<span className={cardStyles.value}>₹{Number(s.revenue || 0).toFixed(2)}</span>
                  </li>
                  <li className={cardStyles.listItem}>
                    Upcoming Today<span className={cardStyles.value}>{s.upcomingToday || 0}</span>
                  </li>
                  <li className={cardStyles.listItem}>
                    Upcoming (7d)<span className={cardStyles.value}>{s.upcomingWeek || 0}</span>
                  </li>
                </ul>
              </div>

              <div className={cardStyles.box}>
                <h2 className={cardStyles.title}>Top Medicines</h2>
                {Array.isArray(s.topMedicines) && s.topMedicines.length > 0 ? (
                  <ul className={cardStyles.list}>
                    {s.topMedicines.map((m, idx) => (
                      <li key={idx} className={cardStyles.listItem}>
                        {m.Med_Name}<span className={cardStyles.value}>{m.count}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={tableStyles.empty}>No data</div>
                )}
              </div>

              <div className={cardStyles.box} style={{ 
                gridColumn: '1 / -1',
                marginTop: '1rem',
                '--bgsize': '0'
              }}>
                <h2 className={cardStyles.title}>Recent Appointments</h2>
                <div style={{ height: '400px', overflow: 'auto' }}>
                  {Array.isArray(s.recentAppointments) && s.recentAppointments.length > 0 ? (
                    <div className={tableStyles.tableWrapper} style={{ margin: '0' }}>
                      <div className={tableStyles.scrollContainer} style={{ width: '100%' }}>
                        <table className={tableStyles.table} style={{ width: '100%', tableLayout: 'fixed' }}>
                          <thead>
                            <tr>
                              <th style={{ width: '8%' }}>ID</th>
                              <th style={{ width: '15%' }}>Date</th>
                              <th style={{ width: '12%' }}>Time</th>
                              <th style={{ width: '15%' }}>Status</th>
                              <th style={{ width: '20%' }}>Patient</th>
                              <th style={{ width: '30%' }}>Cause</th>
                            </tr>
                          </thead>
                          <tbody>
                            {s.recentAppointments.map((a) => (
                              <tr key={a.Appt_ID}>
                                <td style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{a.Appt_ID}</td>
                                <td style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{a.Date ? new Date(a.Date).toLocaleDateString('en-GB') : ''}</td>
                                <td style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{a.Time}</td>
                                <td style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{a.Status}</td>
                                <td style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{a.PatientName}</td>
                                <td style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{a.Cause_of_Visit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className={tableStyles.empty} style={{ textAlign: 'center' }}>No recent appointments</div>
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
