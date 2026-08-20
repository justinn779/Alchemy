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
 * Seeds the 5 starter elements the first time any request needs them.
 * Content is static and identical regardless of who triggers the seed, so a
 * plain get-then-create (no transaction) is safe: a rare concurrent double
 * write is harmless because both writers would write byte-identical data.
 */
export async function ensureStarterElements(): Promise<void> {
  const now = Date.now();
  await Promise.all(
    STARTER_ELEMENTS.map(async (seed) => {
      const ref = elementsCol.doc(seed.id);
      const snap = await ref.get();
      if (!snap.exists) {
        await ref.set(buildStarterElementDoc(seed, now));
      }
    }),
  );
}
