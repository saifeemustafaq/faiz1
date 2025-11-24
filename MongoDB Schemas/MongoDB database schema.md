# MongoDB Database Design Specification
## Community Kitchen Management System

---

## Document Purpose

This document provides complete database design specifications for a MongoDB database administrator to implement a production-ready database for the Community Kitchen Management System. It covers all collections, their purposes, relationships, business rules, and data integrity requirements.

---

## System Overview

**Application Type**: Community Kitchen Management Portal (Admin-side)  
**Primary Users**: Administrators, Kitchen Managers, Volunteers  
**Future Expansion**: Customer-facing RSVP portal  
**Timezone**: All dates and times in Pacific Standard Time (PST)  
**Key Principle**: Sundays are excluded from all meal service operations

---

## Core Business Requirements

### 1. **Menu Management**
- Admins plan weekly menus (Monday-Saturday only, no Sundays)
- Each day can have either 3 menu items OR be designated as a special event
- Menus and events are bidirectionally synchronized
- All date operations use PST timezone

### 2. **Event Management**
- Events can be created independently or from menu management
- One event per day maximum
- Events include details, optional time, and future RSVP capability
- Bidirectional sync with menu management

### 3. **RSVP Access Control**
- **Default State**: RSVP is DISABLED for all dates
- Admins must explicitly enable RSVP for specific dates
- Supports bulk enable/disable (day, week, month)
- Customer portal (future) will only show admin-enabled dates

### 4. **Thali Recipients (Meal Recipients)**
- Track individuals who receive daily meals
- Required information: Name, ITS Number, Mobile, Email, Location, Pickup Location
- Support for search, filter, sort operations
- Track meal preferences and dietary restrictions

### 5. **Location Management**
- Two types: Recipient Locations and Pickup Locations
- "Masjid" is the default location and cannot be deleted
- When a location is deleted, all recipients using it are automatically reassigned to "Masjid"

### 6. **Inventory Management**
- Product catalog with categories, stores (vendors), and measurement units
- Products must reference a category, store, and unit
- Cannot delete categories/stores/units that are in use by products
- When categories/stores/units are renamed, all associated products update automatically

### 7. **Role-Based Access Control**
- Granular permissions system (extensible)
- Admin has full access to all features
- Users can only access features they have permissions for
- Users cannot modify their own permissions

---

## Collections Architecture

### Collection 1: **Users**
**Purpose**: Store user accounts for system access (admins, managers, volunteers)

**Core Fields**:
- Email (unique, required)
- Username (unique, required)
- Password Hash (bcrypt)
- First Name, Last Name
- Role Reference (links to Roles collection)
- Status: active | inactive | suspended
- Email Verified (boolean)
- Last Login timestamp

**Business Rules**:
- Email and username must be unique
- Passwords must be hashed (never store plain text)
- Track who created and last updated each user
- Soft delete (never hard delete user records)

**Relationships**:
- Each user has ONE role (Many-to-One with Roles)
- Users create/update menus, events, recipients, products (audit trail)

---

### Collection 2: **Roles**
**Purpose**: Define user roles and their permissions

**Core Fields**:
- Role Name (unique): admin, manager, volunteer, member
- Display Name
- Permissions Array (list of permission codes)
- Is System Role (built-in roles cannot be deleted)
- Priority (lower number = higher privilege)

**Permission Examples**:
- modify_menu_items
- manage_roles
- modify_events
- manage_carts
- add_edit_inventory
- modify_settings
- manage_rsvp_settings
- manage_recipients

**Business Rules**:
- System roles (admin, manager) cannot be deleted
- Permissions are extensible (can add new permissions)
- Admin role always has all permissions

**Relationships**:
- One role can be assigned to many users (One-to-Many)

---

### Collection 3: **Menus**
**Purpose**: Store weekly menu planning data

**Core Fields**:
- Week Start Date (Monday, PST) - unique per week
- Week End Date (Saturday, PST)
- Week Label: "Week of November 17, 2025"
- Year, Week Number (for filtering)
- Days Array (embedded, one entry per day Monday-Saturday):
  - Date (PST)
  - Day of Week (1=Monday, 6=Saturday)
  - Day Label: "Mon - Nov 17"
  - Type: 'menu' or 'event'
  - If menu: item1, item2, item3 (strings)
  - If event: event reference ID, denormalized event details and time
