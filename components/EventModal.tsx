'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './EventModal.module.css';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: string, time?: string, dateKey?: string) => void;
  initialDetails?: string;
  initialTime?: string;
  initialDate?: string;
  dateLabel?: string;
  mode: 'add' | 'edit';
  allowDateEdit?: boolean;
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  initialDetails = '',
  initialTime = '',
  initialDate = '',
  dateLabel = '',
  mode,
  allowDateEdit = false
}: EventModalProps) {
  const [details, setDetails] = useState(initialDetails);
  const [time, setTime] = useState(initialTime);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  useEffect(() => {
    setDetails(initialDetails);
    setTime(initialTime);
    setSelectedDate(initialDate);
  }, [initialDetails, initialTime, initialDate, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSave = () => {
    if (!details.trim()) {
      alert('Please enter event details');
      return;
    }
    if (mode === 'add' && !selectedDate) {
      alert('Please select a date for the event');
      return;
    }
    onSave(details.trim(), time.trim() || undefined, selectedDate || undefined);
    handleClose();
  };

  const handleClose = () => {
    setDetails('');
    setTime('');
    setSelectedDate('');
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === 'add' ? 'Add Event' : 'Edit Event'}
          </h2>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close modal"
          >
            <X size={24} strokeWidth={2} />
          </button>
        </div>

        {/* Date Label (if provided) */}
        {dateLabel && !allowDateEdit && (
          <div className={styles.dateLabel}>
            {dateLabel}
          </div>
        )}

        {/* Form */}
        <div className={styles.form}>
          {/* Date Picker for Add Mode */}
          {mode === 'add' && (
            <div className={styles.formGroup}>
              <label htmlFor="event-date" className={styles.label}>
                Date <span className={styles.required}>*</span>
              </label>
              <input
                id="event-date"
                type="date"
                className={styles.input}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="event-details" className={styles.label}>
              Details <span className={styles.required}>*</span>
            </label>
            <textarea
              id="event-details"
              className={styles.textarea}
              placeholder="Enter event description..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="event-time" className={styles.label}>
              Time <span className={styles.optional}>(optional)</span>
            </label>
            <input
              id="event-time"
              type="text"
              className={styles.input}
              placeholder="e.g., 6:00 PM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button 
            className={styles.cancelButton}
            onClick={handleClose}
          >
            Cancel
          </button>
          <button 
            className={styles.saveButton}
            onClick={handleSave}
          >
            {mode === 'add' ? 'Add Event' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

