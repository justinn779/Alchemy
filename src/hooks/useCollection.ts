import { useEffect, useMemo, useState } from 'react';
import { fetchElementsByIds, subscribeToUserElements } from '@/services/firestoreService';
import type { ElementDoc, UserElementDoc } from '@/types/models';
import type { CollectionEntry } from '@/types/view';

export function useCollection(uid: string | null) {
  const [userElements, setUserElements] = useState<UserElementDoc[]>([]);
  const [elementsById, setElementsById] = useState<Map<string, ElementDoc>>(new Map());
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setUserElements([]);
      setSubscriptionLoading(false);
      return;
    }
    setSubscriptionLoading(true);
    const unsubscribe = subscribeToUserElements(uid, (entries) => {
      setUserElements(entries);
      setSubscriptionLoading(false);
    });
    return unsubscribe;
  }, [uid]);

  // Join userElements -> elements, fetching only ids we haven't cached yet.
  useEffect(() => {
    const missingIds = userElements
      .map((ue) => ue.elementId)
      .filter((id) => !elementsById.has(id));
    if (missingIds.length === 0) return;

    let cancelled = false;
    void fetchElementsByIds(missingIds).then((fetched) => {
      if (cancelled) return;
      setElementsById((prev) => {
        const next = new Map(prev);
        fetched.forEach((el, id) => next.set(id, el));
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [userElements, elementsById]);

  const entries: CollectionEntry[] = useMemo(
    () =>
      userElements
        .map((ue): CollectionEntry | null => {
          const element = elementsById.get(ue.elementId);
          if (!element) return null;
          return {
            element,
            discoveredAt: ue.discoveredAt,
            isWorldFirst: ue.isWorldFirst,
            isDiscoverer: ue.isDiscoverer ?? false,
          };
        })
        .filter((entry): entry is CollectionEntry => entry !== null),
    [userElements, elementsById],
  );

  const stillJoiningElements = userElements.length > 0 && entries.length < userElements.length;

  return {
    entries,
    loading: subscriptionLoading || stillJoiningElements,
    discoveredCount: userElements.length,
    worldFirstCount: userElements.filter((ue) => ue.isWorldFirst).length,
  };
}
