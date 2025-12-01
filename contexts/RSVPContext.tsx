'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RSVPSettings, RSVPDayStatus, RSVPSummary } from '../types/rsvp';

interface RSVPContextType {
  rsvpSettings: RSVPSettings;
  savedSettings: RSVPSettings;
  hasUnsavedChanges: boolean;
  toggleDay: (dateKey: string) => void;
  enableDays: (dateKeys: string[]) => void;
  disableDays: (dateKeys: string[]) => void;
  enableWeek: (mondayDate: Date) => void;
  disableWeek: (mondayDate: Date) => void;
  enableMonth: (year: number, month: number) => void;
  disableMonth: (year: number, month: number) => void;
  saveSettings: () => Promise<void>;
  cancelChanges: () => void;
  getSummary: () => RSVPSummary;
  isDayEnabled: (dateKey: string) => boolean;
}

const RSVPContext = createContext<RSVPContextType | undefined>(undefined);

export function RSVPProvider({ children }: { children: ReactNode }) {
  const [rsvpSettings, setRsvpSettings] = useState<RSVPSettings>({});
  const [savedSettings, setSavedSettings] = useState<RSVPSettings>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/data?type=rsvpSettings');
        const data = await response.json();
        
        if (data.rsvpSettings) {
          setRsvpSettings(data.rsvpSettings);
          setSavedSettings(data.rsvpSettings);
        }
      } catch (error) {
        console.error('Failed to load RSVP settings from API:', error);
        
        // Fallback to localStorage if API fails
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('rsvpSettings');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setRsvpSettings(parsed);
              setSavedSettings(parsed);
            } catch (e) {
              console.error('Failed to parse RSVP settings:', e);
            }
          }
        }
      }
    };
    
    loadSettings();
  }, []);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(rsvpSettings) !== JSON.stringify(savedSettings);
    setHasUnsavedChanges(hasChanges);
  }, [rsvpSettings, savedSettings]);

  const toggleDay = (dateKey: string) => {
    setRsvpSettings(prev => {
      const current = prev[dateKey];
      const newEnabled = !current?.enabled;
      
      return {
        ...prev,
        [dateKey]: {
          date: dateKey,
          enabled: newEnabled,
          updatedAt: new Date().toISOString(),
          notes: current?.notes
        }
      };
    });
  };

  const enableDays = (dateKeys: string[]) => {
    setRsvpSettings(prev => {
      const updated = { ...prev };
      dateKeys.forEach(dateKey => {
        updated[dateKey] = {
          date: dateKey,
          enabled: true,
          updatedAt: new Date().toISOString(),
          notes: prev[dateKey]?.notes
        };
      });
      return updated;
    });
  };

  const disableDays = (dateKeys: string[]) => {
    setRsvpSettings(prev => {
      const updated = { ...prev };
      dateKeys.forEach(dateKey => {
        updated[dateKey] = {
          date: dateKey,
          enabled: false,
          updatedAt: new Date().toISOString(),
          notes: prev[dateKey]?.notes
        };
      });
      return updated;
    });
  };

  const getWeekDays = (mondayDate: Date): string[] => {
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(mondayDate);
      day.setDate(mondayDate.getDate() + i);
      const dateKey = day.toISOString().split('T')[0];
      days.push(dateKey);
    }
    return days;
  };

  const enableWeek = (mondayDate: Date) => {
    const weekDays = getWeekDays(mondayDate);
    enableDays(weekDays);
  };

  const disableWeek = (mondayDate: Date) => {
    const weekDays = getWeekDays(mondayDate);
    disableDays(weekDays);
  };

  const getMonthDays = (year: number, month: number): string[] => {
    const days: string[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split('T')[0];
      days.push(dateKey);
    }
    return days;
  };

  const enableMonth = (year: number, month: number) => {
    const monthDays = getMonthDays(year, month);
    enableDays(monthDays);
  };

  const disableMonth = (year: number, month: number) => {
    const monthDays = getMonthDays(year, month);
    disableDays(monthDays);
  };

  const saveSettings = async () => {
    try {
      // Save to localStorage for backward compatibility
      if (typeof window !== 'undefined') {
        localStorage.setItem('rsvpSettings', JSON.stringify(rsvpSettings));
        localStorage.setItem('rsvpSettingsLastSaved', new Date().toISOString());
      }

      // Save to API/database
      const response = await fetch('/api/data?type=rsvpSettings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsvpSettings }),
      });

      if (!response.ok) {
        throw new Error('Failed to save RSVP settings');
      }

      setSavedSettings({ ...rsvpSettings });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving RSVP settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const cancelChanges = () => {
    setRsvpSettings({ ...savedSettings });
    setHasUnsavedChanges(false);
  };

  const getSummary = (): RSVPSummary => {
    const enabledDates = Object.entries(rsvpSettings)
      .filter(([_, status]) => status.enabled)
      .map(([date]) => date)
      .sort();
    
    const totalEnabled = enabledDates.length;
    const totalDisabled = Object.keys(rsvpSettings).length - totalEnabled;
    const lastSaved = typeof window !== 'undefined' 
      ? localStorage.getItem('rsvpSettingsLastSaved') || ''
      : '';

    return {
      totalEnabled,
      totalDisabled,
      enabledDates,
      lastSaved
    };
  };

  const isDayEnabled = (dateKey: string): boolean => {
    return rsvpSettings[dateKey]?.enabled || false;
  };

  return (
    <RSVPContext.Provider value={{
      rsvpSettings,
      savedSettings,
      hasUnsavedChanges,
      toggleDay,
      enableDays,
      disableDays,
      enableWeek,
      disableWeek,
      enableMonth,
      disableMonth,
      saveSettings,
      cancelChanges,
      getSummary,
      isDayEnabled
    }}>
      {children}
    </RSVPContext.Provider>
  );
}

export function useRSVP() {
  const context = useContext(RSVPContext);
  if (context === undefined) {
    throw new Error('useRSVP must be used within an RSVPProvider');
  }
  return context;
}

