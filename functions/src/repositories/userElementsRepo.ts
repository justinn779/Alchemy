import { db } from '../admin.js';
import type { UserElementDoc } from '../types/models.js';

const userElementsCol = db.collection('userElements');

export function userElementDocId(uid: string, elementId: string): string {
  return `${uid}_${elementId}`;
}

export async function getUserElement(uid: string, elementId: string): Promise<UserElementDoc | null> {
  const snap = await userElementsCol.doc(userElementDocId(uid, elementId)).get();
  return snap.exists ? (snap.data() as UserElementDoc) : null;
}

/**
 * Grants an element to a player's collection if they don't already own it.
 * Returns true if this call actually granted it (so callers can decide
 * whether to award "NEW" / gold), false if the player already had it.
 */
export async function grantElementIfMissing(
  uid: string,
  elementId: string,
  isWorldFirst: boolean,
): Promise<boolean> {
  const docId = userElementDocId(uid, elementId);
  const ref = userElementsCol.doc(docId);
  const snap = await ref.get();
  if (snap.exists) {
    return false;
  }

  const doc: UserElementDoc = {
    id: docId,
    uid,
    elementId,
    discoveredAt: Date.now(),
    isWorldFirst,
    isDiscoverer: false,
  };
  await ref.set(doc);
  return true;
}
