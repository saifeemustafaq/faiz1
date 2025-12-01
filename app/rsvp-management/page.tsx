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
  Calendar as CalendarIcon,
  Check,
  X
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

  // Get calendar data for the selected month (Monday-Saturday only, no Sundays)
  const getCalendarDays = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const days: Date[] = [];
    
    // Calculate how many days from previous month to show (excluding Sunday)
    // If month starts on Sunday (0), start from Monday (show 0 days from prev month)
    // If month starts on Monday (1), show 0 days from prev month
    // If month starts on Tuesday (2), show 1 day from prev month (Monday)
    // etc.
    const daysFromPrevMonth = startingDayOfWeek === 0 ? 0 : startingDayOfWeek - 1;
    
    // Add days from previous month to fill the first week (Monday start)
    const prevMonthLastDay = new Date(selectedYear, selectedMonth, 0);
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(selectedYear, selectedMonth - 1, prevMonthLastDay.getDate() - i);
      if (date.getDay() !== 0) { // Skip Sundays
        days.push(date);
      }
    }
    
    // Add all days in the current month (skip Sundays)
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      if (date.getDay() !== 0) { // Skip Sundays
        days.push(date);
      }
    }
    
    // Add days from next month to complete the last week (up to Saturday, skip Sundays)
    const lastDayOfWeek = days[days.length - 1].getDay();
    if (lastDayOfWeek !== 6) { // If last day is not Saturday
      const daysToAdd = 6 - lastDayOfWeek;
      for (let day = 1; day <= daysToAdd; day++) {
        const date = new Date(selectedYear, selectedMonth + 1, day);
        if (date.getDay() !== 0) { // Skip Sundays
          days.push(date);
        }
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
    // Always show the Monday of the week
    const monday = getMondayOfWeek(weekStartDate);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Los_Angeles'
    };
    const formatted = monday.toLocaleDateString('en-US', options);
    return formatted;
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

  const isWeekEnabled = (weekStart: Date): boolean => {
    // Check if all Monday-Saturday days in the week are enabled
    let enabledCount = 0;
    const totalDays = 6; // Monday to Saturday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      
      if (day.getDay() !== 0) { // Not Sunday (Mon-Sat only)
        const dateKey = getDateKey(day);
        if (isDayEnabled(dateKey)) {
          enabledCount++;
        }
      }
    }
    
    // Consider week enabled if all 6 days (Mon-Sat) are enabled
    return enabledCount === totalDays;
  };

  const getWeekRSVPData = (weekStart: Date) => {
    // Placeholder data - will be connected to actual RSVP data later
    // TODO: Fetch actual RSVP data from API based on weekStart date
    const medium = 0; // Placeholder
    const large = 0; // Placeholder
    const average = Math.ceil(large + (medium * 0.75));
    
    return { medium, large, average };
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

  const handleToggleWeek = (date: Date) => {
    const monday = getMondayOfWeek(date);
    if (isWeekEnabled(monday)) {
      disableWeek(monday);
    } else {
      enableWeek(monday);
    }
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
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // No Sunday
  const weeksInMonth = getWeeksInMonth();
  const todayPST = getCurrentPSTDate();

  // Group calendar days by week for rendering (6 days per week: Mon-Sat)
  const weekGroups: Date[][] = [];
  for (let i = 0; i < calendarDays.length; i += 6) {
    weekGroups.push(calendarDays.slice(i, i + 6));
  }

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
          <p>Actively enable specific days, weeks, or months to allow user RSVPs. Only enabled dates will be available in the customer portal. Note: Sundays are excluded (no service on Sundays).</p>
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
          <div className={`${styles.legendBox} ${styles.legendOtherMonth}`}></div>
          <span>Other Month</span>
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

      {/* Calendar and RSVP Count Side by Side */}
      <div className={styles.calendarContainer}>
        {/* Calendar Grid with Inline Week Controls */}
        <div className={styles.calendar}>
          {/* Week day headers with toggle column */}
          <div className={styles.weekDayHeaders}>
            <div className={styles.weekToggleHeader}>Week</div>
            {weekDays.map(day => (
              <div key={day} className={styles.weekDayHeader}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar weeks with inline toggle */}
          <div className={styles.calendarWeeks}>
            {weekGroups.map((week, weekIndex) => {
              // Get the Monday of this week
              const weekStart = getMondayOfWeek(week[0]);
              const weekEnabled = isWeekEnabled(weekStart);

              return (
                <div 
                  key={`week-${weekIndex}`} 
                  className={styles.weekRow}
                >
                  {/* Week Toggle Switch */}
                  <button
                    className={`${styles.weekToggleSwitch} ${weekEnabled ? styles.weekToggleSwitchEnabled : ''}`}
                    onClick={() => handleToggleWeek(weekStart)}
                    title={weekEnabled ? 'Click to disable week (Mon-Sat)' : 'Click to enable week (Mon-Sat)'}
                    role="switch"
                    aria-checked={weekEnabled}
                  >
                    <span className={styles.weekToggleSlider}></span>
                  </button>

                  {/* Days in the week (Mon-Sat only) */}
                  {week.map((date, dayIndex) => {
                    const dateKey = getDateKey(date);
                    const isEnabled = isDayEnabled(dateKey);
                    const isToday = isSameDay(date, todayPST);
                    const isOtherMonth = date.getMonth() !== selectedMonth;
                    const monthAbbr = date.toLocaleDateString('en-US', { 
                      month: 'short',
                      timeZone: 'America/Los_Angeles'
                    });

                    return (
                      <div
                        key={`${dateKey}-${dayIndex}`}
                        className={`${styles.calendarDay} 
                          ${isEnabled ? styles.dayEnabled : styles.dayDisabled}
                          ${isToday ? styles.dayToday : ''}
                          ${isOtherMonth ? styles.dayOtherMonth : ''}`}
                        onClick={() => handleDayClick(date)}
                        title={isOtherMonth ? `${monthAbbr} ${date.getDate()}` : undefined}
                      >
                        <div className={styles.dayContent}>
                          <span className={styles.dayNumber}>{date.getDate()}</span>
                          <span className={styles.monthLabel}>{monthAbbr}</span>
                        </div>
                        {isEnabled && (
                          <div className={styles.enabledIndicator}>
                            <CheckCircle size={12} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* RSVP Count Table - Right Side */}
        <div className={styles.rsvpCount}>
          <div className={styles.rsvpCountHeader}>
            <h3 className={styles.rsvpCountTitle}>RSVP Count</h3>
            <div className={styles.rsvpCountNote}>
              <small>Avg = ⌈Large + (Med × 0.75)⌉</small>
            </div>
          </div>
          
          {/* Table Header */}
          <div className={styles.rsvpTableHeader}>
            <div className={styles.rsvpTableHeaderCell}>Week</div>
            <div className={styles.rsvpTableHeaderCell}>Med</div>
            <div className={styles.rsvpTableHeaderCell}>Large</div>
            <div className={styles.rsvpTableHeaderCell}>Avg</div>
          </div>

          {/* Table Rows - One per week, aligned with calendar */}
          <div className={styles.rsvpTableBody}>
            {weekGroups.map((week, weekIndex) => {
              const weekStart = getMondayOfWeek(week[0]);
              const weekLabel = formatWeekLabel(weekStart);
              const rsvpData = getWeekRSVPData(weekStart);

              return (
                <div key={`rsvp-week-${weekIndex}`} className={styles.rsvpTableRow}>
                  <div className={styles.rsvpTableCell}>{weekLabel}</div>
                  <div className={styles.rsvpTableCell}>{rsvpData.medium}</div>
                  <div className={styles.rsvpTableCell}>{rsvpData.large}</div>
                  <div className={`${styles.rsvpTableCell} ${styles.rsvpTableCellAvg}`}>
                    {rsvpData.average}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hint */}
      <div className={styles.hint}>
        <strong>Quick Actions:</strong> Click any day to toggle individually. Use the <Check size={14} style={{display: 'inline', verticalAlign: 'middle'}} />/<X size={14} style={{display: 'inline', verticalAlign: 'middle'}} /> icons to enable/disable entire weeks (Mon-Sat), or use month buttons for bulk operations. Note: Sundays are not shown as there is no service.
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
