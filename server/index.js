// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const apptRoutes = require('./routes/appointments');
const prescRoutes = require('./routes/prescriptions');
const paymentRoutes = require('./routes/payments');
const medRoutes = require('./routes/medicines');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/patients', patientRoutes);
app.use('/appointments', apptRoutes);
app.use('/prescriptions', prescRoutes);
app.use('/payments', paymentRoutes);
app.use('/medicines', medRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
