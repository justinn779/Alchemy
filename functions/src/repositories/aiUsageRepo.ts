import { db } from '../admin.js';
import type { AiUsageMetricDoc } from '../types/models.js';

const aiUsageCol = db.collection('aiUsageMetrics');

/** Fire-and-forget cost/observability log — never blocks or fails the caller. */
export function recordAiUsage(entry: Omit<AiUsageMetricDoc, 'id' | 'createdAt'>): void {
  const ref = aiUsageCol.doc();
  const doc: AiUsageMetricDoc = { ...entry, id: ref.id, createdAt: Date.now() };
  ref.set(doc).catch((err: unknown) => {
    console.error('failed to record AI usage metric', err);
  });
}
