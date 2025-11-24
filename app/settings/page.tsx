'use client';

import { Settings as SettingsIcon, Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import styles from './page.module.css';

type ModalType = 'addLocation' | 'addPickup' | 'editLocation' | 'editPickup' | 'viewLocations' | 'viewPickups' | null;

export default function Settings() {
  const { settings, editLocation, editPickupLocation, removeLocation, removePickupLocation, addLocation, addPickupLocation } = useLocation();

  const [modalType, setModalType] = useState<ModalType>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'location' | 'pickup' | null;
    index: number | null;
    value: string;
  }>({
    type: null,
    index: null,
    value: ''
  });

  const openAddLocationModal = () => {
    setInputValue('');
    setModalType('addLocation');
  };

  const openAddPickupModal = () => {
    setInputValue('');
    setModalType('addPickup');
  };

  const openViewLocationsModal = () => {
    setModalType('viewLocations');
  };

  const openViewPickupsModal = () => {
    setModalType('viewPickups');
  };

  const openEditModal = (type: 'location' | 'pickup', index: number, value: string) => {
    setEditIndex(index);
    setInputValue(value);
    setModalType(type === 'location' ? 'editLocation' : 'editPickup');
  };

  const closeModal = () => {
    setModalType(null);
    setEditIndex(null);
    setInputValue('');
  };

  const handleAdd = () => {
    if (!inputValue.trim()) return;

    if (modalType === 'addLocation') {
      if (settings.locations.includes(inputValue.trim())) {
        alert('This location already exists');
        return;
      }
      addLocation(inputValue.trim());
    } else if (modalType === 'addPickup') {
      if (settings.pickupLocations.includes(inputValue.trim())) {
        alert('This pickup location already exists');
        return;
      }
      addPickupLocation(inputValue.trim());
    }

    closeModal();
  };

  const handleEdit = () => {
    if (!inputValue.trim() || editIndex === null) return;

    if (modalType === 'editLocation') {
      if (settings.locations.includes(inputValue.trim()) && 
          settings.locations[editIndex] !== inputValue.trim()) {
        alert('This location already exists');
        return;
      }
      editLocation(editIndex, inputValue.trim());
    } else if (modalType === 'editPickup') {
      if (settings.pickupLocations.includes(inputValue.trim()) && 
          settings.pickupLocations[editIndex] !== inputValue.trim()) {
        alert('This pickup location already exists');
        return;
      }
      editPickupLocation(editIndex, inputValue.trim());
    }

    closeModal();
  };

  const handleDelete = () => {
    if (deleteConfirm.type === null || deleteConfirm.index === null) return;

    if (deleteConfirm.type === 'location') {
      removeLocation(deleteConfirm.index);
    } else {
      removePickupLocation(deleteConfirm.index);
    }

    setDeleteConfirm({ type: null, index: null, value: '' });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <SettingsIcon size={32} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Settings</h1>
            <p className={styles.subtitle}>Manage locations and system settings</p>
          </div>
        </div>
      </header>

      <div className={styles.sectionsContainer}>
        {/* Locations Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <MapPin size={24} />
              <div>
                <h2>Locations</h2>
                <p className={styles.sectionSubtitle}>
                  {settings.locations.length} location{settings.locations.length !== 1 ? 's' : ''} configured
                </p>
              </div>
            </div>
            <div className={styles.sectionActions}>
              <button className={styles.viewButton} onClick={openViewLocationsModal}>
                View All
              </button>
              <button className={styles.addButton} onClick={openAddLocationModal}>
                <Plus size={18} />
                Add Location
              </button>
            </div>
          </div>
        </section>

        {/* Pickup Locations Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <MapPin size={24} />
              <div>
                <h2>Thali Pickup Locations</h2>
                <p className={styles.sectionSubtitle}>
                  {settings.pickupLocations.length} pickup location{settings.pickupLocations.length !== 1 ? 's' : ''} configured
                </p>
              </div>
            </div>
            <div className={styles.sectionActions}>
              <button className={styles.viewButton} onClick={openViewPickupsModal}>
                View All
              </button>
              <button className={styles.addButton} onClick={openAddPickupModal}>
                <Plus size={18} />
                Add Pickup Location
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Add/Edit Modal */}
      {(modalType === 'addLocation' || modalType === 'addPickup' || modalType === 'editLocation' || modalType === 'editPickup') && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalType === 'addLocation' && 'Add Location'}
                {modalType === 'addPickup' && 'Add Pickup Location'}
                {modalType === 'editLocation' && 'Edit Location'}
                {modalType === 'editPickup' && 'Edit Pickup Location'}
              </h2>
              <button className={styles.closeButton} onClick={closeModal}>×</button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label>
                  {(modalType === 'addLocation' || modalType === 'editLocation') ? 'Location Name' : 'Pickup Location Name'} *
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter name"
                  className={styles.input}
                  autoFocus
                />
              </div>

              <div className={styles.modalActions}>
                <button onClick={closeModal} className={styles.cancelBtn}>Cancel</button>
                <button 
                  onClick={modalType?.startsWith('add') ? handleAdd : handleEdit} 
                  className={styles.saveBtn}
                >
                  {modalType?.startsWith('add') ? 'Add' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Locations Modal */}
      {modalType === 'viewLocations' && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>All Locations ({settings.locations.length})</h2>
              <button className={styles.closeButton} onClick={closeModal}>×</button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.itemsList}>
                {settings.locations.map((location, index) => (
                  <div key={index} className={styles.item}>
                    <span className={styles.itemName}>{location}</span>
                    <div className={styles.itemActions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => openEditModal('location', index, location)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      {location !== 'Masjid' && (
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          onClick={() => setDeleteConfirm({ type: 'location', index, value: location })}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Pickup Locations Modal */}
      {modalType === 'viewPickups' && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>All Pickup Locations ({settings.pickupLocations.length})</h2>
              <button className={styles.closeButton} onClick={closeModal}>×</button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.itemsList}>
                {settings.pickupLocations.map((location, index) => (
                  <div key={index} className={styles.item}>
                    <span className={styles.itemName}>{location}</span>
                    <div className={styles.itemActions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => openEditModal('pickup', index, location)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      {location !== 'Masjid' && (
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          onClick={() => setDeleteConfirm({ type: 'pickup', index, value: location })}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.type && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm({ type: null, index: null, value: '' })}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete <strong>{deleteConfirm.value}</strong>?
            </p>
            <p className={styles.warningText}>
              <strong>Warning:</strong> Recipients using this {deleteConfirm.type} will be automatically reassigned to "Masjid".
            </p>
            <div className={styles.confirmActions}>
              <button 
                onClick={() => setDeleteConfirm({ type: null, index: null, value: '' })} 
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button onClick={handleDelete} className={styles.confirmDeleteBtn}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
