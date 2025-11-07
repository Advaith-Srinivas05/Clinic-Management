import React, { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { admin } from "../api";
import UserFormModal from "../components/UserFormModal";
import pageStyles from "../css/FrontdeskDashboard.module.css";
import tableStyles from "../css/AppointmentList.module.css";

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => { load(""); }, []);

  async function load(query) {
    setLoading(true);
    try {
      const data = query ? await admin.loginsSearch(query) : await admin.logins();
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(userId, role) {
    if (role !== 'Doctor') return;
    if (!window.confirm('Delete this doctor login?')) return;
    try {
      await admin.usersDelete(userId);
      await load(q.trim() ? q : "");
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  }
 

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(async () => {
      const term = q.trim();
      if (!term) {
        await load("");
        setSearching(false);
        return;
      }
      try {
        setSearching(true);
        await load(term);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [q]);

  async function handleAddUser(payload) {
    setAdding(true);
    try {
      await admin.createDoctor(payload);
      setShowAdd(false);
      await load("");
    } catch (err) {
      alert(err.message || "Failed to add doctor");
    } finally {
      setAdding(false);
    }
  }

  async function handleEditUser(userId, payload) {
    setEditing(true);
    try {
      await admin.usersUpdate(userId, payload);
      setEditRow(null);
      await load(q.trim() ? q : "");
    } catch (err) {
      alert(err.message || "Failed to update doctor");
    } finally {
      setEditing(false);
    }
  }

  return (
    <div className={pageStyles.page}>
      <AdminNavbar />

      <div className={pageStyles.materialTable}>
        <div className={pageStyles.tableHeader}>
          <span className={pageStyles.tableTitle}>USERS</span>
          <div className={pageStyles.actions}>
            <button className={pageStyles.iconButton} onClick={() => setShowAdd(true)}>
              <i className="material-icons">add</i>
            </button>
            <button
              className={pageStyles.iconButton}
              title="Search"
              onClick={() => setShowSearch(s => !s)}
            >
              <i className="material-icons">search</i>
            </button>
          </div>
        </div>

        {(showAdd || editRow) && (
          <UserFormModal
            onClose={() => { setShowAdd(false); setEditRow(null); }}
            onSubmit={(data) => {
              if (editRow) handleEditUser(editRow.User_ID, data);
              else handleAddUser(data);
            }}
            submitting={editRow ? editing : adding}
            editData={editRow || null}
          />
        )}

        {showSearch && (
          <div className={pageStyles.searchBar}>
            <input
              type="text"
              placeholder="Search by username, role, doctor name/ID, phone, email, qualifications"
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
                      <th>User ID</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Doctor</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Qualifications</th>
                      <th>Created On</th>
                      <th>Last Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((u) => (
                      <tr key={u.User_ID}>
                        <td>{u.User_ID}</td>
                        <td>{u.Username}</td>
                        <td>{u.Role}</td>
                        <td>{u.DoctorName || (u.Doctor_ID ? `#${u.Doctor_ID}` : "-")}</td>
                        <td>{u.DoctorPhone || '-'}</td>
                        <td>{u.DoctorEmail || '-'}</td>
                        <td>{u.DoctorQualifications || '-'}</td>
                        <td>{u.Created_On ? new Date(u.Created_On).toLocaleString() : ""}</td>
                        <td>{u.Last_Active ? new Date(u.Last_Active).toLocaleString() : ""}</td>
                        <td>
                          {u.Role === 'Doctor' ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                className={tableStyles.actionBtn}
                                style={{ padding: '4px 8px', fontSize: 12 }}
                                onClick={() => setEditRow(u)}
                              >
                                Edit
                              </button>
                              <button
                                className={`${tableStyles.actionBtn} ${tableStyles.deleteBtn}`}
                                style={{ padding: '4px 8px', fontSize: 12 }}
                                onClick={() => handleDelete(u.User_ID, u.Role)}
                              >
                                Delete
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: '#888', fontSize: 12 }}>-</span>
                          )}
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