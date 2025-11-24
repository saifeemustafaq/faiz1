'use client';

import { useState } from 'react';
import { Calendar, Clock, Trash2, Edit, Plus } from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { formatDayLabel, getCurrentPSTDate } from '../../lib/dateUtils';
import EventModal from '../../components/EventModal';
import styles from './page.module.css';

export default function ManageEvents() {
  const { menuState, deleteEvent, addEvent, updateEvent } = useMenu();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedDateKey, setSelectedDateKey] = useState<string>('');
  const [editingEvent, setEditingEvent] = useState<{ details: string; time?: string } | null>(null);

  // Extract all events from menu state
  const events = Object.entries(menuState)
    .filter(([_, data]) => data.isEvent && data.event?.details)
    .map(([dateKey, data]) => ({
      dateKey,
      date: new Date(dateKey),
      details: data.event?.details || '',
      time: data.event?.time,
      data
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const handleAddEvent = () => {
    // Don't set a default date, let user choose
    setSelectedDateKey('');
    setModalMode('add');
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (dateKey: string, details: string, time?: string) => {
    setSelectedDateKey(dateKey);
    setModalMode('edit');
    setEditingEvent({ details, time });
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (dateKey: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEvent(dateKey);
    }
  };

  const handleSaveEvent = (details: string, time?: string, dateKey?: string) => {
    if (modalMode === 'add') {
      if (dateKey) {
        addEvent(dateKey, details, time);
      }
    } else {
      updateEvent(selectedDateKey, details, time);
    }
    setIsModalOpen(false);
  };

  const getDateLabel = (dateKey: string) => {
    const date = new Date(dateKey);
    return formatDayLabel(date);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <Calendar size={32} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Manage Events</h1>
            <p className={styles.subtitle}>View and manage all community events</p>
          </div>
        </div>
        <button className={styles.addButton} onClick={handleAddEvent}>
          <Plus size={20} strokeWidth={2} />
          Add Event
        </button>
      </header>

      {events.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Calendar size={64} strokeWidth={1.5} />
          </div>
          <h2 className={styles.emptyTitle}>No Events Scheduled</h2>
          <p className={styles.emptyText}>
            Click "Add Event" to create a new event, or add events from the Menu Management page.
          </p>
        </div>
      ) : (
        <div className={styles.eventsGrid}>
          {events.map(({ dateKey, date, details, time }) => (
            <div key={dateKey} className={styles.eventCard}>
              <div className={styles.eventHeader}>
                <div className={styles.eventDate}>
                  <div className={styles.eventDay}>{date.getDate()}</div>
                  <div className={styles.eventMonth}>
                    {date.toLocaleDateString('en-US', { 
                      month: 'short',
                      timeZone: 'America/Los_Angeles'
                    })}
                  </div>
                </div>
                <div className={styles.eventInfo}>
                  <h3 className={styles.eventName}>{details}</h3>
                  <p className={styles.eventDateLabel}>
                    <Calendar size={14} />
                    {formatDayLabel(date)}
                  </p>
                </div>
              </div>

              {time && (
                <div className={styles.eventMeta}>
                  <div className={styles.metaItem}>
                    <Clock size={16} />
                    <span>{time}</span>
                  </div>
                </div>
              )}

              <div className={styles.eventActions}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEditEvent(dateKey, details, time)}
                  title="Edit event"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteEvent(dateKey)}
                  title="Delete event"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Section */}
      {events.length > 0 && (
        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Event Summary</h2>
          <div className={styles.summaryStats}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{events.length}</div>
              <div className={styles.statLabel}>Total Events</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {events.filter(e => e.date >= new Date()).length}
              </div>
              <div className={styles.statLabel}>Upcoming</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {events.filter(e => e.date < new Date()).length}
              </div>
              <div className={styles.statLabel}>Past</div>
            </div>
          </div>
        </div>
      )}

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        initialDetails={editingEvent?.details || ''}
        initialTime={editingEvent?.time || ''}
        initialDate={selectedDateKey}
        dateLabel={selectedDateKey ? getDateLabel(selectedDateKey) : ''}
        mode={modalMode}
        allowDateEdit={modalMode === 'add'}
      />
    </div>
  );
}

