/**
 * Canonicalizes an element name for dedup lookups (spec section 5).
 * Unicode-normalizes, strips all whitespace, and lowercases ASCII so that
 * "AI", "ai", " AI " and full/half-width variants all collide on the same
 * normalizedName instead of spawning near-duplicate elements.
 *
 * Kept as its own module so a future semantic-dedup pass (embeddings, etc.)
 * has a single seam to slot into without touching call sites.
 */
export function normalizeElementName(raw: string): string {
  return raw.normalize('NFKC').trim().replace(/\s+/g, '').toLowerCase();
}
