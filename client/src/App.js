import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import FrontdeskDashboard from "./pages/FrontdeskDashboard";
import FrontdeskPatientSearch from "./pages/FrontdeskPatientSearch";
import DoctorDashboard from "./pages/DoctorDashboard"
import AdminMedicines from "./pages/AdminMedicines";
import AdminUsers from "./pages/AdminUsers";
import AdminActivity from "./pages/AdminActivity";

function RoleRedirect() {
  const role = localStorage.getItem("role");
  if (role === "FrontDesk") return <Navigate to="/frontdesk/appointments" />;
  if (role === "Doctor") return <Navigate to="/doctor/dashboard" />;
  if (role === "Admin") return <Navigate to="/admin/medicines" />;
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

      <Route path="/admin/medicines" element={<AdminMedicines />} />
      <Route path="/admin/activity" element={<AdminActivity />} />
      <Route path="/admin/users" element={<AdminUsers />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}