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
  const canAct = (slotA !== null || slotB !== null) && !pending;
  const label = mode === 'combine' ? '煉成' : '萃取';

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <ElementSlot element={slotA} onClear={onClearA} pending={pending} />
        <span className="text-parchment-300/40">＋</span>
        <ElementSlot element={slotB} onClear={onClearB} pending={pending} />
        <button
          type="button"
          onClick={onAction}
          disabled={!canAct}
          className="h-10 rounded-full bg-arcane-500 px-6 font-medium text-void-950 transition hover:bg-arcane-400 disabled:cursor-not-allowed disabled:bg-void-700 disabled:text-parchment-300/40"
        >
          {pending ? `${label}中…` : label}
        </button>
      </div>
      {error && <p className="mt-2 text-center text-sm text-ember-400">{error}</p>}
    </div>
  );
}
