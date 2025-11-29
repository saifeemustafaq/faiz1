import { X, Check, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ExtraItem, ExtraItemApprovalForm, Category, StoreItem, Unit } from '../types';
import styles from '../page.module.css';

interface ApproveExtraItemModalProps {
  item: ExtraItem;
  categories: Category[];
  stores: StoreItem[];
  units: Unit[];
  onSubmit: (item: ExtraItem, filledData: { store: string; category: string }) => void;
  onClose: () => void;
}

export function ApproveExtraItemModal({
  item,
  categories,
  stores,
  units,
  onSubmit,
  onClose
}: ApproveExtraItemModalProps) {
  const [form, setForm] = useState<ExtraItemApprovalForm>({
    name: item.name,
    category: item.category || '',
    store: item.store || '',
    unit: item.unit
  });

  const hasMissingFields = !item.store || !item.category;
  const isFormComplete = form.category && form.store;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.category || !form.store) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit(item, {
      store: form.store,
      category: form.category
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Review & Approve Item</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {hasMissingFields && (
              <div className={styles.missingFieldsWarning} style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={18} />
                <span>
                  This item is missing some information. Please fill in the required fields below.
                </span>
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="itemName">Item Name</label>
              <input
                type="text"
                id="itemName"
                value={item.name}
                disabled
                className={styles.input}
                style={{ 
                  background: '#f9fafb',
                  cursor: 'not-allowed',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="unit">Unit</label>
              <input
                type="text"
                id="unit"
                value={item.unit}
                disabled
                className={styles.input}
                style={{ 
                  background: '#f9fafb',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">
                Category <span className={styles.required}>*</span>
                {!item.category && <span className={styles.missingLabel}> (Missing)</span>}
              </label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={styles.select}
                style={!item.category ? { borderColor: '#ffc107' } : undefined}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="store">
                Store <span className={styles.required}>*</span>
                {!item.store && <span className={styles.missingLabel}> (Missing)</span>}
              </label>
              <select
                id="store"
                value={form.store}
                onChange={(e) => setForm({ ...form, store: e.target.value })}
                className={styles.select}
                style={!item.store ? { borderColor: '#ffc107' } : undefined}
                required
              >
                <option value="">Select Store</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.name}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.approveNote}>
              <strong>Note:</strong> Approving this item will add it to the master inventory as a permanent item that all users can access.
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit"
              className={styles.saveButton}
              disabled={!isFormComplete}
              style={{ 
                background: isFormComplete ? '#28a745' : '#94a3b8',
                cursor: isFormComplete ? 'pointer' : 'not-allowed',
                opacity: isFormComplete ? 1 : 0.6
              }}
            >
              <Check size={18} />
              Approve & Add to Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

