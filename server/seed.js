// seed.js
const pool = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert two doctors (use DOB instead of Age)
    const insertDoctorSQL = `INSERT INTO Doctor (Name, DOB, Gender, Phone_Number, Email_Id, Qualifications) VALUES (?, ?, ?, ?, ?, ?)`;
    await conn.query(insertDoctorSQL, ['Dr. Alice', '1980-05-15', 'Female', '9990001111', 'alice@example.com', 'MBBS']);
    await conn.query(insertDoctorSQL, ['Dr. Bob', '1975-09-22', 'Male', '9990002222', 'bob@example.com', 'MD']);

    // Get doctor ids
    const [doctors] = await conn.query('SELECT Doctor_ID, Name FROM Doctor');
    const doc1 = doctors[0].Doctor_ID;
    const doc2 = doctors[1].Doctor_ID;

    // Insert medicines
    const insertMedSQL = `INSERT INTO Medicine (Med_Name, Type_of_Medicine, Stock_Left, Brand, Supplier, Cost_to_buy, Cost_to_sell) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await conn.query(insertMedSQL, ['Paracetamol', 'Tablet', 100, 'Panadol', 'MedSupplier', 10.00, 15.00]);
    await conn.query(insertMedSQL, ['Amoxicillin', 'Capsule', 50, 'Amox', 'MedSupplier', 20.00, 30.00]);

    // helper to insert user
    const insertUser = async (username, password, role, doctor_id=null) => {
      const hash = await bcrypt.hash(password, 10);
      const sql = `INSERT INTO Login (Username, Password_Hash, Role, Doctor_ID) VALUES (?, ?, ?, ?)`;
      await conn.query(sql, [username, hash, role, doctor_id]);
    };

    // Create accounts:
    await insertUser('admin1', 'admin1', 'Admin', null);
    await insertUser('front1', 'pass1', 'FrontDesk', null);
    // doctor logins linked to doctors inserted above:
    await insertUser('doc1', 'doc1', 'Doctor', doc1);
    await insertUser('doc2', 'doc2', 'Doctor', doc2);

    await conn.commit();
    console.log('Seeding completed.');
  } catch (err) {
    await conn.rollback();
    console.error('Seed failed:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();
