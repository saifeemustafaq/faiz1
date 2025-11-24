/**
 * Date utility functions for Menu Management
 * All dates are calculated in Pacific Time Zone (PST/PDT)
 */

/**
 * Get the current date in PST timezone
 */
export function getCurrentPSTDate(): Date {
  const now = new Date();
  // Convert to PST by using toLocaleString with Pacific timezone
  const pstString = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  return new Date(pstString);
}

/**
 * Get Monday of the week for a given date in PST
 */
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // If Sunday (0), go back 6 days; otherwise go back to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format date as "Week of Month Date, Year"
 * Example: "Week of November 17, 2025"
 */
export function formatWeekHeader(mondayDate: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    timeZone: 'America/Los_Angeles'
  };
  return `Week of ${mondayDate.toLocaleDateString('en-US', options)}`;
}

/**
 * Format date as "Day - Mon Date"
 * Example: "Mon - Nov 17"
 */
export function formatDayLabel(date: Date): string {
  const dayOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'short',
    timeZone: 'America/Los_Angeles'
  };
  const dateOptions: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric',
    timeZone: 'America/Los_Angeles'
  };
  
  const dayName = date.toLocaleDateString('en-US', dayOptions);
  const dateStr = date.toLocaleDateString('en-US', dateOptions);
  
  return `${dayName} - ${dateStr}`;
}

/**
 * Get an array of dates for Monday through Saturday of a given week
 */
export function getWeekDays(mondayDate: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 6; i++) { // Monday (0) through Saturday (5)
    const day = new Date(mondayDate);
    day.setDate(mondayDate.getDate() + i);
    days.push(day);
  }
  return days;
}

/**
 * Add weeks to a date
 */
export function addWeeks(date: Date, weeks: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + (weeks * 7));
  return newDate;
}

/**
 * Format date as ISO string for keys (YYYY-MM-DD) in PST
 */
export function formatDateKey(date: Date): string {
  // Format in PST timezone to avoid timezone shifts
  const pstDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const year = pstDate.getFullYear();
  const month = String(pstDate.getMonth() + 1).padStart(2, '0');
  const day = String(pstDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a date key (YYYY-MM-DD) back to a Date object in PST
 */
export function parseDateKey(dateKey: string): Date {
  // Parse as PST date to avoid timezone shifts
  // Add time component to ensure it's interpreted correctly
  const pstString = `${dateKey}T12:00:00`;
  const date = new Date(pstString);
  // Convert to PST
  const pstDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  return pstDate;
}

