import { fetchRecipesByResult } from './firestoreService';
import type { ElementDoc } from '@/types/models';

export interface GenealogyNode {
  element: ElementDoc;
  /** null for starters, or for an element with no combine-recipe the player owns both inputs for (e.g. extract-derived). */
  parents: [GenealogyNode, GenealogyNode] | null;
}

/**
 * Recursively traces an element's origin back through recipes the player
 * "knows" (owns both ingredients for) down to the 5 starter elements.
 *
 * This only ever walks recipes whose two inputs the player already owns —
 * by construction, if the player owns a non-starter element, they must have
 * combined it from two elements they owned, so a qualifying recipe always
 * exists for it. Memoized so a shared ancestor (e.g. 水) is only fetched
 * once even if it appears at multiple points in the tree.
 */
export async function buildGenealogy(
  elementId: string,
  ownedIds: ReadonlySet<string>,
  elementsCache: ReadonlyMap<string, ElementDoc>,
  memo: Map<string, Promise<GenealogyNode>> = new Map(),
): Promise<GenealogyNode> {
  const existing = memo.get(elementId);
  if (existing) return existing;

  const promise = (async (): Promise<GenealogyNode> => {
    const element = elementsCache.get(elementId);
    if (!element) {
      throw new Error(`genealogy: element ${elementId} not in cache`);
    }

    if (element.isStarter) {
      return { element, parents: null };
    }

    const recipes = await fetchRecipesByResult(elementId);
    const knownRecipe = recipes.find(
      (r) => ownedIds.has(r.elementAId) && ownedIds.has(r.elementBId),
    );
    if (!knownRecipe) {
      return { element, parents: null };
    }

    const [parentA, parentB] = await Promise.all([
      buildGenealogy(knownRecipe.elementAId, ownedIds, elementsCache, memo),
      buildGenealogy(knownRecipe.elementBId, ownedIds, elementsCache, memo),
    ]);
    return { element, parents: [parentA, parentB] };
  })();

  memo.set(elementId, promise);
  return promise;
}

/** Counts combine steps in the tree — one per non-leaf node, de-duplicated by element id. */
export function countCombineSteps(root: GenealogyNode): number {
  const walk = (node: GenealogyNode, seen: Set<string>): number => {
    if (seen.has(node.element.id)) return 0;
    seen.add(node.element.id);
    if (!node.parents) return 0;
    return 1 + walk(node.parents[0], seen) + walk(node.parents[1], seen);
  };
  return walk(root, new Set());
}
