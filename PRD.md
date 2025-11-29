Menu Management Page Specification

**Header (Week Selector):**
- Display the current week at the top, formatted as:  
  `Week of <Month> <Date>, <Year>`
  - Example: If today is Tuesday, November 18, 2025, the header should read `Week of November 17, 2025` (the date corresponding to Monday of the current week).
- Include left and right arrow icons beside the header to allow users to navigate to the previous and next weeks.
- All date calculations should use the Pacific Time Zone (PST).

**Week View Table:**
- Display a 6-row "table" representing Monday through Saturday only (Sunday is always excluded). There are never menu items or service on Sunday.
- The table should not display visible grid lines (appearance is more like a set of aligned rows without borders).
- Columns:
  - **Column 1 (Day):**  
    - Uneditable  
    - Format: `<Day abbreviation> - <Month abbreviation> <Date>`
      - Example: `Mon - Nov 17`
  - **Columns 2–4:**  
    - Correspond to menu item slots:  
      - Column 2: "Item 1"  
      - Column 3: "Item 2"  
      - Column 4: "Item 3"
    - Each cell in these columns contains an editable input box for entering menu items for that day and slot.

**Other Requirements:**
- Omit Sundays entirely from both the header and table.
- All date and time logic should assume PST (Pacific Time Zone), regardless of user location.


Additional Functional Requirements:

- At the end of each weekday row (Monday–Saturday), include two action buttons:
  - **Event:** Converts the entire row into an "event mode" (see below).
  - **Clear:** Clears all input fields for that day.
- At the bottom of the table:
  - **Save Button:** Commits the current menu state. After saving, a summary box should appear directly below, displaying the currently saved menu data as returned from the backend.
  - **Clear All Button:** Clears all input fields for the entire week.
- **Event Mode:**
  - When the "Event" button is clicked for a day, the three menu item input fields for that row are replaced with a single wide text box for entering event details (for that day).
  - The background color of the row should change subtly to indicate event mode.
  - Event information created here should also appear as a card on the `/manage-events` page.
  - Changes to events (created or removed) should be mirrored between `/menu-management` and `/manage-events` so that creating an event in one location updates the other.
- All synchronization between menu items and events must be bidirectional, so that any event added or removed in either the menu management page or the events management page is reflected in both places.

**Manage Roles Page Specification**

Develop a "Manage Roles" admin page that allows me to fully control user accounts and permissions for accessing the portal. The core requirements are:

- I must be able to view the current list of users who can log into the portal.
- I need functionality to add new users: assigning them a username and password.
- When creating or editing a user, I should be able to select specific permissions from a list. Example permissions include: 
  - Modify menu items
  - Manage roles
  - Modify events
  - Manage carts
  - Add/edit new items
  - Modify application settings
  - (etc. — please ensure this permission system is extensible)
- For each user, their portal access should be strictly limited according to the permissions I assign them. If a permission box is ticked, they get access to that area; if not, they do not.
- As the admin, I should always have full access to all accounts: 
  - I can manually see all users and their permissions.
  - I can update, reset, or change any user’s password at any time.
  - I can edit user permissions at any time.
- Users should not be able to change their own permissions or access levels—only I (the admin) can make changes.
- We will handle the technical setup of authentication backend and the login page later, so for now, focus only on delivering the Manage Roles page as described above, with all add/edit/delete and permission assignment functions working in the UI.

Let me know if you need clarifications, but please make sure all the above functionality is included.



**Add New Items Module**

for the “Add New Item” sidebar option. This section should be divided into four horizontal tabs: Products, Categories, Stores, and Units. Below are detailed requirements for each tab:

---

### 1. **Products Tab**
- **Functionality:**
  - Allow the admin to add new products.
  - Each new product entry should have the following required fields:
    - **Product Name**
    - **Default Category** (Dropdown populated from the Categories tab)
    - **Default Store** (Dropdown populated from the Stores tab)
    - **Default Measuring Unit** (Dropdown from the Units tab)
    - **Notes** (optional free-text)
  - On save, the new product should appear in the products list under this tab.
- *Dropdowns must always show the latest options as defined in their respective tabs.*

### 2. **Categories Tab**
- **Functionality:**
  - Allow the admin to add, edit, or remove item categories (e.g., "Grains," "Dairy," etc.).
  - Any newly added category should immediately become available in the “Default Category” dropdown when adding a new product.

### 3. **Stores Tab**
- **Functionality:**
  - Allow the admin to add, edit, or remove stores (e.g., "Costco," "Walmart").
  - Any new or updated store should become selectable in the “Default Store” dropdown when adding or editing a product.

