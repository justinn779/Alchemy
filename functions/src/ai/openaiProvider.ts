import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { AI_ASSIGNABLE_CATEGORIES } from '../types/models.js';
import { buildCombineMessages, buildExtractMessages } from './promptTemplates.js';
import type {
  AlchemyAIProvider,
  AlchemyAIResult,
  ChatMessage,
  CombineInput,
  ExtractInput,
} from './provider.js';

const resultSchema = z.object({
  result: z.string().min(1).max(10),
  description: z.string().min(1).max(80),
  category: z.enum(AI_ASSIGNABLE_CATEGORIES),
});

const MAX_ATTEMPTS = 3;
const DEFAULT_MODEL = 'gpt-4.1-mini';

export class OpenAIAlchemyProvider implements AlchemyAIProvider {
  readonly name = 'openai';
  readonly model: string;
  private readonly client: OpenAI;

  constructor(apiKey: string, model: string = DEFAULT_MODEL) {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async combine(input: CombineInput): Promise<AlchemyAIResult> {
    return this.run(buildCombineMessages(input));
  }

  async extract(input: ExtractInput): Promise<AlchemyAIResult> {
    return this.run(buildExtractMessages(input));
  }

  private async run(messages: ChatMessage[]): Promise<AlchemyAIResult> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const completion = await this.client.beta.chat.completions.parse({
          model: this.model,
          messages,
          response_format: zodResponseFormat(resultSchema, 'alchemy_result'),
          max_completion_tokens: 200,
          temperature: 1,
        });
        const parsed = completion.choices[0]?.message.parsed;
        if (!parsed) {
          throw new Error('OpenAI returned no parsed structured output');
        }
        return parsed;
      } catch (err) {
        lastError = err;
      }
    }
    throw new Error(
      `OpenAI combine/extract failed after ${MAX_ATTEMPTS} attempts: ${String(lastError)}`,
    );
  }
}
