import { useEffect, useState } from 'react';
import { fetchRecipesByResult } from '@/services/firestoreService';
import { buildGenealogy, countCombineSteps, type GenealogyNode } from '@/services/genealogy';
import { GenealogyTree } from './GenealogyTree';
import { RarityStars } from './RarityStars';
import type { ElementDoc, RecipeDoc } from '@/types/models';
import type { CollectionEntry } from '@/types/view';

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ElementDetailModal({
  entry,
  ownedIds,
  elementsCache,
  onClose,
  onAddToSlot,
}: {
  entry: CollectionEntry;
  ownedIds: ReadonlySet<string>;
  elementsCache: ReadonlyMap<string, ElementDoc>;
  onClose: () => void;
  onAddToSlot?: (element: ElementDoc) => void;
}) {
  const { element, discoveredAt, isWorldFirst, isDiscoverer } = entry;

  const [knownRecipes, setKnownRecipes] = useState<RecipeDoc[] | null>(null);
  const [genealogy, setGenealogy] = useState<GenealogyNode | null>(null);
  const [genealogyLoading, setGenealogyLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setKnownRecipes(null);
    void fetchRecipesByResult(element.id).then((recipes) => {
      if (cancelled) return;
      setKnownRecipes(
        recipes.filter((r) => ownedIds.has(r.elementAId) && ownedIds.has(r.elementBId)),
      );
    });
    setGenealogy(null);
    return () => {
      cancelled = true;
    };
  }, [element.id, ownedIds]);

  const loadGenealogy = () => {
    setGenealogyLoading(true);
    void buildGenealogy(element.id, ownedIds, elementsCache)
      .then(setGenealogy)
      .finally(() => setGenealogyLoading(false));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-void-600 bg-void-800 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          {isWorldFirst ? (
            <div className="mb-2 inline-block rounded-full bg-ember-500 px-3 py-1 text-xs font-bold tracking-wide text-void-950">
              世界首創（發明者）
            </div>
          ) : isDiscoverer ? (
            <div className="mb-2 inline-block rounded-full border border-arcane-400 px-3 py-1 text-xs font-bold tracking-wide text-arcane-400">
              發現者
            </div>
          ) : null}
          <div className="text-4xl leading-none">{element.icons?.join('') || '✨'}</div>
          <div className="mt-2 font-display text-3xl text-parchment-200">{element.name}</div>
          <p className="mt-2 text-sm text-parchment-300/70">{element.description}</p>
        </div>

        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between border-b border-void-700 py-1.5">
            <dt className="text-parchment-300/50">分類</dt>
            <dd>{element.category}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-void-700 py-1.5">
            <dt className="text-parchment-300/50">稀有度</dt>
            <dd>
              <RarityStars rarity={element.rarity} />
            </dd>
          </div>
          <div className="flex justify-between border-b border-void-700 py-1.5">
            <dt className="text-parchment-300/50">發明者</dt>
            <dd>{element.isStarter ? '世界起源' : element.creatorName}</dd>
          </div>
          <div className="flex justify-between border-b border-void-700 py-1.5">
            <dt className="text-parchment-300/50">你的發現時間</dt>
            <dd>{formatDate(discoveredAt)}</dd>
          </div>
        </dl>

        <div className="mt-5">
          <h3 className="mb-2 text-xs font-medium text-parchment-300/50">已知配方</h3>
          {knownRecipes === null ? (
            <p className="text-xs text-parchment-300/40">載入中…</p>
          ) : knownRecipes.length === 0 ? (
            <p className="text-xs text-parchment-300/40">
              {element.isStarter ? '起源元素，無需配方。' : '尚無已知配方。'}
            </p>
          ) : (
            <ul className="space-y-1 text-sm">
              {knownRecipes.map((r) => (
                <li key={r.id} className="text-parchment-200">
                  {elementsCache.get(r.elementAId)?.name ?? '？'} +{' '}
                  {elementsCache.get(r.elementBId)?.name ?? '？'} → {element.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-medium text-parchment-300/50">血統</h3>
            {!genealogy && !genealogyLoading && (
              <button
                type="button"
                onClick={loadGenealogy}
                className="text-xs text-arcane-400 hover:text-arcane-300"
              >
                查看血統
              </button>
            )}
          </div>
          {genealogyLoading && <p className="text-xs text-parchment-300/40">追溯中…</p>}
          {genealogy && (
            <>
              <p className="mb-2 text-xs text-parchment-300/50">
                共經歷 {countCombineSteps(genealogy)} 次煉成
              </p>
              <div className="max-h-48 overflow-y-auto rounded-lg bg-void-900 p-3">
                <GenealogyTree node={genealogy} />
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          {onAddToSlot && (
            <button
              type="button"
              onClick={() => onAddToSlot(element)}
              className="flex-1 rounded-lg bg-arcane-500 px-4 py-2 text-sm font-medium text-void-950 transition hover:bg-arcane-400"
            >
              加入煉成格
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-void-600 bg-void-900 px-4 py-2 text-sm transition hover:bg-void-700"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
