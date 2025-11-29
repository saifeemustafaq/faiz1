'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../menu-management/page.module.css';
import { useMenu } from '../../contexts/MenuContext';
import {
  getCurrentPSTDate,
  getMondayOfWeek,
  getWeekDays,
  addWeeks,
  formatWeekHeader,
  formatDateKey,
} from '../../lib/dateUtils';
import { recipeService } from '../recipe-management/services/recipeService';
import type { Recipe } from '@/types/recipe';
import type { Product } from '../add-new-items/types';

type AggregatedItem = {
  productId: string;
  productName: string;
  unitId: string;
  unitName: string;
  totalQuantity: number;
  store?: string | null;
  notes?: string | null;
};

export default function ManageCarts() {
  const { menuState } = useMenu();
  const [currentMonday, setCurrentMonday] = useState<Date | null>(null);
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [rsvpSummaryByDate, setRsvpSummaryByDate] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);

  // init week
  useEffect(() => {
    const today = getCurrentPSTDate();
    const monday = getMondayOfWeek(today);
    setCurrentMonday(monday);
    setWeekDays(getWeekDays(monday));
  }, []);

  const goToPreviousWeek = () => {
    if (!currentMonday) return;
    const newMonday = addWeeks(currentMonday, -1);
    setCurrentMonday(newMonday);
    setWeekDays(getWeekDays(newMonday));
  };

  const goToNextWeek = () => {
    if (!currentMonday) return;
    const newMonday = addWeeks(currentMonday, 1);
    setCurrentMonday(newMonday);
    setWeekDays(getWeekDays(newMonday));
  };

  // load recipes
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const all = await recipeService.getAllRecipes();
        setRecipes(all);
      } catch (e) {
        console.error('Error loading recipes:', e);
      }
    };
    loadRecipes();
  }, []);

  // load products for enrichment (store, notes)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/data?type=products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        const list: Product[] = Array.isArray(data.products) ? data.products : [];
        setProducts(list);
      } catch (e) {
        console.error('Error loading products:', e);
      }
    };
    loadProducts();
  }, []);

  // load RSVP summary map
  useEffect(() => {
    const loadRSVPs = async () => {
      try {
        const res = await fetch('/api/data?type=recipientRsvps');
        const data = await res.json();
        const summary: Record<string, number> = data.summaryByDate || {};
        setRsvpSummaryByDate(summary);
      } catch (e) {
        console.error('Error loading RSVP summary:', e);
      }
    };
    loadRSVPs();
  }, []);

  const recipeByName = useMemo(() => {
    const map: Record<string, Recipe> = {};
    recipes.forEach((r) => {
      map[r.name] = r;
    });
    return map;
  }, [recipes]);

  const productById = useMemo(() => {
    const map: Record<string, Product> = {};
    products.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [products]);

  const productByName = useMemo(() => {
    const map: Record<string, Product> = {};
    products.forEach((p) => {
      const key = p.name ? p.name.trim().toLowerCase() : '';
      if (key) map[key] = p;
    });
    return map;
  }, [products]);

  const aggregatedItems: AggregatedItem[] = useMemo(() => {
    if (!currentMonday) return [];
    const totals = new Map<string, AggregatedItem>();
    for (const day of weekDays) {
      const dateKey = formatDateKey(day);
      const dayData = menuState[dateKey];
      if (!dayData || dayData.isEvent) continue;
      const rsvpCount = rsvpSummaryByDate[dateKey] ?? 0;
      if (rsvpCount <= 0) continue;
      const menuItems = [
        dayData.menuItems?.item1 || '',
        dayData.menuItems?.item2 || '',
        dayData.menuItems?.item3 || '',
      ].filter(Boolean);
      for (const menuItemName of menuItems) {
        const recipe = recipeByName[menuItemName];
        if (!recipe) continue;
        const base = recipe.baseServings && recipe.baseServings > 0 ? recipe.baseServings : 50;
        const scale = rsvpCount / base;
        for (const ing of recipe.ingredients) {
          const key = `${ing.productId}|${ing.unitId}`;
          const existing = totals.get(key);
          const addQty = ing.quantity * scale;
          const prod =
            productById[ing.productId] ||
            productByName[(ing.productName || '').trim().toLowerCase()];
          const store = prod?.store || null;
          const notes = prod?.notes || null;
          if (existing) {
            existing.totalQuantity += addQty;
          } else {
            totals.set(key, {
              productId: ing.productId,
              productName: ing.productName,
              unitId: ing.unitId,
              unitName: ing.unitName,
              totalQuantity: addQty,
              store,
              notes,
            });
          }
        }
      }
    }
    // round to 2 decimals for display
    return Array.from(totals.values()).map((it) => ({
      ...it,
      totalQuantity: Math.round(it.totalQuantity * 100) / 100,
    }));
  }, [currentMonday, weekDays, menuState, rsvpSummaryByDate, recipeByName, productById, productByName]);

  const downloadCSV = () => {
    const lines: string[] = [];
    const weekHeader = currentMonday ? formatWeekHeader(currentMonday) : '';
    lines.push(`Weekly Cart - ${weekHeader}`);
    lines.push('');
    lines.push(['Product', 'Quantity', 'Store', 'Notes'].join(','));
    aggregatedItems.forEach((it) => {
      const qty = `${it.totalQuantity} ${it.unitName}`;
      const store = (it.store || '').replace(/,/g, ' ');
      const notes = (it.notes || '').replace(/,/g, ' ');
      lines.push([it.productName, qty, store, notes].join(','));
    });
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fileDate = currentMonday ? formatWeekHeader(currentMonday).replace(/\s+/g, '-').toLowerCase() : 'week';
    a.href = url;
    a.download = `weekly-cart-${fileDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerBar}>
          <div className={styles.headerIcon}>
            <ShoppingCart size={32} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Manage Carts</h1>
            <p className={styles.subtitle}>Generate weekly shopping carts from menus and RSVPs</p>
          </div>
        </div>
      </header>

      {/* Week Navigation */}
      <div className={styles.weekNavigation}>
        <button
          className={styles.navButton}
          onClick={goToPreviousWeek}
          aria-label="Previous week"
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
        <div className={styles.weekHeader}>
          <h2 className={styles.weekTitle}>{currentMonday ? formatWeekHeader(currentMonday) : ''}</h2>
        </div>
        <button
          className={styles.navButton}
          onClick={goToNextWeek}
          aria-label="Next week"
        >
          <ChevronRight size={24} strokeWidth={2} />
        </button>
      </div>

      {/* Aggregated Cart */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Weekly Cart</h2>
        </div>
        {aggregatedItems.length === 0 ? (
          <div className={styles.emptyState} style={{ padding: 16 }}>
            No items for this week. Ensure menus are set and RSVP counts are provided.
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <div className={styles.headerCell} style={{ width: '40%' }}>Product</div>
              <div className={styles.headerCell} style={{ width: '25%' }}>Quantity</div>
              <div className={styles.headerCell} style={{ width: '20%' }}>Store</div>
              <div className={styles.headerCell} style={{ width: '15%' }}>Notes</div>
            </div>
            {aggregatedItems.map((it) => (
              <div key={`${it.productId}-${it.unitId}`} className={styles.tableRow}>
                <div className={styles.dayCell}>{it.productName}</div>
                <div className={styles.dayCell}>{`${it.totalQuantity} ${it.unitName}`}</div>
                <div className={styles.dayCell}>{it.store || ''}</div>
                <div className={styles.dayCell}>{it.notes || ''}</div>
              </div>
            ))}
          </div>
        )}
        {/* Bottom-right actions */}
        <div className={styles.tableBottomActions}>
          <button
            className={styles.saveButton}
            onClick={downloadCSV}
            disabled={aggregatedItems.length === 0}
            title={aggregatedItems.length === 0 ? 'No items to download' : 'Download CSV'}
          >
            Download CSV
          </button>
          <button
            className={styles.clearAllButton}
            onClick={() => {
              const win = window.open('', '_blank');
              if (!win) return;
              const weekHeader = currentMonday ? formatWeekHeader(currentMonday) : '';
              const rowsHtml = aggregatedItems.map(it => `
                <tr>
                  <td style="padding:8px;border:1px solid #000;">${it.productName}</td>
                  <td style="padding:8px;border:1px solid #000;">${it.totalQuantity} ${it.unitName}</td>
                  <td style="padding:8px;border:1px solid #000;">${(it.store || '').toString()}</td>
                  <td style="padding:8px;border:1px solid #000;">${(it.notes || '').toString()}</td>
                </tr>
              `).join('');
              win.document.write(`
                <html>
                  <head>
                    <title>Weekly Cart - ${weekHeader}</title>
                    <style>
                      body { font-family: Arial, sans-serif; padding: 24px; }
                      h1 { margin: 0 0 16px 0; font-size: 20px; }
                      .sub { color: #555; margin-bottom: 16px; }
                      table { border-collapse: collapse; width: 100%; }
                      th { text-align: left; padding: 8px; border: 1px solid #000; background: #f7f5ef; }
                    </style>
                  </head>
                  <body>
                    <h1>Weekly Cart</h1>
                    <div class="sub">${weekHeader}</div>
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Store</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${rowsHtml}
                      </tbody>
                    </table>
                    <script>
                      window.onload = function() {
                        window.print();
                      }
                    </script>
                  </body>
                </html>
              `);
              win.document.close();
            }}
            disabled={aggregatedItems.length === 0}
            title={aggregatedItems.length === 0 ? 'No items to download' : 'Download PDF'}
          >
            Download as PDF
          </button>
        </div>
      </section>
    </div>
  );
}

