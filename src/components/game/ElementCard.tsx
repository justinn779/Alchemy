import type { ElementDoc } from '@/types/models';

export function ElementCard({
  element,
  selected,
  isInventor,
  isDiscoverer,
  onClick,
  onInfoClick,
}: {
  element: ElementDoc;
  selected?: boolean;
  /** This player invented the concept itself (world first) — most prominent border. */
  isInventor?: boolean;
  /** This player found a new recipe/path to an already-existing concept — moderately prominent border. */
  isDiscoverer?: boolean;
  onClick?: () => void;
  onInfoClick?: () => void;
}) {
  let borderClasses = 'border-void-600 bg-void-800 hover:bg-void-700';
  if (selected) {
    borderClasses = 'border-arcane-400 bg-arcane-400/10';
  } else if (isInventor) {
    borderClasses = 'border-2 border-ember-400 bg-void-800 shadow-[0_0_6px_rgba(240,163,92,0.5)] hover:bg-void-700';
  } else if (isDiscoverer) {
    borderClasses = 'border-arcane-400/70 bg-void-800 hover:bg-void-700';
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-1.5 rounded-full border py-1.5 pl-2.5 pr-2.5 text-sm transition ${borderClasses}`}
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
