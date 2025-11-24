/**
 * Type definitions for Menu Management
 */

export interface MenuItem {
  item1: string;
  item2: string;
  item3: string;
}

export interface EventItem {
  details: string;  // Event description/name
  time?: string;    // Optional time (e.g., "6:00 PM")
}

export interface DayData {
  date: string; // ISO format YYYY-MM-DD
  isEvent: boolean;
  menuItems?: MenuItem;
  event?: EventItem;
}

export interface MenuState {
  [dateKey: string]: DayData;
}

export interface SavedMenuSummary {
  weekOf: string;
  savedAt: string;
  days: DayData[];
}

