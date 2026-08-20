import { GOLD_CONFIG } from '../types/models.js';

/**
 * +1 gold for any new personal discovery.
 * +10 bonus on top if the player invented the concept itself (world first).
 * +3 bonus on top if the player didn't invent it, but was first to find this
 * particular recipe/source that leads to it (discoverer of a new path).
 * isWorldFirst and isDiscoverer are mutually exclusive.
 */
export function calculateGoldReward(params: {
  isNewToPlayer: boolean;
  isWorldFirst: boolean;
  isDiscoverer: boolean;
}): number {
  if (!params.isNewToPlayer) return 0;
  if (params.isWorldFirst) return GOLD_CONFIG.NEW_DISCOVERY + GOLD_CONFIG.WORLD_FIRST_BONUS;
  if (params.isDiscoverer) return GOLD_CONFIG.NEW_DISCOVERY + GOLD_CONFIG.DISCOVERER_BONUS;
  return GOLD_CONFIG.NEW_DISCOVERY;
}
