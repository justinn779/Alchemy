import type { ElementDoc } from './models';

/** Frontend-only joined view: a player's collection entry = element + ownership facts. */
export interface CollectionEntry {
  element: ElementDoc;
  discoveredAt: number;
  isWorldFirst: boolean;
}
