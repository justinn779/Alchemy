import { normalizeElementName } from './normalize.js';
import type { ElementDoc } from '../types/models.js';

export const SYSTEM_CREATOR_ID = 'system';
export const SYSTEM_CREATOR_NAME = '萬象爐';

export interface StarterElementSeed {
  id: string;
  name: string;
  description: string;
  icons: string[];
}

export const STARTER_ELEMENTS: readonly StarterElementSeed[] = [
  { id: 'elem_water', name: '水', description: '澄澈流動的液體，孕育生命的起點。', icons: ['💧'] },
  { id: 'elem_fire', name: '火', description: '熾熱燃燒的能量，毀滅與溫暖並存。', icons: ['🔥'] },
  { id: 'elem_earth', name: '土', description: '孕育萬物的堅實大地。', icons: ['🪨'] },
  { id: 'elem_wind', name: '風', description: '無形流動的氣流，自由不羈。', icons: ['💨'] },
  { id: 'elem_thunder', name: '雷', description: '劃破天際的雷霆之力。', icons: ['⚡'] },
];

export function buildStarterElementDoc(seed: StarterElementSeed, createdAt: number): ElementDoc {
  return {
    id: seed.id,
    name: seed.name,
    normalizedName: normalizeElementName(seed.name),
    description: seed.description,
    category: '起源',
    icons: seed.icons,
    rarity: 0,
    creatorId: SYSTEM_CREATOR_ID,
    creatorName: SYSTEM_CREATOR_NAME,
    createdAt,
    isStarter: true,
    firstRecipeKey: null,
  };
}
