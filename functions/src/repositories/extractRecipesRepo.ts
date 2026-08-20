import { db } from '../admin.js';
import type { ExtractRecipeDoc } from '../types/models.js';

const extractRecipesCol = db.collection('extractRecipes');

export async function getExtractRecipe(sourceElementId: string): Promise<ExtractRecipeDoc | null> {
  const snap = await extractRecipesCol.doc(sourceElementId).get();
  return snap.exists ? (snap.data() as ExtractRecipeDoc) : null;
}

export function extractRecipeDocRef(sourceElementId: string) {
  return extractRecipesCol.doc(sourceElementId);
}
