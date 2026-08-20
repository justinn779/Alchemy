import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { z } from 'zod';
import { setDisplayName } from './repositories/usersRepo.js';

const inputSchema = z.object({
  title: z.string().trim().min(1).max(20),
});

/** Lets a (real, registered) player pick the public name shown as "發明者"/"發現者" on everything they create. */
export const setInventorTitle = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) {
    throw new HttpsError('unauthenticated', '需要登入才能設定稱號。');
  }

  const parsed = inputSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', '稱號長度需在 1～20 個字之間。');
  }

  await setDisplayName(auth.uid, parsed.data.title);
  return { displayName: parsed.data.title };
});
