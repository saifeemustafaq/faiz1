import { ShoppingCart } from 'lucide-react';
import styles from '../menu-management/page.module.css';

export default function ManageCarts() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <ShoppingCart size={32} strokeWidth={2} />
        </div>
        <div>
          <h1 className={styles.title}>Manage Carts</h1>
          <p className={styles.subtitle}>Track and manage shopping carts</p>
        </div>
      </header>

      <div className={styles.placeholder}>
        <div className={styles.placeholderIcon}>
          <ShoppingCart size={64} strokeWidth={1.5} />
        </div>
        <h2 className={styles.placeholderTitle}>Coming Soon</h2>
        <p className={styles.placeholderText}>
          Cart management features will be available here. You'll be able to view, track, and manage all shopping carts.
        </p>
      </div>
    </div>
  );
}

