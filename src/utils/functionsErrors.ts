/** True when a callable-function error carries the { reason: 'test_mode_limit' } detail payload. */
export function isTestModeLimitError(err: unknown): boolean {
  if (!err || typeof err !== 'object' || !('details' in err)) return false;
  const details = (err as { details: unknown }).details;
  if (!details || typeof details !== 'object') return false;
  return (details as { reason?: unknown }).reason === 'test_mode_limit';
}
