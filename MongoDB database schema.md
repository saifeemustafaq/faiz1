# MongoDB Database Schema - Community Kitchen Management System

## Overview
This document defines the MongoDB database schema for the Community Kitchen Management System. The schema is designed following MongoDB best practices, considering scalability, query performance, and data integrity.

## Database Design Principles

### Core Principles Applied
1. **Embed for one-to-few relationships** (e.g., menu items in a day)
2. **Reference for one-to-many relationships** (e.g., user to events)
3. **Denormalize for read-heavy operations** (e.g., event creator name)
4. **Index strategically** based on query patterns
5. **Use timestamps** for audit trails
6. **Implement soft deletes** for data recovery
7. **Validate at schema level** using MongoDB validators

### Naming Conventions
- **Collections**: PascalCase, plural (e.g., `Users`, `Events`, `Menus`)
- **Fields**: camelCase (e.g., `firstName`, `createdAt`)
- **IDs**: Use MongoDB ObjectId, reference fields end with `Id` or `Ids`
- **Timestamps**: ISO 8601 format, stored as Date type

---

## Collections

### 1. Users Collection

**Purpose**: Store user accounts, authentication, and profile information

```javascript
{
  _id: ObjectId,
  
  // Basic Information
  email: String,              // Unique, indexed
  username: String,           // Unique, indexed
  passwordHash: String,       // Bcrypt hash
  
  // Profile
  firstName: String,
  lastName: String,
  displayName: String,        // Computed: firstName + lastName
  phone: String,              // Optional
  
  // Role & Permissions
  roleId: ObjectId,           // Reference to Roles collection
  roleName: String,           // Denormalized for quick access
  permissions: [String],      // Denormalized array of permission codes
  
  // Status
  status: String,             // 'active' | 'inactive' | 'suspended'
  emailVerified: Boolean,
  lastLoginAt: Date,
  
  // Preferences (embedded)
  preferences: {
    timezone: String,         // Default: 'America/Los_Angeles'
    notifications: {
      email: Boolean,
      sms: Boolean
    },
    language: String          // Default: 'en'
  },
  
  // Audit Fields
  createdAt: Date,            // Auto-set
  updatedAt: Date,            // Auto-update
  createdBy: ObjectId,        // Reference to Users
  updatedBy: ObjectId,        // Reference to Users
  deletedAt: Date,            // Soft delete (null if active)
  deletedBy: ObjectId         // Who soft-deleted this record
}
```

**Indexes**:
```javascript
db.Users.createIndex({ email: 1 }, { unique: true })
db.Users.createIndex({ username: 1 }, { unique: true })
db.Users.createIndex({ roleId: 1 })
db.Users.createIndex({ status: 1 })
db.Users.createIndex({ deletedAt: 1 })  // For filtering soft-deleted records
db.Users.createIndex({ createdAt: -1 })
```

**Validation Rules**:
- `email`: Required, valid email format, unique
- `username`: Required, min 3 chars, unique
- `status`: Required, enum ['active', 'inactive', 'suspended']
- `emailVerified`: Required, boolean

---

### 2. Roles Collection

**Purpose**: Define user roles and permissions

```javascript
{
  _id: ObjectId,
  
  // Role Information
  name: String,               // 'admin', 'manager', 'volunteer', 'member'
  displayName: String,        // 'Administrator', 'Kitchen Manager'
  description: String,
  
  // Permissions
  permissions: [
    {
      resource: String,       // 'menus', 'events', 'users', 'rsvps', 'carts'
      actions: [String]       // ['create', 'read', 'update', 'delete']
    }
  ],
  
  // Settings
  isSystem: Boolean,          // True for built-in roles (can't be deleted)
  priority: Number,           // Lower number = higher priority
  
  // Audit Fields
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId,
  deletedAt: Date,
  deletedBy: ObjectId
}
```

**Indexes**:
```javascript
db.Roles.createIndex({ name: 1 }, { unique: true })
db.Roles.createIndex({ priority: 1 })
db.Roles.createIndex({ deletedAt: 1 })
```

**Default Roles**:
```javascript
[
  { name: 'admin', displayName: 'Administrator', priority: 1 },
  { name: 'manager', displayName: 'Kitchen Manager', priority: 2 },
  { name: 'volunteer', displayName: 'Volunteer', priority: 3 },
  { name: 'member', displayName: 'Community Member', priority: 4 }
]
```

---

### 3. Menus Collection

**Purpose**: Store weekly menus with daily menu items

```javascript
{
  _id: ObjectId,
  
  // Week Identification
  weekStart: Date,            // Monday of the week (PST), indexed
  weekEnd: Date,              // Saturday of the week (PST)
  weekLabel: String,          // "Week of November 17, 2025"
  year: Number,               // 2025 (for filtering)
  weekNumber: Number,         // ISO week number (1-53)
  
  // Menu Days (embedded array - one-to-few relationship)
  days: [
    {
      date: Date,             // ISO date for the day (PST)
      dayOfWeek: Number,      // 1=Monday, 6=Saturday
      dayLabel: String,       // "Mon - Nov 17"
      
      // Either menu items OR event (not both)
      type: String,           // 'menu' | 'event'
      
      // Menu Items (if type === 'menu')
      menuItems: {
        item1: String,
        item2: String,
        item3: String
      },
      
      // Event Reference (if type === 'event')
      eventId: ObjectId,      // Reference to Events collection
      eventDetails: String,   // Denormalized for quick access
      eventTime: String       // Denormalized
    }
  ],
  
  // Status
  status: String,             // 'draft' | 'published' | 'archived'
  publishedAt: Date,
  
  // Audit Fields
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  createdByName: String,      // Denormalized
  updatedBy: ObjectId,
  updatedByName: String,      // Denormalized
  deletedAt: Date,
  deletedBy: ObjectId
}
```

