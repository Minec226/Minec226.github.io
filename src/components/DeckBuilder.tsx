/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card, CardRarity } from '../types';
import { ALL_CARDS, RARITY_COLORS } from '../data/cards';
import { Library, Sparkles, Zap, Filter, Info, Check, Lock, ShieldAlert, Snowflake, CloudFog, Eye, Shield, Move, RefreshCw, RotateCcw, Clock, Crown, History, Sun, ShieldCheck } from 'lucide-react';

interface DeckBuilderProps {
  unlockedCardIds: string[];
  onInspectCard: (card: Card) => void;
  onOpenShop: () => void;
}

export const DeckBuilder: React.FC<DeckBuilderProps> = ({
  unlockedCardIds,
  onInspectCard,
  onOpenShop,
}) => {
  const [selectedRarity, setSelectedRarity] = useState<CardRarity | 'ALL'>('ALL');

  const filteredCards = ALL_CARDS.filter(c => 
    selectedRarity === 'ALL' || c.rarity === selectedRarity
  );

  const rarityInfo: Record<CardRarity, { name: string; chance: string; desc: string }> = {
    'D': { name: 'D-Rank (Curses)', chance: '40% Draw Chance', desc: 'Mostly weak or self-restricting spells. Cost 0 Mana.' },
    'C': { name: 'C-Rank (Small Benefits)', chance: '30% Draw Chance', desc: 'Tactical scouting, extra draws, or brief shields. Cost 1 Mana.' },
    'B': { name: 'B-Rank (Useful Utilities)', chance: '18% Draw Chance', desc: 'Piece repositioning, spatial swapping, and pawn recall. Cost 2 Mana.' },
    'A': { name: 'A-Rank (Powerful Spells)', chance: '10% Draw Chance', desc: 'Teleportation (Blink), Time Warp extra turns, and Queen blessings. Cost 3 Mana.' },
    'S': { name: 'S-Rank (Miraculous Artifacts)', chance: '2% Draw Chance', desc: 'Turn undoing (Fate Rewrite), piece revival, and Checkmate escape. Cost 4 Mana.' },
  };

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Snowflake': return <Snowflake className="w-6 h-6 text-cyan-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6 text-slate-400" />;
      case 'CloudFog': return <CloudFog className="w-6 h-6 text-purple-400" />;
      case 'Eye': return <Eye className="w-6 h-6 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-amber-300" />;
      case 'Shield': return <Shield className="w-6 h-6 text-emerald-300" />;
      case 'Move': return <Move className="w-6 h-6 text-cyan-300" />;
      case 'RefreshCw': return <RefreshCw className="w-6 h-6 text-indigo-300" />;
      case 'RotateCcw': return <RotateCcw className="w-6 h-6 text-amber-400" />;
      case 'Zap': return <Zap className="w-6 h-6 text-purple-300" />;
      case 'Clock': return <Clock className="w-6 h-6 text-indigo-400" />;
      case 'Crown': return <Crown className="w-6 h-6 text-amber-400" />;
      case 'History': return <History className="w-6 h-6 text-amber-300" />;
      case 'Sun': return <Sun className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
      default: return <Sparkles className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 flex flex-col gap-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
            <Library className="w-8 h-8 text-indigo-400" />
            <span>ARCANUM GRIMOIRE & LIBRARY</span>
          </h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Explore all {ALL_CARDS.length} magical ability cards, check rarity probabilities, and inspect rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenShop}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-sm shadow-lg shadow-amber-500/20 transition-all"
          >
            Buy Card Packs in Shop
          </button>
        </div>
      </div>

      {/* Rarity Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => setSelectedRarity('ALL')}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
            selectedRarity === 'ALL'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          All Cards ({ALL_CARDS.length})
        </button>

        {(['D', 'C', 'B', 'A', 'S'] as CardRarity[]).map((rarity) => {
          const styles = RARITY_COLORS[rarity];
          const count = ALL_CARDS.filter(c => c.rarity === rarity).length;
          return (
            <button
              key={rarity}
              onClick={() => setSelectedRarity(rarity)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-extrabold transition-all flex items-center gap-1.5 ${
                selectedRarity === rarity
                  ? `${styles.badge} ring-2 ring-white/20 shadow-md`
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{rarity}-Rank</span>
              <span className="opacity-70 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Selected Rarity Info Box */}
      {selectedRarity !== 'ALL' && (
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-sm">
          <div>
            <span className="font-extrabold text-amber-300 mr-2">{rarityInfo[selectedRarity].name}:</span>
            <span className="text-slate-300">{rarityInfo[selectedRarity].desc}</span>
          </div>
          <span className="bg-indigo-950 border border-indigo-500/40 text-cyan-300 font-mono text-xs px-3 py-1 rounded-full font-bold">
            {rarityInfo[selectedRarity].chance}
          </span>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredCards.map((card) => {
          const isUnlocked = unlockedCardIds.includes(card.id) || card.unlockedByDefault;
          const styles = RARITY_COLORS[card.rarity] || RARITY_COLORS['D'];

          return (
            <div
              key={card.id}
              onClick={() => onInspectCard(card)}
              className={`relative flex flex-col justify-between p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                isUnlocked
                  ? `${styles.bg} ${styles.border} ${styles.glow} hover:-translate-y-1 hover:shadow-2xl`
                  : 'bg-slate-950/80 border-slate-800 opacity-60 grayscale hover:grayscale-0'
              }`}
            >
              {!isUnlocked && (
                <div className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between gap-1 mb-3">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${styles.badge}`}>
                  {card.rarity}-RANK
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-cyan-300">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>{card.cost}</span>
                </div>
              </div>

              {/* Title & Icon */}
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-slate-800/90 border border-slate-700 shrink-0 shadow-inner">
                  {getIcon(card.icon)}
                </div>
                <h4 className="font-extrabold text-sm md:text-base text-white leading-tight">
                  {card.name}
                </h4>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 font-medium leading-relaxed mb-4 flex-grow">
                {card.description}
              </p>

              {/* Status footer */}
              <div className="mt-auto pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold">
                {isUnlocked ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>In Library</span>
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked (Open Packs)</span>
                  </span>
                )}
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
