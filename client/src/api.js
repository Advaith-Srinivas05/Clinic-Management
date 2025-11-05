// api.js
const API_BASE = process.env.REACT_APP_API || 'http://localhost:4000';

async function req(path, opts = {}) {
  const token = localStorage.getItem('token');
  opts.headers = opts.headers || {};
  opts.headers['Content-Type'] = 'application/json';
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) {
    let msg = 'Unknown error';
    try {
      const err = await res.json();
      msg = err.error || JSON.stringify(err);
    } catch {
      msg = await res.text();
    }
    throw new Error(msg);
  }
  return res.json();
}

export const login = (username, password) =>
  req('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });

export const createPatient = (data) => req('/patients', { method: 'POST', body: JSON.stringify(data) });
export const searchPatients = (q) => req(`/patients/search?q=${encodeURIComponent(q)}`);
export const getAppointments = (filters) => {
  const qs = new URLSearchParams(filters).toString();
  return req(`/appointments?${qs}`);
};
export const createAppointment = (data) => req('/appointments', { method: 'POST', body: JSON.stringify(data) });
export const editAppointment = (id, data) => req(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAppointment = (id) => req(`/appointments/${id}`, { method: 'DELETE' });

export const createPrescription = (data) => req('/prescriptions', { method: 'POST', body: JSON.stringify(data) });
export const payments = {
  make: (data) => req('/payments', { method: 'POST', body: JSON.stringify(data) }),
  list: (doctorId) => req(`/payments?doctorId=${doctorId || ''}`)
};

export const medicines = {
  list: () => req('/medicines'),
  update: (id, data) => req(`/medicines/${id}`, { method: 'PUT', body: JSON.stringify(data) })
};

export const admin = {
  createDoctor: (d) => req('/admin/create-doctor', { method: 'POST', body: JSON.stringify(d) }),
  logins: () => req('/admin/logins')
};

export const searchAppointments = (q) =>
  req(`/appointments/search?q=${encodeURIComponent(q)}`);
