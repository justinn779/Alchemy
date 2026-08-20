import { db } from '../admin.js';
import type { ElementDoc } from '../types/models.js';
import { STARTER_ELEMENTS, buildStarterElementDoc } from '../domain/starterElements.js';

const elementsCol = db.collection('elements');

export async function getElementById(elementId: string): Promise<ElementDoc | null> {
  const snap = await elementsCol.doc(elementId).get();
  return snap.exists ? (snap.data() as ElementDoc) : null;
}

export async function findElementByNormalizedName(
  normalizedName: string,
): Promise<ElementDoc | null> {
  const snap = await elementsCol.where('normalizedName', '==', normalizedName).limit(1).get();
  return snap.empty ? null : (snap.docs[0]!.data() as ElementDoc);
}

export function elementDocRef(elementId: string) {
  return elementsCol.doc(elementId);
}

export function newElementDocRef() {
  return elementsCol.doc();
}

export function elementsByNormalizedNameQuery(normalizedName: string) {
  return elementsCol.where('normalizedName', '==', normalizedName).limit(1);
}

/**
 * Seeds/upserts the 5 starter elements on every call. Content is static and
 * identical regardless of who triggers it, so an unconditional upsert (no
 * transaction) is safe — it also self-heals existing docs when the starter
 * definitions change (e.g. icons added later), while preserving the
 * original createdAt instead of resetting it.
 */
export async function ensureStarterElements(): Promise<void> {
  const now = Date.now();
  await Promise.all(
    STARTER_ELEMENTS.map(async (seed) => {
      const ref = elementsCol.doc(seed.id);
      const snap = await ref.get();
      const createdAt = snap.exists ? (snap.data() as ElementDoc).createdAt : now;
      await ref.set(buildStarterElementDoc(seed, createdAt));
    }),
  );
}
