import { useMemo, useState } from 'react';
import { ElementCard } from './ElementCard';
import { extractCategories, filterEntries } from '@/utils/collectionFilters';
import type { CollectionEntry } from '@/types/view';

export function ElementList({
  entries,
  onSelect,
  selectedIds,
}: {
  entries: CollectionEntry[];
  onSelect: (entry: CollectionEntry) => void;
  selectedIds: Set<string>;
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  const categories = useMemo(() => extractCategories(entries), [entries]);
  const filtered = useMemo(
    () => filterEntries(entries, search, category),
    [entries, search, category],
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
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
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-parchment-300/40">找不到符合的元素。</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {filtered.map((entry) => (
            <li key={entry.element.id}>
              <ElementCard
                element={entry.element}
                selected={selectedIds.has(entry.element.id)}
                onClick={() => onSelect(entry)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
