import { useEffect } from 'react';
import { Unit, Product } from '../types';
import styles from '../page.module.css';

interface ViewProductsModalProps {
  unit: Unit;
  products: Product[];
  onClose: () => void;
}

export function ViewProductsModal({ unit, products, onClose }: ViewProductsModalProps) {
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
          <h2>Products Using "{unit.name}" ({unit.abbreviation})</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalContent}>
          {products.length === 0 ? (
            <p className={styles.noProducts}>No products are currently using this unit.</p>
          ) : (
            <div className={styles.productsList}>
              {products.map(product => (
                <div key={product.id} className={styles.productItem}>
                  <span className={styles.productName}>{product.name}</span>
                  <span className={styles.productCategory}>{product.category}</span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.modalActions}>
            <button onClick={onClose} className={styles.saveBtn}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