**Indexes**:
```javascript
db.Menus.createIndex({ weekStart: 1 }, { unique: true })
db.Menus.createIndex({ year: 1, weekNumber: 1 })
db.Menus.createIndex({ status: 1 })
db.Menus.createIndex({ deletedAt: 1 })
db.Menus.createIndex({ "days.date": 1 })
db.Menus.createIndex({ "days.eventId": 1 })
```

**Query Patterns**:
```javascript
// Get current week menu
db.Menus.findOne({ 
  weekStart: { $lte: currentDate }, 
  weekEnd: { $gte: currentDate },
  deletedAt: null 
})

// Get menu by week
db.Menus.findOne({ 
  weekStart: ISODate("2025-11-17T08:00:00Z"),
  deletedAt: null 
})

// Get menus for a year
db.Menus.find({ 
  year: 2025, 
  status: 'published',
  deletedAt: null 
}).sort({ weekStart: 1 })
```

---

### 4. Events Collection

**Purpose**: Store community events with RSVP capability

```javascript
{
  _id: ObjectId,
  
  // Event Information (Required)
  details: String,            // Event description/name (REQUIRED)
  date: Date,                 // Event date (PST) - selected via date picker
  time: String,               // Optional: "6:00 PM", "2:00 PM - 4:00 PM"
  
  // Date Components (for querying and indexing)
  dateOnly: String,           // "2025-11-17" (YYYY-MM-DD format) - indexed
  year: Number,               // 2025
  month: Number,              // 0-11 (JavaScript months)
  day: Number,                // 1-31
  dayOfWeek: Number,          // 0-6 (Sunday=0, Saturday=6)
  
  // Extended Information (Future)
  fullDescription: String,    // Long-form description (optional)
  imageUrl: String,           // Event image URL (optional)
  tags: [String],             // Event tags/categories (optional)
  
  // RSVP Settings (Future - Customer Portal)
  rsvpEnabled: Boolean,       // Default: false
  rsvpDeadline: Date,         // Deadline for RSVPs (optional)
  requiresApproval: Boolean,  // Admin must approve RSVPs
  allowWaitlist: Boolean,     // Allow waitlist when full
  maxCapacity: Number,        // Maximum attendees (optional)
  
  // RSVP Counts (Denormalized for performance)
  rsvpCount: Number,          // Total confirmed RSVPs (default: 0)
  pendingRsvpCount: Number,   // Pending approval (default: 0)
  waitlistCount: Number,      // Waitlisted (default: 0)
  
  // Event Source
  source: String,             // 'manual' | 'menu_management'
  menuId: ObjectId,           // Reference to Menus (if created from menu)
  menuDate: Date,             // Menu day date (if applicable)
  
  // Status
  status: String,             // 'draft' | 'published' | 'cancelled' | 'completed'
  publishedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  
  // Audit Fields
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,        // Reference to Users
  createdByName: String,      // Denormalized
  updatedBy: ObjectId,
  updatedByName: String,
  deletedAt: Date,            // Soft delete
  deletedBy: ObjectId
}
```

**Indexes**:
```javascript
// Primary indexes
db.Events.createIndex({ dateOnly: 1 }, { unique: true })  // One event per day
db.Events.createIndex({ date: 1 })
db.Events.createIndex({ year: 1, month: 1 })
db.Events.createIndex({ status: 1 })
db.Events.createIndex({ source: 1 })
db.Events.createIndex({ menuId: 1 })
db.Events.createIndex({ deletedAt: 1 })
db.Events.createIndex({ createdAt: -1 })

// Compound indexes for common queries
db.Events.createIndex({ status: 1, date: 1, deletedAt: 1 })
db.Events.createIndex({ dateOnly: 1, deletedAt: 1 })
db.Events.createIndex({ date: 1, status: 1 })
```

**Validation Schema**:
```javascript
db.createCollection("Events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["details", "date", "dateOnly", "status"],
      properties: {
        details: {
          bsonType: "string",
          minLength: 1,
          description: "Event details/name is required"
        },
        date: {
          bsonType: "date",
          description: "Event date is required"
        },
        dateOnly: {
          bsonType: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "Date in YYYY-MM-DD format"
        },
        status: {
          enum: ["draft", "published", "cancelled", "completed"]
        },
        source: {
          enum: ["manual", "menu_management"]
        },
        rsvpCount: {
          bsonType: "int",
          minimum: 0
        }
      }
    }
  }
})
```

**Query Patterns**:
```javascript
// Get all upcoming events (sorted by date)
db.Events.find({ 
  date: { $gte: new Date() },
  status: 'published',
  deletedAt: null 
}).sort({ date: 1 })

// Get events for a specific month
db.Events.find({ 
  year: 2025,
  month: 10,  // November (0-indexed)
  status: 'published',
  deletedAt: null 
}).sort({ date: 1 })

// Check if event exists for a specific date
db.Events.findOne({ 
  dateOnly: "2025-11-17",
  deletedAt: null 
})

// Get events created from menu management
db.Events.find({
  source: 'menu_management',
  deletedAt: null
}).sort({ date: 1 })

// Update event
db.Events.updateOne(
  { dateOnly: "2025-11-17" },
  { 
    $set: { 
      details: "Updated details",
      time: "7:00 PM",
      updatedAt: new Date(),
      updatedBy: ObjectId("..."),
      updatedByName: "Admin Name"
    }
  }
)

// Delete event (soft delete)
db.Events.updateOne(
  { dateOnly: "2025-11-17" },
  {
    $set: {
      deletedAt: new Date(),
      deletedBy: ObjectId("...")
    }
  }
)
```

**Business Logic**:
1. **One Event Per Day**: Enforced by unique index on `dateOnly`
2. **Date Selection**: Admin selects date via date picker in modal
3. **PST Timezone**: All dates stored and queried in Pacific Time
4. **Bidirectional Sync**: Events created in either place appear in both
5. **Default Published**: New events default to 'published' status
6. **RSVP Integration**: Future customer portal uses these events

---

### 5. RSVPs Collection

**Purpose**: Track event RSVPs and attendance

