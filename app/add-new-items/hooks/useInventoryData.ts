// Custom hook for managing inventory data (products, categories, stores, units, extra items)
// Uses service layer with JSON file persistence via API routes

import { useState, useEffect } from 'react';
import { Product, Category, StoreItem, Unit, ExtraItem } from '../types';
import { InventoryInitService, ProductService, CategoryService, StoreService, UnitService } from '../services/inventoryService';
import { extraItemsService } from '../services/extraItemsService';

export function useInventoryData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Load all data on mount using service layer
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await InventoryInitService.initialize();
        const extraItemsData = await extraItemsService.fetchExtraItems();
        
        setProducts(data.products);
        setCategories(data.categories);
        setStores(data.stores);
        setUnits(data.units);
        setExtraItems(extraItemsData);
        setInitialized(true);
      } catch (error) {
        console.error('Error loading inventory data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save products when they change (after initial load)
  useEffect(() => {
    if (initialized && !isLoading) {
      ProductService.saveAll(products);
    }
  }, [products, initialized, isLoading]);

  // Save categories when they change (after initial load)
  useEffect(() => {
    if (initialized && !isLoading) {
      CategoryService.saveAll(categories);
    }
  }, [categories, initialized, isLoading]);

  // Save stores when they change (after initial load)
  useEffect(() => {
    if (initialized && !isLoading) {
      StoreService.saveAll(stores);
    }
  }, [stores, initialized, isLoading]);

  // Save units when they change (after initial load)
  useEffect(() => {
    if (initialized && !isLoading) {
      UnitService.saveAll(units);
    }
  }, [units, initialized, isLoading]);

  // Save extra items when they change (after initial load)
  useEffect(() => {
    if (initialized && !isLoading) {
      extraItemsService.saveExtraItems(extraItems);
    }
  }, [extraItems, initialized, isLoading]);

  return {
    products,
    setProducts,
    categories,
    setCategories,
    stores,
    setStores,
    units,
    setUnits,
    extraItems,
    setExtraItems,
    isLoading,
  };
}
