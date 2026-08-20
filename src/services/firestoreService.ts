import {
  collection,
  doc,
  documentId,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  CombineHistoryDoc,
  ElementDoc,
  RecipeDoc,
  UserDoc,
  UserElementDoc,
} from '@/types/models';

const HISTORY_LIMIT = 20;

export function subscribeToUserDoc(
  uid: string,
  onChange: (user: UserDoc | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    onChange(snap.exists() ? (snap.data() as UserDoc) : null);
  });
}

export function subscribeToUserElements(
  uid: string,
  onChange: (entries: UserElementDoc[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'userElements'),
    where('uid', '==', uid),
    orderBy('discoveredAt', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => d.data() as UserElementDoc));
  });
}

const FIRESTORE_IN_QUERY_LIMIT = 30;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/** Batched lookup of elements/{id} docs, chunked to respect Firestore's 30-item `in` cap. */
export async function fetchElementsByIds(ids: string[]): Promise<Map<string, ElementDoc>> {
  const uniqueIds = [...new Set(ids)];
  const result = new Map<string, ElementDoc>();
  if (uniqueIds.length === 0) return result;

  const elementsCol = collection(db, 'elements');
  await Promise.all(
    chunk(uniqueIds, FIRESTORE_IN_QUERY_LIMIT).map(async (idsChunk) => {
      const q = query(elementsCol, where(documentId(), 'in', idsChunk));
      const snap = await getDocs(q);
      snap.forEach((d) => result.set(d.id, d.data() as ElementDoc));
    }),
  );
  return result;
}

export function subscribeToCombineHistory(
  uid: string,
  onChange: (entries: CombineHistoryDoc[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'combineHistory'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(HISTORY_LIMIT),
  );
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => d.data() as CombineHistoryDoc));
  });
}

/**
 * Every recipe (possibly more than one, due to normalizedName dedup) that
 * produces the given element as its result. Callers filter to the ones
 * where the player owns both ingredients — see genealogy.ts — so this never
 * surfaces a recipe the player hasn't effectively already "earned" by
 * owning its two inputs.
 */
export async function fetchRecipesByResult(resultElementId: string): Promise<RecipeDoc[]> {
  const q = query(collection(db, 'recipes'), where('resultElementId', '==', resultElementId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as RecipeDoc);
}
