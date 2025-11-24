// Inventory Service - Abstraction layer for data operations
// Uses API routes to persist data in JSON files

import { Product, Category, StoreItem, Unit } from '../types';

// API endpoints
const API_BASE = '/api/data';

// ============================================================================
// PRODUCTS
// ============================================================================

export const ProductService = {
  async getAll(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE}?type=products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  async saveAll(products: Product[]): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}?type=products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products }),
      });
      if (!response.ok) throw new Error('Failed to save products');
    } catch (error) {
      console.error('Error saving products:', error);
      throw error;
    }
  },

  async create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newProduct: Product = {
      id: Date.now().toString(),
      ...product,
      createdAt: new Date().toISOString(),
    };
    
    const products = await this.getAll();
    const updated = [...products, newProduct];
    await this.saveAll(updated);
    return newProduct;
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const products = await this.getAll();
    const updated = products.map(p => p.id === id ? { ...p, ...updates } : p);
    await this.saveAll(updated);
    return updated.find(p => p.id === id)!;
  },

  async delete(id: string): Promise<void> {
    const products = await this.getAll();
    const filtered = products.filter(p => p.id !== id);
    await this.saveAll(filtered);
  },

  async bulkUpdateByCategory(oldCategory: string, newCategory: string): Promise<void> {
    const products = await this.getAll();
    const updated = products.map(p => 
      p.category === oldCategory ? { ...p, category: newCategory } : p
    );
    await this.saveAll(updated);
  },

  async bulkUpdateByStore(oldStore: string, newStore: string): Promise<void> {
    const products = await this.getAll();
    const updated = products.map(p => 
      p.store === oldStore ? { ...p, store: newStore } : p
    );
    await this.saveAll(updated);
  },

  async bulkUpdateByUnit(oldUnit: string, newUnit: string): Promise<void> {
    const products = await this.getAll();
    const updated = products.map(p => 
      p.unit === oldUnit ? { ...p, unit: newUnit } : p
    );
    await this.saveAll(updated);
  },
};

// ============================================================================
// CATEGORIES
// ============================================================================