```javascript
{
  _id: ObjectId,
  
  // References
  eventId: ObjectId,          // Reference to Events, indexed
  userId: ObjectId,           // Reference to Users, indexed
  
  // Denormalized Data (for performance)
  eventDetails: String,
  eventDate: Date,
  userName: String,
  userEmail: String,
  
  // RSVP Details
  status: String,             // 'pending' | 'confirmed' | 'declined' | 'waitlisted' | 'cancelled'
  partySize: Number,          // Number of people (including user)
  dietaryRestrictions: String, // Optional
  notes: String,              // User notes
  
  // Admin Actions
  approvedAt: Date,
  approvedBy: ObjectId,
  approvedByName: String,
  rejectionReason: String,
  
  // Attendance Tracking
  checkedIn: Boolean,
  checkedInAt: Date,
  checkedInBy: ObjectId,
  
  // Notifications
  reminderSent: Boolean,
  reminderSentAt: Date,
  
  // Audit Fields
  createdAt: Date,            // When RSVP was submitted
  updatedAt: Date,
  cancelledAt: Date,
  deletedAt: Date,
  deletedBy: ObjectId
}
```

**Indexes**:
```javascript
db.RSVPs.createIndex({ eventId: 1, userId: 1 }, { unique: true })
db.RSVPs.createIndex({ eventId: 1, status: 1 })
db.RSVPs.createIndex({ userId: 1, status: 1 })
db.RSVPs.createIndex({ eventDate: 1 })
db.RSVPs.createIndex({ deletedAt: 1 })
// Compound for common queries
db.RSVPs.createIndex({ eventId: 1, status: 1, deletedAt: 1 })
```

**Query Patterns**:
```javascript
// Get all RSVPs for an event
db.RSVPs.find({ 
  eventId: ObjectId("..."),
  status: { $in: ['confirmed', 'pending'] },
  deletedAt: null 
})

// Get user's RSVPs
db.RSVPs.find({ 
  userId: ObjectId("..."),
  eventDate: { $gte: new Date() },
  deletedAt: null 
}).sort({ eventDate: 1 })

// Count confirmed RSVPs
db.RSVPs.countDocuments({ 
  eventId: ObjectId("..."),
  status: 'confirmed',
  deletedAt: null 
})
```

---

### 6. Carts Collection

**Purpose**: Shopping carts for ordering/requesting items

```javascript
{
  _id: ObjectId,
  
  // Cart Ownership
  userId: ObjectId,           // Reference to Users, indexed
  userName: String,           // Denormalized
  userEmail: String,          // Denormalized
  
  // Cart Items (embedded - one-to-many within reason)
  items: [
    {
      itemId: ObjectId,       // Reference to InventoryItems (future)
      itemName: String,       // Denormalized
      itemCategory: String,   // Denormalized
      
      quantity: Number,
      unit: String,           // 'lbs', 'oz', 'each', 'dozen'
      
      // Pricing (if applicable)
      unitPrice: Number,
      totalPrice: Number,
      
      notes: String,
      addedAt: Date
    }
  ],
  
  // Cart Summary
  totalItems: Number,         // Count of items
  totalQuantity: Number,      // Sum of quantities
  totalPrice: Number,         // Total cost (if applicable)
  
  // Status
  status: String,             // 'active' | 'checked_out' | 'abandoned' | 'expired'
  lastActivityAt: Date,       // For abandonment tracking
  expiresAt: Date,            // Auto-cleanup old carts
  
  // Checkout
  checkedOutAt: Date,
  deliveryDate: Date,
  deliveryMethod: String,     // 'pickup' | 'delivery'
  notes: String,
  
  // Audit Fields
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
  deletedBy: ObjectId
}
```

**Indexes**:
```javascript
db.Carts.createIndex({ userId: 1, status: 1 })
db.Carts.createIndex({ status: 1 })
db.Carts.createIndex({ expiresAt: 1 })  // For cleanup jobs
db.Carts.createIndex({ lastActivityAt: 1 })
db.Carts.createIndex({ deletedAt: 1 })
db.Carts.createIndex({ checkedOutAt: -1 })
```

**Query Patterns**:
```javascript
// Get user's active cart
db.Carts.findOne({ 
  userId: ObjectId("..."),
  status: 'active',
  deletedAt: null 
})

// Get abandoned carts (for recovery)
db.Carts.find({ 
  status: 'active',
  lastActivityAt: { $lt: new Date(Date.now() - 24*60*60*1000) },
  deletedAt: null 
})

// Get checkout history
db.Carts.find({ 
  userId: ObjectId("..."),
  status: 'checked_out',
  deletedAt: null 
}).sort({ checkedOutAt: -1 })
```

---

### 7. InventoryItems Collection

**Purpose**: Catalog of available items for menus and ordering (future expansion)

```javascript
{
  _id: ObjectId,
  
  // Item Information
  name: String,               // Indexed
  slug: String,               // URL-friendly, unique, indexed
  description: String,
  category: String,           // 'produce', 'dairy', 'meat', 'dry-goods', etc.
  subcategory: String,
  
  // Images
  imageUrl: String,
  thumbnailUrl: String,
  images: [String],           // Multiple images
  
  // Inventory
  sku: String,                // Stock keeping unit
  inStock: Boolean,
  stockLevel: String,         // 'in-stock', 'low', 'out'
  quantityAvailable: Number,
  unit: String,               // 'lbs', 'oz', 'each', 'dozen'
  
  // Pricing (if applicable)
  price: Number,
  priceUnit: String,
  
  // Metadata
  tags: [String],             // ['organic', 'local', 'gluten-free']
  allergens: [String],        // ['nuts', 'dairy', 'gluten']
  seasonal: Boolean,
  seasonMonths: [Number],     // [6, 7, 8] for June, July, August
  
  // Status
  status: String,             // 'active' | 'discontinued' | 'seasonal'
  featured: Boolean,
  
  // Audit Fields
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  createdByName: String,
  updatedBy: ObjectId,
  deletedAt: Date,
  deletedBy: ObjectId
}
```

