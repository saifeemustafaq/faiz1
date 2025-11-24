import { useEffect } from 'react';
import { DeleteConfirm } from '../types';
import styles from '../page.module.css';

interface DeleteConfirmModalProps {
  deleteConfirm: DeleteConfirm;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ deleteConfirm, onConfirm, onCancel }: DeleteConfirmModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onCancel]);

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
        <div className={styles.confirmActions}>
          <button onClick={onCancel} className={styles.cancelBtn}>
            Cancel
          </button>
          <button onClick={onConfirm} className={styles.confirmDeleteBtn}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

