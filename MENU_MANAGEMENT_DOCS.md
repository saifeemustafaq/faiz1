# Menu Management System - Complete Documentation

## Overview

A comprehensive weekly menu management system with event scheduling capabilities. The system features PST timezone support, bidirectional synchronization between menu and events, and a mobile-first responsive design.

## Key Features

### ✅ Week Navigation
- Display current week starting Monday (no Sunday)
- Format: "Week of November 17, 2025"
- Left/right arrow navigation
- All dates calculated in Pacific Time Zone (PST)

### ✅ Menu Table (Monday - Saturday)
- 6 rows (Mon-Sat only, Sunday excluded)
- No visible grid lines (clean borderless design)
- **Column 1**: Day label (uneditable) - "Mon - Nov 17"
- **Columns 2-4**: Editable inputs for menu items (Item 1, Item 2, Item 3)

### ✅ Event Mode
- Convert any day to event mode with "Event" button
- Single wide text box for event details
- Subtle yellow background (#FFF9E6) to indicate event mode
- Toggle back to menu mode with same button

### ✅ Action Buttons
**Per Row:**
- **Event**: Toggle between menu and event mode
- **Clear**: Clear all inputs for that specific day

**Bottom Actions:**
- **Save Menu**: Save current state and display summary
- **Clear All**: Clear all inputs for entire week

### ✅ Bidirectional Sync
- Events created in Menu Management appear in Manage Events
- Events deleted in Manage Events update Menu Management
- Real-time synchronization using React Context
- Persistent storage with localStorage

### ✅ Saved Menu Summary
After saving:
- Display week header
- Show save timestamp (PST)
- List all menu items and events for the week
- Highlight empty days

## File Structure

```
app/
├── menu-management/
│   ├── page.tsx                    # Menu management page
│   └── page.module.css             # Menu page styles
├── manage-events/
│   ├── page.tsx                    # Events display page
│   └── page.module.css             # Events page styles
└── layout.tsx                      # Root layout with MenuProvider

contexts/
└── MenuContext.tsx                 # Global state management

lib/
└── dateUtils.ts                    # PST timezone utilities

types/
└── menu.ts                         # TypeScript type definitions
```

## Technical Implementation

### 1. Date Utilities (`lib/dateUtils.ts`)

All date calculations use Pacific Time Zone:

```typescript
getCurrentPSTDate()       // Get current date in PST
getMondayOfWeek(date)     // Get Monday of any week
formatWeekHeader(monday)  // "Week of November 17, 2025"
formatDayLabel(date)      // "Mon - Nov 17"
getWeekDays(monday)       // Array of Mon-Sat dates
addWeeks(date, n)         // Add/subtract weeks
formatDateKey(date)       // "2025-11-17" for storage
```

### 2. Type Definitions (`types/menu.ts`)

```typescript
interface MenuItem {
  item1: string;
  item2: string;
  item3: string;
}

interface EventItem {
  eventName: string;
}

interface DayData {
  date: string;           // ISO format
  isEvent: boolean;       // Menu or event mode
  menuItems?: MenuItem;   // Present when isEvent=false
  event?: EventItem;      // Present when isEvent=true
}
```

### 3. Context API (`contexts/MenuContext.tsx`)

Global state management with localStorage persistence:

```typescript
useMenu() returns:
  - menuState: MenuState
  - savedSummary: SavedMenuSummary | null
  - updateDay(dateKey, data)
  - clearDay(dateKey)
  - clearAllDays(dateKeys)
  - saveMenu(weekOf, dateKeys)
  - toggleEventMode(dateKey, isEvent)
```

**Storage:**
- `menuState` → localStorage key: `menuState`
- `savedSummary` → localStorage key: `savedMenuSummary`

### 4. Menu Management Page

**Features:**
- Week navigation with PST dates
- 6-row table (Mon-Sat)
- Editable inputs with focus states
- Event mode toggle
- Row and bulk actions
- Save with summary display

**Key Components:**
```tsx
// Week Header
<WeekNavigation>
  <PrevButton /> <WeekTitle /> <NextButton />
</WeekNavigation>

// Table Row (Normal Mode)
<DayLabel /> <Input1 /> <Input2 /> <Input3 /> <Actions />

// Table Row (Event Mode)
<DayLabel /> <WideEventInput /> <Actions />

// Bottom Actions
<SaveButton /> <ClearAllButton />

// Summary (after save)
<SavedMenuSummary />
```

### 5. Manage Events Page

**Features:**
- Display all events from menuState
- Event cards with date, name, and metadata
- Edit button (navigates to Menu Management)
- Delete button (removes event, converts to menu day)
- Summary statistics (Total, Upcoming, Past)
- Empty state with call-to-action

**Synchronization:**
- Reads from `menuState` context
- Filters for `isEvent: true`
- Sorted chronologically
- Real-time updates when menu changes

## Design Specifications

### Color Palette

**Event Row Background:**
```css
background: #FFF9E6; /* Subtle yellow tint */
```

**Action Buttons:**
- Event button: Golden (#D4AF37)
- Clear button: Red outline (#8B3A3A)
- Save button: Green (#2D5016)
- Delete button: Red (#8B3A3A)

### Layout Behavior

**Desktop (≥1024px):**
```css
grid-template-columns: 140px 1fr 1fr 1fr 180px;
/* Day | Item1 | Item2 | Item3 | Actions */
```

**Mobile (<768px):**
```css
grid-template-columns: 1fr;
/* Stacked layout with labels */
```

### Typography

**Week Header:**
- Desktop: 1.5rem (24px)
- Tablet: 1.25rem (20px)
- Mobile: 1rem (16px)

**Input Fields:**
- Font size: 0.875rem (14px)
- Padding: 8px 12px

## Usage Guide

### Creating a Menu

1. Navigate to `/menu-management`
2. Use arrows to select desired week
3. Enter menu items in Item 1, Item 2, Item 3 columns
4. Click "Save Menu" to commit changes
5. View saved summary below the table

### Creating an Event

1. Navigate to `/menu-management`
2. Find the day you want to convert
3. Click "Event" button in the Actions column
4. Enter event details in the wide text box
5. Click "Save Menu"
6. Event appears in `/manage-events`

### Managing Events

**Via Menu Management:**
- Toggle event/menu mode with "Event" button
- Edit event name directly in event input
- Clear event with "Clear" button
- Save changes

**Via Manage Events:**
- View all events in card format
- Click "Edit" to go to Menu Management
- Click "Delete" to remove event
- Deletion converts day back to menu mode

### Clearing Data

**Single Day:**
- Click "Clear" button on specific row
- Clears inputs but preserves mode (menu/event)

**Entire Week:**
- Click "Clear All" button at bottom
- Clears all inputs for all 6 days
- Preserves mode settings

## Timezone Handling

All dates use **Pacific Time Zone (America/Los_Angeles)**:

```javascript
// Example: Current date in PST
const pstDate = new Date().toLocaleString('en-US', { 
  timeZone: 'America/Los_Angeles' 
});

// All date formatting includes PST timezone
date.toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'America/Los_Angeles'
});
```

**Important:** User's local timezone is ignored. All calculations use PST regardless of user location.

## Data Persistence

### LocalStorage Schema

**Menu State:**
```json
{
  "2025-11-17": {
    "date": "2025-11-17",
    "isEvent": false,
    "menuItems": {
      "item1": "Spaghetti",
      "item2": "Caesar Salad",
      "item3": "Garlic Bread"
    }
  },
  "2025-11-18": {
    "date": "2025-11-18",
    "isEvent": true,
    "event": {
      "eventName": "Thanksgiving Dinner"
    }
  }
}
```

**Saved Summary:**
```json
{
  "weekOf": "Week of November 17, 2025",
  "savedAt": "2025-11-18T10:30:00.000Z",
  "days": [
    /* Array of DayData objects */
  ]
}
```

## Mobile-First Responsive Design

### Breakpoints

```css
Mobile:  < 768px   (default styles)
Tablet:  768px+    (2-column grids)
Desktop: 1024px+   (multi-column layouts)
```

### Mobile Optimizations

**Menu Table:**
- Headers hidden on mobile
- Each row becomes card-like
- Stacked inputs with labels
- Touch-friendly buttons (48px+)

**Events Grid:**
- 1 column on mobile
- 2 columns on tablet
- 3 columns on desktop

## Accessibility

✅ **Semantic HTML:** `<nav>`, `<header>`, `<main>`, `<table>` semantics
✅ **ARIA Labels:** All icon buttons have descriptive labels
✅ **Keyboard Navigation:** Full tab/enter support
✅ **Focus Indicators:** Golden 2px outlines
✅ **Touch Targets:** 44px+ minimum
✅ **Color Contrast:** WCAG AA compliant

## Future Enhancements

### Potential Features
- [ ] Drag-and-drop menu item reordering
- [ ] Template system for recurring menus
- [ ] Print-friendly menu view
- [ ] RSVP integration with events
- [ ] Bulk import/export (CSV)
- [ ] Nutrition information per item
- [ ] Image uploads for menu items
- [ ] Multi-week view
- [ ] Calendar integration (iCal export)
- [ ] Email notifications for events

### Backend Integration
Currently uses localStorage. For production:
- Replace with API calls to backend
- Add authentication/authorization
- Implement real-time sync (WebSocket)
- Add conflict resolution
- Backup and recovery

## Troubleshooting

### Events not showing in Manage Events
- Ensure event name is not empty
- Check that `isEvent: true` in menuState
- Verify localStorage hasn't been cleared

### Dates showing wrong timezone
- All utilities use PST explicitly
- Browser timezone is intentionally ignored
- Verify `timeZone: 'America/Los_Angeles'` in all date formatters

### Summary not displaying
- Click "Save Menu" button
- Check browser console for errors
- Verify localStorage permissions

### Mobile menu not responsive
- Clear browser cache
- Check CSS media queries
- Ensure viewport meta tag is present

## Performance Considerations

**Optimizations:**
- Debounced input handling (prevents excessive re-renders)
- Memoized date calculations
- Lazy loading for event images (future)
- LocalStorage for instant load times

**Limits:**
- No practical limit on menu items
- Recommended: Keep event names under 100 characters
- LocalStorage limit: ~5-10MB (plenty for menu data)

---

## Quick Reference

### Key Routes
- `/menu-management` - Create and edit weekly menus
- `/manage-events` - View and manage events
- `/dashboard` - Overview and statistics

### Key Shortcuts
- **Arrow Keys**: Navigate week (when header focused)
- **Tab**: Move between inputs
- **Enter**: Submit forms
- **Escape**: Close modals (future)

### Key Files to Modify
- **Add new menu fields**: Update `types/menu.ts` → `MenuItem`
- **Change date format**: Edit `lib/dateUtils.ts` functions
- **Modify colors**: Update CSS variables in `globals.css`
- **Add actions**: Extend `MenuContext.tsx` methods

---

**Built with mobile-first design principles and following the Community Kitchen Design Guide.**

