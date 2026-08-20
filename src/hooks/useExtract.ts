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

  const extract = async (elementId: string) => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const data = await extractElementApi(elementId);
      setResult({
        resultElement: data.resultElement,
        isNewToPlayer: data.isNewToPlayer,
        isWorldFirst: data.isWorldFirst,
      });
    } catch (err) {
      setError(describeExtractError(err));
    } finally {
      setPending(false);
    }
  };

  const dismissResult = () => setResult(null);

  return { pending, error, result, extract, dismissResult };
}
