'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationSettings {
  locations: string[];
  pickupLocations: string[];
}

interface LocationContextType {
  settings: LocationSettings;
  updateSettings: (newSettings: LocationSettings) => void;
  addLocation: (location: string) => void;
  addPickupLocation: (location: string) => void;
  removeLocation: (index: number) => void;
  removePickupLocation: (index: number) => void;
  editLocation: (index: number, newValue: string) => void;
  editPickupLocation: (index: number, newValue: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<LocationSettings>({
    locations: ['Masjid', 'Downtown', 'Westside', 'Eastside', 'Northside'],
    pickupLocations: ['Masjid', 'Main Center', 'West Branch', 'East Branch', 'North Branch']
  });

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('locationSettings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Ensure "Masjid" is always present
          if (!parsed.locations.includes('Masjid')) {
            parsed.locations.unshift('Masjid');
          }
          if (!parsed.pickupLocations.includes('Masjid')) {
            parsed.pickupLocations.unshift('Masjid');
          }
          setSettings(parsed);
        } catch (error) {
          console.error('Error loading location settings:', error);
        }
      }
    }
  }, []);

  // Save to localStorage whenever settings change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locationSettings', JSON.stringify(settings));
    }
  }, [settings]);

  const updateSettings = (newSettings: LocationSettings) => {
    setSettings(newSettings);
  };

  const addLocation = (location: string) => {
    if (!settings.locations.includes(location)) {
      setSettings({
        ...settings,
        locations: [...settings.locations, location]
      });
    }
  };

  const addPickupLocation = (location: string) => {
    if (!settings.pickupLocations.includes(location)) {
      setSettings({
        ...settings,
        pickupLocations: [...settings.pickupLocations, location]
      });
    }
  };

  const removeLocation = (index: number) => {
    const locationToRemove = settings.locations[index];
    
    // Don't allow removing "Masjid"
    if (locationToRemove === 'Masjid') {
      alert('Cannot delete the default "Masjid" location');
      return;
    }

    // Update recipients using this location to "Masjid"
    if (typeof window !== 'undefined') {
      const recipients = localStorage.getItem('recipients');
      if (recipients) {
        try {
          const parsed = JSON.parse(recipients);
          const updated = parsed.map((recipient: any) => {
            if (recipient.location === locationToRemove) {
              return { ...recipient, location: 'Masjid' };
            }
            return recipient;
          });
          localStorage.setItem('recipients', JSON.stringify(updated));
        } catch (error) {
          console.error('Error updating recipients:', error);
        }
      }
    }

    setSettings({
      ...settings,
      locations: settings.locations.filter((_, i) => i !== index)
    });
  };

  const removePickupLocation = (index: number) => {
    const locationToRemove = settings.pickupLocations[index];
    
    // Don't allow removing "Masjid"
    if (locationToRemove === 'Masjid') {
      alert('Cannot delete the default "Masjid" pickup location');
      return;
    }

    // Update recipients using this pickup location to "Masjid"
    if (typeof window !== 'undefined') {
      const recipients = localStorage.getItem('recipients');
      if (recipients) {
        try {
          const parsed = JSON.parse(recipients);
          const updated = parsed.map((recipient: any) => {
            if (recipient.thaliPickupLocation === locationToRemove) {
              return { ...recipient, thaliPickupLocation: 'Masjid' };
            }
            return recipient;
          });
          localStorage.setItem('recipients', JSON.stringify(updated));
        } catch (error) {
          console.error('Error updating recipients:', error);
        }
      }
    }

    setSettings({
      ...settings,
      pickupLocations: settings.pickupLocations.filter((_, i) => i !== index)
    });
  };

  const editLocation = (index: number, newValue: string) => {
    const oldValue = settings.locations[index];
    const newLocations = [...settings.locations];
    newLocations[index] = newValue;

    // Update recipients using the old location name
    if (typeof window !== 'undefined') {
      const recipients = localStorage.getItem('recipients');
      if (recipients) {
        try {
          const parsed = JSON.parse(recipients);
          const updated = parsed.map((recipient: any) => {
            if (recipient.location === oldValue) {
              return { ...recipient, location: newValue };
            }
            return recipient;
          });
          localStorage.setItem('recipients', JSON.stringify(updated));
        } catch (error) {
          console.error('Error updating recipients:', error);
        }
      }
    }

    setSettings({ ...settings, locations: newLocations });
  };

  const editPickupLocation = (index: number, newValue: string) => {
    const oldValue = settings.pickupLocations[index];
    const newPickupLocations = [...settings.pickupLocations];
    newPickupLocations[index] = newValue;

    // Update recipients using the old pickup location name
    if (typeof window !== 'undefined') {
      const recipients = localStorage.getItem('recipients');
      if (recipients) {
        try {
          const parsed = JSON.parse(recipients);
          const updated = parsed.map((recipient: any) => {
            if (recipient.thaliPickupLocation === oldValue) {
              return { ...recipient, thaliPickupLocation: newValue };
            }
            return recipient;
          });
          localStorage.setItem('recipients', JSON.stringify(updated));
        } catch (error) {
          console.error('Error updating recipients:', error);
        }
      }
    }

    setSettings({ ...settings, pickupLocations: newPickupLocations });
  };

  return (
    <LocationContext.Provider value={{
      settings,
      updateSettings,
      addLocation,
      addPickupLocation,
      removeLocation,
      removePickupLocation,
      editLocation,
      editPickupLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

