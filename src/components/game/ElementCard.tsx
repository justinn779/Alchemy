import type { ElementDoc } from '@/types/models';

export function ElementCard({
  element,
  selected,
  onClick,
}: {
  element: ElementDoc;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-center transition ${
        selected
          ? 'border-arcane-400 bg-arcane-400/10'
          : 'border-void-600 bg-void-800 hover:bg-void-700'
      }`}
    >
      <div className="font-display text-lg">{element.name}</div>
      <div className="mt-1 truncate text-[11px] text-parchment-300/60">{element.category}</div>
    </button>
  );
}