**Indexes**:
```javascript
db.InventoryItems.createIndex({ name: 1 })
db.InventoryItems.createIndex({ slug: 1 }, { unique: true })
db.InventoryItems.createIndex({ category: 1 })
db.InventoryItems.createIndex({ status: 1, inStock: 1 })
db.InventoryItems.createIndex({ tags: 1 })
db.InventoryItems.createIndex({ deletedAt: 1 })
// Text index for search
db.InventoryItems.createIndex({ 
  name: "text", 
  description: "text", 
  tags: "text" 
})
```

---

### 8. RSVPSettings Collection

**Purpose**: Admin configuration for RSVP access control (which dates users can RSVP)

```javascript
{
  _id: ObjectId,
  
  // Date Information
  date: Date,                 // The date this setting applies to (PST)
  dateOnly: String,           // "2025-11-17" (YYYY-MM-DD) - UNIQUE indexed
  year: Number,               // 2025
  month: Number,              // 0-11 (JavaScript months)
  day: Number,                // 1-31
  dayOfWeek: Number,          // 0-6 (Sunday=0, Saturday=6)
  monthAbbr: String,          // "Nov", "Dec" (for display)
  
  // RSVP Access Control
  enabled: Boolean,           // Default: false (RSVP DISABLED by default)
  
  // Admin Notes (Optional)
  notes: String,              // Admin notes about this date
  reason: String,             // Why enabled/disabled (e.g., "Special event", "Holiday")
  
  // Capacity Management (Optional - Future)
  maxCapacity: Number,        // Maximum RSVPs allowed for this date
  currentRsvpCount: Number,   // Denormalized from RSVPs collection
  capacityWarningThreshold: Number,  // Alert when this % reached
  
  // Change Tracking
  enabledAt: Date,            // Timestamp when enabled
  disabledAt: Date,           // Timestamp when disabled
  lastToggledBy: ObjectId,    // Reference to Users (who made last change)
  lastToggledByName: String,  // Denormalized user name
  toggleHistory: [            // History of changes (optional)
    {
      action: String,         // 'enabled' | 'disabled'
      timestamp: Date,
      userId: ObjectId,
      userName: String
    }
  ],
  
  // Bulk Operation Tracking
  bulkOperationId: String,    // Track if part of week/month enable
  bulkOperationType: String,  // 'week' | 'month' | 'individual'
  
  // Audit Fields
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  createdByName: String,
  updatedBy: ObjectId,
  updatedByName: String,
  deletedAt: Date,            // Soft delete (null if active)
  deletedBy: ObjectId
}
```

**Indexes**:
```javascript
// Primary indexes
db.RSVPSettings.createIndex({ dateOnly: 1 }, { unique: true })  // One setting per date
db.RSVPSettings.createIndex({ date: 1 })
db.RSVPSettings.createIndex({ enabled: 1, date: 1 })  // Customer portal queries
db.RSVPSettings.createIndex({ year: 1, month: 1 })    // Monthly views
db.RSVPSettings.createIndex({ dayOfWeek: 1 })         // Sunday filtering
db.RSVPSettings.createIndex({ deletedAt: 1 })

// Compound indexes for common queries
db.RSVPSettings.createIndex({ enabled: 1, date: 1, deletedAt: 1 })
db.RSVPSettings.createIndex({ year: 1, month: 1, deletedAt: 1 })
db.RSVPSettings.createIndex({ dateOnly: 1, enabled: 1 })
```

**Validation Schema**:
```javascript
db.createCollection("RSVPSettings", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["date", "dateOnly", "enabled"],
      properties: {
        dateOnly: {
          bsonType: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "Date must be in YYYY-MM-DD format"
        },
        enabled: {
          bsonType: "bool",
          description: "RSVP enabled flag is required"
        },
        dayOfWeek: {
          bsonType: "int",
          minimum: 0,
          maximum: 6,
          description: "Day of week must be 0-6"
        },
        maxCapacity: {
          bsonType: "int",
          minimum: 0
        },
        currentRsvpCount: {
          bsonType: "int",
          minimum: 0
        }
      }
    }
  }
})
```

**Query Patterns**:
```javascript
// Get enabled dates for next 30 days (Customer Portal)
db.RSVPSettings.find({ 
  enabled: true,
  date: { 
    $gte: new Date(), 
    $lte: new Date(Date.now() + 30*24*60*60*1000) 
  },
  dayOfWeek: { $ne: 0 },  // Exclude Sundays (no service)
  deletedAt: null 
}).sort({ date: 1 })

// Check if specific date is enabled
db.RSVPSettings.findOne({ 
  dateOnly: "2025-11-17",
  enabled: true,
  deletedAt: null 
})

// Get all settings for a month (Admin Calendar View)
db.RSVPSettings.find({ 
  year: 2025,
  month: 10,  // November (0-indexed)
  deletedAt: null 
}).sort({ day: 1 })

// Get all enabled dates (Admin Summary)
db.RSVPSettings.find({
  enabled: true,
  deletedAt: null
}).sort({ date: 1 })

// Toggle individual day
db.RSVPSettings.updateOne(
  { dateOnly: "2025-11-17" },
  { 
    $set: { 
      enabled: true,
      enabledAt: new Date(),
      lastToggledBy: ObjectId("..."),
      lastToggledByName: "Admin Name",
      updatedAt: new Date()
    }
  },
  { upsert: true }  // Create if doesn't exist
)

// Bulk enable week (Monday through Saturday)
db.RSVPSettings.bulkWrite([
  {
    updateOne: {
      filter: { dateOnly: "2025-11-17" },
      update: { 
        $set: { 
          enabled: true, 
          enabledAt: new Date(),
          lastToggledBy: ObjectId("..."),
          bulkOperationType: 'week',
          updatedAt: new Date()
        },
        $setOnInsert: {
          date: ISODate("2025-11-17"),
          dateOnly: "2025-11-17",
          year: 2025,
          month: 10,
          day: 17,
          dayOfWeek: 1,
          monthAbbr: "Nov"
        }
      },
      upsert: true
    }
  },
  // ... repeat for all 7 days in week
])

// Bulk enable month
db.RSVPSettings.updateMany(
  { year: 2025, month: 10 },  // November
  { 
    $set: { 
      enabled: true,
      enabledAt: new Date(),
      lastToggledBy: ObjectId("..."),
      lastToggledByName: "Admin Name",
      bulkOperationType: 'month',
      updatedAt: new Date()
    }
  }
)

// Create settings for entire month (if not exist)
// This would be done via application logic to create all dates
const dates = generateMonthDates(2025, 10); // November
const operations = dates.map(date => ({
  updateOne: {
    filter: { dateOnly: date.dateOnly },
    update: {
      $setOnInsert: {
        date: date.date,
        dateOnly: date.dateOnly,
        year: date.year,
        month: date.month,
        day: date.day,
        dayOfWeek: date.dayOfWeek,
        monthAbbr: date.monthAbbr,
        enabled: false,  // Default disabled
        createdAt: new Date()
      }
    },
    upsert: true
  }
}));
db.RSVPSettings.bulkWrite(operations);

// Disable all Sundays (no service)
db.RSVPSettings.updateMany(
  { dayOfWeek: 0 },  // Sunday
  { 
    $set: { 
      enabled: false,
      disabledAt: new Date(),
      reason: "No service on Sundays",
      updatedAt: new Date()
    }
  }
)
```

