# RSVP Management System - Complete Documentation

## Overview
A comprehensive admin-side RSVP access control system that allows administrators to enable or disable RSVP capabilities for specific dates. This system enforces a **default-deny** approach where all dates are closed for RSVPs until explicitly enabled by an admin.

## Key Principles

### 🔒 Default-Deny Security Model
- **All days start DISABLED** for RSVP access
- Admins must **actively ENABLE** specific days
- Customer portal (future) will **only show enabled dates**
- Provides complete administrative control over RSVP windows

### 🎯 Purpose
This is the **admin-side configuration panel**. The customer-facing RSVP portal will be built later and will enforce the rules set here.

---

## Features

### ✅ Multi-Granularity Control
Admins can enable/disable RSVPs at different levels:

1. **Individual Days** - Click any day to toggle
2. **Entire Weeks** - Enable/disable 7 days at once
3. **Entire Months** - Enable/disable all days in a month
4. **Arbitrary Ranges** - Select multiple days individually

### ✅ Visual Calendar Interface
- Month-by-month calendar view
- Clear color coding:
  - 🟢 **Green**: RSVP Enabled
  - ⬜ **White**: RSVP Disabled (default)
  - 🟡 **Golden border**: Today
- Hover effects for better UX
- Week hover highlighting

### ✅ Bulk Actions
- **Enable/Disable Month**: Single button to control entire month
- **Enable/Disable Week**: Quick week actions (Week 1-5)
- **Individual Toggle**: Click any day to flip its state

### ✅ Change Management
- **Unsaved Changes Tracking**: Know when you have pending changes
- **Save Button**: Publish changes to backend
- **Cancel Button**: Discard all unsaved changes
- **Confirmation Prompts**: Prevent accidental data loss

### ✅ Summary Dashboard
- Total days enabled count
- Total days disabled count
- Last saved timestamp
- Real-time stats update

---

## User Interface

### Calendar View

```
┌─────────────────────────────────────┐
│  RSVP Management                    │
│  Control which days users can RSVP  │
├─────────────────────────────────────┤
│  [<] November 2025 [>]              │
│  [Enable Month] [Disable Month]     │
├─────────────────────────────────────┤
│  Sun Mon Tue Wed Thu Fri Sat        │
│   1   2   3   4   5   6   7         │
│  🟢  🟢  ⬜  ⬜  🟢  🟢  ⬜         │
│   8   9  10  11  12  13  14         │
│  ⬜  ⬜  ⬜  ⬜  ⬜  ⬜  ⬜         │
└─────────────────────────────────────┘
```

### Bulk Week Actions

```
┌─────────────────────────────────────┐
│  Quick Week Actions                 │
├─────────────────────────────────────┤
│  Week 1  [Enable] [Disable]         │
│  Week 2  [Enable] [Disable]         │
│  Week 3  [Enable] [Disable]         │
│  Week 4  [Enable] [Disable]         │
│  Week 5  [Enable] [Disable]         │
└─────────────────────────────────────┘
```

---

## Technical Implementation

### File Structure

```
app/
└── rsvp-management/
    ├── page.tsx                 # Main RSVP management page
    └── page.module.css          # Styles

contexts/
└── RSVPContext.tsx              # Global state management

types/
└── rsvp.ts                      # TypeScript type definitions
```

### State Management

**RSVPContext** provides:

```typescript
{
  // State
  rsvpSettings: RSVPSettings,
  savedSettings: RSVPSettings,
  hasUnsavedChanges: boolean,
  
  // Actions
  toggleDay: (dateKey: string) => void,
  enableDays: (dateKeys: string[]) => void,
  disableDays: (dateKeys: string[]) => void,
  enableWeek: (mondayDate: Date) => void,
  disableWeek: (mondayDate: Date) => void,
  enableMonth: (year: number, month: number) => void,
  disableMonth: (year: number, month: number) => void,
  
  // Persistence
  saveSettings: () => Promise<void>,
  cancelChanges: () => void,
  
  // Utilities
  getSummary: () => RSVPSummary,
  isDayEnabled: (dateKey: string) => boolean
}
```

### Data Structure

