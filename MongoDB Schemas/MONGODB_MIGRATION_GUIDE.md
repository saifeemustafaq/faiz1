# MongoDB Migration Guide
## Community Kitchen Management System

This guide explains how to migrate from the current localStorage-based system to MongoDB Atlas.

---

## 📊 **Current Architecture**

### **Data Storage (Temporary)**
```
Frontend (React) → localStorage → Browser Storage
```

**Current Storage Keys:**
- `inventoryProducts` - Product catalog
- `inventoryCategories` - Product categories
- `inventoryStores` - Store/vendor list
- `inventoryUnits` - Measurement units
- `recipients` - Thali recipients
- `locations` - Location settings
- `pickupLocations` - Pickup location settings
- `menuState` - Weekly menu data
- `rsvpSettings` - RSVP availability settings
- `roles` - User roles and permissions

---

## 🎯 **Target Architecture (MongoDB)**

### **Production Architecture**
```
Frontend (React) → API Routes (Next.js) → MongoDB Atlas → Cloud Storage
```

**Benefits:**
- ✅ **Persistent Data**: Survives browser cache clears
- ✅ **Multi-User**: Shared data across all users
- ✅ **Scalable**: Handles thousands of records
- ✅ **Backup**: Automatic backups and point-in-time recovery
- ✅ **Security**: Proper authentication and authorization
- ✅ **Performance**: Indexed queries, aggregations, caching

---

## 🚀 **Migration Strategy**

### **Phase 1: Service Layer (✅ COMPLETE)**

We've already created a **service layer abstraction** that makes migration seamless:

```typescript
// Current: Uses localStorage
await ProductService.getAll()

// Future: Will use MongoDB API
await fetch('/api/products').then(res => res.json())
```

**Files Created:**
- `app/add-new-items/services/inventoryService.ts` - Service layer with TODO markers
- `app/add-new-items/hooks/useInventoryData.ts` - Data hook using service layer

**Key Benefit:** All business logic is centralized. We only need to update the service layer, not the UI components.

---

### **Phase 2: MongoDB Setup**

#### **Step 1: Create MongoDB Atlas Account**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free tier (M0 - Free Forever)
3. Create a new cluster (choose region closest to users)
4. Wait for cluster provisioning (~5-10 minutes)

#### **Step 2: Configure Database Access**
1. Database Access → Add New Database User
   - Username: `community-kitchen-app`
   - Password: Generate secure password
   - Database User Privileges: `Read and write to any database`
2. Save credentials securely

#### **Step 3: Configure Network Access**
1. Network Access → Add IP Address
   - For development: `0.0.0.0/0` (Allow from anywhere)
   - For production: Add specific IP addresses or use VPC peering
2. Confirm

#### **Step 4: Get Connection String**
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Driver: Node.js, Version: 5.5 or later
4. Copy connection string:
   ```
   mongodb+srv://community-kitchen-app:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=CommunityKitchen
   ```
5. Replace `<password>` with actual password
6. Add database name: `/community-kitchen` before the `?`

---

### **Phase 3: Next.js API Routes**

Create API routes to handle database operations:

```
app/api/
├── products/
│   ├── route.ts              # GET /api/products, POST /api/products
│   └── [id]/
│       └── route.ts          # GET, PUT, DELETE /api/products/:id
├── categories/
│   ├── route.ts
│   └── [id]/route.ts
├── stores/
│   ├── route.ts
│   └── [id]/route.ts
├── units/
│   ├── route.ts
│   └── [id]/route.ts
├── recipients/
│   ├── route.ts
│   └── [id]/route.ts
└── locations/
    ├── route.ts
    └── [id]/route.ts
```

