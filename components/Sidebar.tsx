'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  UtensilsCrossed, 
  CalendarCheck, 
  Calendar, 
  ShieldCheck, 
  Users, 
  ShoppingCart, 
  Plus,
  Settings,
  ChefHat,
  Megaphone
} from 'lucide-react';
import sidebarConfig from '../config/sidebar.json';
import styles from './Sidebar.module.css';

// Icon mapping
const iconMap: { [key: string]: any } = {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarCheck,
  Calendar,
  ShieldCheck,
  Users,
  ShoppingCart,
  Plus,
  Settings,
  ChefHat,
  Megaphone,
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className={styles.menuButton} 
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className={styles.overlay} 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Community Kitchen</h2>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {sidebarConfig.sidebarItems.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = pathname === item.route;

              return (
                <li key={item.id}>
                  <Link 
                    href={item.route}
                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    onClick={closeSidebar}
                  >
                    {Icon && <Icon size={20} strokeWidth={2} />}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}

