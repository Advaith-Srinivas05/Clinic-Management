import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import styles from "../css/Login.module.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(username, password);
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);
      if (res.doctorId != null) {
        localStorage.setItem("doctorId", String(res.doctorId));
      }
      // store a minimal user object for components that expect it
      localStorage.setItem(
        "user",
        JSON.stringify({ role: res.role, doctorId: res.doctorId ?? null })
      );

      if (res.role === "FrontDesk") navigate("/frontdesk/appointments");
      else if (res.role === "Doctor") navigate("/doctor/dashboard");
      else if (res.role === "Admin") navigate("/admin/dashboard");
      else navigate("/login");
    } catch (err) {
      setErr(err.message || "Login failed");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.loginContainer}>
        <h1>LOGIN</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">USERNAME</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button className={styles.loginButton} type="submit">
            SIGN IN
          </button>
        </form>
        {err && <div className={styles.error}>{err}</div>}
      </div>
    </div>
  );
}