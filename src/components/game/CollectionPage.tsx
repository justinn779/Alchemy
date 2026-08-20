import { useMemo, useState } from 'react';
import { ElementCard } from './ElementCard';
import { extractCategories, filterEntries, sortEntries, type SortMode } from '@/utils/collectionFilters';
import type { CollectionEntry } from '@/types/view';

export function CollectionPage({
  entries,
  discoveredCount,
  worldFirstCount,
  onSelect,
}: {
  entries: CollectionEntry[];
  discoveredCount: number;
  worldFirstCount: number;
  onSelect: (entry: CollectionEntry) => void;
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<SortMode>('recent');

  const categories = useMemo(() => extractCategories(entries), [entries]);
  const visible = useMemo(
    () => sortEntries(filterEntries(entries, search, category), sort),
    [entries, search, category, sort],
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 text-sm text-parchment-300/70">
        <span>
          已發現元素：<span className="text-parchment-200">{discoveredCount}</span>
        </span>
        <span>
          我的世界首創：<span className="text-parchment-200">{worldFirstCount}</span>
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋元素…"
          className="min-w-0 flex-1 rounded-lg border border-void-600 bg-void-900 px-3 py-1.5 text-sm text-parchment-200 placeholder:text-parchment-300/30 focus:border-arcane-400 focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-void-600 bg-void-900 px-2 py-1.5 text-sm text-parchment-200 focus:border-arcane-400 focus:outline-none"
        >
          <option value="all">全部分類</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="rounded-lg border border-void-600 bg-void-900 px-2 py-1.5 text-sm text-parchment-200 focus:border-arcane-400 focus:outline-none"
        >
          <option value="recent">最近發現</option>
          <option value="alphabetical">字母排序</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-parchment-300/40">找不到符合的元素。</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {visible.map((entry) => (
            <li key={entry.element.id}>
              <ElementCard element={entry.element} onClick={() => onSelect(entry)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
