'use client';

import { useState } from 'react';
import { Calculator, ChefHat, X, Plus } from 'lucide-react';
import { Recipe, RecipeIngredient } from '@/types/recipe';
import { recipeService } from '../services/recipeService';
import styles from './IngredientsCalculator.module.css';

interface IngredientsCalculatorProps {
  recipes: Recipe[];
  units: Array<{ id: string; name: string; abbreviation: string }>;
}

interface SelectedRecipe {
  id: string;
  recipe: Recipe;
  servings: number;
}

interface CombinedIngredient {
  productId: string;
  productName: string;
  totalQuantity: number;
  unitId: string;
  unitName: string;
}

export default function IngredientsCalculator({ recipes, units }: IngredientsCalculatorProps) {
  const [selectedRecipes, setSelectedRecipes] = useState<SelectedRecipe[]>([]);
  const [availableRecipeId, setAvailableRecipeId] = useState<string>('');

  const handleAddRecipe = () => {
    if (!availableRecipeId) return;
    
    const recipe = recipes.find((r) => r.id === availableRecipeId);
    if (!recipe) return;

    // Check if recipe is already added
    if (selectedRecipes.some((sr) => sr.recipe.id === recipe.id)) {
      alert('This recipe is already added!');
      return;
    }

    setSelectedRecipes([
      ...selectedRecipes,
      {
        id: `selected-${Date.now()}`,
        recipe,
        servings: recipe.baseServings,
      },
    ]);
    setAvailableRecipeId('');
  };

  const handleRemoveRecipe = (id: string) => {
    setSelectedRecipes(selectedRecipes.filter((sr) => sr.id !== id));
  };

  const handleServingsChange = (id: string, servings: number) => {
    setSelectedRecipes(
      selectedRecipes.map((sr) =>
        sr.id === id ? { ...sr, servings: servings || 1 } : sr
      )
    );
  };

  const getScaledRecipe = (selectedRecipe: SelectedRecipe): Recipe => {
    return recipeService.scaleIngredients(selectedRecipe.recipe, selectedRecipe.servings);
  };

  const getCombinedIngredients = (): CombinedIngredient[] => {
    const ingredientMap = new Map<string, CombinedIngredient>();

    selectedRecipes.forEach((selectedRecipe) => {
      const scaledRecipe = getScaledRecipe(selectedRecipe);
      
      scaledRecipe.ingredients.forEach((ingredient) => {
        const existing = ingredientMap.get(ingredient.productId);
        
        if (existing) {
          // Add to existing quantity
          existing.totalQuantity += ingredient.quantity;
        } else {
          // Add new ingredient
          ingredientMap.set(ingredient.productId, {
            productId: ingredient.productId,
            productName: ingredient.productName,
            totalQuantity: ingredient.quantity,
            unitId: ingredient.unitId,
            unitName: ingredient.unitName,
          });
        }
      });
    });

    return Array.from(ingredientMap.values()).sort((a, b) =>
      a.productName.localeCompare(b.productName)
    );
  };

  const formatQuantity = (quantity: number): string => {
    const rounded = Math.round(quantity * 100) / 100;
    return rounded.toString();
  };

  const combinedIngredients = getCombinedIngredients();

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Ingredients Calculator</h2>

      {/* Recipe Selection */}
      <div className={styles.selectContainer}>
        <label className={styles.label} htmlFor="recipeSelect">
          Add a Recipe
        </label>
        <div className={styles.selectRow}>
          <select
            id="recipeSelect"
            className={styles.select}
            value={availableRecipeId}
            onChange={(e) => setAvailableRecipeId(e.target.value)}
          >
            <option value="">Choose a recipe to add...</option>
            {recipes
              .filter((r) => !selectedRecipes.some((sr) => sr.recipe.id === r.id))
              .map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name}
                </option>
              ))}
          </select>
          <button
            className={styles.addRecipeButton}
            onClick={handleAddRecipe}
            disabled={!availableRecipeId}
          >
            <Plus size={20} />
            Add Recipe
          </button>
        </div>
      </div>

      {/* Empty State */}
      {recipes.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <ChefHat size={64} strokeWidth={1} />
          </div>
          <p className={styles.emptyStateText}>
            No recipes available. Please create a recipe in the Recipes Setup section first.
          </p>
        </div>
      )}

      {recipes.length > 0 && selectedRecipes.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <Calculator size={64} strokeWidth={1} />
          </div>
          <p className={styles.emptyStateText}>
            Select recipes above to calculate ingredient quantities for multiple dishes at once.
          </p>
        </div>
      )}

      {/* Selected Recipe Blocks */}
      {selectedRecipes.length > 0 && (
        <>
          <div className={styles.recipeBlocksContainer}>
            {selectedRecipes.map((selectedRecipe) => {
              const scaledRecipe = getScaledRecipe(selectedRecipe);
              
              return (
                <div key={selectedRecipe.id} className={styles.recipeBlock}>
                  <div className={styles.recipeBlockHeader}>
                    <div className={styles.recipeBlockTitle}>
                      <h3 className={styles.recipeName}>{selectedRecipe.recipe.name}</h3>
                      <p className={styles.baseServings}>
                        Base recipe for {selectedRecipe.recipe.baseServings} people
                      </p>
                    </div>
                    <button
                      className={styles.removeRecipeButton}
                      onClick={() => handleRemoveRecipe(selectedRecipe.id)}
                      aria-label="Remove recipe"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className={styles.servingsContainer}>
                    <label className={styles.servingsLabel} htmlFor={`servings-${selectedRecipe.id}`}>
                      Servings for this recipe:
                    </label>
                    <input
                      id={`servings-${selectedRecipe.id}`}
                      type="number"
                      className={styles.servingsInput}
                      value={selectedRecipe.servings}
                      onChange={(e) =>
                        handleServingsChange(selectedRecipe.id, Number(e.target.value))
                      }
                      min="1"
                    />
                  </div>

                  <div className={styles.ingredientsTable}>
                    <div className={styles.tableHeader}>
                      <div>Ingredient</div>
                      <div>Quantity</div>
                      <div>Unit</div>
                    </div>
                    {scaledRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className={styles.tableRow}>
                        <div className={styles.ingredientName}>{ingredient.productName}</div>
                        <div className={styles.ingredientQuantity}>
                          {formatQuantity(ingredient.quantity)}
                        </div>
                        <div className={styles.ingredientUnit}>{ingredient.unitName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Combined Ingredients Summary */}
          <div className={styles.combinedSummary}>
            <div className={styles.combinedSummaryHeader}>
              <h3 className={styles.combinedSummaryTitle}>
                Combined Ingredients Summary
              </h3>
              <p className={styles.combinedSummarySubtitle}>
                Total quantities needed for all {selectedRecipes.length} recipe
                {selectedRecipes.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className={styles.ingredientsTable}>
              <div className={styles.tableHeader}>
                <div>Ingredient</div>
                <div>Total Quantity</div>
                <div>Unit</div>
              </div>
              {combinedIngredients.map((ingredient, index) => (
                <div key={index} className={styles.tableRow}>
                  <div className={styles.ingredientName}>{ingredient.productName}</div>
                  <div className={`${styles.ingredientQuantity} ${styles.totalQuantity}`}>
                    {formatQuantity(ingredient.totalQuantity)}
                  </div>
                  <div className={styles.ingredientUnit}>{ingredient.unitName}</div>
                </div>
              ))}
            </div>

            <div className={styles.summaryInfo}>
              <p>
                <strong>Tip:</strong> These are the total quantities you need to purchase or prepare
                for all selected recipes combined.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
