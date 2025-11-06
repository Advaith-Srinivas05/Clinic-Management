import React from "react";
import { NavLink } from "react-router-dom";
import styles from "../css/Navbar.module.css";
import LogoutButton from "./LogoutButton";

export default function AdminNavbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <span className={styles.logoText}>ADMIN</span>
      </div>

      <div className={styles.center}>
        <NavLink
          to="/admin/medicines"
          className={({ isActive }) =>
            `${styles.navButton} ${styles.centerButton} ${isActive ? styles.active : ""}`
          }
        >
          Medicines
        </NavLink>

        <NavLink
          to="/admin/activity"
          className={({ isActive }) =>
            `${styles.navButton} ${styles.centerButton} ${isActive ? styles.active : ""}`
          }
        >
          Activity
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `${styles.navButton} ${styles.centerButton} ${isActive ? styles.active : ""}`
          }
        >
          Users
        </NavLink>
      </div>

      <div className={styles.right}>
        <LogoutButton />
      </div>
    </nav>
  );
}
