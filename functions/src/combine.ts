import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { z } from 'zod';
import { db } from './admin.js';
import {
  getElementById,
  elementDocRef,
  newElementDocRef,
  elementsByNormalizedNameQuery,
} from './repositories/elementsRepo.js';
import { buildRecipeKey, getRecipe, recipeDocRef } from './repositories/recipesRepo.js';
import { getUserDoc } from './repositories/usersRepo.js';
import { getUserElement } from './repositories/userElementsRepo.js';
import { recordAiUsage } from './repositories/aiUsageRepo.js';
import { recordCombineHistory } from './repositories/combineHistoryRepo.js';
import { normalizeElementName } from './domain/normalize.js';
import { settleGrant } from './domain/settlement.js';
import { checkTestMode } from './domain/testMode.js';
import { incrementTestActionCount } from './repositories/usersRepo.js';
import { getAIProvider, OPENAI_API_KEY } from './ai/index.js';
import type { CombineResult, ElementDoc, RecipeDoc } from './types/models.js';

const inputSchema = z.object({
  elementAId: z.string().min(1),
  elementBId: z.string().min(1),
});

export const combineElements = onCall(
  { secrets: [OPENAI_API_KEY], memory: '512MiB', cpu: 1 },
  async (request) => {
  const auth = request.auth;
  if (!auth) {
    throw new HttpsError('unauthenticated', '需要登入才能進行煉成。');
  }
  const uid = auth.uid;

  const parsed = inputSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', '缺少有效的元素 ID。');
  }
  const { elementAId, elementBId } = parsed.data;

  const recipeKey = buildRecipeKey(elementAId, elementBId);

  // Every read here is independent of the others, so fire them all in one
  // round trip instead of three sequential ones — shaves ~100-200ms off
  // every combine call, cache-hit or not.
  const [elementA, elementB, userDoc, ownsA, ownsB, cachedRecipe] = await Promise.all([
    getElementById(elementAId),
    getElementById(elementBId),
    getUserDoc(uid),
    getUserElement(uid, elementAId),
    getUserElement(uid, elementBId),
    getRecipe(recipeKey),
  ]);
  if (!elementA || !elementB) {
    throw new HttpsError('not-found', '找不到指定的元素，請重新整理頁面再試一次。');
  }
  if (!userDoc) {
    throw new HttpsError('failed-precondition', '玩家資料尚未初始化，請重新整理頁面。');
  }
  if (!ownsA || !ownsB) {
    throw new HttpsError('permission-denied', '你尚未擁有其中一個元素。');
  }

  const isTestMode = checkTestMode(auth, userDoc);

  // ---- Recipe cache fast path: never call the AI for a known recipe,
  // whether it previously succeeded or was already judged impossible ----
  let resultElement: ElementDoc | null = null;
  let recipeIsNew = false;
  if (cachedRecipe) {
    if (!cachedRecipe.failed && cachedRecipe.resultElementId) {
      resultElement = await getElementById(cachedRecipe.resultElementId);
    } else if (cachedRecipe.failed) {
      const result: CombineResult = { success: false };
      return result;
    }
  }

  // ---- Cache miss: call the AI *outside* any transaction, then reconcile ----
  if (!resultElement) {
    const provider = getAIProvider();
    const startedAt = Date.now();
    let aiSucceeded = false;
    try {
      const aiOutput = await provider.combine({
        elementAName: elementA.name,
        elementBName: elementB.name,
      });
      aiSucceeded = true;

      const txResult = await db.runTransaction(async (tx) => {
        const recipeRef = recipeDocRef(recipeKey);
        const recipeSnap = await tx.get(recipeRef);
        if (recipeSnap.exists) {
          // Someone else's request won the race while we waited on the AI —
          // defer to whatever they committed, success or failure alike.
          const existingRecipe = recipeSnap.data() as RecipeDoc;
          if (existingRecipe.failed || !existingRecipe.resultElementId) {
            return { element: null, recipeIsNew: false };
          }
          const existingElSnap = await tx.get(elementDocRef(existingRecipe.resultElementId));
          return {
            element: existingElSnap.data() as ElementDoc,
            recipeIsNew: false,
          };
        }

        if (!aiOutput.possible) {
          const recipe: RecipeDoc = {
            id: recipeKey,
            elementAId,
            elementBId,
            resultElementId: null,
            failed: true,
            creatorId: uid,
            creatorName: userDoc.displayName,
            createdAt: Date.now(),
          };
          tx.set(recipeRef, recipe);
          return { element: null, recipeIsNew: true };
        }

        // A *different* recipe may have already produced this exact concept
        // (e.g. two different ingredient pairs both yielding "蒸氣").
        const normalizedName = normalizeElementName(aiOutput.result);
        const dupSnap = await tx.get(elementsByNormalizedNameQuery(normalizedName));
        let element: ElementDoc;
        if (!dupSnap.empty) {
          element = dupSnap.docs[0]!.data() as ElementDoc;
        } else {
          const newRef = newElementDocRef();
          element = {
            id: newRef.id,
            name: aiOutput.result,
            normalizedName,
            description: aiOutput.description,
            category: aiOutput.category,
            icons: aiOutput.icons,
            rarity: aiOutput.rarity,
            creatorId: uid,
            creatorName: userDoc.displayName,
            createdAt: Date.now(),
            isStarter: false,
            firstRecipeKey: recipeKey,
          };
          tx.set(newRef, element);
        }

        const recipe: RecipeDoc = {
          id: recipeKey,
          elementAId,
          elementBId,
          resultElementId: element.id,
          failed: false,
          creatorId: uid,
          creatorName: userDoc.displayName,
          createdAt: Date.now(),
        };
        tx.set(recipeRef, recipe);

        return { element, recipeIsNew: true };
      });

      resultElement = txResult.element;
      recipeIsNew = txResult.recipeIsNew;

      recordAiUsage({
        uid,
        kind: 'combine',
        provider: provider.name,
        model: provider.model,
        recipeKey,
        latencyMs: Date.now() - startedAt,
        success: true,
      });
    } catch (err) {
      if (!aiSucceeded) {
        recordAiUsage({
          uid,
          kind: 'combine',
          provider: 'openai',
          model: 'unknown',
          recipeKey,
          latencyMs: Date.now() - startedAt,
          success: false,
        });
        console.error('AI combine failed', err);
        throw new HttpsError('unavailable', 'AI 服務暫時無法使用，請稍後再試一次。');
      }
      throw err;
    }
  }

  if (!resultElement) {
    if (isTestMode) await incrementTestActionCount(uid);
    const result: CombineResult = { success: false };
    return result;
  }

  if (isTestMode) {
    // Test mode: the world-shared element/recipe above is still real and
    // cached for everyone, but nothing is saved to *this* player's own
    // collection — no grant, no gold, no history. Just a preview.
    await incrementTestActionCount(uid);
    const result: CombineResult = {
      success: true,
      resultElement,
      isNewToPlayer: true,
      isWorldFirst: resultElement.creatorId === uid,
      isDiscoverer: resultElement.creatorId !== uid && recipeIsNew,
      goldEarned: 0,
      goldTotal: userDoc.gold,
      isTestMode: true,
    };
    return result;
  }

  const settlement = await settleGrant(uid, resultElement, recipeIsNew);

  recordCombineHistory({
    uid,
    elementAId,
    elementBId,
    resultElementId: resultElement.id,
  });

  const result: CombineResult = {
    success: true,
    resultElement,
    ...settlement,
    isTestMode: false,
  };
  return result;
});
