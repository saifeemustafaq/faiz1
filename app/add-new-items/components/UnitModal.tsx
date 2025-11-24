import { useEffect } from 'react';
import { UnitForm } from '../types';
import styles from '../page.module.css';

interface UnitModalProps {
  mode: 'add' | 'edit';
  form: UnitForm;
  onChange: (form: UnitForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function UnitModal({ mode, form, onChange, onSubmit, onClose }: UnitModalProps) {
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
          <h2>{mode === 'add' ? 'Add' : 'Edit'} Unit</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalContent}>
          <form onSubmit={onSubmit}>
            <div className={styles.formGroup}>
              <label>Unit Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                required
                placeholder="e.g., Kilogram, Liter, Piece"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Abbreviation *</label>
              <input
                type="text"
                value={form.abbreviation}
                onChange={(e) => onChange({ ...form, abbreviation: e.target.value })}
                required
                placeholder="e.g., kg, L, pc"
              />
            </div>

            <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" className={styles.saveBtn}>
                {mode === 'add' ? 'Add Unit' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

