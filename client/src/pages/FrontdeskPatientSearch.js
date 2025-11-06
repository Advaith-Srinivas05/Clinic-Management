import React, { useState } from "react";
import Navbar from "../components/Navbar";
import styles from "../css/FrontdeskDashboard.module.css";
import { searchPatients } from "../api";

export default function FrontdeskPatientSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await searchPatients(query);
      setResults(res);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.materialTable}>
        <h2>Patient Search</h2>

        {/* Search input */}
        <form
          onSubmit={handleSearch}
          style={{
            marginTop: "20px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: "1",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              background: "#807182",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>

        {/* Results Table */}
        <div style={{ marginTop: "30px" }}>
          {loading ? (
            <p>Searching...</p>
          ) : results.length > 0 ? (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
              }}
            >
              <thead>
                <tr style={{ background: "#f2f2f2" }}>
                  <th style={{ padding: "10px", textAlign: "left" }}>ID</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Name</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Phone</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>
                    Blood Group
                  </th>
                  <th style={{ padding: "10px", textAlign: "left" }}>
                    Profession
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((p) => (
                  <tr key={p.Patient_ID}>
                    <td style={{ padding: "10px" }}>{p.Patient_ID}</td>
                    <td style={{ padding: "10px" }}>{p.Name}</td>
                    <td style={{ padding: "10px" }}>{p.Phone_Number}</td>
                    <td style={{ padding: "10px" }}>{p.Blood_Group}</td>
                    <td style={{ padding: "10px" }}>{p.Profession}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: "#666", marginTop: "10px" }}>
              No patients found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}