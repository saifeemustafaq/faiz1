export interface RecipeIngredient {
  productId: string;
  productName: string;
  quantity: number;
  unitId: string;
  unitName: string;
}

export interface Recipe {
  id: string;
  name: string;
  baseServings: number;
  ingredients: RecipeIngredient[];
  createdAt: string;
  updatedAt: string;
}

export interface RecipeFormData {
  name: string;
  baseServings: number;
  ingredients: RecipeIngredient[];
}