### 4. **Units Tab**
- **Functionality:**
  - Allow the admin to add, edit, and remove measuring units for products.
    - Each unit should include:
      - **Unit Name** (e.g., “Kilogram”)
      - **Abbreviation** (e.g., “kg”)
  - When viewing an existing measurement unit, display a modal listing all products currently associated with this unit.
  - When adding or editing a unit, use a modal form.

---

**General Implementation Notes:**
- “Add New Item” should be a sidebar option.
- All changes (add, edit, delete) should update the related dropdowns in real-time across the “Add Products” form.
- “Products”, “Categories”, “Stores”, and “Units” tabs should have clean, table or list views with all items visible.
- Use modal dialogs for all add/edit actions.

If anything is unclear or if additional UI details are needed, please request clarification before starting implementation.

## Sidebar Section: Recipe Management

Add a new section in the sidebar called **“Recipe Management”**.

Inside this section, there should be **two clear sub-sections**:

1. **Recipes Setup** – for adding and maintaining recipes
2. **Ingredients Calculator** – for selecting a recipe and getting the required ingredient quantities based on the number of people

We are **not** defining any formal roles or permissions here. Think of it as two kinds of usage:

* Someone who **creates/maintains recipes**
* Someone who **uses those recipes to calculate how much to cook/buy**

Both can access this tab and use whichever section they need.

---

## 1. Sub-Section: Recipes Setup

This is where a user creates and maintains the **baseline recipe** for each dish.

### What the user can do here

* **Add a new dish (recipe)**

  * Enter the **dish name**.
  * Specify the **base number of people** this recipe is defined for (e.g. 50 people).
  * Add a list of **ingredients** required for that base number of people.

    * Each ingredient must be chosen from the **existing inventory list** (no free-text items).
    * For each ingredient, the user defines:

      * The **quantity** needed for the base number of people.
      * The **unit** (e.g. kg, g, liters, pieces, etc.).

* **Edit an existing recipe**

  * Change the base number of people if needed.
  * Add/remove ingredients.
  * Update ingredient quantities or units.

* **View list of all recipes**

  * Show all dishes that have been set up as recipes.
  * Each item should show at least:

    * Dish name
    * Base number of people the recipe is defined for (e.g. “Defined for 50 people”)

### Example

If I’m setting up a dish called **“Tomato Potato Curry”**:

* I define that the recipe is for **50 people**.
* I add ingredients like:

  * Tomatoes – 10 kg (for 50 people)
  * Potatoes – 15 kg (for 50 people)
  * Oil – 2 liters (for 50 people)

This becomes the **baseline recipe** for “Tomato Potato Curry”.

---

## 2. Sub-Section: Ingredients Calculator

This section is for people who want to know **how much of each ingredient to buy/use** for a specific dish, based on **how many people** will be eating.

### What the user can do here

* **Select a dish** from the existing recipes list (created in the Recipes Setup section).

* See the **base information**:

  * Dish name.
  * Base number of people the recipe was defined for (e.g. “This recipe is defined for 50 people”).

* **Adjust the number of people to serve**:

  * There should be a field (or slider) where the user can set **“Number of people”**.
  * By default, it can start at the base value (e.g. 50), but the user can change it to anything else (e.g. 70, 120, etc.).

* **See the ingredients automatically recalculated**:

  * When the user changes the number of people, the quantity of each ingredient should update automatically based on simple scaling.
  * The ingredient list should show:

    * Ingredient name (from inventory)
    * Unit (kg, g, liters, pieces, etc.)
    * **Quantity required for the chosen number of people**

### Example

Using the previous recipe:

* Baseline: “Tomato Potato Curry” for **50 people**:

  * Tomatoes – 10 kg
  * Potatoes – 15 kg
  * Oil – 2 liters

If the user sets **Number of people = 70**:

* Tomatoes → scaled from 10 kg
* Potatoes → scaled from 15 kg
* Oil → scaled from 2 liters

The UI should show the **new calculated quantities** for 70 people.

If they change it to **100 people**, it should again recalculate automatically.

---

## Key Points for the Developer

* **One sidebar item**: “Recipe Management”

* **Inside it, two clear sections**:

  1. **Recipes Setup** – define/edit recipes and their base quantities.
  2. **Ingredients Calculator** – select a dish, set number of people, see scaled ingredient quantities.

* Recipes should **always use ingredients from the existing inventory list** – no custom ingredients.

* The user journey of “adding a recipe” is like defining the **baseline recipe for a fixed number of people**.

* The “calculator” journey is simply **changing the number of people** and seeing ingredient quantities change accordingly.