```typescript
interface RSVPDayStatus {
  date: string;              // ISO date "YYYY-MM-DD"
  enabled: boolean;          // Default: false
  notes?: string;            // Optional admin notes
  updatedAt?: string;        // Last modified
  updatedBy?: string;        // Admin ID
}

interface RSVPSettings {
  [dateKey: string]: RSVPDayStatus;
}
```

**Storage**: Currently localStorage, will migrate to MongoDB

---

## Workflows

### Enabling RSVP for a Single Day

1. Navigate to `/rsvp-management`
2. Use arrow buttons to find desired month
3. Click on the day to enable it (turns green)
4. Click "Save Settings" button
5. Confirmation alert appears
6. Setting is now published

### Enabling RSVP for an Entire Week

**Method 1: Quick Week Actions**
1. Scroll to "Quick Week Actions" section
2. Find the desired week (Week 1-5)
3. Click "Enable" button
4. All 7 days of that week turn green
5. Click "Save Settings"

**Method 2: Manual Selection**
1. Click each day individually
2. Select all 7 days of the week
3. Click "Save Settings"

### Enabling RSVP for an Entire Month

1. Navigate to desired month using arrows
2. Click "Enable Month" button (top right)
3. All days in month turn green
4. Click "Save Settings"

### Disabling Previously Enabled Dates

**Same as enabling, but:**
- Click enabled (green) days to toggle off
- Use "Disable Week" button
- Use "Disable Month" button

### Canceling Unsaved Changes

1. Make changes to the calendar
2. Notice "Unsaved Changes" warning
3. Click "Cancel Changes" button
4. Confirm in dialog
5. All changes revert to last saved state

---

## Mobile Responsiveness

### Mobile (< 768px)
- Full-width calendar
- Stacked controls
- Larger touch targets (days are tappable)
- Simplified month navigation
- Stacked action buttons
- Legend as list view

### Tablet (768px - 1023px)
- 2-column layouts where appropriate
- Comfortable calendar grid
- Side-by-side action buttons

### Desktop (≥ 1024px)
- Wide calendar view
- All controls visible simultaneously
- Optimal spacing and sizing

---

## Design Specifications

### Colors

**Enabled State (Green)**
```css
background: #2D5016 (var(--green-main))
border: 2px solid #1A1A1A
```

**Disabled State (White)**
```css
background: #FFFFF0 (var(--ivory-bg))
border: 2px solid #1A1A1A
```

**Today Highlight (Golden)**
```css
border: 3px solid #D4AF37 (var(--golden-main))
box-shadow: 0 0 0 2px #E5C158 (var(--golden-light))
```

### Typography

```css
Title: 2rem (32px) → 2.5rem desktop
Calendar Days: 1rem (16px)
Buttons: 1rem (16px)
```

### Interactions

**Hover Effects:**
- Days: Transform and shadow lift
- Buttons: Background color shift + shadow enhance
- Week hover: Highlight all days in week

**Click Feedback:**
- Immediate visual toggle
- No loading state needed (instant)

---

## Integration with Customer Portal (Future)

### How It Works

1. **Admin Panel** (Current):
   - Admins enable specific dates
   - Changes saved to database
   
2. **Customer Portal** (Future):
   - Fetches enabled dates from database
   - Only shows enabled dates for RSVP
   - Disabled dates are completely hidden or grayed out
   - Users cannot RSVP for disabled dates

### API Endpoints (Future)

```javascript
// Get enabled dates for next N days
GET /api/rsvp/enabled-dates?days=30

Response:
{
  "enabledDates": [
    "2025-11-17",
    "2025-11-18",
    "2025-11-20"
  ]
}

// Check if specific date is enabled
GET /api/rsvp/check?date=2025-11-17

Response:
{
  "date": "2025-11-17",
  "enabled": true
}
```

---

## MongoDB Integration

### Collection: RSVPSettings

```javascript
{
  _id: ObjectId,
  date: Date,
  dateOnly: "2025-11-17",  // Indexed
  enabled: Boolean,        // Default: false
  notes: String,
  lastToggledBy: ObjectId,
  lastToggledByName: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Key Indexes:**
```javascript
db.RSVPSettings.createIndex({ dateOnly: 1 }, { unique: true })
db.RSVPSettings.createIndex({ enabled: 1, date: 1 })
```

**Query Examples:**
```javascript
// Get all enabled dates
db.RSVPSettings.find({ 
  enabled: true,
  deletedAt: null 
}).sort({ date: 1 })

