import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../admin.js';
import { calculateGoldReward } from './gold.js';
import { userElementDocId } from '../repositories/userElementsRepo.js';
import type { ElementDoc, UserDoc } from '../types/models.js';

export interface SettlementResult {
  isNewToPlayer: boolean;
  isWorldFirst: boolean;
  goldEarned: number;
  goldTotal: number;
}

/**
 * Grants `resultElement` to `uid`'s collection and settles gold, inside its
 * own transaction so it's fast, retries cleanly on Firestore contention, and
 * is a free no-op if the player already owns the result — which is what
 * makes a double-click or network retry of combine/extract safe to replay
 * without double-awarding gold or double-counting discoveries.
 *
 * Shared by combineElements and extractElement.
 */
export async function settleGrant(
  uid: string,
  resultElement: ElementDoc,
): Promise<SettlementResult> {
  return db.runTransaction(async (tx) => {
    const userRef = db.collection('users').doc(uid);
    const userSnap = await tx.get(userRef);
    const currentUser = userSnap.data() as UserDoc;

    const userElementRef = db
      .collection('userElements')
      .doc(userElementDocId(uid, resultElement.id));
    const userElementSnap = await tx.get(userElementRef);
    const isNewToPlayer = !userElementSnap.exists;

    if (!isNewToPlayer) {
      return {
        isNewToPlayer: false,
        isWorldFirst: false,
        goldEarned: 0,
        goldTotal: currentUser.gold,
      };
    }

    const isWorldFirst = resultElement.creatorId === uid;

    tx.set(userElementRef, {
      id: userElementDocId(uid, resultElement.id),
      uid,
      elementId: resultElement.id,
      discoveredAt: Date.now(),
      isWorldFirst,
    });

    const goldEarned = calculateGoldReward({ isNewToPlayer: true, isWorldFirst });

    tx.update(userRef, {
      gold: FieldValue.increment(goldEarned),
      discoveryCount: FieldValue.increment(1),
      ...(isWorldFirst ? { worldFirstCount: FieldValue.increment(1) } : {}),
      updatedAt: Date.now(),
    });

    return {
      isNewToPlayer: true,
      isWorldFirst,
      goldEarned,
      goldTotal: currentUser.gold + goldEarned,
    };
  });
}
