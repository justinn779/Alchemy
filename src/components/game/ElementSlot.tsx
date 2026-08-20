import type { ElementDoc } from '@/types/models';

export function ElementSlot({
  element,
  onClear,
  pending,
}: {
  element: ElementDoc | null;
  onClear?: () => void;
  pending?: boolean;
}) {
  const baseClasses = `flex h-10 min-w-[6rem] items-center justify-center gap-1.5 rounded-full border-2 border-dashed px-3 transition ${
    pending ? 'animate-pulse border-arcane-400' : 'border-void-600'
  }`;

  if (element) {
    return (
      <button
        type="button"
        onClick={onClear}
        disabled={pending}
        title="點擊移除"
        className={`${baseClasses} bg-void-800 disabled:cursor-not-allowed ${!pending ? 'hover:border-ember-400' : ''}`}
      >
        <span className="leading-none">{element.icons?.join('') || '✨'}</span>
        <span className="font-display text-sm leading-none">{element.name}</span>
      </button>
    );
  }

  return (
    <div className={`${baseClasses} bg-void-900`}>
      <span className="text-xs text-parchment-300/30">選擇元素</span>
    </div>
  );
}
