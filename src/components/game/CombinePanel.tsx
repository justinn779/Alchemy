import { ElementSlot } from './ElementSlot';
import type { ElementDoc } from '@/types/models';

export function CombinePanel({
  slotA,
  slotB,
  pending,
  manaAvailable,
  error,
  onClearA,
  onClearB,
  onCombine,
  extractPending,
  extractManaAvailable,
  extractError,
  onExtract,
}: {
  slotA: ElementDoc | null;
  slotB: ElementDoc | null;
  pending: boolean;
  manaAvailable: boolean;
  error: string | null;
  onClearA: () => void;
  onClearB: () => void;
  onCombine: () => void;
  extractPending: boolean;
  extractManaAvailable: boolean;
  extractError: string | null;
  onExtract: () => void;
}) {
  const canCombine = slotA !== null && slotB !== null && !pending && manaAvailable;
  const canExtract = slotA !== null && !extractPending && !pending && extractManaAvailable;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-4">
        <ElementSlot element={slotA} onClear={onClearA} pending={pending} />
        <span className="text-2xl text-parchment-300/40">＋</span>
        <ElementSlot element={slotB} onClear={onClearB} pending={pending} />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onCombine}
          disabled={!canCombine}
          className="rounded-xl bg-arcane-500 px-8 py-2.5 font-medium text-void-950 transition hover:bg-arcane-400 disabled:cursor-not-allowed disabled:bg-void-700 disabled:text-parchment-300/40"
        >
          {pending ? '煉成中…' : '煉成（5 🔮）'}
        </button>

        <button
          type="button"
          onClick={onExtract}
          disabled={!canExtract}
          title={slotA ? `從「${slotA.name}」萃取` : '先選擇左側格的元素'}
          className="rounded-xl border border-void-600 bg-void-800 px-6 py-2.5 font-medium text-parchment-200 transition hover:bg-void-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {extractPending ? '萃取中…' : '萃取（8 🔮）'}
        </button>
      </div>

      {!manaAvailable && slotA && slotB && (
        <p className="text-sm text-ember-400">Mana 不足，請稍後再試。</p>
      )}
      {error && <p className="text-sm text-ember-400">{error}</p>}
      {extractError && <p className="text-sm text-ember-400">{extractError}</p>}
    </div>
  );
}