- Status: draft | published | archived

**Business Rules**:
- One menu document per week (unique on week start date)
- Sundays are never included (only Monday-Saturday)
- A day can be either menu OR event, not both
- When a day is set to event mode, it references the Events collection
- All dates stored and queried in PST

**Relationships**:
- Menu days can reference Events (Many-to-One)
- Created/updated by Users (audit trail)

**Denormalization**:
- Event details and time are copied into menu for fast display
- Creator name stored alongside creator ID

---

### Collection 4: **Events**
**Purpose**: Store community events

**Core Fields**:
- Details (required) - event description/name
- Date (PST, required)
- Date Only String: "2025-11-17" (unique, for easy querying)
- Time (optional): "6:00 PM" or "2:00 PM - 4:00 PM"
- Year, Month, Day (extracted for filtering)
- Day of Week (0=Sunday, 6=Saturday)
- Source: 'manual' or 'menu_management'
- Menu Reference (if created from menu)
- Status: draft | published | cancelled | completed
- RSVP Settings (future):
  - RSVP Enabled (boolean)
  - Max Capacity
  - RSVP Deadline
  - Current RSVP Count (denormalized)

**Business Rules**:
- ONE event per date (enforced by unique index on date string)
- Admin selects date via date picker (not limited to current day)
- Events created in Menu Management appear in Manage Events and vice versa
- All dates in PST
- Default status is 'published'

**Relationships**:
- Can be referenced by Menus (One-to-One optional)
- Can have many RSVPs (One-to-Many, future)
- Created/updated by Users (audit trail)

**Denormalization**:
- Creator name stored for quick display

---

### Collection 5: **RSVPs**
**Purpose**: Track event RSVPs and attendance (future customer portal)

**Core Fields**:
- Event Reference (required)
- User Reference (required)
- Status: pending | confirmed | declined | waitlisted | cancelled
- Party Size (number of people)
- Dietary Restrictions (optional)
- Notes
- Checked In (boolean)
- Check-in Timestamp

**Business Rules**:
- One RSVP per user per event (unique constraint)
- RSVP only allowed if event's RSVP is enabled
- RSVP only allowed if date is enabled in RSVPSettings
- Track approval workflow if event requires approval

**Relationships**:
- Each RSVP belongs to ONE event (Many-to-One)
- Each RSVP belongs to ONE user (Many-to-One)

**Denormalization**:
- Event details, date, user name, user email stored for reporting

---

### Collection 6: **RSVPSettings**
**Purpose**: Admin control for which dates users can RSVP

**Core Fields**:
- Date (PST, required)
- Date Only String: "2025-11-17" (unique)
- Year, Month, Day, Day of Week, Month Abbreviation
- Enabled (boolean) - **DEFAULT: FALSE**
- Admin Notes (why enabled/disabled)
- Max Capacity (optional, per date)
- Current RSVP Count (denormalized)
- Last Toggled By (user reference)
- Bulk Operation Type: individual | week | month

**Business Rules**:
- **CRITICAL**: Default state is DISABLED for all dates
- Admins must explicitly enable dates for RSVP access
- Sundays (dayOfWeek = 0) should always remain disabled (no service)
- One setting per date (unique constraint)
- Supports bulk enable/disable operations
- Customer portal (future) will ONLY show enabled dates

**Relationships**:
- Standalone collection (referenced by date strings)
- Modified by Users (audit trail)

**Usage Pattern**:
- Admin calendar view shows all dates with their enabled/disabled status
- Quick actions: enable/disable week, enable/disable month
- Customer portal queries only enabled dates in future

---

### Collection 7: **ThaliRecipients**
**Purpose**: Individuals who receive daily meals

