import { onCall } from 'firebase-functions/v2/https';

/**
 * Phase 2 smoke-test callable — confirms the Functions deploy pipeline works
 * end-to-end. Real gameplay callables (combineElements, extractElement, ...)
 * land in later phases.
 */
export const ping = onCall(() => {
  return { ok: true, timestamp: Date.now() };
});

export { ensureUserInitialized } from './bootstrap.js';
export { combineElements } from './combine.js';
export { extractElement } from './extract.js';
