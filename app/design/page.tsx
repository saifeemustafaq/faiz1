"use client";

import { 
  ShoppingCart, 
  Plus, 
  Minus,
  Edit,
  Trash2,
  Check,
  Search,
  Filter,
  User,
  Package,
  AlertCircle,
  Info,
  AlertTriangle,
  Star,
  ChevronDown,
  X
} from 'lucide-react';
import './design.css';

export default function DesignGuidePage() {
  return (
    <div className="design-guide">
      {/* Header */}
      <header className="design-header">
        <h1>Community Kitchen - Design Guide</h1>
        <p>Visual reference for all components and styles</p>
      </header>

      {/* Color Palette */}
      <section className="design-section">
        <h2>Color Palette</h2>
        
        <div className="color-section">
          <h3>Primary Colors</h3>
          <div className="color-grid">
            <div className="color-card">
              <div className="color-swatch" style={{ background: '#D4AF37' }}></div>
              <div className="color-info">
                <strong>Golden Main</strong>
                <code>#D4AF37</code>
              </div>
            </div>
            <div className="color-card">
              <div className="color-swatch" style={{ background: '#C5A028' }}></div>
              <div className="color-info">
                <strong>Golden Hover</strong>
                <code>#C5A028</code>
              </div>
            </div>
            <div className="color-card">
              <div className="color-swatch" style={{ background: '#2D5016' }}></div>
              <div className="color-info">
                <strong>Green Main</strong>
                <code>#2D5016</code>
              </div>
            </div>
            <div className="color-card">
              <div className="color-swatch" style={{ background: '#3D6B1F' }}></div>
              <div className="color-info">
                <strong>Green Hover</strong>
                <code>#3D6B1F</code>
              </div>
            </div>
            <div className="color-card">
              <div className="color-swatch" style={{ background: '#FFFFF0', border: '2px solid #1A1A1A' }}></div>
              <div className="color-info">
                <strong>Ivory BG</strong>
                <code>#FFFFF0</code>
              </div>
            </div>
            <div className="color-card">
              <div className="color-swatch" style={{ background: '#FAF8F3', border: '2px solid #1A1A1A' }}></div>
              <div className="color-info">
                <strong>Ivory Card</strong>
                <code>#FAF8F3</code>
              </div>
            </div>
            <div className="color-card">
              <div className="color-swatch" style={{ background: '#1A1A1A' }}></div>
              <div className="color-info">
                <strong>Black Text</strong>
                <code>#1A1A1A</code>
              </div>
            </div>
          </div>
        </div>

        <div className="color-section">
          <h3>Accent Colors (Use Sparingly)</h3>
          <div className="color-grid">
            <div className="color-card">
              <div className="color-swatch" style={{ background: '#8B3A3A' }}></div>
              <div className="color-info">
                <strong>Error Red</strong>
                <code>#8B3A3A</code>
              </div>
            </div>
            <div className="color-card">
              <div className="color-swatch" style={{ background: '#2B5F8F' }}></div>
              <div className="color-info">
                <strong>Info Blue</strong>
                <code>#2B5F8F</code>
              </div>
            </div>
            <div className="color-card">
              <div className="color-swatch" style={{ background: '#CC7A2D' }}></div>
              <div className="color-info">
                <strong>Warning Orange</strong>
                <code>#CC7A2D</code>
              </div>
            </div>
            <div className="color-card">
              <div className="color-swatch" style={{ background: '#6B4E8B' }}></div>
              <div className="color-info">
                <strong>Accent Purple</strong>
                <code>#6B4E8B</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="design-section">
        <h2>Typography</h2>
        <div className="typography-samples">
          <div className="type-sample">
            <div className="display">Display Text</div>
            <code>48px / 3rem / Bold</code>
          </div>
          <div className="type-sample">
            <h1>Heading 1</h1>
            <code>32px / 2rem / Bold</code>
          </div>
          <div className="type-sample">
            <h2>Heading 2</h2>
            <code>24px / 1.5rem / Semi-bold</code>
          </div>
          <div className="type-sample">
            <h3>Heading 3</h3>
            <code>18px / 1.125rem / Semi-bold</code>
          </div>
          <div className="type-sample">
            <p>Body text - This is the standard body text used throughout the application for paragraphs and content.</p>
            <code>16px / 1rem / Regular</code>
          </div>
          <div className="type-sample">
            <small>Small text - Used for labels, helper text, and timestamps</small>
            <code>14px / 0.875rem / Regular</code>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="design-section">
        <h2>Buttons</h2>
        
        <div className="component-group">
          <h3>Primary Button (Golden)</h3>
          <div className="button-row">
            <button className="btn btn-primary">
              <Plus size={20} />
              Add Item
            </button>
            <button className="btn btn-primary">
              <ShoppingCart size={20} />
              Add to Cart
            </button>
            <button className="btn btn-primary" disabled>
              Disabled
            </button>
          </div>
        </div>

        <div className="component-group">
          <h3>Secondary Button (Outlined)</h3>
          <div className="button-row">
            <button className="btn btn-secondary">
              <Edit size={20} />
              Edit
            </button>
            <button className="btn btn-secondary">
              Cancel
            </button>
            <button className="btn btn-secondary" disabled>
              Disabled
            </button>
          </div>
        </div>

        <div className="component-group">
          <h3>Success Button (Green)</h3>
          <div className="button-row">
            <button className="btn btn-success">
              <Check size={20} />
              Confirm Order
            </button>
            <button className="btn btn-success">
              Save Changes
            </button>
          </div>
        </div>

        <div className="component-group">
          <h3>Danger Button (Red)</h3>
          <div className="button-row">
            <button className="btn btn-danger">
              <Trash2 size={20} />
              Delete
            </button>
            <button className="btn btn-danger">
              Remove Item
            </button>
          </div>
        </div>

        <div className="component-group">
          <h3>Info Button (Blue)</h3>
          <div className="button-row">
            <button className="btn btn-info">
              <Info size={20} />
              Learn More
            </button>
            <button className="btn btn-info">
              View Details
            </button>
          </div>
        </div>

        <div className="component-group">
          <h3>Icon-only Buttons</h3>
          <div className="button-row">
            <button className="btn btn-icon btn-primary" aria-label="Add">
              <Plus size={20} />
            </button>
            <button className="btn btn-icon btn-secondary" aria-label="Edit">
              <Edit size={20} />
            </button>
            <button className="btn btn-icon btn-danger" aria-label="Delete">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Input Fields */}
      <section className="design-section">
        <h2>Input Fields</h2>
        
        <div className="component-group">
          <h3>Text Inputs</h3>
          <div className="input-examples">
            <div className="input-group">
              <label htmlFor="item-name">Item Name</label>
              <input 
                type="text" 
                id="item-name"
                className="input" 
                placeholder="e.g. Organic Tomatoes"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="quantity">Quantity</label>
              <input 
                type="number" 
                id="quantity"
                className="input" 
                placeholder="0"
                defaultValue="5"
              />
            </div>

            <div className="input-group">
              <label htmlFor="search">Search</label>
              <div className="input-with-icon">
                <Search size={20} className="input-icon" />
                <input 
                  type="text" 
                  id="search"
                  className="input input-has-icon" 
                  placeholder="Search groceries..."
                />
              </div>
            </div>

            <div className="input-group error">
              <label htmlFor="error-input">With Error</label>
              <input 
                type="text" 
                id="error-input"
                className="input input-error" 
                defaultValue="Invalid input"
              />
              <span className="error-message">This field is required</span>
            </div>
          </div>
        </div>

        <div className="component-group">
          <h3>Select & Textarea</h3>
          <div className="input-examples">
            <div className="input-group">
              <label htmlFor="category">Category</label>
              <select id="category" className="input">
                <option>Select a category</option>
                <option>Vegetables</option>
                <option>Fruits</option>
                <option>Dairy</option>
                <option>Grains</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="notes">Notes</label>
              <textarea 
                id="notes"
                className="input" 
                rows={4}
                placeholder="Add any special instructions..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="design-section">
        <h2>Cards</h2>
        
        <div className="card-grid">
          <div className="card">
            <div className="card-header">
              <h3>Organic Tomatoes</h3>
              <span className="badge badge-green">In Stock</span>
            </div>
            <div className="card-body">
              <p>Fresh organic tomatoes from local farm</p>
              <div className="card-meta">
                <span className="quantity">Quantity: <strong>25 lbs</strong></span>
                <span className="date">Added 2 days ago</span>
              </div>
            </div>
            <div className="card-actions">
              <button className="btn btn-secondary">
                <Edit size={16} />
                Edit
              </button>
              <button className="btn btn-primary">
                <Plus size={16} />
                Add to Order
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Basmati Rice</h3>
              <span className="badge badge-yellow">Low Stock</span>
            </div>
            <div className="card-body">
              <p>Premium long-grain basmati rice</p>
              <div className="card-meta">
                <span className="quantity">Quantity: <strong>5 lbs</strong></span>
                <span className="date">Added 1 week ago</span>
              </div>
            </div>
            <div className="card-actions">
              <button className="btn btn-secondary">
                <Edit size={16} />
                Edit
              </button>
              <button className="btn btn-primary">
                <Plus size={16} />
                Add to Order
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Olive Oil</h3>
              <span className="badge badge-red">Out of Stock</span>
            </div>
            <div className="card-body">
              <p>Extra virgin olive oil, cold pressed</p>
              <div className="card-meta">
                <span className="quantity">Quantity: <strong>0 gal</strong></span>
                <span className="date">Updated today</span>
              </div>
            </div>
            <div className="card-actions">
              <button className="btn btn-secondary">
                <Edit size={16} />
                Edit
              </button>
              <button className="btn btn-danger">
                <AlertCircle size={16} />
                Order Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Badges & Tags */}
      <section className="design-section">
        <h2>Badges & Tags</h2>
        
        <div className="component-group">
          <h3>Status Badges</h3>
          <div className="badge-row">
            <span className="badge badge-golden">Primary</span>
            <span className="badge badge-green">In Stock</span>
            <span className="badge badge-yellow">Low Stock</span>
            <span className="badge badge-red">Out of Stock</span>
            <span className="badge badge-blue">Info</span>
            <span className="badge badge-purple">Premium</span>
          </div>
        </div>

        <div className="component-group">
          <h3>Category Tags</h3>
          <div className="badge-row">
            <span className="tag">Vegetables</span>
            <span className="tag">Fruits</span>
            <span className="tag">Dairy</span>
            <span className="tag">Grains</span>
            <span className="tag">Spices</span>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section className="design-section">
        <h2>Alerts & Messages</h2>
        
        <div className="alert-stack">
          <div className="alert alert-success">
            <Check size={20} />
            <div>
              <strong>Success!</strong>
              <p>Item added to order successfully</p>
            </div>
          </div>

          <div className="alert alert-info">
            <Info size={20} />
            <div>
              <strong>Information</strong>
              <p>Your order will be processed within 24 hours</p>
            </div>
          </div>

          <div className="alert alert-warning">
            <AlertTriangle size={20} />
            <div>
              <strong>Warning</strong>
              <p>Some items are running low on stock</p>
            </div>
          </div>

          <div className="alert alert-error">
            <AlertCircle size={20} />
            <div>
              <strong>Error</strong>
              <p>Failed to save changes. Please try again.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Icons */}
      <section className="design-section">
        <h2>Icons (Lucide React)</h2>
        <p className="icon-note">Using 2px stroke weight for consistency</p>
        
        <div className="icon-grid">
          <div className="icon-item">
            <ShoppingCart size={24} strokeWidth={2} />
            <span>ShoppingCart</span>
          </div>
          <div className="icon-item">
            <Plus size={24} strokeWidth={2} />
            <span>Plus</span>
          </div>
          <div className="icon-item">
            <Minus size={24} strokeWidth={2} />
            <span>Minus</span>
          </div>
          <div className="icon-item">
            <Edit size={24} strokeWidth={2} />
            <span>Edit</span>
          </div>
          <div className="icon-item">
            <Trash2 size={24} strokeWidth={2} />
            <span>Trash2</span>
          </div>
          <div className="icon-item">
            <Check size={24} strokeWidth={2} />
            <span>Check</span>
          </div>
          <div className="icon-item">
            <Search size={24} strokeWidth={2} />
            <span>Search</span>
          </div>
          <div className="icon-item">
            <Filter size={24} strokeWidth={2} />
            <span>Filter</span>
          </div>
          <div className="icon-item">
            <User size={24} strokeWidth={2} />
            <span>User</span>
          </div>
          <div className="icon-item">
            <Package size={24} strokeWidth={2} />
            <span>Package</span>
          </div>
          <div className="icon-item">
            <AlertCircle size={24} strokeWidth={2} />
            <span>AlertCircle</span>
          </div>
          <div className="icon-item">
            <Info size={24} strokeWidth={2} />
            <span>Info</span>
          </div>
          <div className="icon-item">
            <AlertTriangle size={24} strokeWidth={2} />
            <span>AlertTriangle</span>
          </div>
          <div className="icon-item">
            <Star size={24} strokeWidth={2} />
            <span>Star</span>
          </div>
          <div className="icon-item">
            <ChevronDown size={24} strokeWidth={2} />
            <span>ChevronDown</span>
          </div>
        </div>
      </section>

      {/* Quantity Selector */}
      <section className="design-section">
        <h2>Quantity Selector</h2>
        
        <div className="component-group">
          <div className="quantity-selector">
            <button className="btn btn-icon btn-secondary" aria-label="Decrease">
              <Minus size={20} />
            </button>
            <input type="number" className="quantity-input" value="5" readOnly />
            <button className="btn btn-icon btn-primary" aria-label="Increase">
              <Plus size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Tables */}
      <section className="design-section">
        <h2>Data Tables</h2>
        <p style={{ marginBottom: '24px', color: '#4A4A4A' }}>
          Grid-based table layout with responsive mobile behavior
        </p>
        
        <div className="component-group">
          <h3>View Mode Table (Read-Only)</h3>
          <div className="table-container">
            <div className="table-header">
              <div className="table-header-cell">Item</div>
              <div className="table-header-cell">Category</div>
              <div className="table-header-cell">Quantity</div>
              <div className="table-header-cell">Status</div>
              <div className="table-header-cell">Actions</div>
            </div>

            <div className="table-row">
              <div className="table-cell" data-label="Item">Organic Tomatoes</div>
              <div className="table-cell" data-label="Category">Vegetables</div>
              <div className="table-cell" data-label="Quantity">25 lbs</div>
              <div className="table-cell" data-label="Status">
                <span className="badge badge-green">In Stock</span>
              </div>
              <div className="table-cell" data-label="Actions">
                <button className="btn btn-icon btn-secondary" aria-label="Edit">
                  <Edit size={16} />
                </button>
              </div>
            </div>

            <div className="table-row">
              <div className="table-cell" data-label="Item">Basmati Rice</div>
              <div className="table-cell" data-label="Category">Grains</div>
              <div className="table-cell" data-label="Quantity">50 lbs</div>
              <div className="table-cell" data-label="Status">
                <span className="badge badge-green">In Stock</span>
              </div>
              <div className="table-cell" data-label="Actions">
                <button className="btn btn-icon btn-secondary" aria-label="Edit">
                  <Edit size={16} />
                </button>
              </div>
            </div>

            <div className="table-row">
              <div className="table-cell" data-label="Item">Olive Oil</div>
              <div className="table-cell" data-label="Category">Oils</div>
              <div className="table-cell" data-label="Quantity">0 gal</div>
              <div className="table-cell" data-label="Status">
                <span className="badge badge-red">Out of Stock</span>
              </div>
              <div className="table-cell" data-label="Actions">
                <button className="btn btn-icon btn-secondary" aria-label="Edit">
                  <Edit size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="component-group">
          <h3>Edit Mode Table (With Input Fields)</h3>
          <div className="table-container">
            <div className="table-header">
              <div className="table-header-cell" style={{ width: '140px' }}>Day</div>
              <div className="table-header-cell">Item 1</div>
              <div className="table-header-cell">Item 2</div>
              <div className="table-header-cell">Item 3</div>
              <div className="table-header-cell" style={{ width: '180px' }}>Actions</div>
            </div>

            <div className="table-row-edit">
              <div className="table-cell-day" data-label="Day">Mon - Nov 24</div>
              <div className="table-cell-input" data-label="Item 1">
                <input type="text" className="input table-input" placeholder="Item 1" defaultValue="Daal" />
              </div>
              <div className="table-cell-input" data-label="Item 2">
                <input type="text" className="input table-input" placeholder="Item 2" defaultValue="Roti" />
              </div>
              <div className="table-cell-input" data-label="Item 3">
                <input type="text" className="input table-input" placeholder="Item 3" defaultValue="Salad" />
              </div>
              <div className="table-cell-actions" data-label="Actions">
                <button className="btn btn-secondary btn-small">Event</button>
                <button className="btn btn-danger btn-small">
                  <X size={14} />
                  Clear
                </button>
              </div>
            </div>

            <div className="table-row-edit">
              <div className="table-cell-day" data-label="Day">Tue - Nov 25</div>
              <div className="table-cell-input" data-label="Item 1">
                <input type="text" className="input table-input" placeholder="Item 1" defaultValue="Sabzi" />
              </div>
              <div className="table-cell-input" data-label="Item 2">
                <input type="text" className="input table-input" placeholder="Item 2" defaultValue="Rice" />
              </div>
              <div className="table-cell-input" data-label="Item 3">
                <input type="text" className="input table-input" placeholder="Item 3" />
              </div>
              <div className="table-cell-actions" data-label="Actions">
                <button className="btn btn-secondary btn-small">Event</button>
                <button className="btn btn-danger btn-small">
                  <X size={14} />
                  Clear
                </button>
              </div>
            </div>

            <div className="table-row-edit">
              <div className="table-cell-day" data-label="Day">Wed - Nov 26</div>
              <div className="table-cell-input" data-label="Item 1">
                <input type="text" className="input table-input" placeholder="Item 1" />
              </div>
              <div className="table-cell-input" data-label="Item 2">
                <input type="text" className="input table-input" placeholder="Item 2" />
              </div>
              <div className="table-cell-input" data-label="Item 3">
                <input type="text" className="input table-input" placeholder="Item 3" />
              </div>
              <div className="table-cell-actions" data-label="Actions">
                <button className="btn btn-secondary btn-small">Event</button>
                <button className="btn btn-danger btn-small">
                  <X size={14} />
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="table-bottom-actions">
            <button className="btn btn-success">
              <Check size={20} />
              Save Menu
            </button>
            <button className="btn btn-danger">
              Clear All
            </button>
          </div>
        </div>
      </section>

      {/* Dropdowns */}
      <section className="design-section">
        <h2>Dropdowns & Selects</h2>
        
        <div className="component-group">
          <h3>Standard Dropdowns</h3>
          <div className="dropdown-examples">
            <div className="input-group">
              <label htmlFor="unit-select">Unit</label>
              <select id="unit-select" className="input">
                <option value="">Select a unit</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="lb">Pound (lb)</option>
                <option value="oz">Ounce (oz)</option>
                <option value="g">Gram (g)</option>
                <option value="l">Liter (L)</option>
                <option value="ml">Milliliter (mL)</option>
                <option value="gal">Gallon (gal)</option>
                <option value="piece">Piece</option>
                <option value="dozen">Dozen</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="category-select">Category</label>
              <select id="category-select" className="input">
                <option value="">Select a category</option>
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="dairy">Dairy</option>
                <option value="grains">Grains</option>
                <option value="spices">Spices</option>
                <option value="oils">Oils</option>
                <option value="legumes">Legumes</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="store-select">Store</label>
              <select id="store-select" className="input">
                <option value="">Select a store</option>
                <option value="costco">Costco</option>
                <option value="restaurant-depot">Restaurant Depot</option>
                <option value="whole-foods">Whole Foods</option>
                <option value="local-market">Local Market</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Empty States */}
      <section className="design-section">
        <h2>Empty States</h2>
        
        <div className="empty-state">
          <Package size={48} strokeWidth={2} />
          <h3>No items in your order yet</h3>
          <p>Start by adding some groceries from the catalog</p>
          <button className="btn btn-primary">
            <Plus size={20} />
            Browse Groceries
          </button>
        </div>
      </section>
    </div>
  );
}

