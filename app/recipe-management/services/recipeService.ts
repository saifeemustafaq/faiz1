import { Recipe, RecipeFormData } from '@/types/recipe';

const API_BASE_URL = '/api/data';

export const recipeService = {
  async getAllRecipes(): Promise<Recipe[]> {
    const response = await fetch(`${API_BASE_URL}?type=recipes`);
    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }
    const data = await response.json();
    return data.recipes || [];
  },

  async createRecipe(recipeData: RecipeFormData): Promise<Recipe> {
    const newRecipe: Recipe = {
      id: `recipe-${Date.now()}`,
      ...recipeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const allRecipes = await this.getAllRecipes();
    const updatedRecipes = [...allRecipes, newRecipe];

    const response = await fetch(`${API_BASE_URL}?type=recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipes: updatedRecipes }),
    });

    if (!response.ok) {
      throw new Error('Failed to create recipe');
    }

    return newRecipe;
  },

  async updateRecipe(id: string, recipeData: RecipeFormData): Promise<Recipe> {
    const allRecipes = await this.getAllRecipes();
    const recipeIndex = allRecipes.findIndex((r) => r.id === id);

    if (recipeIndex === -1) {
      throw new Error('Recipe not found');
    }

    const updatedRecipe: Recipe = {
      ...allRecipes[recipeIndex],
      ...recipeData,
      updatedAt: new Date().toISOString(),
    };

    const updatedRecipes = [...allRecipes];
    updatedRecipes[recipeIndex] = updatedRecipe;

    const response = await fetch(`${API_BASE_URL}?type=recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipes: updatedRecipes }),
    });

    if (!response.ok) {
      throw new Error('Failed to update recipe');
    }

    return updatedRecipe;
  },

  async deleteRecipe(id: string): Promise<void> {
    const allRecipes = await this.getAllRecipes();
    const updatedRecipes = allRecipes.filter((r) => r.id !== id);

    const response = await fetch(`${API_BASE_URL}?type=recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipes: updatedRecipes }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete recipe');
    }
  },

  scaleIngredients(recipe: Recipe, targetServings: number): Recipe {
    const scaleFactor = targetServings / recipe.baseServings;
    return {
      ...recipe,
      ingredients: recipe.ingredients.map((ingredient) => ({
        ...ingredient,
        quantity: ingredient.quantity * scaleFactor,
      })),
    };
  },
};

