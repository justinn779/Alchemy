import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import type { CombineResult, ExtractResult, UserDoc } from '@/types/models';

export interface EnsureUserInitializedResult {
  user: UserDoc;
  starterElementIds: string[];
}

/**
 * Idempotent post-login bootstrap. Safe to call every time auth state
 * resolves to a signed-in user — the backend self-heals rather than
 * assuming it only ever runs once (see functions/src/bootstrap.ts).
 */
export async function ensureUserInitialized(): Promise<EnsureUserInitializedResult> {
  const call = httpsCallable<void, EnsureUserInitializedResult>(
    functions,
    'ensureUserInitialized',
  );
  const { data } = await call();
  return data;
}

export async function combineElementsApi(
  elementAId: string,
  elementBId: string,
): Promise<CombineResult> {
  const call = httpsCallable<{ elementAId: string; elementBId: string }, CombineResult>(
    functions,
    'combineElements',
  );
  const { data } = await call({ elementAId, elementBId });
  return data;
}

export async function extractElementApi(elementId: string): Promise<ExtractResult> {
  const call = httpsCallable<{ elementId: string }, ExtractResult>(functions, 'extractElement');
  const { data } = await call({ elementId });
  return data;
}
