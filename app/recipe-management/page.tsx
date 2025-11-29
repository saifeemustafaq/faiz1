'use client';

import { useState, useEffect } from 'react';
import { ChefHat, Calculator } from 'lucide-react';
import RecipesSetup from './components/RecipesSetup';
import IngredientsCalculator from './components/IngredientsCalculator';
import { Recipe } from '@/types/recipe';
import { recipeService } from './services/recipeService';
import styles from './page.module.css';

type TabType = 'setup' | 'calculator';

interface Product {
  id: string;
  name: string;
  category: string;
}

interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

export default function RecipeManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('setup');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [recipesData, productsData, unitsData] = await Promise.all([
        recipeService.getAllRecipes(),
        fetch('/api/data?type=products').then((r) => r.json()),
        fetch('/api/data?type=units').then((r) => r.json()),
      ]);

      setRecipes(recipesData);
      setProducts(productsData.products || []);
      setUnits(unitsData.units || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRecipe = await recipeService.createRecipe(recipeData);
      setRecipes([...recipes, newRecipe]);
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Failed to create recipe. Please try again.');
    }
  };

  const handleUpdateRecipe = async (
    id: string,
    recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const updatedRecipe = await recipeService.updateRecipe(id, recipeData);
      setRecipes(recipes.map((r) => (r.id === id ? updatedRecipe : r)));
    } catch (error) {
      console.error('Error updating recipe:', error);
      alert('Failed to update recipe. Please try again.');
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    try {
      await recipeService.deleteRecipe(id);
      setRecipes(recipes.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Recipe Management</h1>
          <p className={styles.subtitle}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Recipe Management</h1>
        <p className={styles.subtitle}>
          Create and manage recipes, then calculate ingredient quantities for any number of people.
        </p>
      </div>

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tab} ${activeTab === 'setup' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('setup')}
        >
          <ChefHat size={20} />
          Recipes Setup
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'calculator' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          <Calculator size={20} />
          Ingredients Calculator
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'setup' && (
          <RecipesSetup
            recipes={recipes}
            products={products}
            units={units}
            onCreateRecipe={handleCreateRecipe}
            onUpdateRecipe={handleUpdateRecipe}
            onDeleteRecipe={handleDeleteRecipe}
          />
        )}

        {activeTab === 'calculator' && (
          <IngredientsCalculator recipes={recipes} units={units} />
        )}
      </div>
    </div>
  );
}

