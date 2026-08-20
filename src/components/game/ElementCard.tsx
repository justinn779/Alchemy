import type { ElementDoc } from '@/types/models';

export function ElementCard({
  element,
  selected,
  onClick,
  onInfoClick,
}: {
  element: ElementDoc;
  selected?: boolean;
  onClick?: () => void;
  onInfoClick?: () => void;
}) {
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-1.5 rounded-full border py-1.5 pl-2.5 pr-2.5 text-sm transition ${
          selected
            ? 'border-arcane-400 bg-arcane-400/10'
            : 'border-void-600 bg-void-800 hover:bg-void-700'
        }`}
      >
        <span className="leading-none">{element.icons?.join('') || '✨'}</span>
        <span className="font-display leading-none">{element.name}</span>
      </button>
      {onInfoClick && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInfoClick();
          }}
          title="查看詳情"
          className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-void-600 bg-void-900 text-[9px] leading-none text-parchment-300/60 transition hover:bg-void-700 hover:text-parchment-200"
        >
          i
        </button>
      )}
    </span>
  );
}
