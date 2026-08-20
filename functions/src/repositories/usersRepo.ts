import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../admin.js';
import type { UserDoc } from '../types/models.js';
import { MANA_CONFIG } from '../types/models.js';

const usersCol = db.collection('users');

export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  const snap = await usersCol.doc(uid).get();
  return snap.exists ? (snap.data() as UserDoc) : null;
}

export interface NewUserProfile {
  displayName: string;
  photoURL: string | null;
}

/** Creates users/{uid} with starting mana/gold if it doesn't exist yet. Idempotent. */
export async function ensureUserDoc(uid: string, profile: NewUserProfile): Promise<UserDoc> {
  const ref = usersCol.doc(uid);
  const snap = await ref.get();
  if (snap.exists) {
    return snap.data() as UserDoc;
  }

  const now = Date.now();
  const newUser: UserDoc = {
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    mana: MANA_CONFIG.MAX_MANA,
    maxMana: MANA_CONFIG.MAX_MANA,
    lastManaUpdatedAt: now,
    gold: 0,
    discoveryCount: 0,
    worldFirstCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(newUser);
  return newUser;
}

export async function incrementDiscoveryCount(uid: string, amount: number): Promise<void> {
  if (amount <= 0) return;
  await usersCol.doc(uid).update({
    discoveryCount: FieldValue.increment(amount),
    updatedAt: Date.now(),
  });
}
