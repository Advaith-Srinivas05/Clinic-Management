import React from 'react';
import styles from '../css/ConfirmationModal.module.css';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  showCancel = true,
  confirmText = 'Confirm' 
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>{title || 'Confirm Action'}</h3>
        <p>{message || 'Are you sure you want to perform this action?'}</p>
        <div className={styles.buttons}>
          {showCancel && (
            <button 
              className={`${styles.button} ${styles.cancelButton}`} 
              onClick={onClose}
            >
              Cancel
            </button>
          )}
          <button 
            className={`${styles.button} ${styles.confirmButton}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
