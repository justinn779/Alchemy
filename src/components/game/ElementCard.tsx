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
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-sm transition ${
        selected
          ? 'border-arcane-400 bg-arcane-400/10'
          : 'border-void-600 bg-void-800 hover:bg-void-700'
      }`}
    >
      <span className="leading-none">{element.icons?.join('') || '✨'}</span>
      <span className="font-display leading-none">{element.name}</span>
    </button>
  );
}