**Business Rules**:
1. **Default State**: ALL dates are DISABLED (`enabled: false`)
2. **Admin Action Required**: Must explicitly enable dates for RSVP access
3. **Sunday Exclusion**: Sundays (dayOfWeek: 0) should always be disabled (no service)
4. **Unique Per Date**: One setting per date (enforced by unique index)
5. **Upsert Pattern**: Use upsert to create/update in one operation
6. **Bulk Operations**: Support week (7 days) and month (30-31 days) bulk enable/disable
7. **Audit Trail**: Track who enabled/disabled and when
8. **Customer Portal Enforcement**: Portal only shows enabled dates
9. **PST Timezone**: All dates in Pacific Time Zone
10. **Capacity Management**: Optional max capacity per date (future)

**Integration with Customer Portal** (Future):
```javascript
// Customer portal query for available RSVP dates
const availableDates = await db.RSVPSettings.find({
  enabled: true,
  date: { $gte: new Date(), $lte: futureDate },
  dayOfWeek: { $ne: 0 },  // No Sundays
  $or: [
    { maxCapacity: null },  // No capacity limit
    { $expr: { $lt: ["$currentRsvpCount", "$maxCapacity"] } }  // Has capacity
  ],
  deletedAt: null
}).toArray();
```

**Storage Optimization**:
- Only create records for dates that admins interact with
- Use TTL index to auto-delete old settings (e.g., > 1 year old):
  ```javascript
  db.RSVPSettings.createIndex(
    { "date": 1 }, 
    { expireAfterSeconds: 31536000 }  // 365 days
  )
  ```

---

### 9. ThaliRecipients Collection

**Purpose**: Store information about individuals who receive daily thali (meals)

```javascript
{
  _id: ObjectId,
  
  // Personal Information (Required)
  name: String,               // Full name, indexed
  itsNumber: String,          // ITS (Identification) Number, unique, indexed
  mobileNumber: String,       // Phone number
  email: String,              // Email address, indexed
  
  // Location Information (Required)
  location: String,           // Recipient's location (from LocationSettings)
  thaliPickupLocation: String, // Where they pick up thali (from LocationSettings)
  
  // Default Settings
  defaultOptIn: Boolean,      // Default meal opt-in preference (true/false)
  
  // Dietary & Preferences (Optional)
  dietaryRestrictions: String, // Special dietary needs
  allergens: [String],        // List of allergens to avoid
  preferences: String,        // Additional preferences
  notes: String,              // Admin notes about this recipient
  
  // Status
  status: String,             // 'active' | 'inactive' | 'suspended'
  
  // Contact Preferences
  contactPreferences: {
    email: Boolean,           // Receive email notifications
    sms: Boolean,             // Receive SMS notifications
    whatsapp: Boolean         // Receive WhatsApp notifications
  },
  
  // Statistics (Denormalized)
  totalMealsReceived: Number, // Lifetime meal count
  lastMealDate: Date,         // Last date they received a meal
  
  // Audit Fields
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,        // Reference to Users (admin who added)
  createdByName: String,      // Denormalized
  updatedBy: ObjectId,
  updatedByName: String,
  deletedAt: Date,            // Soft delete
  deletedBy: ObjectId
}
```

**Indexes**:
```javascript
// Primary indexes
db.ThaliRecipients.createIndex({ itsNumber: 1 }, { unique: true })
db.ThaliRecipients.createIndex({ name: 1 })
db.ThaliRecipients.createIndex({ email: 1 })
db.ThaliRecipients.createIndex({ location: 1 })
db.ThaliRecipients.createIndex({ thaliPickupLocation: 1 })
db.ThaliRecipients.createIndex({ status: 1 })
db.ThaliRecipients.createIndex({ deletedAt: 1 })

// Compound indexes for common queries
db.ThaliRecipients.createIndex({ status: 1, location: 1 })
db.ThaliRecipients.createIndex({ status: 1, deletedAt: 1 })
db.ThaliRecipients.createIndex({ location: 1, thaliPickupLocation: 1 })

// Text index for search functionality
db.ThaliRecipients.createIndex({ 
  name: "text", 
  email: "text",
  itsNumber: "text",
  location: "text"
})
```

