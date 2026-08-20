import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { db } from '../admin.js';
import { calculateCurrentMana } from './mana.js';
import { calculateGoldReward } from './gold.js';
import { userElementDocId } from '../repositories/userElementsRepo.js';
import type { ElementDoc, UserDoc } from '../types/models.js';

export interface SettlementResult {
  isNewToPlayer: boolean;
  isWorldFirst: boolean;
  manaRemaining: number;
  goldEarned: number;
  goldTotal: number;
}

/**
 * Grants `resultElement` to `uid`'s collection and settles mana/gold, inside
 * its own transaction so it's fast, retries cleanly on Firestore contention,
 * and is a free no-op if the player already owns the result — which is what
 * makes a double-click or network retry of combine/extract safe to replay
 * without double-charging mana or double-awarding gold.
 *
 * Shared by combineElements and extractElement: the only thing that differs
 * between them is how `resultElement` and `manaCost` were derived.
 */
export async function settleGrant(
  uid: string,
  resultElement: ElementDoc,
  manaCost: number,
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
        manaRemaining: currentUser.mana,
        goldEarned: 0,
        goldTotal: currentUser.gold,
      };
    }

    const freshRegen = calculateCurrentMana(
      { mana: currentUser.mana, lastManaUpdatedAt: currentUser.lastManaUpdatedAt },
      currentUser.maxMana,
      Date.now(),
    );
    if (freshRegen.mana < manaCost) {
      throw new HttpsError('resource-exhausted', 'Mana 不足，請稍後再試。');
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
    const newMana = freshRegen.mana - manaCost;

    tx.update(userRef, {
      mana: newMana,
      lastManaUpdatedAt: freshRegen.lastManaUpdatedAt,
      gold: FieldValue.increment(goldEarned),
      discoveryCount: FieldValue.increment(1),
      ...(isWorldFirst ? { worldFirstCount: FieldValue.increment(1) } : {}),
      updatedAt: Date.now(),
    });

    return {
      isNewToPlayer: true,
      isWorldFirst,
      manaRemaining: newMana,
      goldEarned,
      goldTotal: currentUser.gold + goldEarned,
    };
  });
}
