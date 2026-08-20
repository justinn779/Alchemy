import { ElementSlot } from './ElementSlot';
import type { ElementDoc } from '@/types/models';

export function CombinePanel({
  slotA,
  slotB,
  mode,
  pending,
  error,
  onClearA,
  onClearB,
  onAction,
}: {
  slotA: ElementDoc | null;
  slotB: ElementDoc | null;
  mode: 'combine' | 'extract';
  pending: boolean;
  error: string | null;
  onClearA: () => void;
  onClearB: () => void;
  onAction: () => void;
}) {
  const canAct = slotA !== null && !pending;
  const label = mode === 'combine' ? '煉成' : '萃取';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-4">
        <ElementSlot element={slotA} onClear={onClearA} pending={pending} />
        <span className="text-2xl text-parchment-300/40">＋</span>
        <ElementSlot element={slotB} onClear={onClearB} pending={pending} />
      </div>

      <button
        type="button"
        onClick={onAction}
        disabled={!canAct}
        className="rounded-xl bg-arcane-500 px-8 py-2.5 font-medium text-void-950 transition hover:bg-arcane-400 disabled:cursor-not-allowed disabled:bg-void-700 disabled:text-parchment-300/40"
      >
        {pending ? `${label}中…` : label}
      </button>

      {error && <p className="text-sm text-ember-400">{error}</p>}
    </div>
  );
}
