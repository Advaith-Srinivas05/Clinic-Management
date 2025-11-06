import React from "react";
import { NavLink } from "react-router-dom";
import styles from "../css/Navbar.module.css";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <span className={styles.logoText}>FRONTDESK</span>
      </div>

      <div className={styles.center}>
        <NavLink
          to="/frontdesk/appointments"
          className={({ isActive }) =>
            `${styles.navButton} ${styles.centerButton} ${isActive ? styles.active : ""}`
          }
        >
          Appointments
        </NavLink>

        <NavLink
          to="/frontdesk/patients"
          className={({ isActive }) =>
            `${styles.navButton} ${styles.centerButton} ${isActive ? styles.active : ""}`
          }
        >
          Patient Search
        </NavLink>
      </div>

      <div className={styles.right}>
        <LogoutButton />
      </div>
    </nav>
  );
}
