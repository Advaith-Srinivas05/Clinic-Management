import React from "react";
import { NavLink } from "react-router-dom";
import styles from "../css/Navbar.module.css";
import LogoutButton from "./LogoutButton";

export default function DoctorNavbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <span className={styles.logoText}>DOCTOR PORTAL</span>
      </div>

      <div className={styles.center}>
        <NavLink
          to="/doctor/dashboard"
          end
          className={({ isActive }) =>
            `${styles.navButton} ${styles.centerButton} ${isActive ? styles.active : ""}`
          }
        >
          Appointments
        </NavLink>

        <NavLink
          to="/doctor/dashboard/patients"
          className={({ isActive }) =>
            `${styles.navButton} ${styles.centerButton} ${isActive ? styles.active : ""}`
          }
        >
          Patients
        </NavLink>

        <NavLink
          to="/doctor/dashboard/stats"
          className={({ isActive }) =>
            `${styles.navButton} ${styles.centerButton} ${isActive ? styles.active : ""}`
          }
        >
          Statistics
        </NavLink>
      </div>

      <div className={styles.right}>
        <LogoutButton />
      </div>
    </nav>
  );
}
