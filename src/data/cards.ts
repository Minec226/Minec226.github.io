/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, CardRarity } from '../types';

export const ALL_CARDS: Card[] = [
  // --- D RANK (Mostly Bad / Curses) - Cost 0 ---
  {
    id: 'clumsy_move',
    name: 'Clumsy Move',
    rarity: 'D',
    cost: 0,
    category: 'curse',
    targetType: 'enemy_piece',
    effectCode: 'FREEZE_PIECE',
    description: 'Freeze one enemy piece. It cannot move on their next turn.',
    flavorText: '"Even the surest enemy knight stumbles upon wet cobblestones."',
    icon: 'Snowflake',
    unlockedByDefault: true,
  },
  {
    id: 'heavy_armor',
    name: 'Heavy Armor',
    rarity: 'D',
    cost: 0,
    category: 'curse',
    targetType: 'enemy_piece',
    effectCode: 'HALF_RANGE',
    description: 'One enemy piece may only move half its normal range (max 2 squares) next turn.',
    flavorText: '"Forged in solid lead. Impervious to arrows, but impossible to sprint in."',
    icon: 'ShieldAlert',
    unlockedByDefault: true,
  },
  {
    id: 'fog_of_war',
    name: 'Mystic Fog',
    rarity: 'D',
    cost: 0,
    category: 'curse',
    targetType: 'enemy_piece',
    effectCode: 'FOG_PIECE',
    description: 'Shroud one enemy piece in thick mist. You cannot see its true identity until it moves.',
    flavorText: '"A shadow looms on the horizon, neither friend nor foe until it strikes."',
    icon: 'CloudFog',
    unlockedByDefault: true,
  },

  // --- C RANK (Small Benefits) - Cost 1 ---
  {
    id: 'scout_vision',
    name: 'Scout Vision',
    rarity: 'C',
    cost: 1,
    category: 'utility',
    targetType: 'enemy_piece',
    effectCode: 'SCOUT_THREATS',
    description: 'Reveal and highlight all legal moves and capture threats of an opponent\'s piece.',
    flavorText: '"The hawk sees from the clouds what the soldier misses in the trench."',
    icon: 'Eye',
    unlockedByDefault: true,
  },
  {
    id: 'double_think',
    name: 'Double Think',
    rarity: 'C',
    cost: 1,
    category: 'utility',
    targetType: 'none',
    effectCode: 'DRAW_TWO',
    description: 'Draw 2 extra cards from your deck immediately.',
    flavorText: '"Two minds operating in perfect harmony see infinite timelines."',
    icon: 'Sparkles',
    unlockedByDefault: true,
  },
  {
    id: 'aegis_shield',
    name: 'Aegis Shield',
    rarity: 'C',
    cost: 1,
    category: 'tactical',
    targetType: 'friendly_piece',
    effectCode: 'SHIELD_PIECE',
    description: 'One chosen non-king piece cannot be captured on the opponent\'s next move.',
    flavorText: '"An impenetrable divine barrier that shatters after absorbing a single blow."',
    icon: 'Shield',
    unlockedByDefault: true,
  },

  // --- B RANK (Useful) - Cost 2 ---
  {
    id: 'tactical_reposition',
    name: 'Reposition',
    rarity: 'B',
    cost: 2,
    category: 'tactical',
    targetType: 'friendly_piece',
    effectCode: 'REPOSITION_PIECE',
    description: 'Move one of your non-king pieces to any legal empty square on your half of the board.',
    flavorText: '"A sudden tactical flank can turn an ambush into a slaughter."',
    icon: 'Move',
    unlockedByDefault: true,
  },
  {
    id: 'spatial_swap',
    name: 'Spatial Swap',
    rarity: 'B',
    cost: 2,
    category: 'tactical',
    targetType: 'two_friendly_pieces',
    effectCode: 'SWAP_PIECES',
    description: 'Exchange the board positions of two friendly non-king pieces instantly.',
    flavorText: '"Two points in space folded together like parchment."',
    icon: 'RefreshCw',
    unlockedByDefault: true,
  },
  {
    id: 'pawn_recall',
    name: 'Recall',
    rarity: 'B',
    cost: 2,
    category: 'utility',
    targetType: 'captured_piece',
    effectCode: 'RECALL_PAWN',
    description: 'Return a captured friendly pawn to its starting square if that square is currently empty.',
    flavorText: '"From the fallen dust, the humble infantryman rises once more."',
    icon: 'RotateCcw',
    unlockedByDefault: true,
  },

  // --- A RANK (Powerful) - Cost 3 ---
  {
    id: 'arcane_blink',
    name: 'Blink',
    rarity: 'A',
    cost: 3,
    category: 'power',
    targetType: 'friendly_piece',
    effectCode: 'BLINK_TELEPORT',
    description: 'Teleport one of your non-king pieces to ANY empty square on the board (cannot cause self-check).',
    flavorText: '"In the blink of an eye, the assassin bypassed the entire front line."',
    icon: 'Zap',
    unlockedByDefault: true,
  },
  {
    id: 'time_warp',
    name: 'Time Warp',
    rarity: 'A',
    cost: 3,
    category: 'power',
    targetType: 'none',
    effectCode: 'EXTRA_TURN',
    description: 'Take two consecutive turns! No card may be played on your second bonus turn.',
    flavorText: '"The sands of time freeze for everyone save the sorcerer."',
    icon: 'Clock',
    unlockedByDefault: true,
  },
  {
    id: 'royal_guard',
    name: 'Royal Guard',
    rarity: 'A',
    cost: 3,
    category: 'power',
    targetType: 'friendly_piece',
    effectCode: 'QUEEN_MOVEMENT',
    description: 'One selected piece gains the movement powers of a Queen for your next move!',
    flavorText: '"Blessed by the sovereign, even a simple rook commands diagonal skies."',
    icon: 'Crown',
    unlockedByDefault: true,
  },

  // --- S RANK (Extremely Rare) - Cost 4 ---
  {
    id: 'fate_rewrite',
    name: 'Fate Rewrite',
    rarity: 'S',
    cost: 4,
    category: 'miracle',
    targetType: 'none',
    effectCode: 'UNDO_TURN',
    description: 'Undo the previous full turn by both players! Revert time to before the enemy\'s last attack.',
    flavorText: '"That which was written in blood is erased by celestial light."',
    icon: 'History',
    unlockedByDefault: false,
  },
  {
    id: 'divine_miracle',
    name: 'Miracle',
    rarity: 'S',
    cost: 4,
    category: 'miracle',
    targetType: 'captured_piece',
    effectCode: 'REVIVE_ANY',
    description: 'Revive ANY captured friendly non-king piece (including Queen or Rook) onto any legal empty square!',
    flavorText: '"The heavens part, returning a fallen hero to the hour of greatest need."',
    icon: 'Sun',
    unlockedByDefault: false,
  },
  {
    id: 'checkmate_escape',
    name: 'Checkmate Escape',
    rarity: 'S',
    cost: 4,
    category: 'miracle',
    targetType: 'none',
    effectCode: 'NEGATE_CHECKMATE',
    description: 'Equip an active ward: If your king would be checkmated, negate it once and grant temporary immunity!',
    flavorText: '"Death came for the King, but found only an illusion in his throne room."',
    icon: 'ShieldCheck',
    unlockedByDefault: false,
  }
];

