import type { CombineHistoryDoc, ElementDoc } from '@/types/models';

function NameButton({
  element,
  onPick,
}: {
  element: ElementDoc | undefined;
  onPick: (element: ElementDoc) => void;
}) {
  if (!element) return <span className="text-parchment-300/30">？</span>;
  return (
    <button
      type="button"
      onClick={() => onPick(element)}
      className="rounded px-1 text-parchment-200 underline decoration-void-600 decoration-dotted underline-offset-2 hover:text-arcane-400 hover:decoration-arcane-400"
    >
      {element.icons?.join('') || '✨'} {element.name}
    </button>
  );
}

export function HistoryPanel({
  history,
  elementsCache,
  onPick,
}: {
  history: CombineHistoryDoc[];
  elementsCache: ReadonlyMap<string, ElementDoc>;
  onPick: (element: ElementDoc) => void;
}) {
  if (history.length === 0) {
    return <p className="text-xs text-parchment-300/40">還沒有合成紀錄。</p>;
  }

  return (
    <ul className="space-y-1 text-sm">
      {history.map((h) => (
        <li key={h.id} className="flex items-center gap-1">
          <NameButton element={elementsCache.get(h.elementAId)} onPick={onPick} />
          <span className="text-parchment-300/40">＋</span>
          <NameButton element={elementsCache.get(h.elementBId)} onPick={onPick} />
          <span className="text-parchment-300/40">→</span>
          <NameButton element={elementsCache.get(h.resultElementId)} onPick={onPick} />
        </li>
      ))}
    </ul>
  );
}
