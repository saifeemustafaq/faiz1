# Centralized Data Storage & Migration System

## 📦 **Overview**

You now have a **centralized JSON data store** that serves as the single source of truth for your application data. This makes MongoDB migration seamless and provides easy backup/restore capabilities.

---

## 📁 **Directory Structure**

```
/Users/mustafa/Desktop/tryapp/faiz1/
├── data/                          # ⭐ NEW: Centralized JSON storage
│   ├── categories.json            # 10 pre-populated categories
│   ├── stores.json                # 7 pre-populated stores
│   ├── units.json                 # 13 measurement units
│   ├── products.json              # User products (initially empty)
│   ├── locations.json             # Locations & pickup locations
│   ├── recipients.json            # Thali recipients (initially empty)
│   ├── roles.json                 # 3 default roles
│   └── README.md                  # Documentation
│
├── lib/
│   └── dataSync.ts                # ⭐ NEW: Export/Import utilities
│
├── app/add-new-items/
│   ├── services/
│   │   └── inventoryService.ts    # ✅ UPDATED: Loads from data/
│   └── hooks/
│       └── useInventoryData.ts    # Uses service layer
│
└── unitdata.json                  # ⚠️ DEPRECATED (use data/units.json)
```

---

## 🎯 **How It Works**

### **1. Current Architecture (localStorage)**

```
┌─────────────────────────────────────────────────────┐
│  Application Start                                   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Check localStorage for existing data                │
└────────────────┬────────────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
         ▼               ▼
   [Data Exists]    [No Data]
         │               │
         │               ▼
         │     ┌─────────────────────┐
         │     │  Fetch from JSON:   │
         │     │  • data/units.json  │
         │     │  • data/categories  │
         │     │  • data/stores      │
         │     │  • data/locations   │
         │     │  • data/roles       │
         │     └──────────┬──────────┘
         │                │
         │                ▼
         │     ┌─────────────────────┐
         │     │  Save to localStorage│
         │     └──────────┬──────────┘
         │                │
         └────────────┬───┘
                      │
                      ▼
         ┌─────────────────────────┐
         │  Application ready       │
         │  Data loaded in memory   │
         └─────────────────────────┘
```

### **2. Data Flow**

```
User Action (Add/Edit/Delete)
         │
         ▼
   Update React State
         │
         ▼
   Save to localStorage
         │
         ▼
   [Ready for Export]
```

---

## 🚀 **Using the Data Export System**

### **Method 1: Browser Console (Easiest)**

1. Open your app in the browser
2. Open Developer Console (F12)
3. Run these commands:

```javascript
// Export all data as JSON file
communityKitchen.exportData()

// Generate MongoDB seed script
communityKitchen.downloadSeedScript()

// Clear all data (with confirmation)
communityKitchen.clearData()
```

### **Method 2: Programmatic Export**

```typescript
import { 
  exportAllData, 
  saveToJSONFiles, 
  downloadSeedScript 
} from '@/lib/dataSync';

// Get data object
const data = exportAllData();
console.log(data);

// Download as file
saveToJSONFiles();

// Generate MongoDB seed script
downloadSeedScript();
```

---

## 📊 **Exported Data Structure**

```typescript
{
  "exportDate": "2025-11-24T10:30:00.000Z",
  "version": "1.0.0",
  "inventory": {
    "products": [...],      // User-created products
    "categories": [...],    // Product categories
    "stores": [...],        // Store/vendor list
    "units": [...]          // Measurement units
  },
  "recipients": [...],      // Thali recipients
  "locations": {
    "locations": [...],
    "pickupLocations": [...]
  },
  "roles": {
    "roles": [...],
    "users": [...]
  },
  "menus": {...},          // Weekly menu data
  "events": [...],         // Events
  "rsvpSettings": {...}    // RSVP availability
}
```

---

## 🔄 **MongoDB Migration Process**

### **Step 1: Export Current Data**

```javascript
// In browser console
communityKitchen.exportData()
// Downloads: community-kitchen-export-[timestamp].json
```

### **Step 2: Generate Seed Script**

```javascript
// In browser console
communityKitchen.downloadSeedScript()
// Downloads: seed-database-[timestamp].ts
```

### **Step 3: Set Up MongoDB Atlas**

1. Create MongoDB Atlas account
2. Create cluster
3. Get connection string
4. Add to `.env.local`:

```bash
MONGODB_URI=mongodb+srv://...
```

### **Step 4: Run Seed Script**

```bash
# Save seed script to scripts/
mv seed-database-*.ts scripts/seed-database.ts

# Install dependencies
npm install mongodb

# Run seed
npx tsx scripts/seed-database.ts
```

### **Step 5: Update Service Layer**

The service layer is already prepared! Just uncomment the MongoDB API calls:

**Before:**
```typescript
async getAll(): Promise<Product[]> {
  // TODO: Replace with MongoDB API call
  // return await fetch('/api/products').then(res => res.json());
  
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
}
```

