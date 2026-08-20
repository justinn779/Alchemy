/**
 * Shared domain types.
 * SOURCE OF TRUTH lives in functions/src/types/models.ts — this file is a
 * byte-identical copy for the frontend until a real shared package is worth it.
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
  resultElementId: string;
  creatorId: string;
  creatorName: string;
  createdAt: number;
}

export interface ExtractRecipeDoc {
  id: string; // == sourceElementId
  sourceElementId: string;
  resultElementId: string;
  creatorId: string;
  creatorName: string;
  createdAt: number;
}

export interface UserDoc {
  displayName: string;
  photoURL: string | null;
  mana: number;
  maxMana: number;
  lastManaUpdatedAt: number;
  gold: number;
  discoveryCount: number;
  worldFirstCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface UserElementDoc {
  id: string; // == `${uid}_${elementId}`
  uid: string;
  elementId: string;
  discoveredAt: number;
  isWorldFirst: boolean;
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
export interface CombineResult {
  resultElement: ElementDoc;
  isNewToPlayer: boolean;
  isWorldFirst: boolean;
  manaRemaining: number;
  goldEarned: number;
  goldTotal: number;
}

export interface ExtractResult {
  resultElement: ElementDoc;
  isNewToPlayer: boolean;
  isWorldFirst: boolean;
  manaRemaining: number;
  goldEarned: number;
  goldTotal: number;
}

export const STARTER_ELEMENT_NAMES = ['水', '火', '土', '風', '雷'] as const;
export type StarterElementName = (typeof STARTER_ELEMENT_NAMES)[number];

export const MANA_CONFIG = {
  MAX_MANA: 100,
  COMBINE_COST: 5,
  EXTRACT_COST: 8,
  REGEN_INTERVAL_MS: 3 * 60 * 1000, // +1 mana every 3 minutes
} as const;

export const GOLD_CONFIG = {
  NEW_DISCOVERY: 1,
  WORLD_FIRST_BONUS: 10,
} as const;
