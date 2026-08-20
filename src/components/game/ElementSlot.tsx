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
  const baseClasses = `flex h-24 w-24 flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-void-900 transition sm:h-28 sm:w-28 ${
    pending ? 'animate-pulse border-arcane-400' : 'border-void-600'
  }`;

  if (element) {
    return (
      <button
        type="button"
        onClick={onClear}
        disabled={pending}
        title="點擊移除"
        className={`${baseClasses} disabled:cursor-not-allowed ${!pending ? 'hover:border-ember-400' : ''}`}
      >
        <span className="text-2xl leading-none">{element.icons?.join('') || '✨'}</span>
        <span className="mt-1 font-display text-base">{element.name}</span>
      </button>
    );
  }

  return (
    <div className={baseClasses}>
      <span className="text-xs text-parchment-300/30">選擇元素</span>
    </div>
  );
}
