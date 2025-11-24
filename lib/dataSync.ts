// Data synchronization utility
// Exports localStorage data to JSON format for migration

import { Product, Category, StoreItem, Unit } from '../app/add-new-items/types';

interface Recipient {
  id: string;
  name: string;
  itsNumber: string;
  mobileNumber: string;
  email: string;
  location: string;
  pickupLocation: string;
  createdAt: string;
}

interface Location {
  id: string;
  name: string;
  type: 'location' | 'pickup';
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  roleId: string;
  roleName: string;
  permissions: string[];
  createdAt: string;
}

export interface ExportData {
  exportDate: string;
  version: string;
  inventory: {
    products: Product[];
    categories: Category[];
    stores: StoreItem[];
    units: Unit[];
  };
  recipients: Recipient[];
  locations: {
    locations: Location[];
    pickupLocations: Location[];
  };
  roles: {
    roles: Role[];
    users: User[];
  };
  menus: any;
  events: any;
  rsvpSettings: any;
}

/**
 * Export all localStorage data to JSON format
 */
export function exportAllData(): ExportData {
  const exportData: ExportData = {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    inventory: {
      products: safeParseJSON(localStorage.getItem('inventoryProducts'), []),
      categories: safeParseJSON(localStorage.getItem('inventoryCategories'), []),
      stores: safeParseJSON(localStorage.getItem('inventoryStores'), []),
      units: safeParseJSON(localStorage.getItem('inventoryUnits'), []),
    },
    recipients: safeParseJSON(localStorage.getItem('recipients'), []),
    locations: {
      locations: safeParseJSON(localStorage.getItem('locations'), []),
      pickupLocations: safeParseJSON(localStorage.getItem('pickupLocations'), []),
    },
    roles: {
      roles: safeParseJSON(localStorage.getItem('roles'), []),
      users: safeParseJSON(localStorage.getItem('users'), []),
    },
    menus: safeParseJSON(localStorage.getItem('menuState'), {}),
    events: safeParseJSON(localStorage.getItem('events'), []),
    rsvpSettings: safeParseJSON(localStorage.getItem('rsvpSettings'), {}),
  };

  return exportData;
}

/**
 * Download exported data as JSON file
 */
