import Link from "next/link";
import { ArrowRight, UtensilsCrossed } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.welcome}>
      <div className={styles.welcomeContent}>
        <div className={styles.welcomeIcon}>
          <UtensilsCrossed size={64} strokeWidth={1.5} />
        </div>
        <h1 className={styles.welcomeTitle}>
          Community Kitchen Management
        </h1>
        <p className={styles.welcomeSubtitle}>
          Welcome to your comprehensive community kitchen management system. 
          Manage menus, events, RSVPs, users, and more - all in one place.
        </p>
        <Link href="/dashboard" className={styles.welcomeButton}>
          Go to Dashboard
          <ArrowRight size={20} strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
