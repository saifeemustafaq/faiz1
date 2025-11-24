import { useState, useMemo } from 'react';
import { Tag, Edit2, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { Category, DeleteConfirm } from '../types';
import styles from '../page.module.css';

interface CategoriesTabProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (confirm: DeleteConfirm) => void;
}

export function CategoriesTab({ categories, onEdit, onDelete }: CategoriesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories;

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(term));
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
  }, [categories, searchTerm, sortOrder]);

  if (categories.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Tag size={64} strokeWidth={1.5} />
        <h3>No categories yet</h3>
        <p>Click "Add Category" to create your first category</p>
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
            placeholder="Search categories..."
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
          {filteredAndSortedCategories.length} {filteredAndSortedCategories.length === 1 ? 'category' : 'categories'}
        </span>
      </div>

      <div className={styles.simpleList}>
        {filteredAndSortedCategories.map(category => (
          <div key={category.id} className={styles.listItem}>
            <span className={styles.itemName}>{category.name}</span>
            <div className={styles.itemActions}>
              <button
                className={styles.iconBtn}
                onClick={() => onEdit(category)}
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                onClick={() => onDelete({ type: 'categories', id: category.id })}
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

