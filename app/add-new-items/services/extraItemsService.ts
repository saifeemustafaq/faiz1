// Service for managing extra items from user portal

import { ExtraItem, Product } from '../types';

const API_BASE = '/api/data';

export const extraItemsService = {
  // Fetch all extra items (pending approval)
  async fetchExtraItems(): Promise<ExtraItem[]> {
    try {
      const response = await fetch(`${API_BASE}?type=extra-items`);
      if (!response.ok) throw new Error('Failed to fetch extra items');
      const data = await response.json();
      return data.extraItemsHistory || [];
    } catch (error) {
      console.error('Error fetching extra items:', error);
      return [];
    }
  },

  // Save extra items
  async saveExtraItems(items: ExtraItem[]): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}?type=extra-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extraItemsHistory: items })
      });
      return response.ok;
    } catch (error) {
      console.error('Error saving extra items:', error);
      return false;
    }
  },

  // Remove an item from extraItemsHistory (after approval)
  async removeExtraItem(itemId: string): Promise<boolean> {
    try {
      const items = await this.fetchExtraItems();
      const updatedItems = items.filter(item => item.id !== itemId);
      return await this.saveExtraItems(updatedItems);
    } catch (error) {
      console.error('Error removing extra item:', error);
      return false;
    }
  },

  // Approve item - add to master inventory and remove from extraItemsHistory
  async approveItem(
    extraItem: ExtraItem,
    products: Product[],
    filledData: { store: string; category: string }
  ): Promise<{ success: boolean; newProduct?: Product }> {
    try {
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
        name: extraItem.name,
        category: filledData.category || extraItem.category || 'Not Assigned',
        store: filledData.store || extraItem.store || 'Not Assigned',
        unit: extraItem.unit,
        notes: `Added from user request on ${new Date().toLocaleDateString()}`,
        createdAt: new Date().toISOString()
      };

      // Remove from extraItemsHistory
      await this.removeExtraItem(extraItem.id);

      return { success: true, newProduct };
    } catch (error) {
      console.error('Error approving item:', error);
      return { success: false };
    }
  }
};

