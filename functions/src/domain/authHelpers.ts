/**
 * Minimal shape we need from CallableRequest['auth'] — kept local rather than
 * imported because firebase-functions/v2/https doesn't re-export AuthData.
 */
export interface AuthLike {
  token: Record<string, unknown>;
}

/** True when the caller is signed in anonymously (i.e. "test mode", not a registered account). */
export function isAnonymousAuth(auth: AuthLike): boolean {
  const firebaseClaim = auth.token['firebase'];
  if (!firebaseClaim || typeof firebaseClaim !== 'object') return false;
  return (firebaseClaim as { sign_in_provider?: unknown }).sign_in_provider === 'anonymous';
}
