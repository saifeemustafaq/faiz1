# Data Directory - Centralized JSON Storage

This directory contains all seed data and will serve as the **single source of truth** for database migration.

## 📁 Directory Structure

```
data/
├── categories.json       # Product categories
├── stores.json          # Store/vendor information
├── units.json           # Measurement units
├── products.json        # Product catalog (user-generated)
├── locations.json       # Locations and pickup locations
├── recipients.json      # Thali recipients (user-generated)
├── roles.json           # User roles and permissions
├── users.json           # System users (admin portal access)
├── menus.json           # Weekly menu data
├── events.json          # Community events
├── rsvp-settings.json   # RSVP availability settings
├── recipient-rsvps.json # Individual recipient RSVPs + per-day summary
├── carts.json           # Shopping carts (user-generated)
└── README.md            # This file
```

## 🎯 Purpose

### **Seed Data (Pre-populated)**
These files contain initial data that will be loaded when the app starts:
- `categories.json` - 10 default categories
- `stores.json` - 7 default stores
- `units.json` - 13 measurement units
- `locations.json` - Default "Masjid" location
- `roles.json` - 3 default roles (Administrator, Manager, Volunteer)
- `menus.json` - Empty menu structure with example
- `events.json` - Empty events list with example
- `rsvp-settings.json` - Empty RSVP settings with example
- `users.json` - Empty users list with example
- `carts.json` - Empty carts list with example
- `recipient-rsvps.json` - Empty RSVPs list with example

### **User Data (Initially Empty)**
These files will be populated as users add data:
- `products.json` - Products created by users
- `recipients.json` - Thali recipients added by admins
- `users.json` - System users added by admin
- `menus.json` - Weekly menus created by managers
- `events.json` - Events created by admins
- `rsvp-settings.json` - RSVP settings configured by admins
- `recipient-rsvps.json` - RSVPs submitted by recipients
- `carts.json` - Shopping carts created by volunteers

## 🔄 Current Usage (localStorage)

The app currently:
1. **Loads seed data** from these JSON files on first launch
2. **Stores all data** in browser localStorage
3. **Reads/writes** to localStorage for all operations

## 🚀 Future Usage (MongoDB Migration)

When migrating to MongoDB:
1. **Seed Script**: Import all JSON files to MongoDB collections
2. **User Data**: Export localStorage → JSON → MongoDB
3. **Ongoing Operations**: All CRUD via MongoDB API

## 📝 File Format

All JSON files follow the same structure:

```json
{
  "collectionName": [
    {
      "id": "unique-id",
      "name": "Item Name",
      ...otherFields,
      "createdAt": "ISO-8601 timestamp",
      "updatedAt": "ISO-8601 timestamp",
      "createdBy": "userId or null",
      "createdByName": "User Name or 'System'",
      "deletedAt": null,
      "deletedBy": null
    }
  ]
}
```

## 🔧 How to Use

### **For Development**
The app automatically loads seed data on first launch. No action needed.

### **For MongoDB Migration**
1. Run the seed script (see migration guide)
2. Export user-generated data from localStorage
3. Merge with existing JSON files
4. Import to MongoDB

### **For Backup/Export**
Use the data export utility in the app to save current state to these JSON files.

## 🔒 Important Notes

1. **Do NOT commit user data** (products.json, recipients.json with real data) to Git
2. **Seed data is safe** to commit (categories, stores, units, locations, roles)
3. **Keep backups** of user-generated JSON files
4. **Validate JSON** before migration to ensure integrity

## 📊 Data Relationships

```
Products
  ├─→ Category (categoryId)
  ├─→ Store (storeId)
  └─→ Unit (unitId)

Recipients
  ├─→ Location (locationId)
  └─→ Pickup Location (pickupLocationId)

Users
  └─→ Role (roleId)
```

## 🎯 Migration Checklist

- [x] Seed data files created
- [x] User data placeholders created
- [ ] Export utility implemented
- [ ] Import utility implemented
- [ ] MongoDB seed script created
- [ ] Data validation implemented
- [ ] Backup strategy defined

---

**Ready for MongoDB migration when you are!** 🚀