**Example API Route** (`app/api/products/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const products = await db
      .collection('Products')
      .find({ deletedAt: null })
      .sort({ name: 1 })
      .toArray();
    
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { db } = await connectToDatabase();
    
    const newProduct = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };
    
    const result = await db.collection('Products').insertOne(newProduct);
    
    return NextResponse.json({ 
      ...newProduct, 
      _id: result.insertedId 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
```

---

### **Phase 4: MongoDB Connection Library**

Create a reusable MongoDB connection utility:

**File:** `lib/mongodb.ts`
```typescript
import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add MONGODB_URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve connection across hot reloads
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDatabase(): Promise<{ 
  client: MongoClient; 
  db: Db 
}> {
  const client = await clientPromise;
  const db = client.db('community-kitchen');
  return { client, db };
}
```

---

### **Phase 5: Update Service Layer**

Update each service to use API routes instead of localStorage:

**Before (localStorage):**
```typescript
async getAll(): Promise<Product[]> {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
}
```

**After (MongoDB API):**
```typescript
async getAll(): Promise<Product[]> {
  const response = await fetch('/api/products');
  if (!response.ok) throw new Error('Failed to fetch products');
  return await response.json();
}
```

---

### **Phase 6: Environment Variables**

**File:** `.env.local`
```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://community-kitchen-app:<password>@cluster0.xxxxx.mongodb.net/community-kitchen?retryWrites=true&w=majority&appName=CommunityKitchen
MONGODB_DB_NAME=community-kitchen
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=2

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**File:** `.env.production`
```bash
MONGODB_URI=<production-connection-string>
MONGODB_DB_NAME=community-kitchen
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

---

### **Phase 7: Data Seeding**

Create a seed script to populate initial data:

**File:** `scripts/seed-database.ts`
```typescript
import { connectToDatabase } from '@/lib/mongodb';
import unitData from '@/unitdata.json';

async function seedDatabase() {
  const { db } = await connectToDatabase();
  
  console.log('🌱 Seeding database...');
  
  // 1. Seed Units
  const units = unitData.units
    .filter(u => u.isActive)
    .map(u => ({
      name: u.name,
      abbreviation: u.shortName,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    }));
  
  await db.collection('Units').insertMany(units);
  console.log(`✅ Seeded ${units.length} units`);
  
  // 2. Seed default categories
  const categories = [
    'Grains & Cereals',
    'Dairy Products',
    'Vegetables',
    'Fruits',
    'Meat & Poultry',
    'Spices & Seasonings',
    'Beverages',
    'Dry Goods',
    'Frozen Items'
  ].map(name => ({
    name,
    productCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  }));
  
  await db.collection('Categories').insertMany(categories);
  console.log(`✅ Seeded ${categories.length} categories`);
  
  // 3. Seed default stores
  const stores = [
    'Costco',
    'Walmart',
    'Sam\'s Club',
    'Local Market',
    'Wholesale Supplier'
  ].map(name => ({
    name,
    productCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  }));
  
  await db.collection('Stores').insertMany(stores);
  console.log(`✅ Seeded ${stores.length} stores`);
  
  // 4. Seed default locations
  const locations = [
    { name: 'Masjid', type: 'location' },
    { name: 'Masjid', type: 'pickup' }
  ].map(loc => ({
    ...loc,
    displayOrder: 0,
    recipientCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  }));
  
  await db.collection('LocationSettings').insertMany(locations);
  console.log(`✅ Seeded ${locations.length} locations`);
  
  console.log('🎉 Database seeding complete!');
}

seedDatabase().catch(console.error);
```

**Run seed script:**
```bash
npx tsx scripts/seed-database.ts
```

---

### **Phase 8: Data Migration**

Migrate existing localStorage data to MongoDB:

**File:** `scripts/migrate-localstorage.ts`
```typescript
// This script helps migrate data from localStorage to MongoDB
// Run this in the browser console to export data

function exportLocalStorageData() {
  const data = {
    products: JSON.parse(localStorage.getItem('inventoryProducts') || '[]'),
    categories: JSON.parse(localStorage.getItem('inventoryCategories') || '[]'),
    stores: JSON.parse(localStorage.getItem('inventoryStores') || '[]'),
    units: JSON.parse(localStorage.getItem('inventoryUnits') || '[]'),
    recipients: JSON.parse(localStorage.getItem('recipients') || '[]'),
    locations: JSON.parse(localStorage.getItem('locations') || '[]'),
    pickupLocations: JSON.parse(localStorage.getItem('pickupLocations') || '[]'),
    menuState: JSON.parse(localStorage.getItem('menuState') || '{}'),
    rsvpSettings: JSON.parse(localStorage.getItem('rsvpSettings') || '{}'),
  };
  
  console.log('Exported data:', data);
  
  // Download as JSON file
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `localstorage-export-${Date.now()}.json`;
  a.click();
}

exportLocalStorageData();
```

Then create an import API endpoint to upload this data to MongoDB.

---

## 📦 **Package Dependencies**

Add MongoDB driver to your project:

```bash
npm install mongodb
# or
yarn add mongodb
```

**Update `package.json`:**
```json
{
  "dependencies": {
    "mongodb": "^6.3.0"
  },
  "scripts": {
    "seed": "tsx scripts/seed-database.ts",
    "migrate": "tsx scripts/migrate-localstorage.ts"
  }
}
```

---

## ✅ **Migration Checklist**

### **Pre-Migration**
- [ ] Review MongoDB schema document
- [ ] Set up MongoDB Atlas account
- [ ] Create database cluster
- [ ] Configure database user and network access
- [ ] Get connection string
- [ ] Add environment variables

### **Development**
- [ ] Install MongoDB driver (`npm install mongodb`)
- [ ] Create `lib/mongodb.ts` connection utility
- [ ] Create API routes for all collections
- [ ] Update service layer to use API routes
- [ ] Test all CRUD operations
- [ ] Create seed script
- [ ] Run seed script to populate initial data

### **Data Migration**
- [ ] Export data from localStorage (browser console)
- [ ] Create import API endpoint
- [ ] Import data to MongoDB
- [ ] Verify data integrity
- [ ] Test all features with MongoDB data

### **Testing**
- [ ] Test Products CRUD
- [ ] Test Categories CRUD
- [ ] Test Stores CRUD
- [ ] Test Units CRUD
- [ ] Test Thali Recipients CRUD
- [ ] Test Location Settings CRUD
- [ ] Test Menu Management
- [ ] Test RSVP Management
- [ ] Test Events Management
- [ ] Test Role Management

### **Production Deployment**
- [ ] Set up production MongoDB cluster
- [ ] Configure production environment variables
- [ ] Deploy to Vercel/hosting platform
- [ ] Run production seed script
- [ ] Migrate production data
- [ ] Monitor performance and errors
- [ ] Set up automated backups

---

## 🔒 **Security Best Practices**

1. **Never commit `.env.local` or `.env.production`** to Git
2. **Use strong passwords** for database users
3. **Restrict network access** to specific IPs in production
4. **Enable MongoDB Atlas encryption** at rest and in transit
5. **Implement API authentication** (JWT tokens, session-based)
6. **Validate all input** on API routes
7. **Use MongoDB schema validation** for data integrity
8. **Enable audit logs** in MongoDB Atlas
9. **Set up monitoring and alerts** for unusual activity
10. **Regular backups** and test restore procedures

---

## 📈 **Performance Optimization**

1. **Indexes**: All collections have strategic indexes (see schema doc)
2. **Connection Pooling**: Configured in `lib/mongodb.ts`
3. **Denormalization**: Category/store/unit names denormalized in products
4. **Aggregation Pipelines**: Use for complex queries
5. **Caching**: Implement Redis/Vercel KV for frequently accessed data
6. **Pagination**: Implement for large result sets
7. **Compression**: Enable MongoDB wire protocol compression

---

## 🆘 **Troubleshooting**

### **Connection Issues**
- Verify connection string is correct
- Check network access whitelist in MongoDB Atlas
- Ensure database user has correct permissions
- Check if cluster is running (not paused)

### **Performance Issues**
- Review slow query logs in MongoDB Atlas
- Check if indexes are being used (`explain()`)
- Monitor connection pool usage
- Consider upgrading cluster tier if needed

### **Data Issues**
- Verify schema validation rules
- Check soft delete filters (`deletedAt: null`)
- Review audit trail fields
- Use MongoDB Compass for visual debugging

---

## 📚 **Additional Resources**

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [MongoDB Best Practices](https://www.mongodb.com/docs/manual/administration/production-notes/)
- [MongoDB Schema Design Patterns](https://www.mongodb.com/blog/post/building-with-patterns-a-summary)

---

## 🎯 **Summary**

This migration is **already 50% complete** thanks to the service layer abstraction! 

**What's Done:**
- ✅ Service layer with clear separation of concerns
- ✅ MongoDB schema fully documented
- ✅ Type-safe interfaces
- ✅ Modular component structure

**What's Next:**
1. Set up MongoDB Atlas (15 minutes)
2. Create API routes (2-3 hours)
3. Update service layer (1 hour)
4. Test and migrate data (1-2 hours)

**Total Migration Time: ~1 day of focused work**

The architecture is **migration-ready** and follows industry best practices! 🚀

