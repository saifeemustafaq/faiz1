// Type definitions for Add New Items module

export type TabType = 'products' | 'categories' | 'stores' | 'units';
export type ModalMode = 'add' | 'edit' | 'viewProducts' | null;

export interface Product {
  id: string;
  name: string;
  category: string;
  store: string;
  unit: string;
  notes: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface StoreItem {
  id: string;
  name: string;
  createdAt: string;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  createdAt: string;
}

export interface DeleteConfirm {
  type: TabType;
  id: string;
}

export interface ProductForm {
  name: string;
  category: string;
  store: string;
  unit: string;
  notes: string;
}

export interface CategoryForm {
  name: string;
}

export interface StoreForm {
  name: string;
}

export interface UnitForm {
  name: string;
  abbreviation: string;
}

