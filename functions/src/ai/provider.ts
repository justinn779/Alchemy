import type { ElementCategory } from '../types/models.js';

export interface CombineInput {
  elementAName: string;
  elementBName: string;
}

export interface ExtractInput {
  elementName: string;
}

export type AlchemyAIResult =
  | {
      possible: true;
      result: string;
      description: string;
      category: ElementCategory;
      /** 1–3 emoji representing the concept. 1 in the common case; 2 or 3 only when genuinely equally apt. */
      icons: string[];
      /** 0–10 in 0.5 steps (21 levels). How rare/exotic the concept is. */
      rarity: number;
    }
  | {
      /** The AI found no plausible connection at all — a legitimate, rare outcome. */
      possible: false;
    };

/**
 * The "world rule engine" contract. Every LLM vendor implements this same
 * interface so combine.ts / extract.ts never import a vendor SDK directly —
 * swapping OpenAI for Gemini or Claude is a one-line change in ai/index.ts.
 */
export interface AlchemyAIProvider {
  readonly name: string;
  readonly model: string;
  combine(input: CombineInput): Promise<AlchemyAIResult>;
  extract(input: ExtractInput): Promise<AlchemyAIResult>;
}

/** Provider-agnostic chat message shape used by promptTemplates.ts. */
export interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}
