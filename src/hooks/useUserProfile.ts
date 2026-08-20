import { useEffect, useState } from 'react';
import { subscribeToUserDoc } from '@/services/firestoreService';
import type { UserDoc } from '@/types/models';

export function useUserProfile(uid: string | null) {
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToUserDoc(uid, (user) => {
      setProfile(user);
      setLoading(false);
    });
    return unsubscribe;
  }, [uid]);

  return { profile, loading };
}
