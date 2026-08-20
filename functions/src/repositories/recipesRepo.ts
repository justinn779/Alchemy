import { db } from '../admin.js';
import type { RecipeDoc } from '../types/models.js';

const recipesCol = db.collection('recipes');

/** A + B == B + A: sort the two ids so both orderings hash to the same key. */
export function buildRecipeKey(elementAId: string, elementBId: string): string {
  return [elementAId, elementBId].sort().join('_');
}

export async function getRecipe(recipeKey: string): Promise<RecipeDoc | null> {
  const snap = await recipesCol.doc(recipeKey).get();
  return snap.exists ? (snap.data() as RecipeDoc) : null;
}

export function recipeDocRef(recipeKey: string) {
  return recipesCol.doc(recipeKey);
}
