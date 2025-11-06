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
    let bodyText = '';
    try {
      bodyText = await res.text();
      try {
        const errObj = JSON.parse(bodyText);
        msg = errObj.error || errObj.message || bodyText;
      } catch {
        msg = bodyText || res.statusText;
      }
    } catch (e) {
      msg = res.statusText || msg;
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
  search: (q) => req(`/medicines/search?q=${encodeURIComponent(q)}`),
  create: (data) => req('/medicines', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => req(`/medicines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => req(`/medicines/${id}`, { method: 'DELETE' })
};

export const admin = {
  createDoctor: (d) => req('/admin/create-doctor', { method: 'POST', body: JSON.stringify(d) }),
  logins: () => req('/admin/logins'),
  attempts: () => req('/admin/attempts'),
  attemptsSearch: (q) => req(`/admin/attempts/search?q=${encodeURIComponent(q)}`)
};

export const searchAppointments = (q) =>
  req(`/appointments/search?q=${encodeURIComponent(q)}`);
