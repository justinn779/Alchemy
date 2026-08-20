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
  return (
    <div
      className={`flex h-24 w-24 flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-void-900 transition sm:h-28 sm:w-28 ${
        pending ? 'animate-pulse border-arcane-400' : 'border-void-600'
      }`}
    >
      {element ? (
        <>
          <span className="font-display text-xl">{element.name}</span>
          {onClear && !pending && (
            <button
              type="button"
              onClick={onClear}
              className="mt-1 text-[10px] text-parchment-300/40 hover:text-parchment-300"
            >
              清除
            </button>
          )}
        </>
      ) : (
        <span className="text-xs text-parchment-300/30">選擇元素</span>
      )}
    </div>
  );
}
