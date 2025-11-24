import { useEffect } from 'react';
import { ProductForm, Category, StoreItem, Unit } from '../types';
import styles from '../page.module.css';

interface ProductModalProps {
  mode: 'add' | 'edit';
  form: ProductForm;
  categories: Category[];
  stores: StoreItem[];
  units: Unit[];
  onChange: (form: ProductForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function ProductModal({
  mode,
  form,
  categories,
  stores,
  units,
  onChange,
  onSubmit,
  onClose
}: ProductModalProps) {
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
          <h2>{mode === 'add' ? 'Add' : 'Edit'} Product</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalContent}>
          <form onSubmit={onSubmit}>
            <div className={styles.formGroup}>
              <label>Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                required
                placeholder="Enter product name"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Default Category *</label>
              <select
                value={form.category}
                onChange={(e) => onChange({ ...form, category: e.target.value })}
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Default Store *</label>
              <select
                value={form.store}
                onChange={(e) => onChange({ ...form, store: e.target.value })}
                required
              >
                <option value="">Select store</option>
                {stores.map(store => (
                  <option key={store.id} value={store.name}>{store.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Default Measuring Unit *</label>
              <select
                value={form.unit}
                onChange={(e) => onChange({ ...form, unit: e.target.value })}
                required
              >
                <option value="">Select unit</option>
                {units.map(unit => (
                  <option key={unit.id} value={unit.abbreviation}>
                    {unit.name} ({unit.abbreviation})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Notes (Optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => onChange({ ...form, notes: e.target.value })}
                placeholder="Additional notes"
                rows={3}
              />
            </div>

            <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" className={styles.saveBtn}>
                {mode === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

