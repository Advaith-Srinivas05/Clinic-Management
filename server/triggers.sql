use clinicdb;
-- triggers.sql
-- This file contains all database triggers for the clinic management system

-- First, drop existing triggers if they exist
DROP TRIGGER IF EXISTS before_delete_patient;

-- Change the delimiter to handle trigger body
DELIMITER //

-- Trigger to handle cascading deletes for patient data
CREATE TRIGGER before_delete_patient
BEFORE DELETE ON Patient
FOR EACH ROW
BEGIN
    -- Delete related appointments (this will cascade to appointments due to ON DELETE CASCADE)
    -- Delete related prescriptions (this will cascade to prescription_medicines due to ON DELETE CASCADE)
    -- Delete related payments (this will be handled by the foreign key constraint)
    
    -- Update any other references to set them to NULL or handle as needed
    -- For example, if there are any other tables that reference Patient but don't have ON DELETE CASCADE
    -- they should be handled here
    
    -- Log the deletion (optional)
    INSERT INTO audit_log (table_name, record_id, action, action_timestamp)
    VALUES ('Patient', OLD.Patient_ID, 'DELETE', NOW());
END//

-- Reset delimiter
DELIMITER ;

-- Note: The actual cascading deletes are handled by the foreign key constraints with ON DELETE CASCADE
-- that were defined in the init_db.sql file. This trigger is mainly for any additional cleanup
-- or logging that might be needed.

-- Create an audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action VARCHAR(10) NOT NULL,
    action_timestamp DATETIME NOT NULL,
    user_id INT,
    ip_address VARCHAR(50),
    details TEXT
) ENGINE=InnoDB;
