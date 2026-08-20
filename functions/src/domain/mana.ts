import { MANA_CONFIG } from '../types/models.js';

export interface ManaState {
  mana: number;
  lastManaUpdatedAt: number;
}

/**
 * Lazily computes how much mana a player should have "right now" from
 * elapsed time since their last recorded update — no background job needed
 * (spec section 9). Leftover partial-interval progress is preserved (we
 * advance lastManaUpdatedAt by whole intervals consumed, not to `now`) so a
 * player never loses a few seconds of regen just because they happened to
 * act mid-interval.
 */
export function calculateCurrentMana(state: ManaState, maxMana: number, now: number): ManaState {
  if (state.mana >= maxMana) {
    return { mana: state.mana, lastManaUpdatedAt: state.lastManaUpdatedAt };
  }
  const elapsedMs = Math.max(0, now - state.lastManaUpdatedAt);
  const regenerated = Math.floor(elapsedMs / MANA_CONFIG.REGEN_INTERVAL_MS);
  if (regenerated <= 0) {
    return state;
  }
  const newMana = Math.min(maxMana, state.mana + regenerated);
  const consumedMs = regenerated * MANA_CONFIG.REGEN_INTERVAL_MS;
  return {
    mana: newMana,
    lastManaUpdatedAt: newMana >= maxMana ? now : state.lastManaUpdatedAt + consumedMs,
  };
}
