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



For the Manage Events page:

- The page should let users add, remove, and edit events.
- All adding and editing of events should happen in a modal dialog. 
    - When a user clicks "Add", show a modal to enter the new event details.
    - When a user clicks "Edit" on an existing event, open the same modal, pre-filled with the existing details.
- Each event should have:
    - A text box labeled "Details" (for the event description).
    - An optional text box labeled "Time" (for entering when the event starts, e.g., "6:00 PM"). 
- There is no need for:
    - A location field for events.
    - Card pop-up animations.
    - Any “open to all” option or similar fields.
- Focus only on the required event details (Details and Time) in the modals.



RSVP Management Requirements (Admin Portal):

- The current scope is for developing the admin-side RSVP management interface. The customer-facing RSVP portal will be built in the future and will rely entirely on the rules and dates enabled or disabled via this admin panel.
- Admins must have comprehensive, flexible control over which days users will be allowed to RSVP for meals (once the customer portal is available).
- RSVP windows can be managed at multiple granularities:
    - Individual days (e.g., enable/disable RSVP for one or more specific dates)
    - Entire weeks at once
    - Entire months at once
    - Arbitrary multi-day selections or ranges
- The default state is that RSVP is DISABLED for all calendar days. Admins must actively enable RSVP for specific days/weeks/months; otherwise, users will not be able to RSVP on those dates in the upcoming customer-facing portal.
- Once the customer portal is implemented, any days disabled in this admin panel will be off-limits to users for RSVPing. Only admin-enabled dates will be open for user RSVPs.
- The admin interface for this control should be extremely user-friendly and allow for:
    - Easy selection and deselection (enable/disable) of days, with clear visual indicators
    - Effortless bulk actions (e.g., enable/disable an entire week or month in one click)
    - Intuitive calendar-style UI or bulk-checkbox selection
- Admins should be able to update RSVP windows at any time, making changes as frequently as needed.
- Summary: This admin panel defines the RSVP access rules that the future customer portal will enforce. Default is locked down—all RSVP access is closed until opened by admin actions. Focus on making the enabling/disabling workflow fast, clear, and error-proof for admins.
And a save button to finally save whatever changes I have made so that they are published to the backend and saved



similarly update the @MongoDB database schema.md  so that once I connect things to the mongodb atlas, I will already have a laid out well planned schema to implement that will quickly adapt to my code and whatever we have built here.


**Thali Recipients Page**

1. **Table/List View & Data Display**
    - The page should display a list of all Thali recipients (users), each as a separate row.
    - Columns to display for each recipient (in one line, no visible row borders):
        - Name
        - ITS Number
        - Mobile Number
        - Email
        - Location
        - Thali Pick-up Location
    - Display column headers for all of the above fields. Use the column headings already provided.
    - The table/list should have a clean, borderless look (no visible grid lines or table borders).
    - Each user row should end with a set of action buttons: Edit, Delete, and Calendar (functionality for Calendar to be specified later).
  
2. **Add Recipient**
    - Provide an "Add Recipient" button on the page.
    - When clicked, open a modal dialog for entering the new recipient’s details (Name, ITS Number, Mobile, Email, Location, Thali Pick-up Location).
    - All fields should be required except as otherwise specified.
    - Submitting the modal should add the new user to the table and persist the data.

3. **Edit Recipient**
    - Each user row should have an Edit button.
    - Clicking Edit should open a modal (same design as Add) pre-filled with the user’s current information, allowing the admin to update details.
    - On save, changes should update the row and persist to backend.

4. **Delete Recipient**
    - Each user row should have a Delete button.
    - On clicking Delete, prompt for confirmation (“Are you sure?”) before removing the recipient.
    - If confirmed, remove the user from the table and backend.

5. **Calendar Button**
    - Each user row should have a Calendar button at the end.
    - For now, just include the button in the UI; I will specify its functionality later.

6. **See/Manage Recipient’s Meal Days**
    - When an admin clicks on a user/row (or uses the Calendar button, as to be specified), display the days the recipient has opted for thali.
    - In future, the system will be integrated with a consumer/recipient portal that lets users choose their meal days—the admin side should reflect whatever days the user has selected.

**Design/UX:**
  - Keep the interface clean and easy to scan.
  - Modal dialogs for Add and Edit.
  - One recipient per row, with all info clearly laid out.
  - No table/grid borders; clean, modern design.

**Note:** Do not implement Calendar button functionality yet; just provide the button in the UI for now.


Add a settings tab in the side bar, settings tab will have a section for adding location and adding pickup location, 
in the recipient tab when in edit mode of a user, the location and pickup location should be drop downs and not text boxes, and to add more options to the dropdown, the admin has to go to setting page to add remove or edit locations

