import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { z } from 'zod';
import { db } from './admin.js';
import {
  getElementById,
  elementDocRef,
  newElementDocRef,
  elementsByNormalizedNameQuery,
} from './repositories/elementsRepo.js';
import { getExtractRecipe, extractRecipeDocRef } from './repositories/extractRecipesRepo.js';
import { getUserDoc } from './repositories/usersRepo.js';
import { getUserElement } from './repositories/userElementsRepo.js';
import { recordAiUsage } from './repositories/aiUsageRepo.js';
import { normalizeElementName } from './domain/normalize.js';
import { settleGrant } from './domain/settlement.js';
import { getAIProvider, OPENAI_API_KEY } from './ai/index.js';
import type { ExtractResult, ElementDoc, ExtractRecipeDoc } from './types/models.js';

const inputSchema = z.object({
  elementId: z.string().min(1),
});

export const extractElement = onCall({ secrets: [OPENAI_API_KEY] }, async (request) => {
  const auth = request.auth;
  if (!auth) {
    throw new HttpsError('unauthenticated', '需要登入才能進行萃取。');
  }
  const uid = auth.uid;

  const parsed = inputSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', '缺少有效的元素 ID。');
  }
  const { elementId } = parsed.data;

  const [sourceElement, userDoc] = await Promise.all([
    getElementById(elementId),
    getUserDoc(uid),
  ]);
  if (!sourceElement) {
    throw new HttpsError('not-found', '找不到指定的元素，請重新整理頁面再試一次。');
  }
  if (!userDoc) {
    throw new HttpsError('failed-precondition', '玩家資料尚未初始化，請重新整理頁面。');
  }

  const owns = await getUserElement(uid, elementId);
  if (!owns) {
    throw new HttpsError('permission-denied', '你尚未擁有這個元素。');
  }

  // ---- extractRecipes cache fast path: never call the AI for a known
  // source, whether it previously succeeded or was already judged impossible ----
  let resultElement: ElementDoc | null = null;
  let recipeIsNew = false;
  const cachedRecipe = await getExtractRecipe(elementId);
  if (cachedRecipe) {
    if (!cachedRecipe.failed && cachedRecipe.resultElementId) {
      resultElement = await getElementById(cachedRecipe.resultElementId);
    } else if (cachedRecipe.failed) {
      const result: ExtractResult = { success: false };
      return result;
    }
  }

  // ---- Cache miss: call the AI *outside* any transaction, then reconcile ----
  if (!resultElement) {
    const provider = getAIProvider();
    const startedAt = Date.now();
    let aiSucceeded = false;
    try {
      const aiOutput = await provider.extract({ elementName: sourceElement.name });
      aiSucceeded = true;

      const txResult = await db.runTransaction(async (tx) => {
        const recipeRef = extractRecipeDocRef(elementId);
        const recipeSnap = await tx.get(recipeRef);
        if (recipeSnap.exists) {
          // Someone else's request won the race while we waited on the AI —
          // defer to whatever they committed, success or failure alike.
          const existing = recipeSnap.data() as ExtractRecipeDoc;
          if (existing.failed || !existing.resultElementId) {
            return { element: null, recipeIsNew: false };
          }
          const existingElSnap = await tx.get(elementDocRef(existing.resultElementId));
          return {
            element: existingElSnap.data() as ElementDoc,
            recipeIsNew: false,
          };
        }

        if (!aiOutput.possible) {
          const recipe: ExtractRecipeDoc = {
            id: elementId,
            sourceElementId: elementId,
            resultElementId: null,
            failed: true,
            creatorId: uid,
            creatorName: userDoc.displayName,
            createdAt: Date.now(),
          };
          tx.set(recipeRef, recipe);
          return { element: null, recipeIsNew: true };
        }

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
            firstRecipeKey: null,
          };
          tx.set(newRef, element);
        }

        const recipe: ExtractRecipeDoc = {
          id: elementId,
          sourceElementId: elementId,
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
        kind: 'extract',
        provider: provider.name,
        model: provider.model,
        recipeKey: elementId,
        latencyMs: Date.now() - startedAt,
        success: true,
      });
    } catch (err) {
      if (!aiSucceeded) {
        recordAiUsage({
          uid,
          kind: 'extract',
          provider: 'openai',
          model: 'unknown',
          recipeKey: elementId,
          latencyMs: Date.now() - startedAt,
          success: false,
        });
        console.error('AI extract failed', err);
        throw new HttpsError('unavailable', 'AI 服務暫時無法使用，請稍後再試一次。');
      }
      throw err;
    }
  }

  if (!resultElement) {
    const result: ExtractResult = { success: false };
    return result;
  }

  const settlement = await settleGrant(uid, resultElement, recipeIsNew);

  const result: ExtractResult = {
    success: true,
    resultElement,
    ...settlement,
  };
  return result;
});
