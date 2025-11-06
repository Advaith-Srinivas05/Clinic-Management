import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import FrontdeskDashboard from "./pages/FrontdeskDashboard";
import FrontdeskPatientSearch from "./pages/FrontdeskPatientSearch";
import DoctorDashboard from "./pages/DoctorDashboard"
import AdminDashboard from "./pages/AdminDashboard"

function RoleRedirect() {
  const role = localStorage.getItem("role");
  if (role === "FrontDesk") return <Navigate to="/frontdesk/appointments" />;
  if (role === "Doctor") return <Navigate to="/doctor/dashboard" />;
  if (role === "Admin") return <Navigate to="/admin/dashboard" />;
  return <Navigate to="/login" />;
}

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/" element={token ? <RoleRedirect /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      <Route path="/frontdesk/appointments" element={<FrontdeskDashboard />} />
      <Route path="/frontdesk/patients" element={<FrontdeskPatientSearch />} />

      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />

      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}