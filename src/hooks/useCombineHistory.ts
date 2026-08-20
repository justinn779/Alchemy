import { useEffect, useState } from 'react';
import { subscribeToCombineHistory } from '@/services/firestoreService';
import type { CombineHistoryDoc } from '@/types/models';

export function useCombineHistory(uid: string | null) {
  const [history, setHistory] = useState<CombineHistoryDoc[]>([]);

  useEffect(() => {
    if (!uid) {
      setHistory([]);
      return;
    }
    return subscribeToCombineHistory(uid, setHistory);
  }, [uid]);

  return history;
}
