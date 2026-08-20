import type { CollectionEntry } from '@/types/view';

export function filterEntries(
  entries: CollectionEntry[],
  search: string,
  category: string,
): CollectionEntry[] {
  const term = search.trim();
  return entries.filter(({ element }) => {
    const matchesSearch = term === '' || element.name.includes(term);
    const matchesCategory = category === 'all' || element.category === category;
    return matchesSearch && matchesCategory;
  });
}

export function extractCategories(entries: CollectionEntry[]): string[] {
  return Array.from(new Set(entries.map((e) => e.element.category))).sort();
}

export type SortMode = 'recent' | 'alphabetical';

export function sortEntries(entries: CollectionEntry[], mode: SortMode): CollectionEntry[] {
  const copy = [...entries];
  if (mode === 'alphabetical') {
    copy.sort((a, b) => a.element.name.localeCompare(b.element.name, 'zh-Hant'));
  } else {
    copy.sort((a, b) => b.discoveredAt - a.discoveredAt);
  }
  return copy;
}