**Core Fields**:
- Name (required)
- ITS Number (unique, required) - identification number
- Mobile Number (required)
- Email (required)
- Location (required) - from LocationSettings
- Thali Pickup Location (required) - from LocationSettings
- Default Opt-In (boolean) - default meal preference
- Dietary Restrictions (optional)
- Allergens Array (optional)
- Status: active | inactive | suspended
- Contact Preferences:
  - Email notifications (boolean)
  - SMS notifications (boolean)
  - WhatsApp notifications (boolean)
- Total Meals Received (counter)
- Last Meal Date

**Business Rules**:
- ITS Number must be unique
- All required fields must be provided
- Location and Pickup Location must exist in LocationSettings
- If a location is deleted, recipient is automatically reassigned to "Masjid"
- Support full-text search across name, email, ITS number, location
- Support filtering by location, pickup location, status
- Support sorting by any field

**Relationships**:
- Location field references LocationSettings (Many-to-One)
- Pickup Location field references LocationSettings (Many-to-One)
- Created/updated by Users (audit trail)

**Denormalization**:
- Location and pickup location stored as strings (not just IDs) for fast queries
- Creator/updater names stored alongside IDs

---

### Collection 8: **LocationSettings**
**Purpose**: Manage location options for recipients

**Core Fields**:
- Type: 'location' or 'pickup'
- Name (unique within type)
- Is Default (boolean) - "Masjid" only
- Is Deletable (boolean) - false for "Masjid"
- Status: active | inactive
- Display Order (for dropdown sorting)
- Recipient Count (how many recipients use this)
- Address, City, State, Zip (optional)
- Coordinates (latitude, longitude, optional)

**Business Rules**:
- Two types: 'location' (recipient address) and 'pickup' (pickup point)
- "Masjid" is the default location and CANNOT be deleted
- Location names must be unique within their type
- Cannot delete locations that are in use by recipients
- When a location is deleted:
  1. All recipients using it are updated to "Masjid"
  2. "Masjid" recipient count is incremented
  3. Deleted location is soft-deleted
- When a location is renamed, all recipients using it are updated automatically

**Relationships**:
- Referenced by ThaliRecipients (One-to-Many)
- Modified by Users (audit trail)

**Cascade Operations**:
- **On Delete**: Update all recipients to "Masjid", update counts, soft delete location
- **On Rename**: Update all recipients with new name

---

### Collection 9: **Products**
**Purpose**: Product catalog for inventory management

**Core Fields**:
- Name (required)
- Category Reference (required) - links to Categories
- Category Name (denormalized)
- Store Reference (required) - links to Stores
- Store Name (denormalized)
- Unit Reference (required) - links to Units
- Unit Abbreviation (denormalized): "lbs", "kg", etc.
- Unit Name (denormalized): "Pounds", "Kilograms"
- Notes (optional)
- Status: active | inactive | discontinued

**Business Rules**:
- Product name should be unique among active products
- Must have valid category, store, and unit references
- Cannot delete if referenced in active carts or orders
- When category/store/unit is renamed, denormalized fields auto-update
- Support full-text search on product name
- Support filtering by category, store, unit, status
- Support sorting by any field

**Relationships**:
- Each product has ONE category (Many-to-One with Categories)
- Each product has ONE store (Many-to-One with Stores)
- Each product has ONE unit (Many-to-One with Units)
- Created/updated by Users (audit trail)

**Denormalization**:
- Category name, store name, unit name/abbreviation stored for fast queries
- Avoids joins when displaying product lists

---

### Collection 10: **Categories**
**Purpose**: Product categories for organization

**Core Fields**:
- Name (unique, required)
- Product Count (denormalized) - how many products in this category

**Business Rules**:
- Category names must be unique (case-insensitive)
- Cannot delete categories that have active products
- When renamed, all products' categoryName field updates automatically
- Track product count for admin dashboard

**Relationships**:
- One category can have many products (One-to-Many)
- Modified by Users (audit trail)

**Cascade Operations**:
- **On Rename**: Update all products with new category name
- **On Delete**: Blocked if any active products exist

**Seed Data** (from data/categories.json):
- Produce (veg & fruit)
- Fresh herbs & aromatics
- Dairy and Eggs
- Bakery
- Dry goods & grains
- Legumes & pulses (dry)
- Oils & fats
- Spices (whole)
- Spices & masalas (ground)
- Condiments & sauces
- Nuts & baking
- Frozen
- Canned & jarred

