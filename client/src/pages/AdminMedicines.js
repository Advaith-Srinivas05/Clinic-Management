import React, { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { medicines } from "../api";
import styles from "../css/FrontdeskDashboard.module.css";
import tableStyles from "../css/AppointmentList.module.css";
import MedicineFormModal from "../components/MedicineFormModal";

export default function AdminMedicines() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [form, setForm] = useState({
    Med_Name: "",
    Type_of_Medicine: "",
    Brand: "",
    Supplier: "",
    Stock_Left: 0,
    Cost_to_buy: 0,
    Cost_to_sell: 0,
  });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await medicines.list();
      setList(data);
    } finally {
      setLoading(false);
    }
  }

  // Debounced server-side search using FULLTEXT/numeric ID
  useEffect(() => {
    const delay = setTimeout(async () => {
      const q = searchTerm.trim();
      if (!q) {
        // reload full list when query cleared
        await load();
        setSearching(false);
        return;
      }
      try {
        setSearching(true);
        const results = await medicines.search(q);
        setList(results);
      } catch (e) {
        console.error("Medicine search failed", e);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const resetForm = () => setForm({
    Med_Name: "",
    Type_of_Medicine: "",
    Brand: "",
    Supplier: "",
    Stock_Left: 0,
    Cost_to_buy: 0,
    Cost_to_sell: 0,
  });

  async function handleAdd(data) {
    setAdding(true);
    try {
      await medicines.create(data);
      resetForm();
      setShowAdd(false);
      await load();
    } catch (err) {
      alert(err.message || "Failed to add medicine");
    } finally {
      setAdding(false);
    }
  }

  function startEdit(med) {
    setEditId(med.Medicine_ID);
    setForm({
      Med_Name: med.Med_Name || "",
      Type_of_Medicine: med.Type_of_Medicine || "",
      Brand: med.Brand || "",
      Supplier: med.Supplier || "",
      Stock_Left: med.Stock_Left || 0,
      Cost_to_buy: med.Cost_to_buy || 0,
      Cost_to_sell: med.Cost_to_sell || 0,
    });
  }

  async function saveEdit(id) {
    try {
      await medicines.update(id, form);
      setEditId(null);
      resetForm();
      await load();
    } catch (err) {
      alert(err.message || "Failed to update medicine");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this medicine?")) return;
    try {
      await medicines.remove(id);
      setList(prev => prev.filter(m => m.Medicine_ID !== id));
    } catch (err) {
      alert(err.message || "Failed to delete medicine");
    }
  }

  return (
    <div className={styles.page}>
      <AdminNavbar />

      <div className={styles.materialTable}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>MEDICINES</span>
          <div className={styles.actions}>
            <button className={styles.iconButton} onClick={() => setShowAdd(s => !s)}>
              <i className="material-icons">add</i>
            </button>
            <button
              className={styles.iconButton}
              title="Search"
              onClick={() => setShowSearch(s => !s)}
            >
              <i className="material-icons">search</i>
            </button>
          </div>
        </div>

        {showAdd && (
          <MedicineFormModal
            onClose={() => { setShowAdd(false); resetForm(); }}
            onSubmit={(data) => handleAdd(data)}
          />
        )}

        {showSearch && (
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search by name, brand, supplier, type... or enter an ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searching && <div className={styles.loading}>Searching...</div>}
          </div>
        )}

        <div className={styles.tableContent}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className={tableStyles.tableWrapper}>
              <div className={tableStyles.scrollContainer}>
                <table className={tableStyles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Brand</th>
                      <th>Supplier</th>
                      <th>Stock Left</th>
                      <th>Cost to Buy</th>
                      <th>Cost to Sell</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map(m => (
                      <tr key={m.Medicine_ID}>
                        <td>{m.Medicine_ID}</td>
                        <td>
                        {editId === m.Medicine_ID ? (
                            <input style={{ width: 160 }} value={form.Med_Name} onChange={e=>setForm({...form, Med_Name: e.target.value})} />
                        ) : m.Med_Name}
                      </td>
                      <td>
                        {editId === m.Medicine_ID ? (
                            <input style={{ width: 140 }} value={form.Type_of_Medicine} onChange={e=>setForm({...form, Type_of_Medicine: e.target.value})} />
                        ) : m.Type_of_Medicine}
                      </td>
                      <td>
                        {editId === m.Medicine_ID ? (
                            <input style={{ width: 140 }} value={form.Brand} onChange={e=>setForm({...form, Brand: e.target.value})} />
                        ) : m.Brand}
                      </td>
                      <td>
                        {editId === m.Medicine_ID ? (
                            <input style={{ width: 160 }} value={form.Supplier} onChange={e=>setForm({...form, Supplier: e.target.value})} />
                        ) : m.Supplier}
                      </td>
                      <td>
                        {editId === m.Medicine_ID ? (
                            <input type="number" style={{ width: 90 }} value={form.Stock_Left} onChange={e=>setForm({...form, Stock_Left: Number(e.target.value)})} />
                        ) : m.Stock_Left}
                      </td>
                      <td>
                        {editId === m.Medicine_ID ? (
                            <input type="number" step="0.01" style={{ width: 110 }} value={form.Cost_to_buy} onChange={e=>setForm({...form, Cost_to_buy: Number(e.target.value)})} />
                        ) : m.Cost_to_buy}
                      </td>
                      <td>
                        {editId === m.Medicine_ID ? (
                            <input type="number" step="0.01" style={{ width: 110 }} value={form.Cost_to_sell} onChange={e=>setForm({...form, Cost_to_sell: Number(e.target.value)})} />
                        ) : m.Cost_to_sell}
                      </td>
                      <td>
                        {editId === m.Medicine_ID ? (
                          <>
                              <button className={tableStyles.actionBtn} style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => saveEdit(m.Medicine_ID)}>Save</button>
                              <button className={tableStyles.actionBtn} style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => { setEditId(null); resetForm(); }}>Cancel</button>
                          </>
                        ) : (
                          <>
                              <button className={tableStyles.actionBtn} style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => startEdit(m)}>Edit</button>
                              <button className={`${tableStyles.actionBtn} ${tableStyles.deleteBtn}`} style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => handleDelete(m.Medicine_ID)}>Delete</button>
                          </>
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
