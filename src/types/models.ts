/**
 * Shared domain types.
 * SOURCE OF TRUTH — the frontend copy at src/types/models.ts must be kept
 * byte-identical to this file until a real shared package is worth it.
 */

/** Categories the AI is allowed to assign to a combine/extract result. */
export const AI_ASSIGNABLE_CATEGORIES = [
  '自然',
  '科學',
  '生物',
  '化學',
  '物理',
  '科技',
  '文明',
  '歷史',
  '文化',
  '神話',
  '抽象概念',
  '日常物品',
  '食物',
  '職業',
  '娛樂',
] as const;

/** '起源' is reserved for the 5 starter elements and is never AI-assignable. */
export const ELEMENT_CATEGORIES = [...AI_ASSIGNABLE_CATEGORIES, '起源'] as const;

export type ElementCategory = (typeof ELEMENT_CATEGORIES)[number];

export interface ElementDoc {
  id: string;
  name: string;
  normalizedName: string;
  description: string;
  category: ElementCategory;
  /** 1–3 emoji representing the concept. 1 in the common case; 2 or 3 only when genuinely equally apt. */
  icons: string[];
  /** 0–10 in 0.5 steps (21 levels). How rare/exotic the concept is. */
  rarity: number;
  creatorId: string;
  creatorName: string;
  createdAt: number; // epoch millis
  isStarter: boolean;
  /** the recipeKey that first produced this element, if any (starters have none) */
  firstRecipeKey: string | null;
}

export interface RecipeDoc {
  id: string; // == recipeKey, `${minElementId}_${maxElementId}`
  elementAId: string;
  elementBId: string;
  /** null when the AI judged these two concepts to have no reasonable connection. */
  resultElementId: string | null;
  failed: boolean;
  creatorId: string;
  creatorName: string;
  createdAt: number;
}

export interface ExtractRecipeDoc {
  id: string; // == sourceElementId
  sourceElementId: string;
  /** null when the AI judged this concept to have no further extractable essence. */
  resultElementId: string | null;
  failed: boolean;
  creatorId: string;
  creatorName: string;
  createdAt: number;
}

export interface UserDoc {
  displayName: string;
  photoURL: string | null;
  gold: number;
  discoveryCount: number;
  worldFirstCount: number;
  /** True once the player has chosen a custom "發明家稱號" (only asked of real, non-anonymous accounts). */
  hasSetDisplayName: boolean;
  /** Combine/extract actions taken while signed in anonymously ("test mode"). Capped at TEST_MODE_ACTION_LIMIT. */
  testActionCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface UserElementDoc {
  id: string; // == `${uid}_${elementId}`
  uid: string;
  elementId: string;
  discoveredAt: number;
  /** This player's combine/extract call was the one that created this element for the whole world (inventor). */
  isWorldFirst: boolean;
  /** This player's combine/extract call was the first to find *this* recipe/source, but the result already
   * existed via a different pairing (discoverer of a new path, not the original inventor). Mutually exclusive with isWorldFirst. */
  isDiscoverer: boolean;
}

export interface CombineHistoryDoc {
  id: string;
  uid: string;
  elementAId: string;
  elementBId: string;
  resultElementId: string;
  createdAt: number;
}

export interface AiUsageMetricDoc {
  id: string;
  uid: string;
  kind: 'combine' | 'extract';
  provider: string;
  model: string;
  recipeKey: string;
  latencyMs: number;
  success: boolean;
  createdAt: number;
}

/** Result returned to the client by the combineElements callable. */
export type CombineResult =
  | {
      success: true;
      resultElement: ElementDoc;
      isNewToPlayer: boolean;
      isWorldFirst: boolean;
      isDiscoverer: boolean;
      goldEarned: number;
      goldTotal: number;
      /** True if this was a test-mode (anonymous) preview: nothing was saved to the player's collection. */
      isTestMode: boolean;
    }
  | { success: false };

export type ExtractResult =
  | {
      success: true;
      resultElement: ElementDoc;
      isNewToPlayer: boolean;
      isWorldFirst: boolean;
      isDiscoverer: boolean;
      goldEarned: number;
      goldTotal: number;
      /** True if this was a test-mode (anonymous) preview: nothing was saved to the player's collection. */
      isTestMode: boolean;
    }
  | { success: false };

export const TEST_MODE_ACTION_LIMIT = 30;

export const STARTER_ELEMENT_NAMES = ['水', '火', '土', '風', '雷'] as const;
export type StarterElementName = (typeof STARTER_ELEMENT_NAMES)[number];

export const GOLD_CONFIG = {
  NEW_DISCOVERY: 1,
  DISCOVERER_BONUS: 3,
  WORLD_FIRST_BONUS: 10,
} as const;
