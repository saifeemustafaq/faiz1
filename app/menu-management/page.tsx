'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import {
  getCurrentPSTDate,
  getMondayOfWeek,
  formatWeekHeader,
  formatDayLabel,
  getWeekDays,
  addWeeks,
  formatDateKey,
  parseDateKey
} from '../../lib/dateUtils';
import styles from './page.module.css';
import { recipeService } from '../recipe-management/services/recipeService';
import type { Recipe } from '@/types/recipe';

export default function MenuManagement() {
  const [currentMonday, setCurrentMonday] = useState<Date | null>(null);
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});
  const [rsvpSummaryByDate, setRsvpSummaryByDate] = useState<Record<string, number>>({});
  const [recipientRsvpRows, setRecipientRsvpRows] = useState<Array<{ date?: string; status?: string }>>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [weeklyRSVPCounts, setWeeklyRSVPCounts] = useState<Record<string, { medium: number; large: number }>>({});
  const { menuState, savedSummary, updateDay, clearDay, clearAllDays, saveMenu, toggleEventMode } = useMenu();

  // Initialize with current week on mount
  useEffect(() => {
    const today = getCurrentPSTDate();
    const monday = getMondayOfWeek(today);
    setCurrentMonday(monday);
    setWeekDays(getWeekDays(monday));
  }, []);

  // Load recipes for dropdowns
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const all = await recipeService.getAllRecipes();
        setRecipes(all);
      } catch (e) {
        console.error('Error loading recipes:', e);
      }
    };
    loadRecipes();
  }, []);

  // Load weekly RSVP counts from rsvp-counts.json
  useEffect(() => {
    const loadWeeklyRSVPCounts = async () => {
      try {
        const response = await fetch('/api/rsvp-counts');
        if (response.ok) {
          const data = await response.json();
          setWeeklyRSVPCounts(data.weeklyRSVPCounts || {});
        }
      } catch (error) {
        console.error('Error loading weekly RSVP counts:', error);
      }
    };
    loadWeeklyRSVPCounts();
  }, []);

  // Load RSVP counts
  useEffect(() => {
    const loadRSVPs = async () => {
      try {
        const res = await fetch('/api/data?type=recipientRsvps');
        if (!res.ok) throw new Error('Failed to fetch RSVPs');
        const data = await res.json();
        const rows: Array<{ date?: string; status?: string }> =
          Array.isArray(data.recipientRSVPs) ? data.recipientRSVPs : [];
        setRecipientRsvpRows(rows);
        const counts: Record<string, number> = {};
        for (const r of rows) {
          if (r?.date && r?.status === 'confirmed') {
            counts[r.date] = (counts[r.date] || 0) + 1;
          }
        }
        setRsvpCounts(counts);
        // Use persisted summary if present, else fall back to computed counts
        const persistedSummary: Record<string, number> = data.summaryByDate || {};
        setRsvpSummaryByDate(Object.keys(persistedSummary).length ? persistedSummary : counts);
      } catch (e) {
        console.error('Error loading RSVPs:', e);
      }
    };
    loadRSVPs();
  }, []);

  const saveRsvpSummaryForDate = async (dateKey: string, value: number) => {
    try {
      const updated = { ...rsvpSummaryByDate, [dateKey]: value };
      setRsvpSummaryByDate(updated);
      // Persist both recipient list and summary map to keep file consistent
      const response = await fetch('/api/data?type=recipientRsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientRSVPs: recipientRsvpRows,
          summaryByDate: updated,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to save RSVP summary');
      }
    } catch (err) {
      console.error('Error saving RSVP summary:', err);
    }
  };

  // Calculate average RSVP count for a date based on its week's Monday
  const getAverageRSVPForDate = (date: Date): number => {
    const monday = getMondayOfWeek(date);
    const weekKey = formatDateKey(monday);
    const weekData = weeklyRSVPCounts[weekKey];
    
    if (weekData) {
      const medium = weekData.medium || 0;
      const large = weekData.large || 0;
      const average = Math.ceil(large + (medium * 0.75));
      return average;
    }
    
    return 0;
  };

  const goToPreviousWeek = () => {
    if (currentMonday) {
      const newMonday = addWeeks(currentMonday, -1);
      setCurrentMonday(newMonday);
      setWeekDays(getWeekDays(newMonday));
    }
  };

  const goToNextWeek = () => {
    if (currentMonday) {
      const newMonday = addWeeks(currentMonday, 1);
      setCurrentMonday(newMonday);
      setWeekDays(getWeekDays(newMonday));
    }
  };

  const handleInputChange = (dateKey: string, field: 'item1' | 'item2' | 'item3' | 'details' | 'time', value: string) => {
    const current = menuState[dateKey] || {
      date: dateKey,
      isEvent: false,
      menuItems: { item1: '', item2: '', item3: '' }
    };

    if (field === 'details' || field === 'time') {
      updateDay(dateKey, {
        ...current,
        isEvent: true,
        event: {
          details: field === 'details' ? value : (current.event?.details || ''),
          time: field === 'time' ? value : current.event?.time
        }
      });
    } else {
      const items: { item1: string; item2: string; item3: string } = {
        item1: current.menuItems?.item1 || '',
        item2: current.menuItems?.item2 || '',
        item3: current.menuItems?.item3 || '',
      };
      items[field as 'item1' | 'item2' | 'item3'] = value;
      updateDay(dateKey, {
        ...current,
        isEvent: false,
        menuItems: items
      });
    }
  };

  const handleToggleEvent = (dateKey: string) => {
    const current = menuState[dateKey];
    const isCurrentlyEvent = current?.isEvent || false;
    toggleEventMode(dateKey, !isCurrentlyEvent);
  };

  const handleClearDay = (dateKey: string) => {
    clearDay(dateKey);
  };

  const handleClearAll = () => {
    const dateKeys = weekDays.map(day => formatDateKey(day));
    clearAllDays(dateKeys);
  };

  const handleSave = () => {
    const persistAll = async () => {
      try {
        // Persist current RSVP summary before saving menu (covers case when input hasn't blurred)
        await fetch('/api/data?type=recipientRsvps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientRSVPs: recipientRsvpRows,
            summaryByDate: rsvpSummaryByDate,
          }),
        });
      } catch (e) {
        console.error('Error persisting RSVP summary before save:', e);
      }
      if (currentMonday) {
        const weekHeader = formatWeekHeader(currentMonday);
        const dateKeys = weekDays.map(day => formatDateKey(day));
        saveMenu(weekHeader, dateKeys);
      }
    };
    void persistAll();
  };

  if (!currentMonday) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      {/* Header with Week Navigation */}
      <header className={styles.header}>
        <div className={styles.weekNavigation}>
          <button 
            className={styles.navButton} 
            onClick={goToPreviousWeek}
            aria-label="Previous week"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
          
          <div className={styles.weekHeader}>
            <CalendarIcon size={24} strokeWidth={2} />
            <h1 className={styles.weekTitle}>{formatWeekHeader(currentMonday)}</h1>
          </div>
          
          <button 
            className={styles.navButton} 
            onClick={goToNextWeek}
            aria-label="Next week"
          >
            <ChevronRight size={24} strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* Menu Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell} style={{ width: '140px' }}>Day</div>
          <div className={styles.headerCell}>Item 1</div>
          <div className={styles.headerCell}>Item 2</div>
          <div className={styles.headerCell}>Item 3</div>
          <div className={styles.headerCell} style={{ width: '120px' }}>RSVP Count</div>
          <div className={styles.headerCell} style={{ width: '180px' }}>Actions</div>
        </div>

        {weekDays.map((day) => {
          const dateKey = formatDateKey(day);
          const dayData = menuState[dateKey];
          const isEvent = dayData?.isEvent || false;

          return (
            <div 
              key={dateKey} 
              className={`${styles.tableRow} ${isEvent ? styles.eventRow : ''}`}
            >
              {/* Day Label */}
              <div className={styles.dayCell}>
                {formatDayLabel(day)}
              </div>

              {/* Menu Items or Event Input */}
              {isEvent ? (
                <div className={styles.eventInputCell}>
                  <div className={styles.eventInputs}>
                    <input
                      type="text"
                      className={styles.eventInput}
                      placeholder="Event details..."
                      value={dayData?.event?.details || ''}
                      onChange={(e) => handleInputChange(dateKey, 'details', e.target.value)}
                    />
                    <input
                      type="text"
                      className={styles.eventTimeInput}
                      placeholder="Time (optional)"
                      value={dayData?.event?.time || ''}
                      onChange={(e) => handleInputChange(dateKey, 'time', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.inputCell}>
                    <select
                      className={styles.menuSelect}
                      value={dayData?.menuItems?.item1 || ''}
                      onChange={(e) => handleInputChange(dateKey, 'item1', e.target.value)}
                    >
                      <option value="">Select recipe...</option>
                      {recipes.map((r) => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.inputCell}>
                    <select
                      className={styles.menuSelect}
                      value={dayData?.menuItems?.item2 || ''}
                      onChange={(e) => handleInputChange(dateKey, 'item2', e.target.value)}
                    >
                      <option value="">Select recipe...</option>
                      {recipes.map((r) => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.inputCell}>
                    <select
                      className={styles.menuSelect}
                      value={dayData?.menuItems?.item3 || ''}
                      onChange={(e) => handleInputChange(dateKey, 'item3', e.target.value)}
                    >
                      <option value="">Select recipe...</option>
                      {recipes.map((r) => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* RSVP Count */}
              <div className={styles.rsvpCell}>
                <input
                  type="number"
                  min={0}
                  className={`${styles.rsvpInput} ${styles.rsvpInputReadonly}`}
                  value={getAverageRSVPForDate(day)}
                  readOnly
                  disabled
                  aria-label={`RSVP count for ${dateKey}`}
                  title="This is calculated from RSVP Management. Edit there to change."
                />
              </div>

              {/* Action Buttons */}
              <div className={styles.actionCell}>
                <button
                  className={`${styles.actionButton} ${isEvent ? styles.activeEventButton : styles.eventButton}`}
                  onClick={() => handleToggleEvent(dateKey)}
                  title={isEvent ? "Switch to menu items" : "Convert to event"}
                >
                  {isEvent ? 'Menu' : 'Event'}
                </button>
                <button
                  className={styles.clearButton}
                  onClick={() => handleClearDay(dateKey)}
                  title="Clear this day"
                >
                  <X size={16} strokeWidth={2} />
                  Clear
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Buttons */}
      <div className={styles.bottomActions}>
        <button className={styles.saveButton} onClick={handleSave}>
          Save Menu
        </button>
        <button className={styles.clearAllButton} onClick={handleClearAll}>
          Clear All
        </button>
      </div>

      {/* Saved Summary */}
      {savedSummary && (
        <div className={styles.summaryBox}>
          <h2 className={styles.summaryTitle}>Saved Menu Summary</h2>
          <p className={styles.summaryMeta}>
            <strong>Week:</strong> {savedSummary.weekOf}<br />
            <strong>Saved At:</strong> {new Date(savedSummary.savedAt).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}
          </p>
          
          <div className={styles.summaryDays}>
            {savedSummary.days.map((day) => {
              const date = parseDateKey(day.date);
              return (
                <div key={day.date} className={styles.summaryDay}>
                  <strong>{formatDayLabel(date)}</strong>
                  {day.isEvent ? (
                    <div className={styles.summaryEvent}>
                      <div><strong>Event:</strong> {day.event?.details || '(No details)'}</div>
                      {day.event?.time && <div><strong>Time:</strong> {day.event.time}</div>}
                    </div>
                  ) : (
                    <div className={styles.summaryItems}>
                      {day.menuItems?.item1 && <div>• {day.menuItems.item1}</div>}
                      {day.menuItems?.item2 && <div>• {day.menuItems.item2}</div>}
                      {day.menuItems?.item3 && <div>• {day.menuItems.item3}</div>}
                      {!day.menuItems?.item1 && !day.menuItems?.item2 && !day.menuItems?.item3 && (
                        <div className={styles.emptyDay}>(No items)</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