**After:**
```typescript
async getAll(): Promise<Product[]> {
  return await fetch('/api/products').then(res => res.json());
}
```

---

## 💾 **Backup & Restore**

### **Backup (Export)**

```javascript
// Browser console
communityKitchen.exportData()
```

This creates a timestamped JSON file with ALL your data. Store it safely!

### **Restore (Import)**

```javascript
// Load backup file
const backupData = /* your JSON data */;

// Import to localStorage
communityKitchen.importData(backupData);

// Refresh page
location.reload();
```

---

## 📋 **Pre-Populated Seed Data**

### **Categories** (10 items)
- Grains & Cereals
- Dairy Products
- Vegetables
- Fruits
- Meat & Poultry
- Spices & Seasonings
- Beverages
- Dry Goods
- Frozen Items
- Canned Goods

### **Stores** (7 items)
- Costco
- Walmart
- Sam's Club
- Local Market
- Wholesale Supplier
- Trader Joe's
- Restaurant Depot

### **Units** (13 items)
- Pounds (lbs)
- Packets (pkt)
- Bunches (bunch)
- Cases (case)
- Gallons (gal)
- Ounces (oz)
- Grams (g)
- Bottles (btl)
- Cans (can)
- Pieces (pc)
- Boxes (box)
- Count (ct)
- Kilograms (kg)

### **Locations**
- Masjid (default, cannot be deleted)

### **Roles** (3 default)
- Administrator (full access)
- Manager (manage menus, events, recipients)
- Volunteer (view menus, manage carts)

---

## 🔧 **Developer Workflow**

### **During Development**

1. Add data through the UI
2. Periodically export data:
   ```javascript
   communityKitchen.exportData()
   ```
3. Commit seed data files to Git:
   ```bash
   git add data/
   git commit -m "Update seed data"
   ```

### **Before Migration**

1. Export all data
2. Generate seed script
3. Test import on development MongoDB
4. Verify data integrity
5. Update API routes
6. Switch to production MongoDB

---

## ⚠️ **Important Notes**

### **✅ Safe to Commit**
- `data/categories.json`
- `data/stores.json`
- `data/units.json`
- `data/locations.json`
- `data/roles.json`

### **❌ DO NOT Commit (Contains User Data)**
- `data/products.json` (after users add products)
- `data/recipients.json` (contains personal info)
- Exported backup files (`community-kitchen-export-*.json`)

### **Add to `.gitignore`:**
```
# User-generated data exports
community-kitchen-export-*.json
seed-database-*.ts

# User data (if populated)
data/products.json
data/recipients.json
```

---

## 🎯 **Migration Checklist**

### **Pre-Migration** ✅
- [x] Centralized JSON storage created
- [x] Seed data populated
- [x] Service layer abstracted
- [x] Export utility created
- [x] MongoDB schema documented

### **Ready to Migrate** 🚀
- [ ] Export current data
- [ ] Set up MongoDB Atlas
- [ ] Create API routes
- [ ] Run seed script
- [ ] Test all CRUD operations
- [ ] Switch service layer to API
- [ ] Deploy to production

---

## 📚 **Quick Reference**

### **Browser Console Commands**
```javascript
// Export everything
communityKitchen.exportData()

// Generate seed script  
communityKitchen.downloadSeedScript()

// Clear all data (careful!)
communityKitchen.clearData()
```

### **File Locations**
- **Seed Data**: `/data/*.json`
- **Export Utility**: `/lib/dataSync.ts`
- **Service Layer**: `/app/add-new-items/services/inventoryService.ts`
- **MongoDB Schema**: `/MongoDB Schemas/MongoDB database schema.md`

### **localStorage Keys**
```
inventoryProducts       → Products
inventoryCategories     → Categories  
inventoryStores         → Stores
inventoryUnits          → Units
recipients              → Thali Recipients
locations               → Locations
pickupLocations         → Pickup Locations
roles                   → User Roles
users                   → System Users
menuState               → Weekly Menus
events                  → Events
rsvpSettings            → RSVP Settings
```

---

## ✅ **Summary**

**You now have:**
1. ✅ Centralized JSON data files (`/data/`)
2. ✅ Pre-populated seed data (categories, stores, units, roles, locations)
3. ✅ Export/import utilities (`lib/dataSync.ts`)
4. ✅ Browser console commands
5. ✅ MongoDB seed script generator
6. ✅ Clear migration path

**When you're ready to migrate to MongoDB:**
1. Run `communityKitchen.exportData()` in console
2. Run `communityKitchen.downloadSeedScript()` in console
3. Set up MongoDB Atlas
4. Run the seed script
5. Update service layer API calls
6. Deploy! 🚀

**Migration Time: ~4 hours (setup + testing)**

The hard work is done! Your data is organized, exportable, and ready for MongoDB migration. 🎉

