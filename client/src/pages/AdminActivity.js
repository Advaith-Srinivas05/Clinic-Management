import React, { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { admin } from "../api";
import pageStyles from "../css/FrontdeskDashboard.module.css";
import tableStyles from "../css/AppointmentList.module.css";

export default function AdminActivity() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => { load(""); }, []);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!q) {
        await load("");
        setSearching(false);
      } else {
        try {
          setSearching(true);
          await load(q);
        } finally {
          setSearching(false);
        }
      }
    }, 350);
    return () => clearTimeout(delay);
  }, [q]);

  async function load(query) {
    setLoading(true);
    try {
      const data = query ? await admin.attemptsSearch(query) : await admin.attempts();
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={pageStyles.page}>
      <AdminNavbar />

      <div className={pageStyles.materialTable}>
        <div className={pageStyles.tableHeader}>
          <span className={pageStyles.tableTitle}>ACTIVITY</span>
          <div className={pageStyles.actions}>
            <button
              className={pageStyles.iconButton}
              title="Search"
              onClick={() => setShowSearch(s => !s)}
            >
              <i className="material-icons">search</i>
            </button>
          </div>
        </div>

        {showSearch && (
          <div className={pageStyles.searchBar}>
            <input
              type="text"
              placeholder="Search by username, role, or status..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {searching && <div className={pageStyles.loading}>Searching...</div>}
          </div>
        )}

        <div className={pageStyles.tableContent}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className={tableStyles.tableWrapper}>
              <div className={tableStyles.scrollContainer}>
                <table className={tableStyles.table}>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Time</th>
                      <th>Success</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.Attempt_ID}>
                        <td>{r.Username}</td>
                        <td>{r.Role || '-'}</td>
                        <td>{r.Attempt_Time ? new Date(r.Attempt_Time).toLocaleString() : ""}</td>
                        <td>
                          <span className={`${tableStyles.status} ${r.Success ? tableStyles.completed : tableStyles.cancelled}`}>
                            {r.Success ? "Success" : "Failed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
