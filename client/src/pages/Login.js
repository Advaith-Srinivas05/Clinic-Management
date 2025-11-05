// Login.js
import React, { useState } from "react";
import { login } from "../api";
import styles from "./Login.module.css";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(username, password);
      localStorage.setItem("token", res.token);
      onLogin(res);
    } catch (err) {
      setErr(err.error || "Login failed");
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.loginContainer} onSubmit={submit}>
        {/* <h1>LOGIN</h1> */}
        <h1 className={styles.h1_login}>CLINIC MANAGEMENT</h1>

        <div className={styles.inputGroup}>
          <label htmlFor="username">USERNAME</label>
          <input
            id="username"
            type="text"
            value={username}
            placeholder="Enter username"
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">PASSWORD</label>
          <input
            id="password"
            type="password"
            value={password}
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className={styles.loginButton} type="submit">
          SIGN IN
        </button>

        {err && <div style={{ color: "red", marginTop: "10px" }}>{err}</div>}
      </form>
    </div>
  );
}
