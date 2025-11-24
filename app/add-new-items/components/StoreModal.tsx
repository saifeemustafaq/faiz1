import { useEffect } from 'react';
import { StoreForm } from '../types';
import styles from '../page.module.css';

interface StoreModalProps {
  mode: 'add' | 'edit';
  form: StoreForm;
  onChange: (form: StoreForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function StoreModal({ mode, form, onChange, onSubmit, onClose }: StoreModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{mode === 'add' ? 'Add' : 'Edit'} Store</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalContent}>
          <form onSubmit={onSubmit}>
            <div className={styles.formGroup}>
              <label>Store Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => onChange({ name: e.target.value })}
                required
                placeholder="e.g., Costco, Walmart, Local Market"
              />
            </div>

            <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" className={styles.saveBtn}>
                {mode === 'add' ? 'Add Store' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

