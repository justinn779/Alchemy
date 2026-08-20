import { db } from '../admin.js';
import type { CombineHistoryDoc } from '../types/models.js';

const combineHistoryCol = db.collection('combineHistory');

/** Best-effort log of every combine action (cache-hit or fresh) for the player's recent-history UI. */
export function recordCombineHistory(
  entry: Omit<CombineHistoryDoc, 'id' | 'createdAt'>,
): void {
  const ref = combineHistoryCol.doc();
  const doc: CombineHistoryDoc = { ...entry, id: ref.id, createdAt: Date.now() };
  ref.set(doc).catch((err: unknown) => {
    console.error('failed to record combine history', err);
  });
}
