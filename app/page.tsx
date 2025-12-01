'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UtensilsCrossed, 
  Calendar, 
  Clock, 
  MapPin,
  Users,
  ChefHat,
  Info,
  AlertCircle,
  CheckCircle,
  Megaphone,
  ExternalLink,
  CalendarCheck,
  LogIn,
  X
} from 'lucide-react';
import styles from './page.module.css';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

interface RSVPSettings {
  rsvpSettings: {
    [date: string]: boolean;
  };
}

export default function Home() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [rsvpSettings, setRsvpSettings] = useState<RSVPSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginTab, setLoginTab] = useState<'mumin' | 'admin'>('mumin');
  const [itsId, setItsId] = useState('');
  const [password, setPassword] = useState('');

  // Load active announcements and RSVP settings
  useEffect(() => {
    Promise.all([
      fetch('/api/announcements/active').then(res => res.json()),
      fetch('/api/data?type=rsvpSettings').then(res => res.json())
    ])
      .then(([announcementsData, rsvpData]) => {
        setAnnouncements(announcementsData.announcements || []);
        console.log('RSVP Data loaded:', rsvpData);
        setRsvpSettings(rsvpData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setLoading(false);
      });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just redirect to dashboard
    router.push('/dashboard');
  };

  // Check if RSVP is currently open - Show ALL enabled dates (past, present, or future)
  const getOpenRSVPDates = () => {
    if (!rsvpSettings?.rsvpSettings) {
      console.log('No RSVP settings found');
      return null;
    }
    
    console.log('All RSVP settings:', rsvpSettings.rsvpSettings);
    
    // Get all enabled dates without filtering by date
    const enabledDates = Object.entries(rsvpSettings.rsvpSettings)
      .filter(([_, enabled]) => enabled === true)
      .map(([dateStr, _]) => {
        // Parse date string in YYYY-MM-DD format
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day, 0, 0, 0, 0);
        return { dateStr, date };
      })
      .filter(({ date, dateStr }) => {
        const isValid = !isNaN(date.getTime());
        console.log(`Date ${dateStr}: valid=${isValid}`);
        return isValid;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ date }) => date);

    console.log('All enabled dates:', enabledDates.map(d => d.toISOString().split('T')[0]));
    
    if (enabledDates.length === 0) {
      console.log('No enabled dates found');
      return null;
    }

    const result = {
      startDate: enabledDates[0],
      endDate: enabledDates[enabledDates.length - 1],
      count: enabledDates.length
    };
    
    console.log('Open RSVP window:', {
      start: result.startDate.toISOString().split('T')[0],
      end: result.endDate.toISOString().split('T')[0],
      count: result.count
    });
    
    return result;
  };

  const openRSVP = getOpenRSVPDates();

  const getAnnouncementIcon = (type: Announcement['type']) => {
    switch (type) {
      case 'info': return <Info size={20} />;
      case 'warning': return <AlertCircle size={20} />;
      case 'success': return <CheckCircle size={20} />;
      case 'urgent': return <Megaphone size={20} />;
      default: return <Info size={20} />;
    }
  };

  return (
    <div className={styles.landingPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <UtensilsCrossed size={32} strokeWidth={2} />
            <div className={styles.logoTextContainer}>
              <span className={styles.logoText}>Anjuman - e - Jamali</span>
              <span className={styles.logoLocation}>San Jose, CA</span>
            </div>
          </div>
          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className={styles.loginButton}
          >
            <LogIn size={20} strokeWidth={2} />
            Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.mainLayout}>
        {/* Left Sidebar - Quick Links */}
        <aside className={styles.leftSidebar}>
          <div className={styles.sidebarCard}>
            <h2 className={styles.sidebarTitle}>Quick Links</h2>
            
            <nav className={styles.quickLinks}>
              <a href="#about" className={styles.quickLink}>
                <Info size={20} strokeWidth={2} />
                <span>About Us</span>
              </a>
              <a href="#schedule" className={styles.quickLink}>
                <Calendar size={20} strokeWidth={2} />
                <span>Schedule</span>
              </a>
              <a href="#menu" className={styles.quickLink}>
                <ChefHat size={20} strokeWidth={2} />
                <span>This Week's Menu</span>
              </a>
              <a href="#location" className={styles.quickLink}>
                <MapPin size={20} strokeWidth={2} />
                <span>Location</span>
              </a>
              <a href="#volunteer" className={styles.quickLink}>
                <Users size={20} strokeWidth={2} />
                <span>Volunteer</span>
              </a>
            </nav>

            <div className={styles.contactInfo}>
              <h3 className={styles.contactTitle}>Contact</h3>
              <p className={styles.contactItem}>
                <Clock size={16} />
                Mon-Fri: 9AM-5PM
              </p>
              <p className={styles.contactItem}>
                <MapPin size={16} />
                San Jose, CA
              </p>
            </div>
          </div>
        </aside>

        {/* Center Content - Scrollable */}
        <main className={styles.centerContent}>
          {/* Hero Section */}
          <section className={styles.hero}>
            <div className={styles.heroIcon}>
              <UtensilsCrossed size={64} strokeWidth={2} />
            </div>
            <h1 className={styles.heroTitle}>
              Welcome to Anjuman - e - Jamali
            </h1>
            <p className={styles.heroSubtitle}>
              Serving our community with love, one meal at a time
            </p>
          </section>

          {/* About Section */}
          <section id="about" className={styles.contentSection}>
            <h2 className={styles.sectionTitle}>About Us</h2>
            <div className={styles.card}>
              <p className={styles.cardText}>
                Anjuman - e - Jamali is dedicated to providing nutritious meals 
                to our community members in San Jose. We believe in the power of 
                sharing food and building connections through communal dining.
              </p>
              <p className={styles.cardText}>
                Every meal is prepared with care by our dedicated volunteers using 
                fresh, quality ingredients. We serve the community with respect, 
                dignity, and warmth.
              </p>
            </div>
          </section>

          {/* Schedule Section */}
          <section id="schedule" className={styles.contentSection}>
            <h2 className={styles.sectionTitle}>Schedule</h2>
            <div className={styles.card}>
              <div className={styles.scheduleGrid}>
                <div className={styles.scheduleItem}>
                  <div className={styles.scheduleDay}>Monday - Friday</div>
                  <div className={styles.scheduleTime}>
                    <Clock size={16} />
                    12:00 PM - 2:00 PM
                  </div>
                  <div className={styles.scheduleDetails}>Lunch Service</div>
                </div>
                <div className={styles.scheduleItem}>
                  <div className={styles.scheduleDay}>Saturday</div>
                  <div className={styles.scheduleTime}>
                    <Clock size={16} />
                    12:00 PM - 3:00 PM
                  </div>
                  <div className={styles.scheduleDetails}>Weekend Special</div>
                </div>
                <div className={styles.scheduleItem}>
                  <div className={styles.scheduleDay}>Sunday</div>
                  <div className={styles.scheduleTime}>
                    <Clock size={16} />
                    Closed
                  </div>
                  <div className={styles.scheduleDetails}>Rest Day</div>
                </div>
              </div>
            </div>
          </section>

          {/* Menu Section */}
          <section id="menu" className={styles.contentSection}>
            <h2 className={styles.sectionTitle}>This Week's Menu</h2>
            <div className={styles.card}>
              <p className={styles.cardText}>
                <ChefHat size={20} strokeWidth={2} style={{ display: 'inline', marginRight: '8px' }} />
                Check back soon for this week's delicious menu!
              </p>
              <p className={styles.cardText}>
                We update our menu weekly with seasonal dishes and community favorites.
              </p>
            </div>
          </section>

          {/* Location Section */}
          <section id="location" className={styles.contentSection}>
            <h2 className={styles.sectionTitle}>Location</h2>
            <div className={styles.card}>
              <div className={styles.locationInfo}>
                <MapPin size={24} strokeWidth={2} />
                <div>
                  <h3 className={styles.locationTitle}>Anjuman - e - Jamali</h3>
                  <p className={styles.locationAddress}>
                    San Jose, CA
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Volunteer Section */}
          <section id="volunteer" className={styles.contentSection}>
            <h2 className={styles.sectionTitle}>Volunteer With Us</h2>
            <div className={styles.card}>
              <p className={styles.cardText}>
                <Users size={20} strokeWidth={2} style={{ display: 'inline', marginRight: '8px' }} />
                We're always looking for helping hands! Whether you can cook, 
                serve, or help with setup and cleanup, every contribution matters.
              </p>
              <p className={styles.cardText}>
                Interested in volunteering? Contact us through the admin portal 
                or stop by during service hours.
              </p>
            </div>
          </section>
        </main>

        {/* Right Sidebar - Announcements */}
        <aside className={styles.rightSidebar}>
          <div className={styles.sidebarCard}>
            <h2 className={styles.sidebarTitle}>
              <Megaphone size={20} strokeWidth={2} />
              Announcements
            </h2>
            
            <div className={styles.announcementsContainer}>
              {loading ? (
                <div className={styles.announcementPlaceholder}>
                  Loading announcements...
                </div>
              ) : announcements.length === 0 ? (
                <div className={styles.announcementEmpty}>
                  <Info size={32} strokeWidth={1.5} />
                  <p>No announcements at this time</p>
                </div>
              ) : (
                announcements.map(announcement => (
                  <div 
                    key={announcement.id} 
                    className={`${styles.announcement} ${styles[`announcement${announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}`]}`}
                  >
                    <div className={styles.announcementHeader}>
                      {getAnnouncementIcon(announcement.type)}
                      <h3 className={styles.announcementTitle}>
                        {announcement.title}
                      </h3>
                    </div>
                    <p className={styles.announcementMessage}>
                      {announcement.message}
                    </p>
                    <div className={styles.announcementDate}>
                      {new Date(announcement.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* RSVP Window Status - Always Visible */}
            <div className={styles.rsvpWindow}>
              <h3 className={styles.rsvpTitle}>
                <CalendarCheck size={20} strokeWidth={2} />
                {openRSVP ? 'RSVP Open' : 'RSVP Status'}
              </h3>
              <div className={styles.rsvpContent}>
                {openRSVP ? (
                  <>
                    <p className={styles.rsvpText}>
                      RSVP is now open for:
                    </p>
                    <p className={styles.rsvpDates}>
                      {openRSVP.startDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      {openRSVP.startDate.toDateString() !== openRSVP.endDate.toDateString() && (
                        <>
                          {' - '}
                          {openRSVP.endDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </>
                      )}
                    </p>
                    <p className={styles.rsvpCount}>
                      {openRSVP.count} {openRSVP.count === 1 ? 'day' : 'days'} available
                    </p>
                    <button 
                      className={styles.rsvpButton}
                      onClick={() => setIsLoginModalOpen(true)}
                    >
                      Login to RSVP
                    </button>
                  </>
                ) : (
                  <>
                    <p className={styles.rsvpTextClosed}>
                      RSVP is currently closed
                    </p>
                    <p className={styles.rsvpMessage}>
                      Check back soon for upcoming RSVP dates. You'll be able to reserve your meals once the RSVP window opens.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Anjuman - e - Jamali &copy; {new Date().getFullYear()} - San Jose, CA
        </p>
      </footer>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsLoginModalOpen(false)}>
          <div className={styles.loginModal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={() => setIsLoginModalOpen(false)}
            >
              <X size={24} />
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <LogIn size={32} strokeWidth={2} />
              </div>
              <h2 className={styles.modalTitle}>Login</h2>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${loginTab === 'mumin' ? styles.tabActive : ''}`}
                onClick={() => setLoginTab('mumin')}
              >
                Mumin Login
              </button>
              <button
                className={`${styles.tab} ${loginTab === 'admin' ? styles.tabActive : ''}`}
                onClick={() => setLoginTab('admin')}
              >
                Admin Login
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label htmlFor="itsId" className={styles.label}>
                  ITS ID
                </label>
                <input
                  id="itsId"
                  type="text"
                  className={styles.input}
                  value={itsId}
                  onChange={(e) => setItsId(e.target.value)}
                  placeholder="Enter your ITS ID"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button type="submit" className={styles.loginSubmitButton}>
                <LogIn size={20} strokeWidth={2} />
                Login as {loginTab === 'mumin' ? 'Mumin' : 'Admin'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
