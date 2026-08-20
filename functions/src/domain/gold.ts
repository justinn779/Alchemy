import { GOLD_CONFIG } from '../types/models.js';

/** +1 gold for any new personal discovery, +10 bonus if it's a world first. */
export function calculateGoldReward(params: { isNewToPlayer: boolean; isWorldFirst: boolean }): number {
  if (!params.isNewToPlayer) return 0;
  return GOLD_CONFIG.NEW_DISCOVERY + (params.isWorldFirst ? GOLD_CONFIG.WORLD_FIRST_BONUS : 0);
}
