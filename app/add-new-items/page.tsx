'use client';

import { Plus, Edit2, Trash2, Package, Tag, Store, Ruler } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import styles from './page.module.css';

type TabType = 'products' | 'categories' | 'stores' | 'units';
type ModalMode = 'add' | 'edit' | 'viewProducts' | null;

interface Product {
  id: string;
  name: string;
  category: string;
  store: string;
  unit: string;
  notes: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  createdAt: string;
}

interface StoreItem {
  id: string;
  name: string;
  createdAt: string;
}

interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  createdAt: string;
}

export default function AddNewItems() {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: TabType; id: string } | null>(null);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    store: '',
    unit: '',
    notes: ''
  });

  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [storeForm, setStoreForm] = useState({ name: '' });
  const [unitForm, setUnitForm] = useState({ name: '', abbreviation: '' });

  // Load data from localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedProducts = localStorage.getItem('inventoryProducts');
        const savedCategories = localStorage.getItem('inventoryCategories');
        const savedStores = localStorage.getItem('inventoryStores');
        const savedUnits = localStorage.getItem('inventoryUnits');

        if (savedProducts) setProducts(JSON.parse(savedProducts));
        if (savedCategories) setCategories(JSON.parse(savedCategories));
        if (savedStores) setStores(JSON.parse(savedStores));
        
        // Load units from localStorage or import from unitdata.json if not present
        if (savedUnits) {
          setUnits(JSON.parse(savedUnits));
        } else {
          // Import units from unitdata.json on first load
          try {
            const response = await fetch('/unitdata.json');
            const data = await response.json();
            
            if (data.units && Array.isArray(data.units)) {
              const importedUnits: Unit[] = data.units
                .filter((u: any) => u.isActive)
                .map((u: any) => ({
                  id: u.id || Date.now().toString() + Math.random(),
                  name: u.name,
                  abbreviation: u.shortName,
                  createdAt: new Date().toISOString()
                }));
              
              setUnits(importedUnits);
              localStorage.setItem('inventoryUnits', JSON.stringify(importedUnits));
            }
          } catch (error) {
            console.error('Error importing units from unitdata.json:', error);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (products.length > 0) localStorage.setItem('inventoryProducts', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (categories.length > 0) localStorage.setItem('inventoryCategories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    if (stores.length > 0) localStorage.setItem('inventoryStores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    if (units.length > 0) localStorage.setItem('inventoryUnits', JSON.stringify(units));
  }, [units]);

  // Get products using a specific unit
  const getProductsUsingUnit = (unitAbbr: string) => {
    return products.filter(p => p.unit === unitAbbr);
  };

  // Modal handlers
  const openAddModal = () => {
    if (activeTab === 'products') {
      setProductForm({ name: '', category: '', store: '', unit: '', notes: '' });
    } else if (activeTab === 'categories') {
      setCategoryForm({ name: '' });
    } else if (activeTab === 'stores') {
      setStoreForm({ name: '' });
    } else if (activeTab === 'units') {
      setUnitForm({ name: '', abbreviation: '' });
    }
    setModalMode('add');
  };

  const openEditModal = (item: any) => {
    setCurrentItem(item);
    if (activeTab === 'products') {
      setProductForm({
        name: item.name,
        category: item.category,
        store: item.store,
        unit: item.unit,
        notes: item.notes
      });
    } else if (activeTab === 'categories') {
      setCategoryForm({ name: item.name });
    } else if (activeTab === 'stores') {
      setStoreForm({ name: item.name });
    } else if (activeTab === 'units') {
      setUnitForm({ name: item.name, abbreviation: item.abbreviation });
    }
    setModalMode('edit');
  };

  const openViewProductsModal = (unit: Unit) => {
    setCurrentItem(unit);
    setModalMode('viewProducts');
  };

  const closeModal = () => {
    setModalMode(null);
    setCurrentItem(null);
  };

  // Submit handlers
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productForm.name || !productForm.category || !productForm.store || !productForm.unit) {
      alert('Please fill in all required fields');
      return;
    }

    if (modalMode === 'add') {
      const newProduct: Product = {
        id: Date.now().toString(),
        ...productForm,
        createdAt: new Date().toISOString()
      };
      setProducts([...products, newProduct]);
    } else if (modalMode === 'edit' && currentItem) {
      setProducts(products.map(p =>
        p.id === currentItem.id ? { ...p, ...productForm } : p
      ));
    }
    closeModal();
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.name) {
      alert('Please enter a category name');
      return;
    }

    if (modalMode === 'add') {
      if (categories.some(c => c.name.toLowerCase() === categoryForm.name.toLowerCase())) {
        alert('Category already exists');
        return;
      }
      const newCategory: Category = {
        id: Date.now().toString(),
        name: categoryForm.name,
        createdAt: new Date().toISOString()
      };
      setCategories([...categories, newCategory]);
    } else if (modalMode === 'edit' && currentItem) {
      const oldName = currentItem.name;
      setCategories(categories.map(c =>
        c.id === currentItem.id ? { ...c, name: categoryForm.name } : c
      ));
      // Update products using this category
      setProducts(products.map(p =>
        p.category === oldName ? { ...p, category: categoryForm.name } : p
      ));
    }
    closeModal();
  };

  const handleStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeForm.name) {
      alert('Please enter a store name');
      return;
    }

    if (modalMode === 'add') {
      if (stores.some(s => s.name.toLowerCase() === storeForm.name.toLowerCase())) {
        alert('Store already exists');
        return;
      }
      const newStore: StoreItem = {
        id: Date.now().toString(),
        name: storeForm.name,
        createdAt: new Date().toISOString()
      };
      setStores([...stores, newStore]);
    } else if (modalMode === 'edit' && currentItem) {
      const oldName = currentItem.name;
      setStores(stores.map(s =>
        s.id === currentItem.id ? { ...s, name: storeForm.name } : s
      ));
      // Update products using this store
      setProducts(products.map(p =>
        p.store === oldName ? { ...p, store: storeForm.name } : p
      ));
    }
    closeModal();
  };

  const handleUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!unitForm.name || !unitForm.abbreviation) {
      alert('Please fill in all fields');
      return;
    }

    if (modalMode === 'add') {
      if (units.some(u => u.abbreviation.toLowerCase() === unitForm.abbreviation.toLowerCase())) {
        alert('Unit abbreviation already exists');
        return;
      }
      const newUnit: Unit = {
        id: Date.now().toString(),
        name: unitForm.name,
        abbreviation: unitForm.abbreviation,
        createdAt: new Date().toISOString()
      };
      setUnits([...units, newUnit]);
    } else if (modalMode === 'edit' && currentItem) {
      const oldAbbr = currentItem.abbreviation;
      setUnits(units.map(u =>
        u.id === currentItem.id ? { ...u, ...unitForm } : u
      ));
      // Update products using this unit
      setProducts(products.map(p =>
        p.unit === oldAbbr ? { ...p, unit: unitForm.abbreviation } : p
      ));
    }
    closeModal();
  };

  // Delete handlers
  const handleDelete = () => {
    if (!deleteConfirm) return;

    const { type, id } = deleteConfirm;

    if (type === 'products') {
      setProducts(products.filter(p => p.id !== id));
    } else if (type === 'categories') {
      const category = categories.find(c => c.id === id);
      if (category && products.some(p => p.category === category.name)) {
        alert('Cannot delete category that is being used by products');
        setDeleteConfirm(null);
        return;
      }
      setCategories(categories.filter(c => c.id !== id));
    } else if (type === 'stores') {
      const store = stores.find(s => s.id === id);
      if (store && products.some(p => p.store === store.name)) {
        alert('Cannot delete store that is being used by products');
        setDeleteConfirm(null);
        return;
      }
      setStores(stores.filter(s => s.id !== id));
    } else if (type === 'units') {
      const unit = units.find(u => u.id === id);
      if (unit && products.some(p => p.unit === unit.abbreviation)) {
        alert('Cannot delete unit that is being used by products');
        setDeleteConfirm(null);
        return;
      }
      setUnits(units.filter(u => u.id !== id));
    }

    setDeleteConfirm(null);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Plus size={32} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Add New Items</h1>
            <p className={styles.subtitle}>Manage products, categories, stores, and units</p>
          </div>
        </div>
        <button className={styles.addButton} onClick={openAddModal}>
          <Plus size={20} />
          Add {activeTab === 'products' ? 'Product' : activeTab === 'categories' ? 'Category' : activeTab === 'stores' ? 'Store' : 'Unit'}
        </button>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={20} />
          Products
          <span className={styles.count}>{products.length}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'categories' ? styles.active : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Tag size={20} />
          Categories
          <span className={styles.count}>{categories.length}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'stores' ? styles.active : ''}`}
          onClick={() => setActiveTab('stores')}
        >
          <Store size={20} />
          Stores
          <span className={styles.count}>{stores.length}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'units' ? styles.active : ''}`}
          onClick={() => setActiveTab('units')}
        >
          <Ruler size={20} />
          Units
          <span className={styles.count}>{units.length}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className={styles.itemsList}>
            {products.length === 0 ? (
              <div className={styles.emptyState}>
                <Package size={64} strokeWidth={1.5} />
                <h3>No products yet</h3>
                <p>Click "Add Product" to create your first product</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {products.map(product => (
                  <div key={product.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h3>{product.name}</h3>
                      <div className={styles.cardActions}>
                        <button
                          className={styles.iconBtn}
                          onClick={() => openEditModal(product)}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className={`${styles.iconBtn} ${styles.deleteBtn}`}
                          onClick={() => setDeleteConfirm({ type: 'products', id: product.id })}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardRow}>
                        <span className={styles.label}>Category:</span>
                        <span className={styles.value}>{product.category}</span>
                      </div>
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
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className={styles.itemsList}>
            {categories.length === 0 ? (
              <div className={styles.emptyState}>
                <Tag size={64} strokeWidth={1.5} />
                <h3>No categories yet</h3>
                <p>Click "Add Category" to create your first category</p>
              </div>
            ) : (
              <div className={styles.simpleList}>
                {categories.map(category => (
                  <div key={category.id} className={styles.listItem}>
                    <span className={styles.itemName}>{category.name}</span>
                    <div className={styles.itemActions}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => openEditModal(category)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.deleteBtn}`}
                        onClick={() => setDeleteConfirm({ type: 'categories', id: category.id })}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stores Tab */}
        {activeTab === 'stores' && (
          <div className={styles.itemsList}>
            {stores.length === 0 ? (
              <div className={styles.emptyState}>
                <Store size={64} strokeWidth={1.5} />
                <h3>No stores yet</h3>
                <p>Click "Add Store" to create your first store</p>
              </div>
            ) : (
              <div className={styles.simpleList}>
                {stores.map(store => (
                  <div key={store.id} className={styles.listItem}>
                    <span className={styles.itemName}>{store.name}</span>
                    <div className={styles.itemActions}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => openEditModal(store)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.deleteBtn}`}
                        onClick={() => setDeleteConfirm({ type: 'stores', id: store.id })}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Units Tab */}
        {activeTab === 'units' && (
          <div className={styles.itemsList}>
            {units.length === 0 ? (
              <div className={styles.emptyState}>
                <Ruler size={64} strokeWidth={1.5} />
                <h3>No units yet</h3>
                <p>Click "Add Unit" to create your first measuring unit</p>
              </div>
            ) : (
              <div className={styles.simpleList}>
                {units.map(unit => (
                  <div key={unit.id} className={styles.listItem}>
                    <div className={styles.unitInfo}>
                      <span className={styles.itemName}>{unit.name}</span>
                      <span className={styles.unitAbbr}>({unit.abbreviation})</span>
                      <button
                        className={styles.viewProductsBtn}
                        onClick={() => openViewProductsModal(unit)}
                      >
                        {getProductsUsingUnit(unit.abbreviation).length} products
                      </button>
                    </div>
                    <div className={styles.itemActions}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => openEditModal(unit)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.deleteBtn}`}
                        onClick={() => setDeleteConfirm({ type: 'units', id: unit.id })}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modals */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalMode === 'add' ? 'Add' : 'Edit'}{' '}
                {activeTab === 'products' ? 'Product' : activeTab === 'categories' ? 'Category' : activeTab === 'stores' ? 'Store' : 'Unit'}
              </h2>
              <button className={styles.closeButton} onClick={closeModal}>×</button>
            </div>

            <div className={styles.modalContent}>
              {activeTab === 'products' && (
                <form onSubmit={handleProductSubmit}>
                  <div className={styles.formGroup}>
                    <label>Product Name *</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Default Category *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
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
                      value={productForm.store}
                      onChange={(e) => setProductForm({ ...productForm, store: e.target.value })}
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
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
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
                      value={productForm.notes}
                      onChange={(e) => setProductForm({ ...productForm, notes: e.target.value })}
                      placeholder="Additional notes"
                      rows={3}
                    />
                  </div>

                  <div className={styles.modalActions}>
                    <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.saveBtn}>
                      {modalMode === 'add' ? 'Add Product' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'categories' && (
                <form onSubmit={handleCategorySubmit}>
                  <div className={styles.formGroup}>
                    <label>Category Name *</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ name: e.target.value })}
                      required
                      placeholder="e.g., Grains, Dairy, Vegetables"
                    />
                  </div>

                  <div className={styles.modalActions}>
                    <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.saveBtn}>
                      {modalMode === 'add' ? 'Add Category' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'stores' && (
                <form onSubmit={handleStoreSubmit}>
                  <div className={styles.formGroup}>
                    <label>Store Name *</label>
                    <input
                      type="text"
                      value={storeForm.name}
                      onChange={(e) => setStoreForm({ name: e.target.value })}
                      required
                      placeholder="e.g., Costco, Walmart, Local Market"
                    />
                  </div>

                  <div className={styles.modalActions}>
                    <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.saveBtn}>
                      {modalMode === 'add' ? 'Add Store' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'units' && (
                <form onSubmit={handleUnitSubmit}>
                  <div className={styles.formGroup}>
                    <label>Unit Name *</label>
                    <input
                      type="text"
                      value={unitForm.name}
                      onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                      required
                      placeholder="e.g., Kilogram, Liter, Piece"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Abbreviation *</label>
                    <input
                      type="text"
                      value={unitForm.abbreviation}
                      onChange={(e) => setUnitForm({ ...unitForm, abbreviation: e.target.value })}
                      required
                      placeholder="e.g., kg, L, pc"
                    />
                  </div>

                  <div className={styles.modalActions}>
                    <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.saveBtn}>
                      {modalMode === 'add' ? 'Add Unit' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Products Using Unit Modal */}
      {modalMode === 'viewProducts' && currentItem && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Products Using "{currentItem.name}" ({currentItem.abbreviation})</h2>
              <button className={styles.closeButton} onClick={closeModal}>×</button>
            </div>

            <div className={styles.modalContent}>
              {getProductsUsingUnit(currentItem.abbreviation).length === 0 ? (
                <p className={styles.noProducts}>No products are currently using this unit.</p>
              ) : (
                <div className={styles.productsList}>
                  {getProductsUsingUnit(currentItem.abbreviation).map(product => (
                    <div key={product.id} className={styles.productItem}>
                      <span className={styles.productName}>{product.name}</span>
                      <span className={styles.productCategory}>{product.category}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.modalActions}>
                <button onClick={closeModal} className={styles.saveBtn}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button onClick={() => setDeleteConfirm(null)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleDelete} className={styles.confirmDeleteBtn}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