export function downloadExportData(): void {
  const data = exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `community-kitchen-export-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Save data to JSON files (for development/backup)
 */
export async function saveToJSONFiles(): Promise<void> {
  const data = exportAllData();
  
  console.log('📦 Exported Data Summary:');
  console.log(`  Products: ${data.inventory.products.length}`);
  console.log(`  Categories: ${data.inventory.categories.length}`);
  console.log(`  Stores: ${data.inventory.stores.length}`);
  console.log(`  Units: ${data.inventory.units.length}`);
  console.log(`  Recipients: ${data.recipients.length}`);
  console.log(`  Locations: ${data.locations.locations.length}`);
  console.log(`  Pickup Locations: ${data.locations.pickupLocations.length}`);
  console.log(`  Roles: ${data.roles.roles.length}`);
  console.log(`  Users: ${data.roles.users.length}`);
  
  // Download the file
  downloadExportData();
  
  console.log('✅ Data exported successfully!');
  console.log('💡 When migrating to MongoDB, use this file with the seed script.');
}

/**
 * Import data from JSON (restore from backup)
 */
export function importData(jsonData: ExportData): void {
  try {
    // Validate data structure
    if (!jsonData.inventory || !jsonData.recipients || !jsonData.locations) {
      throw new Error('Invalid data format');
    }

    // Import inventory data
    if (jsonData.inventory.products.length > 0) {
      localStorage.setItem(
        'inventoryProducts',
        JSON.stringify(jsonData.inventory.products)
      );
    }
    if (jsonData.inventory.categories.length > 0) {
      localStorage.setItem(
        'inventoryCategories',
        JSON.stringify(jsonData.inventory.categories)
      );
    }
    if (jsonData.inventory.stores.length > 0) {
      localStorage.setItem(
        'inventoryStores',
        JSON.stringify(jsonData.inventory.stores)
      );
    }
    if (jsonData.inventory.units.length > 0) {
      localStorage.setItem(
        'inventoryUnits',
        JSON.stringify(jsonData.inventory.units)
      );
    }

    // Import recipients
    if (jsonData.recipients.length > 0) {
      localStorage.setItem('recipients', JSON.stringify(jsonData.recipients));
    }

    // Import locations
    if (jsonData.locations.locations.length > 0) {
      localStorage.setItem(
        'locations',
        JSON.stringify(jsonData.locations.locations)
      );
    }
    if (jsonData.locations.pickupLocations.length > 0) {
      localStorage.setItem(
        'pickupLocations',
        JSON.stringify(jsonData.locations.pickupLocations)
      );
    }

    // Import roles and users
    if (jsonData.roles.roles.length > 0) {
      localStorage.setItem('roles', JSON.stringify(jsonData.roles.roles));
    }
    if (jsonData.roles.users.length > 0) {
      localStorage.setItem('users', JSON.stringify(jsonData.roles.users));
    }

    // Import menus, events, RSVP settings
    if (Object.keys(jsonData.menus).length > 0) {
      localStorage.setItem('menuState', JSON.stringify(jsonData.menus));
    }
    if (jsonData.events && jsonData.events.length > 0) {
      localStorage.setItem('events', JSON.stringify(jsonData.events));
    }
    if (Object.keys(jsonData.rsvpSettings).length > 0) {
      localStorage.setItem('rsvpSettings', JSON.stringify(jsonData.rsvpSettings));
    }

    console.log('✅ Data imported successfully!');
    console.log('🔄 Refresh the page to see imported data.');
  } catch (error) {
    console.error('❌ Error importing data:', error);
    throw error;
  }
}

/**
 * Clear all data (use with caution!)
 */
export function clearAllData(): void {
  const keys = [
    'inventoryProducts',
    'inventoryCategories',
    'inventoryStores',
    'inventoryUnits',
    'recipients',
    'locations',
    'pickupLocations',
    'roles',
    'users',
    'menuState',
    'events',
    'rsvpSettings',
  ];

  const confirmed = confirm(
    '⚠️ WARNING: This will delete ALL data from localStorage.\n\n' +
      'Make sure you have exported your data first!\n\n' +
      'Continue?'
  );

  if (confirmed) {
    keys.forEach((key) => localStorage.removeItem(key));
    console.log('🗑️ All data cleared.');
    console.log('🔄 Refresh the page to reload seed data.');
  }
}

/**
 * Safe JSON parsing with fallback
 */
function safeParseJSON<T>(data: string | null, fallback: T): T {
  if (!data) return fallback;
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

/**
 * Generate MongoDB seed script from current data
 */
export function generateMongoDBSeedScript(): string {
  const data = exportAllData();
  
  return `// MongoDB Seed Script - Generated ${new Date().toISOString()}
// Run this script to populate your MongoDB database

import { connectToDatabase } from '@/lib/mongodb';

async function seedDatabase() {
  const { db } = await connectToDatabase();
  
  console.log('🌱 Starting database seed...');
  
  try {
    // 1. Seed Categories
    if (${data.inventory.categories.length} > 0) {
      await db.collection('Categories').insertMany(${JSON.stringify(data.inventory.categories, null, 2)});
      console.log('✅ Seeded ${data.inventory.categories.length} categories');
    }
    
    // 2. Seed Stores
    if (${data.inventory.stores.length} > 0) {
      await db.collection('Stores').insertMany(${JSON.stringify(data.inventory.stores, null, 2)});
      console.log('✅ Seeded ${data.inventory.stores.length} stores');
    }
    
    // 3. Seed Units
    if (${data.inventory.units.length} > 0) {
      await db.collection('Units').insertMany(${JSON.stringify(data.inventory.units, null, 2)});
      console.log('✅ Seeded ${data.inventory.units.length} units');
    }
    
    // 4. Seed Products
    if (${data.inventory.products.length} > 0) {
      await db.collection('Products').insertMany(${JSON.stringify(data.inventory.products, null, 2)});
      console.log('✅ Seeded ${data.inventory.products.length} products');
    }
    
    // 5. Seed Location Settings
    const locations = [
      ...${JSON.stringify(data.locations.locations, null, 2)},
      ...${JSON.stringify(data.locations.pickupLocations, null, 2)}
    ];
    if (locations.length > 0) {
      await db.collection('LocationSettings').insertMany(locations);
      console.log('✅ Seeded ' + locations.length + ' locations');
    }
    
    // 6. Seed Thali Recipients
    if (${data.recipients.length} > 0) {
      await db.collection('ThaliRecipients').insertMany(${JSON.stringify(data.recipients, null, 2)});
      console.log('✅ Seeded ${data.recipients.length} recipients');
    }
    
    // 7. Seed Roles
    if (${data.roles.roles.length} > 0) {
      await db.collection('Roles').insertMany(${JSON.stringify(data.roles.roles, null, 2)});
      console.log('✅ Seeded ${data.roles.roles.length} roles');
    }
    
    console.log('🎉 Database seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;
}

/**
 * Download MongoDB seed script
 */
export function downloadSeedScript(): void {
  const script = generateMongoDBSeedScript();
  const blob = new Blob([script], { type: 'text/typescript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `seed-database-${Date.now()}.ts`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('✅ MongoDB seed script downloaded!');
  console.log('📁 Save it to: scripts/seed-database.ts');
  console.log('🚀 Run with: npx tsx scripts/seed-database.ts');
}

// Export utility functions for browser console
if (typeof window !== 'undefined') {
  (window as any).communityKitchen = {
    exportData: saveToJSONFiles,
    importData,
    clearData: clearAllData,
    downloadSeedScript,
  };
  
  console.log('🔧 Community Kitchen Data Utilities loaded!');
  console.log('Available commands:');
  console.log('  communityKitchen.exportData()         - Export all data to JSON');
  console.log('  communityKitchen.downloadSeedScript() - Generate MongoDB seed script');
  console.log('  communityKitchen.clearData()          - Clear all localStorage data');
}

