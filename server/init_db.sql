-- init_db.sql
CREATE DATABASE if NOT EXISTS clinicdb;
USE clinicdb;

-- Doctor
CREATE TABLE Doctor (
    Doctor_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Age INT,
    Gender ENUM('Male','Female','Other'),
    Phone_Number VARCHAR(15) UNIQUE,
    Email_Id VARCHAR(100) UNIQUE,
    Qualifications TEXT
);

-- Patient
CREATE TABLE Patient (
    Patient_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    DOB DATE,
    Gender ENUM('Male','Female','Other'),
    Height DECIMAL(5,2),
    Weight DECIMAL(5,2),
    BMI DECIMAL(5,2),
    Blood_Group VARCHAR(5),
    Phone_Number VARCHAR(15) UNIQUE,
    Mothers_Name VARCHAR(100),
    Fathers_Name VARCHAR(100),
    Profession VARCHAR(100),
    Portfolio TEXT
);

-- Medicine
CREATE TABLE Medicine (
    Medicine_ID INT PRIMARY KEY AUTO_INCREMENT,
    Med_Name VARCHAR(100) NOT NULL,
    Type_of_Medicine VARCHAR(50),
    Stock_Left INT,
    Brand VARCHAR(50),
    Supplier VARCHAR(100),
    Cost_to_buy DECIMAL(10,2),
    Cost_to_sell DECIMAL(10,2),
    Expiry_Date DATE
);

-- Appointments
CREATE TABLE Appointments (
    Appt_ID INT PRIMARY KEY AUTO_INCREMENT,
    Doctor_ID INT,
    Patient_ID INT,
    Date DATE,
    Time TIME,
    Cause_of_Visit TEXT,
    Status ENUM('Scheduled','Completed','Cancelled') DEFAULT 'Scheduled',
    Payment_ID INT,
    Prescription_ID INT,
    FOREIGN KEY (Doctor_ID) REFERENCES Doctor(Doctor_ID) ON DELETE CASCADE,
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID) ON DELETE CASCADE
);

-- Payments
CREATE TABLE Payments (
    Payment_ID INT PRIMARY KEY AUTO_INCREMENT,
    Appt_ID INT,
    Patient_ID INT,
    Date DATE,
    Time TIME,
    Amount DECIMAL(10,2),
    Mode_of_payment ENUM('Cash','Card','UPI','Other'),
    Prescription_ID INT,
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID) ON DELETE CASCADE
);

-- Prescription
CREATE TABLE Prescription (
    Prescription_ID INT PRIMARY KEY AUTO_INCREMENT,
    Appt_ID INT,
    Payment_ID INT,
    Doctor_ID INT,
    Patient_ID INT,
    Prescription TEXT,
    Medicine_ID INT,
    FOREIGN KEY (Doctor_ID) REFERENCES Doctor(Doctor_ID) ON DELETE CASCADE,
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (Medicine_ID) REFERENCES Medicine(Medicine_ID) ON DELETE SET NULL
);

-- Now add remaining FKs (use ALTER to avoid circular creation issues)
ALTER TABLE Appointments
    ADD CONSTRAINT fk_appt_payment FOREIGN KEY (Payment_ID) REFERENCES Payments(Payment_ID) ON DELETE SET NULL,
    ADD CONSTRAINT fk_appt_prescription FOREIGN KEY (Prescription_ID) REFERENCES Prescription(Prescription_ID) ON DELETE SET NULL;

ALTER TABLE Payments
    ADD CONSTRAINT fk_payment_appt FOREIGN KEY (Appt_ID) REFERENCES Appointments(Appt_ID) ON DELETE CASCADE,
    ADD CONSTRAINT fk_payment_prescription FOREIGN KEY (Prescription_ID) REFERENCES Prescription(Prescription_ID) ON DELETE SET NULL;

ALTER TABLE Prescription
    ADD CONSTRAINT fk_presc_appt FOREIGN KEY (Appt_ID) REFERENCES Appointments(Appt_ID) ON DELETE SET NULL,
    ADD CONSTRAINT fk_presc_payment FOREIGN KEY (Payment_ID) REFERENCES Payments(Payment_ID) ON DELETE SET NULL;

-- Login and login attempts
CREATE TABLE Login (
    User_ID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password_Hash VARCHAR(255) NOT NULL,
    Role ENUM('Admin','Doctor','FrontDesk') NOT NULL,
    Doctor_ID INT DEFAULT NULL,
    Created_On DATETIME DEFAULT CURRENT_TIMESTAMP,
    Last_Active DATETIME DEFAULT NULL,
    FOREIGN KEY (Doctor_ID) REFERENCES Doctor(Doctor_ID) ON DELETE SET NULL
);

CREATE TABLE Login_Attempts (
    Attempt_ID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50),
    Attempt_Time DATETIME DEFAULT CURRENT_TIMESTAMP,
    Success BOOLEAN
);
