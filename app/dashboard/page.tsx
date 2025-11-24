'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Calendar, 
  Package,
  UtensilsCrossed,
  Tag,
  Store,
  Ruler,
  CalendarCheck,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { parseDateKey, formatDayLabel, getCurrentPSTDate } from '../../lib/dateUtils';
import styles from './page.module.css';

interface InventoryData {
  products: any[];
  categories: any[];
  stores: any[];
  units: any[];
}

export default function Dashboard() {
  const { menuState } = useMenu();
  const [inventoryData, setInventoryData] = useState<InventoryData>({
    products: [],
    categories: [],
    stores: [],
    units: []
  });
  const [recipients, setRecipients] = useState<any[]>([]);

  // Load inventory data
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const [productsRes, categoriesRes, storesRes, unitsRes] = await Promise.all([
          fetch('/api/data?type=products'),
          fetch('/api/data?type=categories'),
          fetch('/api/data?type=stores'),
          fetch('/api/data?type=units')
        ]);

        const [products, categories, stores, units] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          storesRes.json(),
          unitsRes.json()
        ]);

        setInventoryData({
          products: products.products || [],
          categories: categories.categories || [],
          stores: stores.stores || [],
          units: units.units || []
        });
      } catch (error) {
        console.error('Error loading inventory:', error);
      }
    };

    loadInventory();
  }, []);

  // Load recipients from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recipients');
    if (saved) {
      try {
        setRecipients(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading recipients:', e);
      }
    }
  }, []);

  // Get upcoming events
  const upcomingEvents = Object.entries(menuState)
    .filter(([_, data]) => data.isEvent && data.event?.details)
    .map(([dateKey, data]) => ({
      dateKey,
      date: parseDateKey(dateKey),
      details: data.event?.details || '',
      time: data.event?.time
    }))
    .filter(event => event.date >= getCurrentPSTDate())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 4);

  // Get this week's menu items count
  const thisWeekMenus = Object.entries(menuState)
    .filter(([_, data]) => !data.isEvent && (data.menuItems?.item1 || data.menuItems?.item2 || data.menuItems?.item3))
    .length;

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Welcome to Community Kitchen Management</p>
      </header>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <Link href="/thali-recipients" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#8FBC8F' }}>
            <Users size={24} strokeWidth={2} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Thali Recipients</p>
            <p className={styles.statValue}>{recipients.length}</p>
            <p className={styles.statChange}>
              <ArrowRight size={14} /> View all recipients
            </p>
          </div>
        </Link>

        <Link href="/manage-events" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#E5C158' }}>
            <Calendar size={24} strokeWidth={2} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Upcoming Events</p>
            <p className={styles.statValue}>{upcomingEvents.length}</p>
            <p className={styles.statChange}>
              <ArrowRight size={14} /> Manage events
            </p>
          </div>
        </Link>

        <Link href="/add-new-items" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#D4AF37' }}>
            <Package size={24} strokeWidth={2} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Inventory Products</p>
            <p className={styles.statValue}>{inventoryData.products.length}</p>
            <p className={styles.statChange}>
              <ArrowRight size={14} /> View inventory
            </p>
          </div>
        </Link>

        <Link href="/menu-management" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#8FBC8F' }}>
            <UtensilsCrossed size={24} strokeWidth={2} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>This Week's Menus</p>
            <p className={styles.statValue}>{thisWeekMenus}</p>
            <p className={styles.statChange}>
              <ArrowRight size={14} /> Manage menus
            </p>
          </div>
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className={styles.twoColumn}>
        {/* Inventory Summary */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Inventory Overview</h2>
            <Link href="/add-new-items" className={styles.viewAllLink}>
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.inventoryGrid}>
            <Link href="/add-new-items?tab=products" className={styles.inventoryItem}>
              <div className={styles.inventoryIcon} style={{ background: '#8FBC8F' }}>
                <Package size={20} />
              </div>
              <div className={styles.inventoryContent}>
                <p className={styles.inventoryValue}>{inventoryData.products.length}</p>
                <p className={styles.inventoryLabel}>Products</p>
              </div>
            </Link>

            <Link href="/add-new-items?tab=categories" className={styles.inventoryItem}>
              <div className={styles.inventoryIcon} style={{ background: '#E5C158' }}>
                <Tag size={20} />
              </div>
              <div className={styles.inventoryContent}>
                <p className={styles.inventoryValue}>{inventoryData.categories.length}</p>
                <p className={styles.inventoryLabel}>Categories</p>
              </div>
            </Link>

            <Link href="/add-new-items?tab=stores" className={styles.inventoryItem}>
              <div className={styles.inventoryIcon} style={{ background: '#D4AF37' }}>
                <Store size={20} />
              </div>
              <div className={styles.inventoryContent}>
                <p className={styles.inventoryValue}>{inventoryData.stores.length}</p>
                <p className={styles.inventoryLabel}>Stores</p>
              </div>
            </Link>

            <Link href="/add-new-items?tab=units" className={styles.inventoryItem}>
              <div className={styles.inventoryIcon} style={{ background: '#CC7A2D' }}>
                <Ruler size={20} />
              </div>
              <div className={styles.inventoryContent}>
                <p className={styles.inventoryValue}>{inventoryData.units.length}</p>
                <p className={styles.inventoryLabel}>Units</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Upcoming Events</h2>
            <Link href="/manage-events" className={styles.viewAllLink}>
              View All <ArrowRight size={16} />
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className={styles.emptyState}>
              <Calendar size={48} strokeWidth={1.5} style={{ opacity: 0.3 }} />
              <p className={styles.emptyText}>No upcoming events</p>
              <Link href="/manage-events" className={styles.emptyLink}>
                Add your first event
              </Link>
            </div>
          ) : (
            <div className={styles.eventList}>
              {upcomingEvents.map(({ dateKey, date, details, time }) => (
                <div key={dateKey} className={styles.eventItem}>
                  <div className={styles.eventDate}>
                    <span className={styles.eventDay}>{date.getDate()}</span>
                    <span className={styles.eventMonth}>
                      {date.toLocaleDateString('en-US', { 
                        month: 'short',
                        timeZone: 'America/Los_Angeles'
                      })}
                    </span>
                  </div>
                  <div className={styles.eventDetails}>
                    <h3 className={styles.eventName}>{details}</h3>
                    <p className={styles.eventInfo}>
                      {formatDayLabel(date)}
                      {time && ` • ${time}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Quick Actions */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Quick Actions</h2>
        <div className={styles.quickActions}>
          <Link href="/thali-recipients" className={styles.actionButton}>
            <Users size={20} />
            Manage Recipients
          </Link>
          <Link href="/manage-events" className={styles.actionButton}>
            <Calendar size={20} />
            Create Event
          </Link>
          <Link href="/menu-management" className={styles.actionButton}>
            <UtensilsCrossed size={20} />
            Update Menu
          </Link>
          <Link href="/rsvp-management" className={styles.actionButton}>
            <CalendarCheck size={20} />
            RSVP Settings
          </Link>
          <Link href="/add-new-items" className={styles.actionButton}>
            <Package size={20} />
            Add Products
          </Link>
          <Link href="/manage-roles" className={styles.actionButton}>
            <Users size={20} />
            Manage Roles
          </Link>
        </div>
      </section>
    </div>
  );
}

