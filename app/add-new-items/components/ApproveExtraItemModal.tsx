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
      <div className={styles.modal} style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Review & Approve Item</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody} style={{ padding: '1.5rem' }}>
            {hasMissingFields && (
              <div className={styles.missingFieldsWarning} style={{ marginBottom: '1.5rem' }}>
                <AlertCircle size={18} />
                <span>
                  This item is missing some information. Please fill in the required fields below.
                </span>
              </div>
            )}

            <div className={styles.formGroup} style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="itemName" style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                Item Name
              </label>
              <input
                type="text"
                id="itemName"
                value={item.name}
                disabled
                className={styles.input}
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  background: '#f9fafb',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  cursor: 'not-allowed',
                  fontWeight: 600,
                  color: '#111827'
                }}
              />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="unit" style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                Unit
              </label>
              <input
                type="text"
                id="unit"
                value={item.unit}
                disabled
                className={styles.input}
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  background: '#f9fafb',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  cursor: 'not-allowed',
                  color: '#4b5563'
                }}
              />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="category" style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                Category <span style={{ color: '#dc3545' }}>*</span>
                {!item.category && <span className={styles.missingLabel}> (Missing)</span>}
              </label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={styles.select}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${!item.category ? '#ffc107' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  background: 'white',
                  cursor: 'pointer',
                  color: '#111827'
                }}
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

            <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="store" style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                Store <span style={{ color: '#dc3545' }}>*</span>
                {!item.store && <span className={styles.missingLabel}> (Missing)</span>}
              </label>
              <select
                id="store"
                value={form.store}
                onChange={(e) => setForm({ ...form, store: e.target.value })}
                className={styles.select}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${!item.store ? '#ffc107' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  background: 'white',
                  cursor: 'pointer',
                  color: '#111827'
                }}
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

            <div style={{
              padding: '1rem',
              background: '#fffbeb',
              borderLeft: '4px solid #fbbf24',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: '#92400e',
              lineHeight: '1.6'
            }}>
              <strong>Note:</strong> Approving this item will add it to the master inventory as a permanent item that all users can access.
            </div>
          </div>

          <div className={styles.modalFooter} style={{ 
            padding: '1.25rem 1.5rem',
            display: 'flex',
            gap: '0.75rem',
            borderTop: '2px solid #f3f4f6'
          }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                background: 'white',
                color: '#374151',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#0ea5e9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!isFormComplete}
              style={{ 
                flex: 1,
                padding: '0.75rem 1.5rem',
                background: isFormComplete ? '#28a745' : '#cbd5e1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: isFormComplete ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                boxShadow: isFormComplete ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (isFormComplete) {
                  e.currentTarget.style.background = '#218838';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (isFormComplete) {
                  e.currentTarget.style.background = '#28a745';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }
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

