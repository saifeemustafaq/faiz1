'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Recipe, RecipeIngredient } from '@/types/recipe';
import styles from './RecipeModal.module.css';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: (id: string) => void;
  recipe?: Recipe;
  products: Array<{ id: string; name: string }>;
  units: Array<{ id: string; name: string; abbreviation: string }>;
  mode?: 'view' | 'edit' | 'add';
}

export default function RecipeModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  recipe,
  products,
  units,
  mode: initialMode = 'add',
}: RecipeModalProps) {
  const [mode, setMode] = useState<'view' | 'edit' | 'add'>(initialMode);
  const [name, setName] = useState('');
  const [baseServings, setBaseServings] = useState(50);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);

  useEffect(() => {
    setMode(initialMode);
    if (recipe) {
      setName(recipe.name);
      setBaseServings(recipe.baseServings);
      setIngredients(recipe.ingredients);
    } else {
      setName('');
      setBaseServings(50);
      setIngredients([]);
    }
  }, [recipe, isOpen, initialMode]);

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        productId: '',
        productName: '',
        quantity: 0,
        unitId: '',
        unitName: '',
      },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof RecipeIngredient,
    value: string | number
  ) => {
    const updated = [...ingredients];
    
    if (field === 'productId') {
      const product = products.find((p) => p.id === value);
      updated[index] = {
        ...updated[index],
        productId: value as string,
        productName: product?.name || '',
      };
    } else if (field === 'unitId') {
      const unit = units.find((u) => u.id === value);
      updated[index] = {
        ...updated[index],
        unitId: value as string,
        unitName: unit?.name || '',
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    }
    
    setIngredients(updated);
  };

  const handleSubmit = () => {
    const validIngredients = ingredients.filter(
      (ing) => ing.productId && ing.quantity > 0 && ing.unitId
    );

    if (!name.trim() || baseServings <= 0 || validIngredients.length === 0) {
      return;
    }

    onSave({
      name: name.trim(),
      baseServings,
      ingredients: validIngredients,
    });

    onClose();
  };

  const handleDelete = () => {
    if (recipe && onDelete) {
      if (confirm(`Are you sure you want to delete the recipe "${recipe.name}"?`)) {
        onDelete(recipe.id);
        onClose();
      }
    }
  };

  const handleEditClick = () => {
    setMode('edit');
  };

  const isValid = () => {
    const validIngredients = ingredients.filter(
      (ing) => ing.productId && ing.quantity > 0 && ing.unitId
    );
    return name.trim() && baseServings > 0 && validIngredients.length > 0;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {mode === 'view' ? recipe?.name : mode === 'edit' ? 'Edit Recipe' : 'Add New Recipe'}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {mode === 'view' && recipe ? (
            <>
              <div className={styles.viewSection}>
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Base Servings:</span>
                  <span className={styles.viewValue}>{recipe.baseServings} people</span>
                </div>
              </div>

              <div className={styles.ingredientsSection}>
                <div className={styles.ingredientsSectionHeader}>
                  <h3 className={styles.sectionTitle}>Ingredients</h3>
                </div>

                <div className={styles.viewIngredientsList}>
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className={styles.viewIngredientRow}>
                      <span className={styles.ingredientName}>{ingredient.productName}</span>
                      <span className={styles.ingredientQuantity}>
                        {ingredient.quantity} {ingredient.unitName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="recipeName">
              Dish Name *
            </label>
            <input
              id="recipeName"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Tomato Potato Curry"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="baseServings">
              Base Number of People *
            </label>
            <input
              id="baseServings"
              type="number"
              className={styles.input}
              value={baseServings}
              onChange={(e) => setBaseServings(Number(e.target.value))}
              min="1"
              placeholder="e.g., 50"
            />
          </div>

          <div className={styles.ingredientsSection}>
            <div className={styles.ingredientsSectionHeader}>
              <h3 className={styles.sectionTitle}>Ingredients *</h3>
            </div>

            <div className={styles.ingredientsList}>
              {ingredients.map((ingredient, index) => (
                <div key={index} className={styles.ingredientRow}>
                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.label}>Ingredient</label>
                    <select
                      className={styles.select}
                      value={ingredient.productId}
                      onChange={(e) =>
                        handleIngredientChange(index, 'productId', e.target.value)
                      }
                    >
                      <option value="">Select ingredient</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.label}>Quantity</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={ingredient.quantity || ''}
                      onChange={(e) =>
                        handleIngredientChange(
                          index,
                          'quantity',
                          Number(e.target.value)
                        )
                      }
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.label}>Unit</label>
                    <select
                      className={styles.select}
                      value={ingredient.unitId}
                      onChange={(e) =>
                        handleIngredientChange(index, 'unitId', e.target.value)
                      }
                    >
                      <option value="">Select unit</option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveIngredient(index)}
                    aria-label="Remove ingredient"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              className={styles.addIngredientButton}
              onClick={handleAddIngredient}
            >
              <Plus size={18} />
              Add Ingredient
            </button>
          </div>
          </>
          )}
        </div>

        <div className={styles.modalFooter}>
          {mode === 'view' && recipe ? (
            <>
              <button
                className={`${styles.button} ${styles.deleteButton}`}
                onClick={handleDelete}
              >
                Delete Recipe
              </button>
              <button
                className={`${styles.button} ${styles.editButton}`}
                onClick={handleEditClick}
              >
                Edit Recipe
              </button>
            </>
          ) : (
            <>
          <button className={`${styles.button} ${styles.cancelButton}`} onClick={onClose}>
            Cancel
          </button>
          <button
            className={`${styles.button} ${styles.saveButton}`}
            onClick={handleSubmit}
            disabled={!isValid()}
          >
            {mode === 'edit' ? 'Update Recipe' : 'Create Recipe'}
          </button>
          </>
          )}
        </div>
      </div>
    </div>
  );
}

