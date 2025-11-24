import { useState, useMemo } from 'react';
import { Ruler, Edit2, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { Unit, Product, DeleteConfirm } from '../types';
import styles from '../page.module.css';

interface UnitsTabProps {
  units: Unit[];
  products: Product[];
  onEdit: (unit: Unit) => void;
  onDelete: (confirm: DeleteConfirm) => void;
  onViewProducts: (unit: Unit) => void;
}

type SortField = 'name' | 'abbreviation' | 'productCount';

export function UnitsTab({ units, products, onEdit, onDelete, onViewProducts }: UnitsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getProductsUsingUnit = (unitAbbr: string) => {
    return products.filter(p => p.unit === unitAbbr);
  };

  const filteredAndSortedUnits = useMemo(() => {
    let filtered = units;

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.abbreviation.toLowerCase().includes(term)
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'abbreviation') {
        comparison = a.abbreviation.localeCompare(b.abbreviation);
      } else if (sortField === 'productCount') {
        const aCount = getProductsUsingUnit(a.abbreviation).length;
        const bCount = getProductsUsingUnit(b.abbreviation).length;
        comparison = aCount - bCount;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [units, products, searchTerm, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  if (units.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Ruler size={64} strokeWidth={1.5} />
        <h3>No units yet</h3>
        <p>Click "Add Unit" to create your first measuring unit</p>
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
            placeholder="Search units..."
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
          onClick={() => toggleSort('name')}
          className={`${styles.sortBtn} ${sortField === 'name' ? styles.active : ''}`}
        >
          Name <ArrowUpDown size={14} />
          {sortField === 'name' && <span className={styles.sortIndicator}>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
        </button>
        <button
          onClick={() => toggleSort('abbreviation')}
          className={`${styles.sortBtn} ${sortField === 'abbreviation' ? styles.active : ''}`}
        >
          Abbreviation <ArrowUpDown size={14} />
          {sortField === 'abbreviation' && <span className={styles.sortIndicator}>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
        </button>
        <button
          onClick={() => toggleSort('productCount')}
          className={`${styles.sortBtn} ${sortField === 'productCount' ? styles.active : ''}`}
        >
          Product Count <ArrowUpDown size={14} />
          {sortField === 'productCount' && <span className={styles.sortIndicator}>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
        </button>
        <span className={styles.resultsCount} style={{ marginLeft: 'auto' }}>
          {filteredAndSortedUnits.length} {filteredAndSortedUnits.length === 1 ? 'unit' : 'units'}
        </span>
      </div>

      <div className={styles.simpleList}>
        {filteredAndSortedUnits.map(unit => (
          <div key={unit.id} className={styles.listItem}>
            <div className={styles.unitInfo}>
              <span className={styles.itemName}>{unit.name}</span>
              <span className={styles.unitAbbr}>({unit.abbreviation})</span>
              <button
                className={styles.viewProductsBtn}
                onClick={() => onViewProducts(unit)}
              >
                {getProductsUsingUnit(unit.abbreviation).length} products
              </button>
            </div>
            <div className={styles.itemActions}>
              <button
                className={styles.iconBtn}
                onClick={() => onEdit(unit)}
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                onClick={() => onDelete({ type: 'units', id: unit.id })}
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