**Validation Schema**:
```javascript
db.createCollection("ThaliRecipients", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "itsNumber", "mobileNumber", "email", "location", "thaliPickupLocation", "status"],
      properties: {
        name: {
          bsonType: "string",
          minLength: 1,
          description: "Name is required"
        },
        itsNumber: {
          bsonType: "string",
          minLength: 1,
          description: "ITS Number is required and must be unique"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Valid email format required"
        },
        mobileNumber: {
          bsonType: "string",
          minLength: 1,
          description: "Mobile number is required"
        },
        location: {
          bsonType: "string",
          minLength: 1,
          description: "Location is required"
        },
        thaliPickupLocation: {
          bsonType: "string",
          minLength: 1,
          description: "Pickup location is required"
        },
        status: {
          enum: ["active", "inactive", "suspended"],
          description: "Status must be one of: active, inactive, suspended"
        },
        defaultOptIn: {
          bsonType: "bool"
        },
        totalMealsReceived: {
          bsonType: "int",
          minimum: 0
        }
      }
    }
  }
})
```

**Query Patterns**:
```javascript
// Get all active recipients
db.ThaliRecipients.find({ 
  status: 'active',
  deletedAt: null 
}).sort({ name: 1 })

// Search recipients by name, email, or ITS number
db.ThaliRecipients.find({
  $text: { $search: "ahmed" },
  deletedAt: null
}).sort({ name: 1 })

// Get recipients by location
db.ThaliRecipients.find({ 
  location: "Downtown",
  status: 'active',
  deletedAt: null 
}).sort({ name: 1 })

// Get recipients by pickup location
db.ThaliRecipients.find({ 
  thaliPickupLocation: "Main Center",
  status: 'active',
  deletedAt: null 
}).sort({ name: 1 })

// Get recipients with default opt-in
db.ThaliRecipients.find({ 
  defaultOptIn: true,
  status: 'active',
  deletedAt: null 
})

// Update recipient location (when location is deleted, reset to "Masjid")
db.ThaliRecipients.updateMany(
  { location: "OldLocationName" },
  { 
    $set: { 
      location: "Masjid",
      updatedAt: new Date(),
      updatedBy: ObjectId("..."),
      updatedByName: "System"
    }
  }
)

// Get recipient by ITS number
db.ThaliRecipients.findOne({ 
  itsNumber: "20123456",
  deletedAt: null 
})

// Filter by multiple criteria
db.ThaliRecipients.find({
  location: "Downtown",
  thaliPickupLocation: "Main Center",
  status: 'active',
  deletedAt: null
}).sort({ name: 1 })

// Count active recipients by location
db.ThaliRecipients.aggregate([
  { $match: { status: 'active', deletedAt: null } },
  { $group: {
    _id: "$location",
    count: { $sum: 1 }
  }},
  { $sort: { count: -1 } }
])
```

**Business Rules**:
1. **Unique ITS Number**: Each recipient must have unique ITS number
2. **Required Fields**: Name, ITS, mobile, email, location, pickup location all required
3. **Location Validation**: Location and pickup location must exist in LocationSettings
4. **Default to Masjid**: If location is deleted, reset to "Masjid"
5. **Soft Delete**: Never hard delete, use deletedAt field
6. **Active by Default**: New recipients default to 'active' status
7. **Contact Preferences**: Track notification preferences for future use

---

### 10. LocationSettings Collection

**Purpose**: Store and manage location options for recipients (addresses and pickup locations)

```javascript
{
  _id: ObjectId,
  
  // Location Information
  type: String,               // 'location' | 'pickup' - Type of location
  name: String,               // Location name (e.g., "Downtown", "Main Center")
  isDefault: Boolean,         // Is this the default location ("Masjid")
  
  // Additional Details (Optional)
  address: String,            // Full address (optional)
  city: String,
  state: String,
  zipCode: String,
  coordinates: {              // Geo coordinates for mapping (optional)
    latitude: Number,
    longitude: Number
  },
  
  // Usage Statistics (Denormalized)
  recipientCount: Number,     // How many recipients use this location
  lastUsedDate: Date,         // Last time a recipient was assigned this location
  
  // Status & Metadata
  status: String,             // 'active' | 'inactive'
  displayOrder: Number,       // Order in dropdown (lower = higher)
  description: String,        // Additional notes about this location
  
  // Protection
  isDeletable: Boolean,       // false for "Masjid", true for others
  
  // Audit Fields
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,        // Reference to Users
  createdByName: String,
  updatedBy: ObjectId,
  updatedByName: String,
  deletedAt: Date,            // Soft delete
  deletedBy: ObjectId
}
```

**Indexes**:
```javascript
// Primary indexes
db.LocationSettings.createIndex({ name: 1, type: 1 }, { unique: true })
db.LocationSettings.createIndex({ type: 1 })
db.LocationSettings.createIndex({ isDefault: 1 })
db.LocationSettings.createIndex({ status: 1 })
db.LocationSettings.createIndex({ deletedAt: 1 })
db.LocationSettings.createIndex({ displayOrder: 1 })

// Compound indexes
db.LocationSettings.createIndex({ type: 1, status: 1, deletedAt: 1 })
db.LocationSettings.createIndex({ type: 1, displayOrder: 1 })
```

**Validation Schema**:
```javascript
db.createCollection("LocationSettings", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "type", "status"],
      properties: {
        name: {
          bsonType: "string",
          minLength: 1,
          description: "Location name is required"
        },
        type: {
          enum: ["location", "pickup"],
          description: "Type must be 'location' or 'pickup'"
        },
        status: {
          enum: ["active", "inactive"],
          description: "Status must be 'active' or 'inactive'"
        },
        isDefault: {
          bsonType: "bool"
        },
        isDeletable: {
          bsonType: "bool"
        },
        displayOrder: {
          bsonType: "int",
          minimum: 0
        },
        recipientCount: {
          bsonType: "int",
          minimum: 0
        }
      }
    }
  }
})
```

