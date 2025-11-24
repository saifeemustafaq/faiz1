/**
 * Type definitions for RSVP Management
 */

export interface RSVPDayStatus {
  date: string;              // ISO date string YYYY-MM-DD
  enabled: boolean;          // Default: false
  notes?: string;            // Optional admin notes
  updatedAt?: string;        // Last modified timestamp
  updatedBy?: string;        // Admin who last modified
}

export interface RSVPSettings {
  [dateKey: string]: RSVPDayStatus;
}

export interface RSVPSummary {
  totalEnabled: number;
  totalDisabled: number;
  enabledDates: string[];
  lastSaved: string;
}

