use clinicdb;
-- auto calculate bmi
DELIMITER $$

CREATE FUNCTION calculate_bmi(height DECIMAL(5,2), weight DECIMAL(5,2))
RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
    DECLARE result DECIMAL(5,2);
    IF height IS NULL OR weight IS NULL OR height = 0 THEN
        SET result = NULL;
    ELSE
        SET result = weight / POWER(height/100, 2);
    END IF;
    RETURN result;
END$$

DELIMITER ;


-- auto update bmi
DELIMITER $$

CREATE TRIGGER trg_patient_bmi_before_insert
BEFORE INSERT ON Patient
FOR EACH ROW
BEGIN
    SET NEW.BMI = calculate_bmi(NEW.Height, NEW.Weight);
END$$

CREATE TRIGGER trg_patient_bmi_before_update
BEFORE UPDATE ON Patient
FOR EACH ROW
BEGIN
    SET NEW.BMI = calculate_bmi(NEW.Height, NEW.Weight);
END$$

DELIMITER ;

--  auto set status to completed after payment
DELIMITER $$

CREATE TRIGGER trg_update_appointment_status_after_payment
AFTER INSERT ON Payments
FOR EACH ROW
BEGIN
    UPDATE Appointments
    SET Status = 'Completed'
    WHERE Appt_ID = NEW.Appt_ID;
END$$

DELIMITER ;


-- auto reduce stock when prescription is issued
DELIMITER $$

CREATE TRIGGER trg_reduce_stock_after_prescription
AFTER INSERT ON Prescription
FOR EACH ROW
BEGIN
    IF NEW.Medicine_ID IS NOT NULL THEN
        UPDATE Medicine
        SET Stock_Left = Stock_Left - 1
        WHERE Medicine_ID = NEW.Medicine_ID;
    END IF;
END$$

DELIMITER ;