**Query Patterns**:
```javascript
// Get all active locations (for dropdown)
db.LocationSettings.find({ 
  type: 'location',
  status: 'active',
  deletedAt: null 
}).sort({ displayOrder: 1, name: 1 })

// Get all active pickup locations (for dropdown)
db.LocationSettings.find({ 
  type: 'pickup',
  status: 'active',
  deletedAt: null 
}).sort({ displayOrder: 1, name: 1 })

// Get default location ("Masjid")
db.LocationSettings.findOne({ 
  isDefault: true,
  type: 'location',
  deletedAt: null 
})

// Add new location
db.LocationSettings.insertOne({
  name: "Westside",
  type: "location",
  status: "active",
  isDefault: false,
  isDeletable: true,
  displayOrder: 10,
  recipientCount: 0,
  createdAt: new Date(),
  createdBy: ObjectId("..."),
  createdByName: "Admin Name"
})

// Update location name
db.LocationSettings.updateOne(
  { name: "OldName", type: "location" },
  { 
    $set: { 
      name: "NewName",
      updatedAt: new Date(),
      updatedBy: ObjectId("..."),
      updatedByName: "Admin Name"
    }
  }
)

// Soft delete location (only if not default)
db.LocationSettings.updateOne(
  { 
    name: "Downtown",
    type: "location",
    isDeletable: true 
  },
  {
    $set: {
      deletedAt: new Date(),
      deletedBy: ObjectId("...")
    }
  }
)

// Get location usage statistics
db.LocationSettings.aggregate([
  { $match: { type: 'location', deletedAt: null } },
  { $project: {
    name: 1,
    recipientCount: 1,
    lastUsedDate: 1
  }},
  { $sort: { recipientCount: -1 } }
])

// Update recipient count when location is assigned
db.LocationSettings.updateOne(
  { name: "Downtown", type: "location" },
  { 
    $inc: { recipientCount: 1 },
    $set: { 
      lastUsedDate: new Date(),
      updatedAt: new Date()
    }
  }
)
```

**Business Rules**:
1. **Default Location**: "Masjid" is always present and cannot be deleted
2. **Unique Names**: Location names must be unique within their type
3. **Type Separation**: Keep 'location' and 'pickup' types separate
4. **Deletion Protection**: Cannot delete default location or locations in use
5. **Cascade Updates**: When location is renamed, update all recipients using it
6. **Cascade Deletion**: When location is deleted, reset recipients to "Masjid"
7. **Display Order**: Lower numbers appear first in dropdowns
8. **Usage Tracking**: Track how many recipients use each location

**Integration with ThaliRecipients**:
```javascript
// When deleting a location, update all recipients
const location = await db.LocationSettings.findOne({ 
  name: "Downtown", 
  type: "location" 
});

if (location && location.recipientCount > 0) {
  // Update all recipients using this location
  await db.ThaliRecipients.updateMany(
    { location: "Downtown" },
    { 
      $set: { 
        location: "Masjid",
        updatedAt: new Date(),
        updatedBy: ObjectId("..."),
        updatedByName: "System"
      }
    }
  );
  
  // Update recipient counts
  await db.LocationSettings.updateOne(
    { name: "Masjid", type: "location" },
    { $inc: { recipientCount: location.recipientCount } }
  );
}

// Soft delete the location
await db.LocationSettings.updateOne(
  { name: "Downtown", type: "location" },
  { 
    $set: { 
      deletedAt: new Date(),
      deletedBy: ObjectId("..."),
      recipientCount: 0
    }
  }
);
```

---

## Relationships Diagram

```
Users (1) ──────────── (M) RSVPs
  │                        │
  │                        │
  │                        (M)
  │                        │
  │                    Events (1) ───── (1) Menus
  │                        │
  │                        │
  (M)                      │
  │                        │
Roles (1) ──────────── (M) Users

Users (1) ──────────── (M) Carts
                           │
                           │
                           (M)
                           │
                    InventoryItems

Users (1) ──────────── (M) ThaliRecipients
  │                        │
  │                        │
  │                        (M)
  │                        │
  │                 LocationSettings
  │                   (Referenced via
  │                    location & 
  │                    thaliPickupLocation
  │                    fields)

RSVPSettings (1) ───────── Date-based access control
                           (Used by customer portal)

ThaliRecipients (M) ──────── (1) LocationSettings
                                  (location field)
                                  
ThaliRecipients (M) ──────── (1) LocationSettings  
                                  (thaliPickupLocation field)
```

**Key Relationships:**

1. **Users ↔ Roles**: Many-to-One (each user has one role)
2. **Users ↔ RSVPs**: One-to-Many (users can have multiple RSVPs)
3. **Events ↔ RSVPs**: One-to-Many (events can have multiple RSVPs)
4. **Events ↔ Menus**: One-to-One (optional, if event created from menu)
5. **Users ↔ Carts**: One-to-Many (users can have multiple carts)
6. **Carts ↔ InventoryItems**: Many-to-Many (cart items reference inventory)
7. **Users ↔ ThaliRecipients**: One-to-Many (admins create recipient records)
8. **ThaliRecipients ↔ LocationSettings**: Many-to-One (recipients reference locations)
9. **RSVPSettings**: Standalone date configuration (referenced by date strings)

---

## Data Integrity & Validation

### Schema Validation (MongoDB)

```javascript
// Users validation
db.createCollection("Users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "username", "passwordHash", "status"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        status: {
          enum: ["active", "inactive", "suspended"]
        },
        emailVerified: {
          bsonType: "bool"
        }
      }
    }
  }
})

// Events validation
db.createCollection("Events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["details", "date", "status"],
      properties: {
        status: {
          enum: ["draft", "published", "cancelled", "completed"]
        },
        capacity: {
          bsonType: "int",
          minimum: 0
        },
        rsvpCount: {
          bsonType: "int",
          minimum: 0
        }
      }
    }
  }
})
```

---

## Performance Optimization

### 1. **Read Optimization**
- Denormalize frequently accessed data (user names, event details)
- Use covering indexes for common queries
- Implement caching layer (Redis) for hot data

### 2. **Write Optimization**
- Batch updates where possible
- Use background index builds
- Implement write-behind pattern for analytics

### 3. **Aggregation Pipeline Examples**

