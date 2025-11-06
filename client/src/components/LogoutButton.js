// LogoutButton.js
import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/LogoutButton.module.css";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <button onClick={handleLogout} className={styles.button}>
      <span className={styles.span}>
        Logout
      </span>
    </button>
  );
}