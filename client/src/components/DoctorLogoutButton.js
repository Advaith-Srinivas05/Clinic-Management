// DoctorLogoutButton.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doctors } from "../api";
import styles from "../css/LogoutButton.module.css";

export default function DoctorLogoutButton() {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const storedDoctorId = localStorage.getItem("doctorId");
        if (!storedDoctorId) return;
        const list = await doctors.list();
        const d = (list || []).find((x) => String(x.Doctor_ID) === String(storedDoctorId));
        if (d && d.Name) setName(d.Name);
      } catch {}
    }
    load();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("doctorId");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className={styles.button}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={hover ? "Logout" : (name || "Doctor")}
    >
      <span className={styles.span}>
        {hover ? "Logout" : (name || "Doctor")}
      </span>
    </button>
  );
}