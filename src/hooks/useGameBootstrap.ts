import { useEffect, useState } from 'react';
import { ensureUserInitialized } from '@/services/functionsApi';

export type BootstrapStatus = 'idle' | 'pending' | 'done' | 'error';

/**
 * Calls the idempotent ensureUserInitialized callable once per signed-in
 * uid — and again whenever `isAnonymous` flips (test mode → linked to a
 * real Google account), since linking preserves the same uid so it
 * wouldn't otherwise re-trigger.
 */
export function useGameBootstrap(uid: string | null, isAnonymous: boolean) {
  const [status, setStatus] = useState<BootstrapStatus>('idle');
  const [needsInventorTitle, setNeedsInventorTitle] = useState(false);

  useEffect(() => {
    if (!uid) {
      setStatus('idle');
      return;
    }
    let cancelled = false;
    setStatus('pending');
    ensureUserInitialized()
      .then((result) => {
        if (cancelled) return;
        setNeedsInventorTitle(result.needsInventorTitle);
        setStatus('done');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error('ensureUserInitialized failed', err);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [uid, isAnonymous]);

  return { status, needsInventorTitle, clearNeedsInventorTitle: () => setNeedsInventorTitle(false) };
}
