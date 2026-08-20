import { useEffect, useState } from 'react';
import { ensureUserInitialized } from '@/services/functionsApi';

export type BootstrapStatus = 'idle' | 'pending' | 'done' | 'error';

/** Calls the idempotent ensureUserInitialized callable once per signed-in uid. */
export function useGameBootstrap(uid: string | null) {
  const [status, setStatus] = useState<BootstrapStatus>('idle');

  useEffect(() => {
    if (!uid) {
      setStatus('idle');
      return;
    }
    let cancelled = false;
    setStatus('pending');
    ensureUserInitialized()
      .then(() => {
        if (!cancelled) setStatus('done');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error('ensureUserInitialized failed', err);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return status;
}
