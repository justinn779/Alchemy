import { defineSecret } from 'firebase-functions/params';
import { OpenAIAlchemyProvider } from './openaiProvider.js';
import type { AlchemyAIProvider } from './provider.js';

export const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

/**
 * Provider selection lives in exactly one place. Adding GeminiAlchemyProvider
 * or ClaudeAlchemyProvider later means implementing AlchemyAIProvider and
 * adding a branch here — combine.ts/extract.ts never change.
 */
export function getAIProvider(): AlchemyAIProvider {
  return new OpenAIAlchemyProvider(OPENAI_API_KEY.value());
}
