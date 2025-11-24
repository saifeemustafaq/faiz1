import { useState, useMemo } from 'react';
import { Store, Edit2, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { StoreItem, DeleteConfirm } from '../types';
import styles from '../page.module.css';

interface StoresTabProps {
  stores: StoreItem[];
  onEdit: (store: StoreItem) => void;
  onDelete: (confirm: DeleteConfirm) => void;
}

export function StoresTab({ stores, onEdit, onDelete }: StoresTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedStores = useMemo(() => {
    let filtered = stores;

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(term));
    }

    // Apply sort
    filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

    return filtered;
  }, [stores, searchTerm, sortOrder]);

  if (stores.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Store size={64} strokeWidth={1.5} />
        <h3>No stores yet</h3>
        <p>Click "Add Store" to create your first store</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className={styles.searchFilterBar}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Sort and Results */}
      <div className={styles.sortBar}>
        <span className={styles.sortLabel}>Sort by:</span>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className={`${styles.sortBtn} ${styles.active}`}
        >
          Name <ArrowUpDown size={14} />
          <span className={styles.sortIndicator}>{sortOrder === 'asc' ? '↑' : '↓'}</span>
        </button>
        <span className={styles.resultsCount} style={{ marginLeft: 'auto' }}>
          {filteredAndSortedStores.length} {filteredAndSortedStores.length === 1 ? 'store' : 'stores'}
        </span>
      </div>

      <div className={styles.simpleList}>
        {filteredAndSortedStores.map(store => (
          <div key={store.id} className={styles.listItem}>
            <span className={styles.itemName}>{store.name}</span>
            <div className={styles.itemActions}>
              <button
                className={styles.iconBtn}
                onClick={() => onEdit(store)}
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                onClick={() => onDelete({ type: 'stores', id: store.id })}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

