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
  formatDateKey
} from '../../lib/dateUtils';
import styles from './page.module.css';

export default function MenuManagement() {
  const [currentMonday, setCurrentMonday] = useState<Date | null>(null);
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const { menuState, savedSummary, updateDay, clearDay, clearAllDays, saveMenu, toggleEventMode } = useMenu();

  // Initialize with current week on mount
  useEffect(() => {
    const today = getCurrentPSTDate();
    const monday = getMondayOfWeek(today);
    setCurrentMonday(monday);
    setWeekDays(getWeekDays(monday));
  }, []);

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
      updateDay(dateKey, {
        ...current,
        isEvent: false,
        menuItems: {
          ...current.menuItems,
          [field]: value
        } as any
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
    if (currentMonday) {
      const weekHeader = formatWeekHeader(currentMonday);
      const dateKeys = weekDays.map(day => formatDateKey(day));
      saveMenu(weekHeader, dateKeys);
    }
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
          <div className={styles.headerCell} style={{ width: '180px' }}>Actions</div>
        </div>

        {weekDays.map((day, index) => {
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
                    <input
                      type="text"
                      className={styles.menuInput}
                      placeholder="Item 1"
                      value={dayData?.menuItems?.item1 || ''}
                      onChange={(e) => handleInputChange(dateKey, 'item1', e.target.value)}
                    />
                  </div>
                  <div className={styles.inputCell}>
                    <input
                      type="text"
                      className={styles.menuInput}
                      placeholder="Item 2"
                      value={dayData?.menuItems?.item2 || ''}
                      onChange={(e) => handleInputChange(dateKey, 'item2', e.target.value)}
                    />
                  </div>
                  <div className={styles.inputCell}>
                    <input
                      type="text"
                      className={styles.menuInput}
                      placeholder="Item 3"
                      value={dayData?.menuItems?.item3 || ''}
                      onChange={(e) => handleInputChange(dateKey, 'item3', e.target.value)}
                    />
                  </div>
                </>
              )}

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
              const date = new Date(day.date);
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
