'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle,
  Save,
  RotateCcw,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useRSVP } from '../../contexts/RSVPContext';
import { getCurrentPSTDate } from '../../lib/dateUtils';
import styles from './page.module.css';

export default function RSVPManagement() {
  const {
    isDayEnabled,
    toggleDay,
    enableWeek,
    disableWeek,
    enableMonth,
    disableMonth,
    saveSettings,
    cancelChanges,
    hasUnsavedChanges,
    getSummary
  } = useRSVP();

  const [currentDate, setCurrentDate] = useState<Date>(getCurrentPSTDate());
  const [selectedMonth, setSelectedMonth] = useState<number>(getCurrentPSTDate().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentPSTDate().getFullYear());
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  // Get calendar data for the selected month
  const getCalendarDays = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
    const days: Date[] = [];
    
    // Add days from previous month to fill the first week
    const prevMonthLastDay = new Date(selectedYear, selectedMonth, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(selectedYear, selectedMonth - 1, prevMonthLastDay.getDate() - i);
      days.push(date);
    }
    
    // Add all days in the current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(selectedYear, selectedMonth, day));
    }
    
    // Add days from next month to complete the last week
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let day = 1; day <= remainingDays; day++) {
        days.push(new Date(selectedYear, selectedMonth + 1, day));
      }
    }
    
    return days;
  };

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const formatMonthYear = () => {
    const date = new Date(selectedYear, selectedMonth, 1);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric',
      timeZone: 'America/Los_Angeles'
    });
  };

  const getDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getMondayOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const formatWeekLabel = (weekStartDate: Date): string => {
    // Format as "Week of Nov 17, 2025"
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/Los_Angeles'
    };
    const formatted = weekStartDate.toLocaleDateString('en-US', options);
    return `Week of ${formatted}`;
  };

  const getWeeksInMonth = (): Date[] => {
    const weeks: Date[] = [];
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    
    let currentDate = new Date(firstDay);
    const seenWeeks = new Set<string>();
    
    // Iterate through all days in the month
    while (currentDate <= lastDay) {
      const monday = getMondayOfWeek(currentDate);
      const weekKey = monday.toISOString().split('T')[0];
      
      // Only add if we haven't seen this week yet and it's relevant to this month
      if (!seenWeeks.has(weekKey)) {
        // Check if this week has at least one day in the current month
        const weekEnd = new Date(monday);
        weekEnd.setDate(monday.getDate() + 6);
        
        if (weekEnd >= firstDay && monday <= lastDay) {
          weeks.push(new Date(monday));
          seenWeeks.add(weekKey);
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return weeks;
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const handleDayClick = (date: Date) => {
    const dateKey = getDateKey(date);
    toggleDay(dateKey);
  };

  const handleEnableWeek = (date: Date) => {
    const monday = getMondayOfWeek(date);
    enableWeek(monday);
  };

  const handleDisableWeek = (date: Date) => {
    const monday = getMondayOfWeek(date);
    disableWeek(monday);
  };

  const handleEnableMonth = () => {
    enableMonth(selectedYear, selectedMonth);
  };

  const handleDisableMonth = () => {
    disableMonth(selectedYear, selectedMonth);
  };

  const handleSave = async () => {
    await saveSettings();
    alert('RSVP settings saved successfully!');
  };

  const handleCancel = () => {
    if (confirm('Discard all unsaved changes?')) {
      cancelChanges();
    }
  };

  const summary = getSummary();
  const calendarDays = getCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeksInMonth = getWeeksInMonth();
  const todayPST = getCurrentPSTDate();

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <CalendarCheck size={32} strokeWidth={2} />
        </div>
        <div>
          <h1 className={styles.title}>RSVP Management</h1>
          <p className={styles.subtitle}>
            Control which days users can RSVP for meals
          </p>
        </div>
      </header>

      {/* Important Notice */}
      <div className={styles.notice}>
        <div className={styles.noticeIcon}>
          <CalendarIcon size={20} />
        </div>
        <div>
          <strong>Default: All days are DISABLED</strong>
          <p>Actively enable specific days, weeks, or months to allow user RSVPs. Only enabled dates will be available in the customer portal.</p>
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.legendEnabled}`}></div>
          <span>RSVP Enabled</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.legendDisabled}`}></div>
          <span>RSVP Disabled (Default)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.legendToday}`}></div>
          <span>Today</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.legendSunday}`}></div>
          <span>Sunday (No Service)</span>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className={styles.calendarHeader}>
        <div className={styles.monthNavigation}>
          <button 
            className={styles.navButton}
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className={styles.monthTitle}>{formatMonthYear()}</h2>
          <button 
            className={styles.navButton}
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Bulk Month Actions */}
        <div className={styles.bulkActions}>
          <button 
            className={styles.enableButton}
            onClick={handleEnableMonth}
            title="Enable entire month"
          >
            <CheckCircle size={16} />
            Enable Month
          </button>
          <button 
            className={styles.disableButton}
            onClick={handleDisableMonth}
            title="Disable entire month"
          >
            <XCircle size={16} />
            Disable Month
          </button>
        </div>
      </div>

      {/* Calendar and Week Actions Side by Side */}
      <div className={styles.calendarContainer}>
        {/* Calendar Grid */}
        <div className={styles.calendar}>
          {/* Week day headers */}
          <div className={styles.weekDayHeaders}>
            {weekDays.map(day => (
              <div key={day} className={styles.weekDayHeader}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className={styles.calendarGrid}>
            {calendarDays.map((date, index) => {
              const dateKey = getDateKey(date);
              const isEnabled = isDayEnabled(dateKey);
              const isToday = isSameDay(date, todayPST);
              const isSunday = date.getDay() === 0;
              const isOtherMonth = date.getMonth() !== selectedMonth;
              const monthAbbr = date.toLocaleDateString('en-US', { 
                month: 'short',
                timeZone: 'America/Los_Angeles'
              });

              return (
                <div
                  key={`${dateKey}-${index}`}
                  className={`${styles.calendarDay} 
                    ${isEnabled ? styles.dayEnabled : styles.dayDisabled}
                    ${isToday ? styles.dayToday : ''}
                    ${isSunday ? styles.daySunday : ''}
                    ${isOtherMonth ? styles.dayOtherMonth : ''}`}
                  onClick={() => !isSunday && handleDayClick(date)}
                  title={isSunday ? 'No service on Sundays' : isOtherMonth ? 'Other month' : undefined}
                >
                  <div className={styles.dayContent}>
                    <span className={styles.dayNumber}>{date.getDate()}</span>
                    <span className={styles.monthLabel}>{monthAbbr}</span>
                  </div>
                  {isEnabled && !isSunday && (
                    <div className={styles.enabledIndicator}>
                      <CheckCircle size={12} />
                    </div>
                  )}
                  {isSunday && (
                    <div className={styles.sundayIndicator}>—</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Week Actions - Right Side */}
        <div className={styles.weekActions}>
          <h3 className={styles.weekActionsTitle}>Week Actions</h3>
          <div className={styles.weekButtons}>
            {weeksInMonth.map((weekStart) => {
              const weekLabel = formatWeekLabel(weekStart);
              
              return (
                <div key={weekStart.toISOString()} className={styles.weekButtonGroup}>
                  <span className={styles.weekLabel}>{weekLabel}</span>
                  <div className={styles.weekButtonPair}>
                    <button
                      className={styles.enableWeekButton}
                      onClick={() => handleEnableWeek(weekStart)}
                      title={`Enable ${weekLabel}`}
                    >
                      <CheckCircle size={14} />
                      Enable
                    </button>
                    <button
                      className={styles.disableWeekButton}
                      onClick={() => handleDisableWeek(weekStart)}
                      title={`Disable ${weekLabel}`}
                    >
                      <XCircle size={14} />
                      Disable
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hint */}
      <div className={styles.hint}>
        <strong>Quick Actions:</strong> Click any day to toggle (Sundays disabled - no service). Use week actions or month buttons for bulk operations.
      </div>

      {/* Save/Cancel Actions */}
      <div className={styles.actions}>
        {hasUnsavedChanges && (
          <div className={styles.unsavedWarning}>
            <strong>Unsaved Changes</strong> - Save to publish your changes
          </div>
        )}
        <div className={styles.actionButtons}>
          <button
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={!hasUnsavedChanges}
          >
            <RotateCcw size={20} />
            Cancel Changes
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
          >
            <Save size={20} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
