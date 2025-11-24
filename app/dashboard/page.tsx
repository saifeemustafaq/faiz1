import { 
  Users, 
  Calendar, 
  ShoppingCart, 
  UtensilsCrossed,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import styles from './page.module.css';

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Welcome to Community Kitchen Management</p>
      </header>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#8FBC8F' }}>
            <Users size={24} strokeWidth={2} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Users</p>
            <p className={styles.statValue}>248</p>
            <p className={styles.statChange}>
              <TrendingUp size={14} /> +12% from last month
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#E5C158' }}>
            <Calendar size={24} strokeWidth={2} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Active Events</p>
            <p className={styles.statValue}>12</p>
            <p className={styles.statChange}>
              <TrendingUp size={14} /> 3 new this week
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#D4AF37' }}>
            <ShoppingCart size={24} strokeWidth={2} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Active Carts</p>
            <p className={styles.statValue}>34</p>
            <p className={styles.statChange}>
              <TrendingUp size={14} /> 8 pending checkout
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#8FBC8F' }}>
            <UtensilsCrossed size={24} strokeWidth={2} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Menu Items</p>
            <p className={styles.statValue}>156</p>
            <p className={styles.statChange}>
              <TrendingUp size={14} /> 23 added this month
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className={styles.twoColumn}>
        {/* Recent Activity */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Recent Activity</h2>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon} style={{ background: '#8FBC8F' }}>
                <CheckCircle size={16} />
              </div>
              <div className={styles.activityContent}>
                <p className={styles.activityText}>New user registered: John Doe</p>
                <p className={styles.activityTime}>
                  <Clock size={12} /> 5 minutes ago
                </p>
              </div>
            </div>

            <div className={styles.activityItem}>
              <div className={styles.activityIcon} style={{ background: '#D4AF37' }}>
                <Calendar size={16} />
              </div>
              <div className={styles.activityContent}>
                <p className={styles.activityText}>Event created: Community Dinner</p>
                <p className={styles.activityTime}>
                  <Clock size={12} /> 1 hour ago
                </p>
              </div>
            </div>

            <div className={styles.activityItem}>
              <div className={styles.activityIcon} style={{ background: '#E5C158' }}>
                <ShoppingCart size={16} />
              </div>
              <div className={styles.activityContent}>
                <p className={styles.activityText}>Cart checked out by Sarah Smith</p>
                <p className={styles.activityTime}>
                  <Clock size={12} /> 2 hours ago
                </p>
              </div>
            </div>

            <div className={styles.activityItem}>
              <div className={styles.activityIcon} style={{ background: '#8FBC8F' }}>
                <UtensilsCrossed size={16} />
              </div>
              <div className={styles.activityContent}>
                <p className={styles.activityText}>Menu updated: 5 new items added</p>
                <p className={styles.activityTime}>
                  <Clock size={12} /> 3 hours ago
                </p>
              </div>
            </div>

            <div className={styles.activityItem}>
              <div className={styles.activityIcon} style={{ background: '#CC7A2D' }}>
                <AlertCircle size={16} />
              </div>
              <div className={styles.activityContent}>
                <p className={styles.activityText}>Low stock alert: Rice</p>
                <p className={styles.activityTime}>
                  <Clock size={12} /> 5 hours ago
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Upcoming Events</h2>
          <div className={styles.eventList}>
            <div className={styles.eventItem}>
              <div className={styles.eventDate}>
                <span className={styles.eventDay}>24</span>
                <span className={styles.eventMonth}>Nov</span>
              </div>
              <div className={styles.eventDetails}>
                <h3 className={styles.eventName}>Community Dinner</h3>
                <p className={styles.eventInfo}>6:00 PM • 85 RSVPs</p>
              </div>
            </div>

            <div className={styles.eventItem}>
              <div className={styles.eventDate}>
                <span className={styles.eventDay}>28</span>
                <span className={styles.eventMonth}>Nov</span>
              </div>
              <div className={styles.eventDetails}>
                <h3 className={styles.eventName}>Volunteer Training</h3>
                <p className={styles.eventInfo}>2:00 PM • 20 RSVPs</p>
              </div>
            </div>

            <div className={styles.eventItem}>
              <div className={styles.eventDate}>
                <span className={styles.eventDay}>01</span>
                <span className={styles.eventMonth}>Dec</span>
              </div>
              <div className={styles.eventDetails}>
                <h3 className={styles.eventName}>Thanksgiving Feast</h3>
                <p className={styles.eventInfo}>12:00 PM • 150 RSVPs</p>
              </div>
            </div>

            <div className={styles.eventItem}>
              <div className={styles.eventDate}>
                <span className={styles.eventDay}>05</span>
                <span className={styles.eventMonth}>Dec</span>
              </div>
              <div className={styles.eventDetails}>
                <h3 className={styles.eventName}>Cooking Class</h3>
                <p className={styles.eventInfo}>10:00 AM • 12 RSVPs</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Quick Actions */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Quick Actions</h2>
        <div className={styles.quickActions}>
          <button className={styles.actionButton}>
            <Users size={20} />
            Add New User
          </button>
          <button className={styles.actionButton}>
            <Calendar size={20} />
            Create Event
          </button>
          <button className={styles.actionButton}>
            <UtensilsCrossed size={20} />
            Add Menu Item
          </button>
          <button className={styles.actionButton}>
            <ShoppingCart size={20} />
            View Carts
          </button>
        </div>
      </section>
    </div>
  );
}

