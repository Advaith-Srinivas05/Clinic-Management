// Login.js
import React, { useState } from 'react';
import { login } from '../api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(username, password);
      localStorage.setItem('token', res.token);
      onLogin(res);
    } catch (err) {
      setErr(err.error || 'Login failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div><input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} /></div>
        <div><input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button type="submit">Login</button>
      </form>
      {err && <div style={{color:'red'}}>{err}</div>}
      <div style={{marginTop:10}}>
        Use: front1/pass1 | admin1/admin1 | doc1/doc1 | doc2/doc2
      </div>
    </div>
  );
}