---

### Collection 11: **Stores**
**Purpose**: Store/vendor information for product sourcing

**Core Fields**:
- Name (unique, required)
- Product Count (denormalized) - how many products from this store

**Business Rules**:
- Store names must be unique (case-insensitive)
- Cannot delete stores that have active products
- When renamed, all products' storeName field updates automatically
- Track product count for admin dashboard

**Relationships**:
- One store can supply many products (One-to-Many)
- Modified by Users (audit trail)

**Cascade Operations**:
- **On Rename**: Update all products with new store name
- **On Delete**: Blocked if any active products exist

---

### Collection 12: **Units**
**Purpose**: Measurement units for product quantities

**Core Fields**:
- Name (required): "Pounds", "Kilograms", "Packets"
- Abbreviation (unique, required): "lbs", "kg", "pkt"
- Product Count (denormalized) - how many products use this unit

**Business Rules**:
- Abbreviations must be unique (case-insensitive)
- Cannot delete units that have active products
- When renamed, all products' unitName and unitAbbreviation fields update automatically
- Track product count for admin dashboard

**Relationships**:
- One unit can be used by many products (One-to-Many)
- Modified by Users (audit trail)

**Cascade Operations**:
- **On Rename**: Update all products with new unit name and abbreviation
- **On Delete**: Blocked if any active products exist

**Seed Data** (from data/units.json):
- Pounds (lbs), Kilograms (kg), Grams (g), Ounces (oz)
- Packets (pkt), Boxes (box), Cases (case), Bottles (btl), Cans (can)
- Bunches (bunch), Pieces (pc), Count (ct)
- Gallons (gal)

---

### Collection 13: **Carts**
**Purpose**: Shopping carts for ordering/requesting items (future)

**Core Fields**:
- User Reference (required)
- Items Array (embedded):
  - Product Reference
  - Product Name (denormalized)
  - Quantity
  - Unit
  - Unit Price (optional)
  - Total Price (optional)
  - Notes
- Total Items Count
- Total Quantity Sum
- Total Price Sum
- Status: active | checked_out | abandoned | expired
- Last Activity Timestamp (for abandonment tracking)
- Checkout Timestamp
- Delivery Date
- Delivery Method: pickup | delivery

**Business Rules**:
- One active cart per user
- Track last activity for abandonment detection
- Auto-expire old carts (configurable period)
- Checkout creates order record (future)

**Relationships**:
- Each cart belongs to ONE user (Many-to-One)
- Cart items reference Products (Many-to-Many via embedded array)

---

### Collection 14: **InventoryItems**
**Purpose**: Extended item catalog with images, pricing, stock levels (future expansion)

**Core Fields**:
- Name, Slug (URL-friendly, unique)
- Description
- Category, Subcategory
- Images Array
- SKU (stock keeping unit)
- In Stock (boolean)
- Stock Level: in-stock | low | out
- Quantity Available
- Unit
- Price, Price Unit
- Tags Array: organic, local, gluten-free, etc.
- Allergens Array
- Seasonal (boolean)
- Status: active | discontinued | seasonal

**Business Rules**:
- Slug must be unique
- Track stock levels for inventory management
- Support seasonal items with active months
- Full-text search on name, description, tags

**Relationships**:
- Can be referenced by Carts (Many-to-Many)
- Modified by Users (audit trail)

---

## Entity Relationship Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     CORE RELATIONSHIPS                          │
└─────────────────────────────────────────────────────────────────┘

Users ──(1:M)──> Menus (creator)
Users ──(1:M)──> Events (creator)
Users ──(1:M)──> ThaliRecipients (creator)
Users ──(1:M)──> Products (creator)
Users ──(1:M)──> Carts (owner)
Users ──(M:1)──> Roles (has one role)

Events ──(1:1)──> Menus (optional, if created from menu)
Events ──(1:M)──> RSVPs (future)

ThaliRecipients ──(M:1)──> LocationSettings (location)
ThaliRecipients ──(M:1)──> LocationSettings (pickup location)

