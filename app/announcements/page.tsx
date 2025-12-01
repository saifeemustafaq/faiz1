'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import styles from './page.module.css';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  displayUntil?: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as Announcement['type'],
    isActive: true,
    displayUntil: '',
  });

  // Load announcements
  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const response = await fetch('/api/data?type=announcements');
      const data = await response.json();
      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAnnouncements = async (updatedAnnouncements: Announcement[]) => {
    setSaving(true);
    try {
      const response = await fetch('/api/data?type=announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcements: updatedAnnouncements }),
      });

      if (response.ok) {
        setAnnouncements(updatedAnnouncements);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving announcements:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = () => {
    setModalMode('add');
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      message: '',
      type: 'info',
      isActive: true,
      displayUntil: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setModalMode('edit');
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      isActive: announcement.isActive,
      displayUntil: announcement.displayUntil || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    const updated = announcements.filter(a => a.id !== id);
    await saveAnnouncements(updated);
  };

  const handleToggleActive = async (id: string) => {
    const updated = announcements.map(a =>
      a.id === id ? { ...a, isActive: !a.isActive, updatedAt: new Date().toISOString() } : a
    );
    await saveAnnouncements(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    let updated: Announcement[];
    const timestamp = new Date().toISOString();

    if (modalMode === 'add') {
      const newAnnouncement: Announcement = {
        id: `ann_${Date.now()}`,
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        isActive: formData.isActive,
        createdAt: timestamp,
        updatedAt: timestamp,
        displayUntil: formData.displayUntil || undefined,
      };
      updated = [...announcements, newAnnouncement];
    } else if (editingAnnouncement) {
      updated = announcements.map(a =>
        a.id === editingAnnouncement.id
          ? {
              ...a,
              title: formData.title.trim(),
              message: formData.message.trim(),
              type: formData.type,
              isActive: formData.isActive,
              updatedAt: timestamp,
              displayUntil: formData.displayUntil || undefined,
            }
          : a
      );
    } else {
      return;
    }

    const success = await saveAnnouncements(updated);
    if (success) {
      setIsModalOpen(false);
      setFormData({
        title: '',
        message: '',
        type: 'info',
        isActive: true,
        displayUntil: '',
      });
    }
  };

  const getTypeColor = (type: Announcement['type']) => {
    switch (type) {
      case 'info': return '#3B82F6';
      case 'warning': return '#F59E0B';
      case 'success': return '#10B981';
      case 'urgent': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTypeLabel = (type: Announcement['type']) => {
    switch (type) {
      case 'info': return 'Info';
      case 'warning': return 'Warning';
      case 'success': return 'Success';
      case 'urgent': return 'Urgent';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading announcements...</div>
      </div>
    );
  }

  const activeAnnouncements = announcements.filter(a => a.isActive);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <Megaphone size={32} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Announcements</h1>
            <p className={styles.subtitle}>
              Manage public-facing announcements for the community dashboard
            </p>
          </div>
        </div>
        <button 
          className={styles.addButton} 
          onClick={handleAddNew}
          disabled={saving}
        >
          <Plus size={20} strokeWidth={2} />
          Add Announcement
        </button>
      </header>

      {/* Stats */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{announcements.length}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{activeAnnouncements.length}</span>
          <span className={styles.statLabel}>Active</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{announcements.length - activeAnnouncements.length}</span>
          <span className={styles.statLabel}>Inactive</span>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Megaphone size={64} strokeWidth={1.5} />
          </div>
          <h2 className={styles.emptyTitle}>No Announcements</h2>
          <p className={styles.emptyText}>
            Create your first announcement to display on the public-facing dashboard
          </p>
          <button className={styles.emptyButton} onClick={handleAddNew}>
            <Plus size={20} />
            Create Announcement
          </button>
        </div>
      ) : (
        <div className={styles.announcementsList}>
          {announcements
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map((announcement) => (
              <div
                key={announcement.id}
                className={`${styles.announcementCard} ${
                  !announcement.isActive ? styles.inactive : ''
                }`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderLeft}>
                    <span
                      className={styles.typeBadge}
                      style={{ background: getTypeColor(announcement.type) }}
                    >
                      {getTypeLabel(announcement.type)}
                    </span>
                    <h3 className={styles.announcementTitle}>{announcement.title}</h3>
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.iconButton}
                      onClick={() => handleToggleActive(announcement.id)}
                      title={announcement.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {announcement.isActive ? (
                        <Eye size={16} />
                      ) : (
                        <EyeOff size={16} />
                      )}
                    </button>
                    <button
                      className={styles.iconButton}
                      onClick={() => handleEdit(announcement)}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className={`${styles.iconButton} ${styles.deleteButton}`}
                      onClick={() => handleDelete(announcement.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className={styles.announcementMessage}>{announcement.message}</p>

                <div className={styles.cardMeta}>
                  <span className={styles.metaItem}>
                    Created: {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                  {announcement.displayUntil && (
                    <span className={styles.metaItem}>
                      Display until: {new Date(announcement.displayUntil).toLocaleDateString()}
                    </span>
                  )}
                  {!announcement.isActive && (
                    <span className={styles.inactiveBadge}>Inactive</span>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === 'add' ? 'Add New Announcement' : 'Edit Announcement'}
              </h2>
              <button
                className={styles.closeButton}
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>
                  Title <span className={styles.required}>*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  className={styles.input}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter announcement title"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>
                  Message <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="message"
                  className={styles.textarea}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter announcement message"
                  rows={4}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="type" className={styles.label}>
                    Type
                  </label>
                  <select
                    id="type"
                    className={styles.select}
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as Announcement['type'] })
                    }
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="displayUntil" className={styles.label}>
                    Display Until (Optional)
                  </label>
                  <input
                    id="displayUntil"
                    type="date"
                    className={styles.input}
                    value={formData.displayUntil}
                    onChange={(e) => setFormData({ ...formData, displayUntil: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className={styles.checkbox}
                  />
                  <span>Active (visible on public dashboard)</span>
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : modalMode === 'add' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

