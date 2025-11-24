import { useState, useMemo, useEffect } from 'react';
import { Package, Edit2, Trash2, ChevronDown, ChevronRight, ChevronsDown, ChevronsUp, Search } from 'lucide-react';
import { Product, DeleteConfirm } from '../types';
import styles from '../page.module.css';

interface ProductsTabProps {
  products: Product[];
  categories: string[];
  stores: string[];
  units: string[];
  onEdit: (product: Product) => void;
  onDelete: (confirm: DeleteConfirm) => void;
}

export function ProductsTab({ products, categories, stores, units, onEdit, onDelete }: ProductsTabProps) {
  // Track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStore, setFilterStore] = useState<string>('');
  const [filterUnit, setFilterUnit] = useState<string>('');

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.store.toLowerCase().includes(term) ||
        p.unit.toLowerCase().includes(term) ||
        (p.notes && p.notes.toLowerCase().includes(term))
      );
    }

    // Apply filters
    if (filterCategory) {
      filtered = filtered.filter(p => p.category === filterCategory);
    }
    if (filterStore) {
      filtered = filtered.filter(p => p.store === filterStore);
    }
    if (filterUnit) {
      filtered = filtered.filter(p => p.unit === filterUnit);
    }

    // Sort by name within each category
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    return filtered;
  }, [products, searchTerm, filterCategory, filterStore, filterUnit]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped: Record<string, Product[]> = {};
    
    filteredProducts.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });

    // Sort categories alphabetically
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredProducts]);

  // Initialize all categories as expanded on first render only
  useEffect(() => {
    if (productsByCategory.length > 0 && !initialized) {
      const allCategories = new Set(productsByCategory.map(([category]) => category));
      setExpandedCategories(allCategories);
      setInitialized(true);
    }
  }, [productsByCategory, initialized]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allCategories = new Set(productsByCategory.map(([category]) => category));
    setExpandedCategories(allCategories);
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterStore('');
    setFilterUnit('');
  };

  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Package size={64} strokeWidth={1.5} />
        <h3>No products yet</h3>
        <p>Click "Add Product" to create your first product</p>
      </div>
    );
  }

  const allExpanded = expandedCategories.size === productsByCategory.length;
  const allCollapsed = expandedCategories.size === 0;
  const hasActiveFilters = searchTerm || filterCategory || filterStore || filterUnit;

  return (
    <div>
      {/* Search and Filters */}
      <div className={styles.searchFilterBar}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filterStore}
            onChange={(e) => setFilterStore(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Stores</option>
            {stores.map(store => (
              <option key={store} value={store}>{store}</option>
            ))}
          </select>

          <select
            value={filterUnit}
            onChange={(e) => setFilterUnit(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Units</option>
            {units.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button onClick={clearFilters} className={styles.clearFiltersBtn}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Expand/Collapse Controls */}
      <div className={styles.categoryControls}>
        <span className={styles.resultsCount}>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </span>
        <div className={styles.categoryControlButtons}>
          <button
            className={styles.categoryControlBtn}
            onClick={expandAll}
            disabled={allExpanded}
          >
            <ChevronsDown size={16} />
            Expand All
          </button>
          <button
            className={styles.categoryControlBtn}
            onClick={collapseAll}
            disabled={allCollapsed}
          >
            <ChevronsUp size={16} />
            Collapse All
          </button>
        </div>
      </div>

      <div className={styles.categorizedProducts}>
        {productsByCategory.map(([category, categoryProducts]) => {
        const isExpanded = expandedCategories.has(category);
        
        return (
          <div key={category} className={styles.categorySection}>
            <button
              className={styles.categoryHeader}
              onClick={() => toggleCategory(category)}
            >
              <div className={styles.categoryHeaderLeft}>
                {isExpanded ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
                <h3 className={styles.categoryTitle}>{category}</h3>
                <span className={styles.categoryCount}>
                  ({categoryProducts.length} {categoryProducts.length === 1 ? 'item' : 'items'})
                </span>
              </div>
            </button>

            {isExpanded && (
              <div className={styles.categoryContent}>
                <div className={styles.grid}>
                  {categoryProducts.map(product => (
                    <div key={product.id} className={styles.card}>
                      <div className={styles.cardHeader}>
                        <h3>{product.name}</h3>
                        <div className={styles.cardActions}>
                          <button
                            className={styles.iconBtn}
                            onClick={() => onEdit(product)}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className={`${styles.iconBtn} ${styles.deleteBtn}`}
                            onClick={() => onDelete({ type: 'products', id: product.id })}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className={styles.cardBody}>
                        <div className={styles.cardRow}>
                          <span className={styles.label}>Store:</span>
                          <span className={styles.value}>{product.store}</span>
                        </div>
                        <div className={styles.cardRow}>
                          <span className={styles.label}>Unit:</span>
                          <span className={styles.value}>{product.unit}</span>
                        </div>
                        {product.notes && (
                          <div className={styles.cardRow}>
                            <span className={styles.label}>Notes:</span>
                            <span className={styles.value}>{product.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}

