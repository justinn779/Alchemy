import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { ensureStarterElements } from './repositories/elementsRepo.js';
import { ensureUserDoc, incrementDiscoveryCount, getUserDoc } from './repositories/usersRepo.js';
import { grantElementIfMissing } from './repositories/userElementsRepo.js';
import { STARTER_ELEMENTS } from './domain/starterElements.js';
import { isAnonymousAuth } from './domain/authHelpers.js';
import type { UserDoc } from './types/models.js';

/**
 * Idempotent post-login bootstrap: the frontend calls this once whenever
 * auth state resolves to a signed-in user. Safe to call on every app load —
 * it self-heals (grants any missing starter elements) rather than assuming
 * it only ever runs once per account.
 */
export const ensureUserInitialized = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) {
    throw new HttpsError('unauthenticated', '需要登入才能初始化玩家資料。');
  }
  const uid = auth.uid;

  await ensureStarterElements();

  const token = auth.token;
  const displayName =
    (typeof token['name'] === 'string' && token['name']) || '匿名煉金術士';
  const photoURL = (typeof token['picture'] === 'string' && token['picture']) || null;

  await ensureUserDoc(uid, { displayName, photoURL });

  let grantedCount = 0;
  for (const starter of STARTER_ELEMENTS) {
    const granted = await grantElementIfMissing(uid, starter.id, false);
    if (granted) grantedCount++;
  }
  if (grantedCount > 0) {
    await incrementDiscoveryCount(uid, grantedCount);
  }

  const user = (await getUserDoc(uid)) as UserDoc;
  return {
    user,
    starterElementIds: STARTER_ELEMENTS.map((s) => s.id),
    // Only ever asked of real (non-anonymous) accounts that haven't picked one yet.
    needsInventorTitle: !user.hasSetDisplayName && !isAnonymousAuth(auth),
  };
});
