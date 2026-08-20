import { HttpsError } from 'firebase-functions/v2/https';
import { isAnonymousAuth, type AuthLike } from './authHelpers.js';
import { TEST_MODE_ACTION_LIMIT } from '../types/models.js';
import type { UserDoc } from '../types/models.js';

/**
 * Returns whether this request is from an anonymous ("test mode") account,
 * throwing if they've already used up their trial actions. Real (registered)
 * accounts are never rate-limited here.
 */
export function checkTestMode(auth: AuthLike, userDoc: UserDoc): boolean {
  const isTestMode = isAnonymousAuth(auth);
  if (isTestMode && userDoc.testActionCount >= TEST_MODE_ACTION_LIMIT) {
    throw new HttpsError(
      'resource-exhausted',
      `測試模式已達 ${TEST_MODE_ACTION_LIMIT} 次上限，請登入以繼續遊玩。`,
      { reason: 'test_mode_limit' },
    );
  }
  return isTestMode;
}
