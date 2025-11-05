// App.js
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Login from './pages/Login';
import FrontdeskDashboard from './pages/FrontdeskDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // decode token once on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // normalize role to capitalized form
        const role = decoded.role ? decoded.role.toLowerCase() : '';
        setUser({
          role: role,
          doctorId: decoded.doctorId,
        });
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (res) => {
    const role = res.role ? res.role.toLowerCase() : '';
    setUser({ role, doctorId: res.doctorId });
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  // no user yet → login screen
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // normalize roles and route
  if (user.role === 'frontdesk') return <FrontdeskDashboard user={user} />;
  if (user.role === 'doctor') return <DoctorDashboard user={user} />;
  if (user.role === 'admin') return <AdminDashboard user={user} />;

  return <div style={{ padding: 20 }}>Unknown role: {user.role}</div>;
}