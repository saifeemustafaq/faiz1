

## Additional Instructions for the **Ingredients Calculator**

Inside the **Ingredients Calculator** section, the user should be able to calculate ingredient requirements for **multiple recipes at the same time**, and see both:

1. **Each recipe’s individual ingredient requirements**, and
2. **The combined total of all ingredients** across all selected recipes.

### How it should work

1. **User selects a recipe from a dropdown.**

   * When a recipe is selected, it should appear as an **individual recipe block** on the screen.
   * This block should show:

     * The recipe name.
     * A field/slider to set **“Number of people to serve”** for that recipe.
     * The calculated ingredient list **for that recipe only**.

2. **User can add more recipes**

   * When the user selects another recipe from the dropdown:

     * A **second recipe block** is added below the first one.
     * It will also have:

       * Its own “number of people to serve” input.
       * Its own individually calculated ingredient list.

3. **Shared Ingredient Summary Area**

   * Below all recipe blocks, there should be **one combined ingredient summary table**.
   * This summary table should:

     * Merge ingredients from all selected recipes.
     * If the same ingredient appears in multiple recipes, **their quantities should be added together**.
     * Show the **total quantity required for each ingredient**.

4. **Live Recalculation**

   * Whenever the user changes the number of people for any recipe block:

     * That recipe’s ingredient list should update.
     * The shared combined ingredient summary should automatically update as well.

---

## Example Scenario

* User selects **Recipe A**

  * Sets “Serve 30 people”
  * Sees ingredients for Recipe A (scaled for 30)

* Then user selects **Recipe B**

  * Sets “Serve 40 people”
  * Sees ingredients for Recipe B (scaled for 40)

* The **Combined Ingredients Summary** shows:

  * Tomatoes: (A’s tomatoes for 30) + (B’s tomatoes for 40)
  * Potatoes: (A’s potatoes for 30) + (B’s potatoes for 40)
  * Onion, oil, spices, etc.
  * Every ingredient added together so the user knows **exactly how much total to purchase**.

---

## Key Notes for Developer

* Each selected recipe creates its **own block**, but all blocks share a **single total summary area**.
* Ingredient merging must be done based on the **inventory item ID**, not just the ingredient name (so no duplicates).
* Totals should always represent the **sum across all active recipe blocks**.
* Removing a recipe block should instantly update totals.
* Everything recalculates **live** when any recipe’s serving size changes.
