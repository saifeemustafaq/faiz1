// Type definitions for Add New Items module

export type TabType = 'products' | 'categories' | 'stores' | 'units' | 'extra-items';
export type ModalMode = 'add' | 'edit' | 'viewProducts' | 'approveExtraItem' | null;

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

// Extra Items types (from User Portal)
export interface ExtraItem {
  id: string;                    // Format: "extra-{timestamp}-{random}"
  name: string;                  // Item name
  store?: string;                // Optional, can be undefined or empty string
  unit: string;                  // Must match one of the valid unit abbreviations
  category?: string;             // Optional, can be undefined or empty string
  addedAt: string;               // ISO 8601 date string
}

export interface ExtraItemApprovalForm {
  name: string;
  category: string;
  store: string;
  unit: string;
}


