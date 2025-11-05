// LogoutButton.js
import React from 'react';

export default function LogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload(); // simplest way to reset everything
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        position: 'absolute',
        top: 15,
        right: 15,
        background: '#e74c3c',
        color: 'white',
        border: 'none',
        padding: '8px 14px',
        borderRadius: '6px',
        cursor: 'pointer'
      }}
    >
      Logout
    </button>
  );
}
