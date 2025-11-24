'use client';

import { Users, Plus, Edit2, Trash2, Calendar, Search, Filter, ArrowUpDown } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import styles from './page.module.css';

interface Recipient {
  id: string;
  name: string;
  itsNumber: string;
  mobileNumber: string;
  email: string;
  location: string;
  thaliPickupLocation: string;
}

type ModalMode = 'add' | 'edit' | null;
type SortField = 'name' | 'itsNumber' | 'email' | 'location' | 'thaliPickupLocation';
type SortOrder = 'asc' | 'desc';

export default function ThaliRecipients() {
  const { settings } = useLocation();
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  // Load recipients from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recipients');
      if (saved) {
        try {
          setRecipients(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading recipients:', error);
        }
      } else {
        // Default data if nothing in localStorage
        const defaultRecipients: Recipient[] = [
          {
            id: '1',
            name: 'Ahmed Ali',
            itsNumber: '20123456',
            mobileNumber: '(555) 123-4567',
            email: 'ahmed.ali@example.com',
            location: 'Downtown',
            thaliPickupLocation: 'Main Center'
          },
          {
            id: '2',
            name: 'Fatima Khan',
            itsNumber: '20234567',
            mobileNumber: '(555) 234-5678',
            email: 'fatima.khan@example.com',
            location: 'Westside',
            thaliPickupLocation: 'West Branch'
          },
          {
            id: '3',
            name: 'Hassan Malik',
            itsNumber: '20345678',
            mobileNumber: '(555) 345-6789',
            email: 'hassan.malik@example.com',
            location: 'Eastside',
            thaliPickupLocation: 'East Branch'
          }
        ];
        setRecipients(defaultRecipients);
      }
    }
  }, []);

  // Save recipients to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && recipients.length > 0) {
      localStorage.setItem('recipients', JSON.stringify(recipients));
    }
  }, [recipients]);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [currentRecipient, setCurrentRecipient] = useState<Recipient | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Search, Filter, Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterPickupLocation, setFilterPickupLocation] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [formData, setFormData] = useState({
    name: '',
    itsNumber: '',
    mobileNumber: '',
    email: '',
    location: '',
    thaliPickupLocation: ''
  });

  // Get unique locations for filter dropdowns
  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(recipients.map(r => r.location))).sort();
  }, [recipients]);

  const uniquePickupLocations = useMemo(() => {
    return Array.from(new Set(recipients.map(r => r.thaliPickupLocation))).sort();
  }, [recipients]);

  // Filtered and sorted recipients
  const filteredAndSortedRecipients = useMemo(() => {
    let filtered = recipients;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipient => 
        recipient.name.toLowerCase().includes(query) ||
        recipient.itsNumber.toLowerCase().includes(query) ||
        recipient.mobileNumber.toLowerCase().includes(query) ||
        recipient.email.toLowerCase().includes(query) ||
        recipient.location.toLowerCase().includes(query) ||
        recipient.thaliPickupLocation.toLowerCase().includes(query)
      );
    }

    // Apply location filter
    if (filterLocation !== 'all') {
      filtered = filtered.filter(r => r.location === filterLocation);
    }

    // Apply pickup location filter
    if (filterPickupLocation !== 'all') {
      filtered = filtered.filter(r => r.thaliPickupLocation === filterPickupLocation);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField].toLowerCase();
      const bValue = b[sortField].toLowerCase();

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return sorted;
  }, [recipients, searchQuery, filterLocation, filterPickupLocation, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterLocation('all');
    setFilterPickupLocation('all');
    setSortField('name');
    setSortOrder('asc');
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      itsNumber: '',
      mobileNumber: '',
      email: '',
      location: '',
      thaliPickupLocation: ''
    });
    setModalMode('add');
  };

  const openEditModal = (recipient: Recipient) => {
    setCurrentRecipient(recipient);
    setFormData({
      name: recipient.name,
      itsNumber: recipient.itsNumber,
      mobileNumber: recipient.mobileNumber,
      email: recipient.email,
      location: recipient.location,
      thaliPickupLocation: recipient.thaliPickupLocation
    });
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setCurrentRecipient(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'add') {
      const newRecipient: Recipient = {
        id: Date.now().toString(),
        ...formData
      };
      setRecipients([...recipients, newRecipient]);
    } else if (modalMode === 'edit' && currentRecipient) {
      setRecipients(recipients.map(r => 
        r.id === currentRecipient.id 
          ? { ...r, ...formData }
          : r
      ));
    }

    closeModal();
  };

  const handleDelete = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
    setDeleteConfirm(null);
  };

  const handleCalendarClick = (recipient: Recipient) => {
    // Functionality to be implemented later
    console.log('Calendar clicked for:', recipient.name);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Users size={32} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Thali Recipients</h1>
            <p className={styles.subtitle}>Manage people who receive daily meals</p>
          </div>
        </div>
        <button className={styles.addButton} onClick={openAddModal}>
          <Plus size={20} />
          Add Recipient
        </button>
      </header>

      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{recipients.length}</span>
          <span className={styles.statLabel}>Total Recipients</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{filteredAndSortedRecipients.length}</span>
          <span className={styles.statLabel}>Filtered Results</span>
        </div>
      </div>

      {/* Search, Filter, Sort Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, ITS, email, phone, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.filterBox}>
            <Filter size={18} className={styles.filterIcon} />
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Locations</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterBox}>
            <Filter size={18} className={styles.filterIcon} />
            <select
              value={filterPickupLocation}
              onChange={(e) => setFilterPickupLocation(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Pickup Locations</option>
              {uniquePickupLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchQuery || filterLocation !== 'all' || filterPickupLocation !== 'all') && (
          <button className={styles.clearFiltersBtn} onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div 
            className={`${styles.headerCell} ${styles.sortable}`} 
            style={{ flex: '1.5', minWidth: '150px' }}
            onClick={() => handleSort('name')}
          >
            <span>Name</span>
            <ArrowUpDown size={16} className={sortField === 'name' ? styles.activeSort : ''} />
            {sortField === 'name' && (
              <span className={styles.sortIndicator}>{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
          <div 
            className={`${styles.headerCell} ${styles.sortable}`} 
            style={{ flex: '1', minWidth: '120px' }}
            onClick={() => handleSort('itsNumber')}
          >
            <span>ITS Number</span>
            <ArrowUpDown size={16} className={sortField === 'itsNumber' ? styles.activeSort : ''} />
            {sortField === 'itsNumber' && (
              <span className={styles.sortIndicator}>{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
          <div className={styles.headerCell} style={{ flex: '1.2', minWidth: '130px' }}>Mobile Number</div>
          <div 
            className={`${styles.headerCell} ${styles.sortable}`} 
            style={{ flex: '1.5', minWidth: '200px' }}
            onClick={() => handleSort('email')}
          >
            <span>Email</span>
            <ArrowUpDown size={16} className={sortField === 'email' ? styles.activeSort : ''} />
            {sortField === 'email' && (
              <span className={styles.sortIndicator}>{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
          <div 
            className={`${styles.headerCell} ${styles.sortable}`} 
            style={{ flex: '1', minWidth: '120px' }}
            onClick={() => handleSort('location')}
          >
            <span>Location</span>
            <ArrowUpDown size={16} className={sortField === 'location' ? styles.activeSort : ''} />
            {sortField === 'location' && (
              <span className={styles.sortIndicator}>{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
          <div 
            className={`${styles.headerCell} ${styles.sortable}`} 
            style={{ flex: '1.2', minWidth: '150px' }}
            onClick={() => handleSort('thaliPickupLocation')}
          >
            <span>Thali Pick-up Location</span>
            <ArrowUpDown size={16} className={sortField === 'thaliPickupLocation' ? styles.activeSort : ''} />
            {sortField === 'thaliPickupLocation' && (
              <span className={styles.sortIndicator}>{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
          <div className={styles.headerCell} style={{ flex: '1.2', minWidth: '140px' }}>Actions</div>
        </div>

        <div className={styles.tableBody}>
          {recipients.length === 0 ? (
            <div className={styles.emptyState}>
              <Users size={64} strokeWidth={1.5} />
              <h3>No recipients yet</h3>
              <p>Click "Add Recipient" to add your first thali recipient</p>
            </div>
          ) : filteredAndSortedRecipients.length === 0 ? (
            <div className={styles.emptyState}>
              <Search size={64} strokeWidth={1.5} />
              <h3>No results found</h3>
              <p>Try adjusting your search or filters</p>
              <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            filteredAndSortedRecipients.map((recipient) => (
              <div key={recipient.id} className={styles.tableRow}>
                <div className={styles.cell} style={{ flex: '1.5', minWidth: '150px' }}>
                  <span className={styles.cellContent}>{recipient.name}</span>
                </div>
                <div className={styles.cell} style={{ flex: '1', minWidth: '120px' }}>
                  <span className={styles.cellContent}>{recipient.itsNumber}</span>
                </div>
                <div className={styles.cell} style={{ flex: '1.2', minWidth: '130px' }}>
                  <span className={styles.cellContent}>{recipient.mobileNumber}</span>
                </div>
                <div className={styles.cell} style={{ flex: '1.5', minWidth: '200px' }}>
                  <span className={styles.cellContent}>{recipient.email}</span>
                </div>
                <div className={styles.cell} style={{ flex: '1', minWidth: '120px' }}>
                  <span className={styles.cellContent}>{recipient.location}</span>
                </div>
                <div className={styles.cell} style={{ flex: '1.2', minWidth: '150px' }}>
                  <span className={styles.cellContent}>{recipient.thaliPickupLocation}</span>
                </div>
                <div className={styles.cell} style={{ flex: '1.2', minWidth: '140px' }}>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => openEditModal(recipient)}
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => setDeleteConfirm(recipient.id)}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleCalendarClick(recipient)}
                      title="Calendar"
                    >
                      <Calendar size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalMode && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{modalMode === 'add' ? 'Add New Recipient' : 'Edit Recipient'}</h2>
              <button className={styles.closeButton} onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="itsNumber">ITS Number *</label>
                <input
                  id="itsNumber"
                  type="text"
                  value={formData.itsNumber}
                  onChange={(e) => setFormData({ ...formData, itsNumber: e.target.value })}
                  required
                  placeholder="Enter ITS number"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="mobileNumber">Mobile Number *</label>
                <input
                  id="mobileNumber"
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  required
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="email@example.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="location">Location *</label>
                <select
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className={styles.select}
                >
                  <option value="">Select location</option>
                  {settings.locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="thaliPickupLocation">Thali Pick-up Location *</label>
                <select
                  id="thaliPickupLocation"
                  value={formData.thaliPickupLocation}
                  onChange={(e) => setFormData({ ...formData, thaliPickupLocation: e.target.value })}
                  required
                  className={styles.select}
                >
                  <option value="">Select pickup location</option>
                  {settings.pickupLocations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {modalMode === 'add' ? 'Add Recipient' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this recipient? This action cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button onClick={() => setDeleteConfirm(null)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className={styles.confirmDeleteBtn}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
