import type { GenealogyNode } from '@/services/genealogy';

export function GenealogyTree({ node, depth = 0 }: { node: GenealogyNode; depth?: number }) {
  return (
    <div className={depth > 0 ? 'ml-4 border-l border-void-700 pl-3' : ''}>
      <div className="flex items-center gap-2 py-0.5">
        <span className="font-display text-sm text-parchment-200">{node.element.name}</span>
        {node.element.isStarter && (
          <span className="rounded bg-void-700 px-1.5 py-0.5 text-[10px] text-parchment-300/50">
            起源
          </span>
        )}
      </div>
      {node.parents && (
        <div className="mt-0.5">
          <GenealogyTree node={node.parents[0]} depth={depth + 1} />
          <GenealogyTree node={node.parents[1]} depth={depth + 1} />
        </div>
      )}
    </div>
  );
}
