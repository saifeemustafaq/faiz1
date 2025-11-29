'use client';

import { Plus, Package, Tag, Store, Ruler, Inbox } from 'lucide-react';
import { useState } from 'react';
import styles from './page.module.css';

// Types
import {
  TabType,
  ModalMode,
  Product,
  Category,
  StoreItem,
  Unit,
  DeleteConfirm,
  ProductForm,
  CategoryForm,
  StoreForm,
  UnitForm,
  ExtraItem
} from './types';

// Hooks
import { useInventoryData } from './hooks/useInventoryData';

// Components
import { ProductsTab } from './components/ProductsTab';
import { CategoriesTab } from './components/CategoriesTab';
import { StoresTab } from './components/StoresTab';
import { UnitsTab } from './components/UnitsTab';
import { ExtraItemsTab } from './components/ExtraItemsTab';
import { ProductModal } from './components/ProductModal';
import { CategoryModal } from './components/CategoryModal';
import { StoreModal } from './components/StoreModal';
import { UnitModal } from './components/UnitModal';
import { ViewProductsModal } from './components/ViewProductsModal';
import { ApproveExtraItemModal } from './components/ApproveExtraItemModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

export default function AddNewItems() {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm | null>(null);
  const [extraItemToApprove, setExtraItemToApprove] = useState<ExtraItem | null>(null);

  // Data from custom hook
  const {
    products,
    setProducts,
    categories,
    setCategories,
    stores,
    setStores,
    units,
    setUnits,
    extraItems,
    setExtraItems
  } = useInventoryData();

  // Form states
  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    category: '',
    store: '',
    unit: '',
    notes: ''
  });

  const [categoryForm, setCategoryForm] = useState<CategoryForm>({ name: '' });
  const [storeForm, setStoreForm] = useState<StoreForm>({ name: '' });
  const [unitForm, setUnitForm] = useState<UnitForm>({ name: '', abbreviation: '' });

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

  // Delete handler
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

  // Get products using a specific unit
  const getProductsUsingUnit = (unitAbbr: string) => {
    return products.filter(p => p.unit === unitAbbr);
  };

  // Extra Items handlers
  const handleApproveExtraItem = (item: ExtraItem) => {
    setExtraItemToApprove(item);
    setModalMode('approveExtraItem');
  };

  const confirmApproveExtraItem = (
    item: ExtraItem,
    filledData: { store: string; category: string }
  ) => {
    // Generate new ID for master inventory
    const maxId = Math.max(
      ...products.map(p => {
        const match = p.id.match(/prod-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }),
      0
    );
    const newId = `prod-${String(maxId + 1).padStart(3, '0')}`;

    // Create new product for master inventory
    const newProduct: Product = {
      id: newId,
      name: item.name,
      category: filledData.category || item.category || 'Not Assigned',
      store: filledData.store || item.store || 'Not Assigned',
      unit: item.unit,
      notes: `Added from user request on ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString()
    };

    // Add to products
    setProducts([...products, newProduct]);

    // Remove from extraItems
    setExtraItems(extraItems.filter(ei => ei.id !== item.id));

    // Close modal
    setExtraItemToApprove(null);
    setModalMode(null);
  };

  // Get counts for tab badges
  const pendingExtraItemsCount = extraItems.length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Plus size={32} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Add New Items</h1>
            <p className={styles.subtitle}>Manage products, categories, stores, units, and user requests</p>
          </div>
        </div>
        {activeTab !== 'extra-items' && (
          <button className={styles.addButton} onClick={openAddModal}>
            <Plus size={20} />
            Add {activeTab === 'products' ? 'Product' : activeTab === 'categories' ? 'Category' : activeTab === 'stores' ? 'Store' : activeTab === 'units' ? 'Unit' : 'Item'}
          </button>
        )}
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
        <button
          className={`${styles.tab} ${activeTab === 'extra-items' ? styles.active : ''}`}
          onClick={() => setActiveTab('extra-items')}
        >
          <Inbox size={20} />
          Extra Items
          {pendingExtraItemsCount > 0 && (
            <span className={styles.count} style={{ background: '#ffc107', color: '#000' }}>
              {pendingExtraItemsCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        <div className={styles.itemsList}>
          {activeTab === 'products' && (
            <ProductsTab
              products={products}
              categories={categories.map(c => c.name)}
              stores={stores.map(s => s.name)}
              units={units.map(u => u.abbreviation)}
              onEdit={openEditModal}
              onDelete={setDeleteConfirm}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesTab
              categories={categories}
              onEdit={openEditModal}
              onDelete={setDeleteConfirm}
            />
          )}

          {activeTab === 'stores' && (
            <StoresTab
              stores={stores}
              onEdit={openEditModal}
              onDelete={setDeleteConfirm}
            />
          )}

          {activeTab === 'units' && (
            <UnitsTab
              units={units}
              products={products}
              onEdit={openEditModal}
              onDelete={setDeleteConfirm}
              onViewProducts={openViewProductsModal}
            />
          )}

          {activeTab === 'extra-items' && (
            <ExtraItemsTab
              extraItems={extraItems}
              onApproveItem={handleApproveExtraItem}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {modalMode === 'add' || modalMode === 'edit' ? (
        <>
          {activeTab === 'products' && (
            <ProductModal
              mode={modalMode}
              form={productForm}
              categories={categories}
              stores={stores}
              units={units}
              onChange={setProductForm}
              onSubmit={handleProductSubmit}
              onClose={closeModal}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryModal
              mode={modalMode}
              form={categoryForm}
              onChange={setCategoryForm}
              onSubmit={handleCategorySubmit}
              onClose={closeModal}
            />
          )}

          {activeTab === 'stores' && (
            <StoreModal
              mode={modalMode}
              form={storeForm}
              onChange={setStoreForm}
              onSubmit={handleStoreSubmit}
              onClose={closeModal}
            />
          )}

          {activeTab === 'units' && (
            <UnitModal
              mode={modalMode}
              form={unitForm}
              onChange={setUnitForm}
              onSubmit={handleUnitSubmit}
              onClose={closeModal}
            />
          )}
        </>
      ) : null}

      {modalMode === 'viewProducts' && currentItem && (
        <ViewProductsModal
          unit={currentItem}
          products={getProductsUsingUnit(currentItem.abbreviation)}
          onClose={closeModal}
        />
      )}

      {modalMode === 'approveExtraItem' && extraItemToApprove && (
        <ApproveExtraItemModal
          item={extraItemToApprove}
          categories={categories}
          stores={stores}
          units={units}
          onSubmit={confirmApproveExtraItem}
          onClose={() => {
            setExtraItemToApprove(null);
            setModalMode(null);
          }}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          deleteConfirm={deleteConfirm}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
