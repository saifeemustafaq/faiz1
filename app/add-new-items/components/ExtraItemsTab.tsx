import { useState } from 'react';
import { Inbox, AlertCircle, Eye, Check, Search } from 'lucide-react';
import { ExtraItem } from '../types';
import styles from '../page.module.css';

interface ExtraItemsTabProps {
  extraItems: ExtraItem[];
  onApproveItem: (item: ExtraItem) => void;
}

export function ExtraItemsTab({
  extraItems,
  onApproveItem
}: ExtraItemsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter items based on search
  const filteredItems = extraItems.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.unit.toLowerCase().includes(term) ||
      (item.category && item.category.toLowerCase().includes(term)) ||
      (item.store && item.store.toLowerCase().includes(term))
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check for missing fields
  const hasMissingFields = (item: ExtraItem) => {
    return !item.store || !item.category;
  };

  return (
    <div className={styles.newAdditionsContainer}>
      {/* Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Summary Card */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Inbox size={24} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Pending Review</div>
            <div className={styles.summaryValue}>{extraItems.length}</div>
          </div>
        </div>
        
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: '#fff3cd', color: '#856404' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Need Attention</div>
            <div className={styles.summaryValue}>
              {extraItems.filter(hasMissingFields).length}
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className={styles.emptyState}>
          <Inbox size={64} />
          <h3>No Items Found</h3>
          <p>
            {searchTerm
              ? 'Try adjusting your search'
              : 'User-requested items will appear here for review'}
          </p>
        </div>
      ) : (
        <div className={styles.requestsList}>
          {filteredItems.map(item => (
            <div key={item.id} className={styles.requestCard}>
              <div className={styles.requestHeader}>
                <div className={styles.requestTitle}>
                  <h3>{item.name}</h3>
                  {hasMissingFields(item) && (
                    <span className={`${styles.statusBadge} ${styles.statusPending}`}>
                      <AlertCircle size={14} />
                      Needs Info
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.requestBody}>
                <div className={styles.requestMeta}>
                  <div>
                    <strong>Unit:</strong> {item.unit}
                  </div>
                  <div>
                    <strong>Category:</strong>{' '}
                    {item.category ? (
                      <span>{item.category}</span>
                    ) : (
                      <span className={styles.missingField}>Not Specified</span>
                    )}
                  </div>
                  <div>
                    <strong>Store:</strong>{' '}
                    {item.store ? (
                      <span>{item.store}</span>
                    ) : (
                      <span className={styles.missingField}>Not Specified</span>
                    )}
                  </div>
                  <div>
                    <strong>Added:</strong> {formatDate(item.addedAt)}
                  </div>
                </div>

                {hasMissingFields(item) && (
                  <div className={styles.missingFieldsWarning}>
                    <AlertCircle size={16} />
                    <span>
                      Please fill in missing information before approving this item.
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.requestActions}>
                <button
                  className={`${styles.actionButton} ${!hasMissingFields(item) ? styles.approveButton : ''}`}
                  onClick={() => onApproveItem(item)}
                  disabled={hasMissingFields(item)}
                  title={hasMissingFields(item) ? "Please complete all fields in the modal first" : "Review & Approve"}
                  style={{
                    opacity: hasMissingFields(item) ? 0.5 : 1,
                    cursor: hasMissingFields(item) ? 'not-allowed' : 'pointer',
                    borderColor: hasMissingFields(item) ? '#cbd5e1' : undefined,
                  }}
                >
                  <Check size={18} />
                  Review & Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

