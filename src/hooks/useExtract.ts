import { useState } from 'react';
import { extractElementApi } from '@/services/functionsApi';
import type { CombineResultView } from './useCombine';

function describeExtractError(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message;
  }
  return '萃取失敗，請稍後再試一次。';
}

export function useExtract() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CombineResultView | null>(null);

  /** Returns true if the request completed (with a result either way) so the caller can clear slots; false on a thrown error, so the selection survives for a retry. */
  const extract = async (elementId: string): Promise<boolean> => {
    if (pending) return false;
    setPending(true);
    setError(null);
    try {
      const data = await extractElementApi(elementId);
      setResult(
        data.success
          ? {
              success: true,
              resultElement: data.resultElement,
              isNewToPlayer: data.isNewToPlayer,
              isWorldFirst: data.isWorldFirst,
              isDiscoverer: data.isDiscoverer,
            }
          : { success: false },
      );
      return true;
    } catch (err) {
      setError(describeExtractError(err));
      return false;
    } finally {
      setPending(false);
    }
  };

  const dismissResult = () => setResult(null);

  return { pending, error, result, extract, dismissResult };
}