// Rarity draw weights (D: 40%, C: 30%, B: 18%, A: 10%, S: 2%)
const RARITY_WEIGHTS: Record<CardRarity, number> = {
  'D': 40,
  'C': 30,
  'B': 18,
  'A': 10,
  'S': 2,
};

export const RARITY_COLORS: Record<CardRarity, { border: string; bg: string; text: string; badge: string; glow: string }> = {
  'D': {
    border: 'border-slate-600',
    bg: 'bg-slate-900/90',
    text: 'text-slate-400',
    badge: 'bg-slate-800 text-slate-300 border border-slate-600',
    glow: 'shadow-slate-500/10',
  },
  'C': {
    border: 'border-emerald-600',
    bg: 'bg-emerald-950/90',
    text: 'text-emerald-400',
    badge: 'bg-emerald-900/80 text-emerald-300 border border-emerald-500',
    glow: 'shadow-emerald-500/20',
  },
  'B': {
    border: 'border-cyan-600',
    bg: 'bg-cyan-950/90',
    text: 'text-cyan-400',
    badge: 'bg-cyan-900/80 text-cyan-300 border border-cyan-500',
    glow: 'shadow-cyan-500/20',
  },
  'A': {
    border: 'border-purple-600',
    bg: 'bg-purple-950/90',
    text: 'text-purple-400',
    badge: 'bg-purple-900/80 text-purple-300 border border-purple-500',
    glow: 'shadow-purple-500/30',
  },
  'S': {
    border: 'border-amber-500',
    bg: 'bg-amber-950/95',
    text: 'text-amber-400',
    badge: 'bg-amber-500 text-slate-950 font-bold border border-amber-300 animate-pulse',
    glow: 'shadow-amber-500/50 ring-1 ring-amber-400/50',
  },
};

/**
 * Draw a random card based on rarity weight distribution from the available pool
 */
export function drawRandomCard(pool: Card[] = ALL_CARDS): Card {
  // First pick a rarity based on weight
  const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let randomVal = Math.random() * totalWeight;
  let selectedRarity: CardRarity = 'D';

  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    randomVal -= weight;
    if (randomVal <= 0) {
      selectedRarity = rarity as CardRarity;
      break;
    }
  }

  // Filter pool by chosen rarity
  const rarityPool = pool.filter(c => c.rarity === selectedRarity);
  if (rarityPool.length === 0) {
    // Fallback to any card if pool is empty for that rarity
    return pool[Math.floor(Math.random() * pool.length)];
  }

  return rarityPool[Math.floor(Math.random() * rarityPool.length)];
}

/**
 * Generate a randomized starter deck of 15 cards
 */
export function generateStarterDeck(unlockedCardIds?: string[]): Card[] {
  const pool = unlockedCardIds 
    ? ALL_CARDS.filter(c => unlockedCardIds.includes(c.id))
    : ALL_CARDS;

  const deck: Card[] = [];
  for (let i = 0; i < 15; i++) {
    deck.push(drawRandomCard(pool));
  }
  return deck;
}