// Bulk update month
db.RSVPSettings.updateMany(
  { year: 2025, month: 11 },
  { $set: { enabled: true, updatedAt: new Date() } },
  { upsert: true }
)
```

---

## Security & Access Control

### Admin-Only Access
- Only users with `admin` or `manager` roles can access
- Changes tracked with user ID and name
- Audit trail maintained

### Validation Rules
- Date must be valid ISO format
- Enabled state must be boolean
- Cannot enable dates in the past (optional rule)
- Bulk operations have limits (max 365 days at once)

---

## Testing Checklist

- [ ] Load page and see current month calendar
- [ ] Navigate to previous/next month
- [ ] Click individual day to toggle (should turn green)
- [ ] Click enabled day to disable (should turn white)
- [ ] Enable entire week using Quick Week Actions
- [ ] Disable entire week
- [ ] Enable entire month
- [ ] Disable entire month
- [ ] Make changes and see "Unsaved Changes" warning
- [ ] Save changes and see confirmation
- [ ] Make changes and cancel them
- [ ] Check summary statistics update correctly
- [ ] Test on mobile device (resize browser)
- [ ] Verify today is highlighted with golden border
- [ ] Test week hover effect

---

## Future Enhancements

### Planned Features
1. **Date Range Picker**: Select arbitrary date ranges
2. **Copy Settings**: Copy one month's settings to another
3. **Templates**: Save and reuse RSVP patterns
4. **Bulk Import**: CSV/Excel import for enabling dates
5. **Calendar View Options**: Week view, multi-month view
6. **Capacity Management**: Set max RSVPs per day
7. **Time Slots**: Enable specific time slots per day
8. **Recurring Rules**: "Enable all Mondays in December"
9. **Visual Annotations**: Add notes/reasons to enabled dates
10. **Change History**: View audit log of all changes

### API Development Needed
- RESTful endpoints for CRUD operations
- Bulk operation endpoints
- Query optimization for date ranges
- Caching layer for frequently accessed dates

---

## Troubleshooting

### Issue: Changes not saving
**Solution**: Check browser console for errors, ensure localStorage isn't full

### Issue: Calendar shows wrong month
**Solution**: Refresh page, check system timezone

### Issue: Today's date not highlighting
**Solution**: Verify system date is correct, check PST timezone

### Issue: Bulk actions not working
**Solution**: Ensure you click the correct week/month buttons, check for JavaScript errors

---

## Performance Considerations

### Current (localStorage)
- ✅ Instant reads/writes
- ✅ No network latency
- ⚠️ Limited to ~5-10MB
- ⚠️ No multi-device sync

### Future (MongoDB)
- ✅ Unlimited storage
- ✅ Multi-device sync
- ✅ Backup and recovery
- ⚠️ Network latency (mitigated with caching)
- ⚠️ Requires API endpoints

**Optimization Strategies:**
- Cache enabled dates for next 90 days
- Lazy load past dates
- Debounce bulk operations
- Optimistic UI updates

---

## Summary

### What This System Provides

✅ **Complete Control**: Admins have full control over RSVP access
✅ **Default Security**: All dates locked down by default
✅ **Flexible Management**: Day/week/month level control
✅ **User-Friendly**: Intuitive calendar interface
✅ **Change Safety**: Unsaved changes tracking + cancel
✅ **Mobile-First**: Works on all devices
✅ **Audit Ready**: Track who changed what and when
✅ **Future-Proof**: Ready for customer portal integration

### Current Status
**✅ Fully Functional Admin Panel**
- Calendar view with toggle functionality
- Bulk week and month operations
- Save/cancel change management
- Mobile-responsive design
- localStorage persistence

**🔄 Next Steps**
- Build customer-facing RSVP portal
- Migrate to MongoDB Atlas
- Add API layer
- Implement user authentication
- Add capacity management

---

**Built with mobile-first design and following Community Kitchen Design Guide principles.**

