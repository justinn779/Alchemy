import { useState } from 'react';
import { combineElementsApi } from '@/services/functionsApi';
import type { ElementDoc } from '@/types/models';

export interface CombineResultView {
  resultElement: ElementDoc;
  isNewToPlayer: boolean;
  isWorldFirst: boolean;
}

function describeCombineError(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message;
  }
  return '煉成失敗，請稍後再試一次。';
}

export function useCombine() {
  const [slotA, setSlotA] = useState<ElementDoc | null>(null);
  const [slotB, setSlotB] = useState<ElementDoc | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CombineResultView | null>(null);

  /** First click fills slot A, second fills slot B, a third replaces A and clears B. */
  const pickElement = (element: ElementDoc) => {
    setError(null);
    if (!slotA) {
      setSlotA(element);
      return;
    }
    if (!slotB) {
      setSlotB(element);
      return;
    }
    setSlotA(element);
    setSlotB(null);
  };

  const clearSlotA = () => setSlotA(null);
  const clearSlotB = () => setSlotB(null);

  const combine = async () => {
    if (!slotA || !slotB || pending) return;
    setPending(true);
    setError(null);
    try {
      const data = await combineElementsApi(slotA.id, slotB.id);
      setResult({
        resultElement: data.resultElement,
        isNewToPlayer: data.isNewToPlayer,
        isWorldFirst: data.isWorldFirst,
      });
      setSlotA(null);
      setSlotB(null);
    } catch (err) {
      setError(describeCombineError(err));
    } finally {
      setPending(false);
    }
  };

  const dismissResult = () => setResult(null);

  return {
    slotA,
    slotB,
    pending,
    error,
    result,
    pickElement,
    clearSlotA,
    clearSlotB,
    combine,
    dismissResult,
  };
}
