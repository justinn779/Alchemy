import { useEffect, useState } from 'react';
import type { CombineResultView } from '@/hooks/useCombine';
import { RarityStars } from './RarityStars';

export function CombineResultModal({
  result,
  onClose,
}: {
  result: CombineResultView;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-xs rounded-2xl border border-void-600 bg-void-800 p-6 text-center shadow-xl transition-all duration-300 ease-out ${
          visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {!result.success ? (
          <>
            <div className="text-4xl leading-none">🤷</div>
            <div className="mt-2 font-display text-xl text-parchment-200">沒有明顯關聯</div>
            <p className="mt-2 text-sm text-parchment-300/70">
              這兩者之間找不到合理的煉成結果，換個組合試試看。
            </p>
          </>
        ) : (
          <>
            {result.isWorldFirst ? (
              <div className="mb-2 inline-block rounded-full bg-ember-500 px-3 py-1 text-xs font-bold tracking-wide text-void-950">
                WORLD FIRST · 發明者
              </div>
            ) : result.isDiscoverer ? (
              <div className="mb-2 inline-block rounded-full border border-arcane-400 px-3 py-1 text-xs font-bold tracking-wide text-arcane-400">
                發現者
              </div>
            ) : result.isNewToPlayer ? (
              <div className="mb-2 inline-block rounded-full bg-arcane-500 px-3 py-1 text-xs font-bold tracking-wide text-void-950">
                NEW
              </div>
            ) : null}

            <div className="text-4xl leading-none">
              {result.resultElement.icons?.join('') || '✨'}
            </div>
            <div className="mt-2 font-display text-3xl text-parchment-200">
              {result.resultElement.name}
            </div>
            <p className="mt-2 text-sm text-parchment-300/70">
              {result.resultElement.description}
            </p>
            <p className="mt-1 text-xs text-parchment-300/40">{result.resultElement.category}</p>
            <div className="mt-2 flex justify-center">
              <RarityStars rarity={result.resultElement.rarity} />
            </div>
            {result.isTestMode && (
              <p className="mt-3 text-xs text-parchment-300/40">
                測試模式預覽，不會加入你的圖鑑或計入紀錄。
              </p>
            )}
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 rounded-lg border border-void-600 bg-void-900 px-4 py-2 text-sm transition hover:bg-void-700"
        >
          關閉
        </button>
      </div>
    </div>
  );
}
