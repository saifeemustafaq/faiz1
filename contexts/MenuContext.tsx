'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuState, DayData, SavedMenuSummary } from '../types/menu';

interface MenuContextType {
  menuState: MenuState;
  savedSummary: SavedMenuSummary | null;
  updateDay: (dateKey: string, data: DayData) => void;
  clearDay: (dateKey: string) => void;
  clearAllDays: (dateKeys: string[]) => void;
  saveMenu: (weekOf: string, dateKeys: string[]) => void;
  toggleEventMode: (dateKey: string, isEvent: boolean) => void;
  addEvent: (dateKey: string, details: string, time?: string) => void;
  updateEvent: (dateKey: string, details: string, time?: string) => void;
  deleteEvent: (dateKey: string) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuState, setMenuState] = useState<MenuState>({});
  const [savedSummary, setSavedSummary] = useState<SavedMenuSummary | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('menuState');
      if (saved) {
        try {
          setMenuState(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse menu state:', e);
        }
      }

      const savedSum = localStorage.getItem('savedMenuSummary');
      if (savedSum) {
        try {
          setSavedSummary(JSON.parse(savedSum));
        } catch (e) {
          console.error('Failed to parse saved summary:', e);
        }
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('menuState', JSON.stringify(menuState));
    }
  }, [menuState]);

  const updateDay = (dateKey: string, data: DayData) => {
    setMenuState(prev => ({
      ...prev,
      [dateKey]: data
    }));
  };

  const clearDay = (dateKey: string) => {
    setMenuState(prev => {
      const newState = { ...prev };
      if (newState[dateKey]) {
        if (newState[dateKey].isEvent) {
          newState[dateKey] = {
            ...newState[dateKey],
            event: { details: '', time: '' }
          };
        } else {
          newState[dateKey] = {
            ...newState[dateKey],
            menuItems: { item1: '', item2: '', item3: '' }
          };
        }
      }
      return newState;
    });
  };

  const clearAllDays = (dateKeys: string[]) => {
    setMenuState(prev => {
      const newState = { ...prev };
      dateKeys.forEach(key => {
        if (newState[key]) {
          if (newState[key].isEvent) {
            newState[key] = {
              ...newState[key],
              event: { details: '', time: '' }
            };
          } else {
            newState[key] = {
              ...newState[key],
              menuItems: { item1: '', item2: '', item3: '' }
            };
          }
        }
      });
      return newState;
    });
  };

  const saveMenu = (weekOf: string, dateKeys: string[]) => {
    const days = dateKeys.map(key => menuState[key] || {
      date: key,
      isEvent: false,
      menuItems: { item1: '', item2: '', item3: '' }
    });

    const summary: SavedMenuSummary = {
      weekOf,
      savedAt: new Date().toISOString(),
      days
    };

    setSavedSummary(summary);
    if (typeof window !== 'undefined') {
      localStorage.setItem('savedMenuSummary', JSON.stringify(summary));
    }
  };

  const toggleEventMode = (dateKey: string, isEvent: boolean) => {
    setMenuState(prev => {
      const current = prev[dateKey] || {
        date: dateKey,
        isEvent: false,
        menuItems: { item1: '', item2: '', item3: '' }
      };

      return {
        ...prev,
        [dateKey]: {
          ...current,
          isEvent,
          menuItems: isEvent ? undefined : (current.menuItems || { item1: '', item2: '', item3: '' }),
          event: isEvent ? (current.event || { details: '', time: '' }) : undefined
        }
      };
    });
  };

  const addEvent = (dateKey: string, details: string, time?: string) => {
    setMenuState(prev => ({
      ...prev,
      [dateKey]: {
        date: dateKey,
        isEvent: true,
        event: { details, time }
      }
    }));
  };

  const updateEvent = (dateKey: string, details: string, time?: string) => {
    setMenuState(prev => {
      const current = prev[dateKey];
      if (!current || !current.isEvent) return prev;
      
      return {
        ...prev,
        [dateKey]: {
          ...current,
          event: { details, time }
        }
      };
    });
  };

  const deleteEvent = (dateKey: string) => {
    setMenuState(prev => {
      const newState = { ...prev };
      delete newState[dateKey];
      return newState;
    });
  };

  return (
    <MenuContext.Provider value={{
      menuState,
      savedSummary,
      updateDay,
      clearDay,
      clearAllDays,
      saveMenu,
      toggleEventMode,
      addEvent,
      updateEvent,
      deleteEvent
    }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}

