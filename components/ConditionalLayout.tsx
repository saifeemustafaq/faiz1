'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import styles from '../app/layout.module.css';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Show sidebar for all routes except the landing page
  const showSidebar = pathname !== '/';

  if (!showSidebar) {
    // Landing page layout (no sidebar)
    return <>{children}</>;
  }

  // Admin layout (with sidebar)
  return (
    <div className={styles.appContainer}>
      <Sidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

