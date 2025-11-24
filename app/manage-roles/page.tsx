'use client';

import { ShieldCheck, Plus, Edit2, Trash2, Key, Search, Filter } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import styles from './page.module.css';

interface Permission {
  id: string;
  label: string;
  description: string;
  category: string;
}

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  permissions: string[];
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

type ModalMode = 'add' | 'edit' | 'resetPassword' | null;

export default function ManageRoles() {
  // Available permissions (extensible)
  const allPermissions: Permission[] = [
    // Menu Management
    { id: 'menu_view', label: 'View Menu', description: 'View menu items and weekly menus', category: 'Menu Management' },
    { id: 'menu_edit', label: 'Modify Menu Items', description: 'Add, edit, and delete menu items', category: 'Menu Management' },
    { id: 'menu_publish', label: 'Publish Menu', description: 'Publish and save weekly menus', category: 'Menu Management' },
    
    // Events Management
    { id: 'events_view', label: 'View Events', description: 'View community events', category: 'Events Management' },
    { id: 'events_edit', label: 'Modify Events', description: 'Add, edit, and delete events', category: 'Events Management' },
    { id: 'events_rsvp', label: 'Manage RSVPs', description: 'View and manage event RSVPs', category: 'Events Management' },
    
    // RSVP Management
    { id: 'rsvp_view', label: 'View RSVP Settings', description: 'View RSVP availability settings', category: 'RSVP Management' },
    { id: 'rsvp_edit', label: 'Modify RSVP Settings', description: 'Enable/disable RSVP dates', category: 'RSVP Management' },
    
    // Recipients Management
    { id: 'recipients_view', label: 'View Recipients', description: 'View thali recipients list', category: 'Recipients Management' },
    { id: 'recipients_edit', label: 'Manage Recipients', description: 'Add, edit, and delete recipients', category: 'Recipients Management' },
    
    // Roles & Users
    { id: 'roles_view', label: 'View Users & Roles', description: 'View user accounts and permissions', category: 'Roles & Users' },
    { id: 'roles_manage', label: 'Manage Roles', description: 'Add, edit users and assign permissions', category: 'Roles & Users' },
    
    // Carts Management
    { id: 'carts_view', label: 'View Carts', description: 'View shopping carts', category: 'Carts Management' },
    { id: 'carts_edit', label: 'Manage Carts', description: 'Edit and manage carts', category: 'Carts Management' },
    
    // Inventory
    { id: 'inventory_view', label: 'View Items', description: 'View inventory items', category: 'Inventory' },
    { id: 'inventory_edit', label: 'Add/Edit Items', description: 'Add and edit inventory items', category: 'Inventory' },
    
    // Settings
    { id: 'settings_view', label: 'View Settings', description: 'View application settings', category: 'Settings' },
    { id: 'settings_edit', label: 'Modify Settings', description: 'Modify locations and app settings', category: 'Settings' },
    
    // Reports
    { id: 'reports_view', label: 'View Reports', description: 'View analytics and reports', category: 'Reports' },
    { id: 'reports_export', label: 'Export Reports', description: 'Export data and reports', category: 'Reports' },
  ];

  const [users, setUsers] = useState<User[]>([]);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    permissions: [] as string[],
    status: 'active' as 'active' | 'inactive'
  });

  // Password reset
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Load users from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('portalUsers');
    if (saved) {
      try {
        setUsers(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading users:', error);
      }
    } else {
      // Default admin user
      const defaultUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          fullName: 'System Administrator',
          email: 'admin@communitykitchen.org',
          role: 'Admin',
          permissions: allPermissions.map(p => p.id), // All permissions
          status: 'active',
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ];
      setUsers(defaultUsers);
    }
  }, []);

  // Save users to localStorage
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('portalUsers', JSON.stringify(users));
    }
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, filterRole, filterStatus]);

  // Unique roles for filter
  const uniqueRoles = useMemo(() => {
    return Array.from(new Set(users.map(u => u.role))).sort();
  }, [users]);

  // Group permissions by category
  const groupedPermissions = useMemo(() => {
    const groups: { [key: string]: Permission[] } = {};
    allPermissions.forEach(permission => {
      if (!groups[permission.category]) {
        groups[permission.category] = [];
      }
      groups[permission.category].push(permission);
    });
    return groups;
  }, [allPermissions]);

  const openAddModal = () => {
    setFormData({
      username: '',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      permissions: [],
      status: 'active'
    });
    setModalMode('add');
  };

  const openEditModal = (user: User) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      permissions: [...user.permissions],
      status: user.status
    });
    setModalMode('edit');
  };

  const openResetPasswordModal = (user: User) => {
    setCurrentUser(user);
    setNewPassword('');
    setConfirmNewPassword('');
    setModalMode('resetPassword');
  };

  const closeModal = () => {
    setModalMode(null);
    setCurrentUser(null);
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const selectAllInCategory = (category: string) => {
    const categoryPermissions = groupedPermissions[category].map(p => p.id);
    const allSelected = categoryPermissions.every(id => formData.permissions.includes(id));
    
    if (allSelected) {
      // Deselect all in category
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !categoryPermissions.includes(p))
      }));
    } else {
      // Select all in category
      setFormData(prev => ({
        ...prev,
        permissions: Array.from(new Set([...prev.permissions, ...categoryPermissions]))
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.username || !formData.fullName || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    if (modalMode === 'add') {
      if (!formData.password || formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      // Check username uniqueness
      if (users.some(u => u.username === formData.username)) {
        alert('Username already exists');
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions,
        status: formData.status,
        lastLogin: 'Never',
        createdAt: new Date().toISOString()
      };

      setUsers([...users, newUser]);
    } else if (modalMode === 'edit' && currentUser) {
      setUsers(users.map(u =>
        u.id === currentUser.id
          ? {
              ...u,
              username: formData.username,
              fullName: formData.fullName,
              email: formData.email,
              role: formData.role,
              permissions: formData.permissions,
              status: formData.status
            }
          : u
      ));
    }

    closeModal();
  };

  const handleResetPassword = () => {
    if (!newPassword || newPassword !== confirmNewPassword) {
      alert('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    // In real implementation, this would call API
    alert(`Password reset successful for ${currentUser?.username}`);
    closeModal();
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    
    const user = users.find(u => u.id === deleteConfirm);
    if (user?.username === 'admin') {
      alert('Cannot delete the admin account');
      return;
    }

    setUsers(users.filter(u => u.id !== deleteConfirm));
    setDeleteConfirm(null);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <ShieldCheck size={32} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Manage Roles & Users</h1>
            <p className={styles.subtitle}>Control user access and permissions</p>
          </div>
        </div>
        <button className={styles.addButton} onClick={openAddModal}>
          <Plus size={20} />
          Add User
        </button>
      </header>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by username, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.filterBox}>
            <Filter size={18} className={styles.filterIcon} />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterBox}>
            <Filter size={18} className={styles.filterIcon} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{users.length}</span>
          <span className={styles.statLabel}>Total Users</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{users.filter(u => u.status === 'active').length}</span>
          <span className={styles.statLabel}>Active Users</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{filteredUsers.length}</span>
          <span className={styles.statLabel}>Filtered Results</span>
        </div>
      </div>

      {/* Users List */}
      <div className={styles.usersContainer}>
        {filteredUsers.length === 0 ? (
          <div className={styles.emptyState}>
            <ShieldCheck size={64} strokeWidth={1.5} />
            <h3>No users found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={styles.usersList}>
            {filteredUsers.map(user => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userHeader}>
                  <div className={styles.userInfo}>
                    <h3 className={styles.userName}>{user.fullName}</h3>
                    <span className={styles.username}>@{user.username}</span>
                    <span className={`${styles.statusBadge} ${styles[user.status]}`}>
                      {user.status}
                    </span>
                  </div>
                  <div className={styles.userActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => openEditModal(user)}
                      title="Edit User"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={() => openResetPasswordModal(user)}
                      title="Reset Password"
                    >
                      <Key size={18} />
                    </button>
                    {user.username !== 'admin' && (
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => setDeleteConfirm(user.id)}
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.userDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>{user.email}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Role:</span>
                    <span className={styles.detailValue}>{user.role}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Last Login:</span>
                    <span className={styles.detailValue}>{user.lastLogin === 'Never' ? 'Never' : new Date(user.lastLogin).toLocaleString()}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Permissions:</span>
                    <span className={styles.detailValue}>{user.permissions.length} assigned</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h2>
              <button className={styles.closeButton} onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    disabled={modalMode === 'edit'}
                    placeholder="john_doe"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="john@example.com"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Role *</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                    placeholder="Manager, Staff, Volunteer, etc."
                  />
                </div>

                {modalMode === 'add' && (
                  <>
                    <div className={styles.formGroup}>
                      <label>Password *</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        placeholder="Min 8 characters"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Confirm Password *</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        placeholder="Re-enter password"
                      />
                    </div>
                  </>
                )}

                <div className={styles.formGroup}>
                  <label>Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Permissions Section */}
              <div className={styles.permissionsSection}>
                <h3 className={styles.permissionsTitle}>Assign Permissions</h3>
                <p className={styles.permissionsSubtitle}>
                  Select which features this user can access. Users can only access areas where permissions are granted.
                </p>

                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category} className={styles.permissionCategory}>
                    <div className={styles.categoryHeader}>
                      <h4>{category}</h4>
                      <button
                        type="button"
                        className={styles.selectAllBtn}
                        onClick={() => selectAllInCategory(category)}
                      >
                        {permissions.every(p => formData.permissions.includes(p.id)) ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className={styles.permissionGrid}>
                      {permissions.map(permission => (
                        <label key={permission.id} className={styles.permissionItem}>
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                          />
                          <div className={styles.permissionInfo}>
                            <span className={styles.permissionLabel}>{permission.label}</span>
                            <span className={styles.permissionDesc}>{permission.description}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {modalMode === 'add' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {modalMode === 'resetPassword' && currentUser && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Reset Password</h2>
              <button className={styles.closeButton} onClick={closeModal}>×</button>
            </div>

            <div className={styles.modalContent}>
              <p className={styles.resetInfo}>
                Resetting password for: <strong>{currentUser.username}</strong>
              </p>

              <div className={styles.formGroup}>
                <label>New Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Confirm New Password *</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter password"
                />
              </div>

              <div className={styles.modalActions}>
                <button onClick={closeModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button onClick={handleResetPassword} className={styles.saveBtn}>
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className={styles.confirmActions}>
              <button onClick={() => setDeleteConfirm(null)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleDelete} className={styles.confirmDeleteBtn}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
