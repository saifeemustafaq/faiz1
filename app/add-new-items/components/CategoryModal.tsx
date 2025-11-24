import { useEffect } from 'react';
import { CategoryForm } from '../types';
import styles from '../page.module.css';

interface CategoryModalProps {
  mode: 'add' | 'edit';
  form: CategoryForm;
  onChange: (form: CategoryForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function CategoryModal({ mode, form, onChange, onSubmit, onClose }: CategoryModalProps) {
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
          <h2>{mode === 'add' ? 'Add' : 'Edit'} Category</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalContent}>
          <form onSubmit={onSubmit}>
            <div className={styles.formGroup}>
              <label>Category Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => onChange({ name: e.target.value })}
                required
                placeholder="e.g., Grains, Dairy, Vegetables"
              />
            </div>

            <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" className={styles.saveBtn}>
                {mode === 'add' ? 'Add Category' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

