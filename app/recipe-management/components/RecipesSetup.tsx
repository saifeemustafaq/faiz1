'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ChefHat } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import RecipeModal from './RecipeModal';
import styles from './RecipesSetup.module.css';

interface RecipesSetupProps {
  recipes: Recipe[];
  products: Array<{ id: string; name: string }>;
  units: Array<{ id: string; name: string; abbreviation: string }>;
  onCreateRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateRecipe: (id: string, recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteRecipe: (id: string) => void;
}

export default function RecipesSetup({
  recipes,
  products,
  units,
  onCreateRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
}: RecipesSetupProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>();
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('add');

  const handleAddRecipe = () => {
    setEditingRecipe(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEditingRecipe(recipe);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteRecipe = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the recipe "${name}"?`)) {
      onDeleteRecipe(id);
      setIsModalOpen(false);
      setEditingRecipe(undefined);
    }
  };

  const handleSaveRecipe = (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingRecipe && modalMode === 'edit') {
      onUpdateRecipe(editingRecipe.id, recipeData);
    } else if (modalMode === 'add') {
      onCreateRecipe(recipeData);
    }
    setIsModalOpen(false);
    setEditingRecipe(undefined);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecipe(undefined);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Recipes Setup</h2>
        <button
          className={`${styles.button} ${styles.primaryButton}`}
          onClick={handleAddRecipe}
        >
          <Plus size={20} />
          Add New Recipe
        </button>
      </div>

      {recipes.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <ChefHat size={64} strokeWidth={1} />
          </div>
          <p className={styles.emptyStateText}>
            No recipes yet. Click "Add New Recipe" to create your first recipe.
          </p>
        </div>
      ) : (
        <div className={styles.recipeList}>
          {recipes.map((recipe) => (
            <div 
              key={recipe.id} 
              className={styles.recipeCard}
              onClick={() => handleViewRecipe(recipe)}
            >
              <div className={styles.recipeCardHeader}>
                <h3 className={styles.recipeName}>{recipe.name}</h3>
                <div className={styles.recipeActions}>
                  <button
                    className={styles.iconButton}
                    onClick={(e) => handleEditRecipe(recipe, e)}
                    aria-label="Edit recipe"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    className={`${styles.iconButton} ${styles.deleteButton}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRecipe(recipe.id, recipe.name);
                    }}
                    aria-label="Delete recipe"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <p className={styles.recipeInfo}>
                Defined for <strong>{recipe.baseServings}</strong> people
              </p>
              <p className={styles.ingredientCount}>
                {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>
      )}

      <RecipeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRecipe}
        onDelete={(id) => handleDeleteRecipe(id, editingRecipe?.name || '')}
        recipe={editingRecipe}
        products={products}
        units={units}
        mode={modalMode}
      />
    </div>
  );
}

