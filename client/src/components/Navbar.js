import React from "react";
import styles from "../css/Navbar.module.css";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <span className={styles.logoText}>FRONTDESK</span>
      </div>
      <div className={styles.right}>
        <LogoutButton />
      </div>
    </nav>
  );
}