```javascript
// Get event RSVP summary
db.RSVPs.aggregate([
  { $match: { eventId: ObjectId("..."), deletedAt: null } },
  { $group: {
    _id: "$status",
    count: { $sum: 1 },
    totalPartySize: { $sum: "$partySize" }
  }}
])

// Get user menu activity
db.Menus.aggregate([
  { $match: { createdBy: ObjectId("..."), deletedAt: null } },
  { $group: {
    _id: { year: "$year", month: { $month: "$weekStart" } },
    menusCreated: { $sum: 1 }
  }},
  { $sort: { "_id.year": -1, "_id.month": -1 } }
])
```

---

## Data Migration Strategy

### From localStorage to MongoDB

```javascript
// 1. Export current localStorage data
const menuState = JSON.parse(localStorage.getItem('menuState'))
const savedSummary = JSON.parse(localStorage.getItem('savedMenuSummary'))

// 2. Transform to MongoDB format
const transformedData = {
  menus: transformMenuState(menuState),
  events: extractEvents(menuState)
}

// 3. Bulk insert
await db.Menus.insertMany(transformedData.menus)
await db.Events.insertMany(transformedData.events)

// 4. Create indexes
await createAllIndexes()

// 5. Validate data integrity
await validateData()
```

---

## Backup & Recovery

### Backup Strategy
1. **Automated Daily Backups**: Full database backup at 2 AM PST
2. **Point-in-Time Recovery**: Enable oplog for continuous backup
3. **Geographic Redundancy**: Multi-region MongoDB Atlas cluster
4. **Retention**: 30 days for daily, 12 months for monthly

### Recovery Procedures
```bash
# Restore from backup
mongorestore --uri="mongodb+srv://..." --archive=backup.gz

# Point-in-time restore (MongoDB Atlas)
# Use Atlas UI to restore to specific timestamp
```

---

## Security Considerations

### 1. **Authentication**
- Use MongoDB Atlas IP whitelist
- Implement RBAC (Role-Based Access Control)
- Rotate credentials quarterly

### 2. **Encryption**
- Encryption at rest (MongoDB Atlas default)
- TLS/SSL for data in transit
- Encrypt sensitive fields (passwordHash, etc.)

### 3. **Audit Logging**
- Enable MongoDB audit logs
- Track all data modifications
- Log authentication attempts

---

## Monitoring & Alerts

### Key Metrics to Monitor
1. **Performance**: Query response time, index usage
2. **Capacity**: Storage usage, connection pool
3. **Errors**: Failed queries, timeout errors
4. **Security**: Failed auth attempts, unusual access patterns

### Alert Thresholds
- Query time > 100ms: Warning
- Storage > 80%: Critical
- Connection pool > 90%: Warning
- Failed auth > 5/min: Critical

---

## Future Considerations

### Planned Collections
1. **Notifications**: Store user notifications and preferences
2. **AuditLogs**: Comprehensive audit trail
3. **Templates**: Reusable menu templates
4. **Recipes**: Recipe database with ingredients
5. **Orders**: Supplier orders and tracking
6. **Volunteers**: Volunteer schedule and hours
7. **RecipientMealSchedule**: Track which recipients opted for meals on which days (future)

### Scalability
- Implement sharding when data > 100GB
- Use read replicas for analytics
- Consider time-series collection for metrics
- Archive old menus (> 1 year) to separate collection

---

## API Integration Points

### GraphQL Schema Alignment
Ensure MongoDB schema aligns with GraphQL types:

```graphql
type User {
  id: ID!
  email: String!
  displayName: String!
  role: Role!
  status: UserStatus!
}

type Event {
  id: ID!
  details: String!
  time: String
  date: DateTime!
  rsvps: [RSVP!]!
  rsvpCount: Int!
}
```

### REST API Considerations
- Use projection to return only needed fields
- Implement pagination (limit, skip)
- Support filtering, sorting, searching
- Return normalized ObjectIds as strings

---

## Maintenance Procedures

### Weekly
- Review slow queries and optimize
- Check index usage and remove unused
- Monitor storage growth

### Monthly
- Review and archive old data
- Update backup retention policies
- Security audit

### Quarterly
- Performance tuning
- Schema optimization review
- Capacity planning

---

## Connection String (Example)

```
mongodb+srv://username:password@cluster.mongodb.net/community-kitchen?retryWrites=true&w=majority&appName=CommunityKitchen
```

**Environment Variables**:
```bash
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=community-kitchen
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=2
```

---

## Summary

This schema provides:
✅ **Scalability**: Designed for growth from 100s to 10,000s of users
✅ **Performance**: Strategic indexing and denormalization
✅ **Flexibility**: Easy to extend with new features
✅ **Reliability**: Soft deletes, audit trails, validation
✅ **Best Practices**: Follows MongoDB patterns and DBMS principles

**Collections Overview:**
1. **Users** - User accounts and authentication (Admin, Managers, Volunteers)
2. **Roles** - Role-based access control
3. **Menus** - Weekly menu planning (Monday-Saturday)
4. **Events** - Community events with RSVP capability
5. **RSVPs** - Event RSVP tracking and attendance
6. **Carts** - Shopping cart functionality
7. **InventoryItems** - Item catalog for menus and ordering
8. **RSVPSettings** - Admin control for RSVP date availability
9. **ThaliRecipients** ⭐ - Individuals who receive daily meals
10. **LocationSettings** ⭐ - Location and pickup location options

⭐ = **New collections added for Thali Recipients & Settings pages**

**Key Features:**
- **Thali Recipient Management**: Complete CRUD with search, filter, sort
- **Location Management**: Centralized location settings with cascade updates
- **Default Location Protection**: "Masjid" cannot be deleted
- **Automatic Updates**: When locations are deleted/renamed, recipients auto-update
- **Validation**: MongoDB validators ensure data integrity
- **Indexing**: Optimized for common queries (search, filter by location, status)
- **Audit Trail**: Complete tracking of who created/updated/deleted records
- **Soft Deletes**: All collections support soft delete for data recovery

**Ready for production deployment on MongoDB Atlas.**