export const CategoryService = {
  async getAll(): Promise<Category[]> {
    try {
      const response = await fetch(`${API_BASE}?type=categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  async saveAll(categories: Category[]): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}?type=categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories }),
      });
      if (!response.ok) throw new Error('Failed to save categories');
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  },

  async create(name: string): Promise<Category> {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
    };
    
    const categories = await this.getAll();
    const updated = [...categories, newCategory];
    await this.saveAll(updated);
    return newCategory;
  },

  async update(id: string, name: string): Promise<Category> {
    const categories = await this.getAll();
    const updated = categories.map(c => c.id === id ? { ...c, name } : c);
    await this.saveAll(updated);
    return updated.find(c => c.id === id)!;
  },

  async delete(id: string): Promise<void> {
    const categories = await this.getAll();
    const filtered = categories.filter(c => c.id !== id);
    await this.saveAll(filtered);
  },

  async checkInUse(name: string): Promise<boolean> {
    const products = await ProductService.getAll();
    return products.some(p => p.category === name);
  },

  async importFromJSON(): Promise<Category[]> {
    // Import categories from data/categories.json (one-time seed operation)
    try {
      const response = await fetch('/data/categories.json');
      const data = await response.json();
      
      if (data.categories && Array.isArray(data.categories)) {
        return data.categories;
      }
    } catch (error) {
      console.error('Error importing categories from data/categories.json:', error);
    }
    
    return [];
  },
};

// ============================================================================
// STORES
// ============================================================================

export const StoreService = {
  async getAll(): Promise<StoreItem[]> {
    try {
      const response = await fetch(`${API_BASE}?type=stores`);
      if (!response.ok) throw new Error('Failed to fetch stores');
      const data = await response.json();
      return data.stores || [];
    } catch (error) {
      console.error('Error fetching stores:', error);
      return [];
    }
  },

  async saveAll(stores: StoreItem[]): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}?type=stores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stores }),
      });
      if (!response.ok) throw new Error('Failed to save stores');
    } catch (error) {
      console.error('Error saving stores:', error);
      throw error;
    }
  },

  async create(name: string): Promise<StoreItem> {
    const newStore: StoreItem = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
    };
    
    const stores = await this.getAll();
    const updated = [...stores, newStore];
    await this.saveAll(updated);
    return newStore;
  },

  async update(id: string, name: string): Promise<StoreItem> {
    const stores = await this.getAll();
    const updated = stores.map(s => s.id === id ? { ...s, name } : s);
    await this.saveAll(updated);
    return updated.find(s => s.id === id)!;
  },

  async delete(id: string): Promise<void> {
    const stores = await this.getAll();
    const filtered = stores.filter(s => s.id !== id);
    await this.saveAll(filtered);
  },

  async checkInUse(name: string): Promise<boolean> {
    const products = await ProductService.getAll();
    return products.some(p => p.store === name);
  },

  async importFromJSON(): Promise<StoreItem[]> {
    try {
      const response = await fetch('/data/stores.json');
      const data = await response.json();
      
      if (data.stores && Array.isArray(data.stores)) {
        return data.stores;
      }
    } catch (error) {
      console.error('Error importing stores from data/stores.json:', error);
    }
    
    return [];
  },
};

// ============================================================================
// UNITS
// ============================================================================

export const UnitService = {
  async getAll(): Promise<Unit[]> {
    try {
      const response = await fetch(`${API_BASE}?type=units`);
      if (!response.ok) throw new Error('Failed to fetch units');
      const data = await response.json();
      return data.units || [];
    } catch (error) {
      console.error('Error fetching units:', error);
      return [];
    }
  },

  async saveAll(units: Unit[]): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}?type=units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ units }),
      });
      if (!response.ok) throw new Error('Failed to save units');
    } catch (error) {
      console.error('Error saving units:', error);
      throw error;
    }
  },

  async create(unit: Omit<Unit, 'id' | 'createdAt'>): Promise<Unit> {
    const newUnit: Unit = {
      id: Date.now().toString(),
      ...unit,
      createdAt: new Date().toISOString(),
    };
    
    const units = await this.getAll();
    const updated = [...units, newUnit];
    await this.saveAll(updated);
    return newUnit;
  },

  async update(id: string, updates: Partial<Unit>): Promise<Unit> {
    const units = await this.getAll();
    const updated = units.map(u => u.id === id ? { ...u, ...updates } : u);
    await this.saveAll(updated);
    return updated.find(u => u.id === id)!;
  },

  async delete(id: string): Promise<void> {
    const units = await this.getAll();
    const filtered = units.filter(u => u.id !== id);
    await this.saveAll(filtered);
  },

  async checkInUse(abbreviation: string): Promise<boolean> {
    const products = await ProductService.getAll();
    return products.some(p => p.unit === abbreviation);
  },

  async importFromJSON(): Promise<Unit[]> {
    try {
      const response = await fetch('/data/units.json');
      const data = await response.json();
      
      if (data.units && Array.isArray(data.units)) {
        return data.units;
      }
    } catch (error) {
      console.error('Error importing units from data/units.json:', error);
    }
    
    return [];
  },
};

// ============================================================================
// INITIALIZATION
// ============================================================================

export const InventoryInitService = {
  async initialize(): Promise<{
    products: Product[];
    categories: Category[];
    stores: StoreItem[];
    units: Unit[];
  }> {
    // Load all data on app initialization
    let units = await UnitService.getAll();
    let categories = await CategoryService.getAll();
    let stores = await StoreService.getAll();
    
    // If no data exists, import from JSON files (first-time setup) and save
    if (units.length === 0) {
      units = await UnitService.importFromJSON();
      if (units.length > 0) {
        await UnitService.saveAll(units);
      }
    }
    
    if (categories.length === 0) {
      categories = await CategoryService.importFromJSON();
      if (categories.length > 0) {
        await CategoryService.saveAll(categories);
      }
    }
    
    if (stores.length === 0) {
      stores = await StoreService.importFromJSON();
      if (stores.length > 0) {
        await StoreService.saveAll(stores);
      }
    }
    
    const products = await ProductService.getAll();
    
    return { products, categories, stores, units };
  },
};