Products ──(M:1)──> Categories
Products ──(M:1)──> Stores
Products ──(M:1)──> Units

Carts ──(M:M)──> Products (via embedded items array)

RSVPSettings (standalone, referenced by date strings)
```

---

## Critical Business Logic

### 1. **Bidirectional Menu-Event Sync**
- When an event is created in Menu Management:
  - Create corresponding event in Events collection
  - Link menu day to event
- When an event is updated in Manage Events:
  - Update corresponding menu day
- When an event is deleted:
  - Remove from both Menu and Events
  - Convert menu day back to regular menu

### 2. **Location Cascade Updates**
- **On Location Rename**:
  1. Update LocationSettings record
  2. Find all ThaliRecipients using old name
  3. Update their location/pickupLocation field
  4. Update audit fields
  
- **On Location Delete**:
  1. Check if location is "Masjid" → BLOCK if true
  2. Find all ThaliRecipients using this location
  3. Update them to "Masjid"
  4. Update "Masjid" recipient count
  5. Soft delete the location

### 3. **Inventory Cascade Updates**
- **On Category/Store/Unit Rename**:
  1. Update master record (Categories/Stores/Units)
  2. Find all Products referencing it
  3. Update denormalized name fields in all products
  4. Update audit fields

- **On Category/Store/Unit Delete**:
  1. Check if any active products use it
  2. BLOCK deletion if in use
  3. If not in use, soft delete

### 4. **RSVP Access Control**
- Default: ALL dates disabled
- Admin must explicitly enable dates
- Customer portal queries: `enabled = true AND date >= today AND dayOfWeek != 0`
- Sundays always disabled (no service)

### 5. **Soft Delete Pattern**
- Never hard delete records
- Set `deletedAt` timestamp and `deletedBy` user ID
- All queries must filter `deletedAt = null`
- Enables data recovery and audit trails

---

## Indexing Strategy

### High-Priority Indexes (Create First)

**Users**:
- Unique: email, username
- Standard: roleId, status, deletedAt

**Events**:
- Unique: dateOnly
- Standard: date, status, year+month (compound)
- Compound: status+date+deletedAt

**Menus**:
- Unique: weekStart
- Standard: year+weekNumber (compound), status, deletedAt

**RSVPSettings**:
- Unique: dateOnly
- Compound: enabled+date+deletedAt, year+month+deletedAt

**ThaliRecipients**:
- Unique: itsNumber
- Standard: name, email, location, thaliPickupLocation, status, deletedAt
- Compound: status+location, status+deletedAt
- Text: name, email, itsNumber, location (for search)

**Products**:
- Standard: name, categoryId, storeId, unitId, status, deletedAt
- Text: name (for search)

**Categories, Stores, Units**:
- Unique: name (Categories, Stores), abbreviation (Units)
- Standard: deletedAt

**LocationSettings**:
- Unique: name+type (compound)
- Standard: type, isDefault, status, deletedAt
- Compound: type+status+deletedAt

---

## Data Validation Requirements

### Field-Level Validation

**Email Fields**: Must match email regex pattern  
**Status Fields**: Must be from predefined enum  
**Date Fields**: Must be valid ISO date  
**Boolean Fields**: Must be true/false  
**Counters**: Must be >= 0  
**Required Fields**: Cannot be null or empty string

### Collection-Level Validation

**Users**: email, username, passwordHash, status required  
**Events**: details, date, dateOnly, status required  
**ThaliRecipients**: name, itsNumber, mobile, email, location, pickupLocation, status required  
**Products**: name, categoryId, storeId, unitId required  
**Categories/Stores**: name required  
**Units**: name, abbreviation required  
**LocationSettings**: name, type, status required  
**RSVPSettings**: date, dateOnly, enabled required

---

## Audit Trail Requirements

### All Collections Must Track:
- `createdAt` (timestamp)
- `createdBy` (user ObjectId)
- `createdByName` (denormalized user name)
- `updatedAt` (timestamp)
- `updatedBy` (user ObjectId)
- `updatedByName` (denormalized user name)
- `deletedAt` (timestamp, null if active)
- `deletedBy` (user ObjectId, null if active)

### Audit Benefits:
- Track who made changes and when
- Support compliance requirements
- Enable data recovery
- Investigate issues

---

## Denormalization Strategy

### Why Denormalize?
- Avoid expensive joins in MongoDB
- Faster read performance
- Simpler queries
- Better user experience

### What to Denormalize?

**User Names**: Store alongside user IDs in audit fields  
**Event Details**: Copy into menu days for fast menu display  
**Category/Store/Unit Names**: Copy into products for fast product lists  
**Location Names**: Store in recipients for fast filtering  
**Counts**: Store product counts in categories/stores/units for dashboard

### Denormalization Maintenance:
- When source changes, update all denormalized copies
- Use application-level triggers or scheduled jobs
- Validate consistency periodically

---

## Data Migration from Current System

### Current State:
- Data stored in JSON files in `/data` directory
- Products, Categories, Stores, Units already populated
- Recipients in localStorage (temporary)
- Menus and Events in localStorage (temporary)
- RSVP settings in localStorage (temporary)

### Migration Steps:

1. **Export Current Data**:
   - Read all JSON files from `/data` directory
   - Export localStorage data from browser

2. **Transform Data**:
   - Convert string IDs to MongoDB ObjectIds
   - Add audit fields (createdAt, createdBy, etc.)
   - Add default values for optional fields
   - Validate all required fields present

3. **Import to MongoDB**:
   - Create collections with validation rules
   - Create all indexes
   - Bulk insert transformed data
   - Verify data integrity

4. **Update Application**:
   - Switch from JSON files to MongoDB queries
   - Update API routes to use MongoDB
   - Test all CRUD operations
   - Verify cascade operations work

---

## Performance Considerations

### Query Optimization:
- Use indexes for all frequent queries
- Use compound indexes for multi-field filters
- Use text indexes for search functionality
- Limit result sets with pagination

### Write Optimization:
- Batch updates where possible
- Use bulk operations for cascade updates
- Update denormalized fields asynchronously if possible

### Monitoring:
- Track slow queries (> 100ms)
- Monitor index usage
- Watch storage growth
- Alert on failed operations

---

## Security Requirements

### Authentication:
- Use MongoDB Atlas with IP whitelist
- Implement role-based access control (RBAC)
- Rotate credentials quarterly
- Use strong passwords (min 16 chars)

### Encryption:
- Enable encryption at rest (MongoDB Atlas default)
- Use TLS/SSL for all connections
- Encrypt sensitive fields (passwords, personal info)

### Access Control:
- Admin: Full access to all collections
- Manager: Read/write to menus, events, recipients, products
- Volunteer: Read-only access to menus and events
- Application: Specific database user with limited permissions

---

## Backup & Recovery Strategy

### Automated Backups:
- Daily full backup at 2 AM PST
- Retain daily backups for 30 days
- Retain monthly backups for 12 months
- Store backups in separate geographic region

### Point-in-Time Recovery:
- Enable MongoDB oplog
- Support restore to any point in last 7 days

### Disaster Recovery:
- Multi-region MongoDB Atlas cluster
- Automatic failover
- Recovery Time Objective (RTO): < 1 hour
- Recovery Point Objective (RPO): < 15 minutes

---

## Scalability Planning

### Current Scale:
- Expected users: < 100
- Expected recipients: < 500
- Expected products: < 1000
- Expected events: < 100/year

### Growth Projections:
- Year 1: 2x growth
- Year 2: 5x growth
- Year 3: 10x growth

### Scaling Strategy:
- Start with MongoDB Atlas M10 cluster
- Enable auto-scaling
- Implement sharding when data > 100GB
- Use read replicas for reporting
- Archive old data (> 1 year) to separate collection

---

## Monitoring & Alerts

### Metrics to Monitor:
- Query response time (alert if > 100ms)
- Storage usage (alert if > 80%)
- Connection pool usage (alert if > 90%)
- Failed queries (alert if > 1% error rate)
- Failed authentication attempts (alert if > 5/min)

### Health Checks:
- Database connectivity
- Index health
- Replication lag
- Backup success/failure

---

## Implementation Checklist for DBA

### Phase 1: Setup
- [ ] Create MongoDB Atlas account
- [ ] Create cluster (M10 or higher)
- [ ] Configure IP whitelist
- [ ] Create database user with strong password
- [ ] Enable encryption at rest
- [ ] Configure TLS/SSL

### Phase 2: Schema Creation
- [ ] Create all 14 collections
- [ ] Add validation rules to each collection
- [ ] Create all unique indexes
- [ ] Create all standard indexes
- [ ] Create all compound indexes
- [ ] Create all text indexes

### Phase 3: Seed Data
- [ ] Import Categories from data/categories.json
- [ ] Import Stores from data/stores.json
- [ ] Import Units from data/units.json
- [ ] Import Products from data/products.json
- [ ] Create default "Masjid" location
- [ ] Create default admin user
- [ ] Create default roles

### Phase 4: Testing
- [ ] Test all CRUD operations
- [ ] Test cascade updates (location rename/delete)
- [ ] Test cascade updates (category/store/unit rename)
- [ ] Test soft delete functionality
- [ ] Test unique constraints
- [ ] Test validation rules
- [ ] Test search functionality
- [ ] Test filtering and sorting
- [ ] Verify index usage with explain()

### Phase 5: Security
- [ ] Review and restrict database user permissions
- [ ] Enable audit logging
- [ ] Configure backup schedule
- [ ] Test backup restoration
- [ ] Set up monitoring alerts
- [ ] Document connection strings (securely)

### Phase 6: Handoff
- [ ] Provide connection string to development team
- [ ] Document any deviations from spec
- [ ] Provide admin credentials (securely)
- [ ] Schedule knowledge transfer session

---

## Connection Information

### Connection String Format:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

### Required Environment Variables:
- `MONGODB_URI`: Full connection string
- `MONGODB_DB_NAME`: Database name (e.g., "community-kitchen")
- `MONGODB_MAX_POOL_SIZE`: 10
- `MONGODB_MIN_POOL_SIZE`: 2

### Network Configuration:
- Whitelist application server IPs
- Whitelist developer IPs (temporary)
- Use VPN for admin access (recommended)

---

## Support & Maintenance

### Weekly Tasks:
- Review slow query logs
- Check index usage
- Monitor storage growth
- Review failed operations

### Monthly Tasks:
- Review and archive old data
- Update backup retention policies
- Security audit
- Performance review

### Quarterly Tasks:
- Capacity planning
- Schema optimization review
- Update documentation
- Rotate credentials

---

## Questions for DBA

Before implementation, please confirm:

1. **Cluster Configuration**: Which MongoDB Atlas tier will be used?
2. **Region**: Which AWS/Azure/GCP region for primary cluster?
3. **Backup Schedule**: Confirm 2 AM PST daily backup acceptable?
4. **Monitoring**: Which monitoring tools will be used?
5. **Alerting**: Who receives alerts and via what channel?
6. **Credentials**: How will credentials be securely shared?
7. **Timeline**: Expected completion date for Phase 1-5?

---

## Document Version

**Version**: 2.0  
**Last Updated**: November 24, 2025  
**Updated By**: Development Team  
**Next Review**: Before MongoDB implementation

---

## Appendix: Quick Reference

### Collection Count: 14
1. Users
2. Roles
3. Menus
4. Events
5. RSVPs
6. RSVPSettings
7. ThaliRecipients
8. LocationSettings
9. Products
10. Categories
11. Stores
12. Units
13. Carts
14. InventoryItems

### Key Relationships:
- Users → Roles (M:1)
- Products → Categories/Stores/Units (M:1 each)
- ThaliRecipients → LocationSettings (M:1 twice)
- Events ↔ Menus (1:1 optional, bidirectional)
- Users → Everything (audit trail)

### Critical Features:
- Soft delete everywhere
- Cascade updates for denormalized data
- Default RSVP disabled (admin must enable)
- "Masjid" cannot be deleted
- PST timezone for all dates
- No Sundays (no service)

---

**END OF SPECIFICATION**

This document is ready for database administrator review and implementation.
