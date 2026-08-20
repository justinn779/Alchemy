import type { ElementCategory } from '../types/models.js';

export interface CombineInput {
  elementAName: string;
  elementBName: string;
}

export interface ExtractInput {
  elementName: string;
}

export interface AlchemyAIResult {
  result: string;
  description: string;
  category: ElementCategory;
}

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
