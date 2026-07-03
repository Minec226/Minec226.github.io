/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card, BoardSkin } from '../types';
import { ALL_CARDS, drawRandomCard, RARITY_COLORS } from '../data/cards';
import { BOARD_SKINS } from '../data/skins';
import confetti from 'canvas-confetti';
import { ShoppingBag, Coins, Sparkles, Package, Zap, Check, Lock, Palette, Info } from 'lucide-react';

interface CardPackShopProps {
  coins: number;
  onSpendCoins: (amount: number) => boolean;
  unlockedCardIds: string[];
  onUnlockCard: (cardId: string) => void;
  unlockedSkinIds: string[];
  onUnlockSkin: (skinId: string) => void;
  activeSkinId: string;
  onSelectSkin: (skinId: string) => void;
  onInspectCard: (card: Card) => void;
}

export const CardPackShop: React.FC<CardPackShopProps> = ({
  coins,
  onSpendCoins,
  unlockedCardIds,
  onUnlockCard,
  unlockedSkinIds,
  onUnlockSkin,
  activeSkinId,
  onSelectSkin,
  onInspectCard,
}) => {
  const [activeTab, setActiveTab] = useState<'packs' | 'skins'>('packs');
  const [openedCards, setOpenedCards] = useState<Card[] | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenPack = (packType: 'standard' | 'rare' | 'royal', cost: number) => {
    if (!onSpendCoins(cost)) return;

    setIsOpening(true);
    setOpenedCards(null);

    setTimeout(() => {
      const results: Card[] = [];
      const count = packType === 'standard' ? 3 : packType === 'rare' ? 4 : 5;

      for (let i = 0; i < count; i++) {
        let pool = ALL_CARDS;
        if (packType === 'rare' && i === 0) {
          // Guarantee at least B or higher on rare pack
          pool = ALL_CARDS.filter(c => c.rarity === 'B' || c.rarity === 'A' || c.rarity === 'S');
        } else if (packType === 'royal' && i === 0) {
          // Guarantee at least A or S on royal pack
          pool = ALL_CARDS.filter(c => c.rarity === 'A' || c.rarity === 'S');
        }
        const drawn = drawRandomCard(pool);
        results.push(drawn);
        onUnlockCard(drawn.id);
      }

      setOpenedCards(results);
      setIsOpening(false);

      // Trigger celebratory confetti if an A or S rank card was opened!
      if (results.some(c => c.rarity === 'A' || c.rarity === 'S')) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#a855f7', '#06b6d4'],
        });
      }
    }, 800);
  };

  const handleBuySkin = (skin: BoardSkin, cost: number) => {
    if (unlockedSkinIds.includes(skin.id)) {
      onSelectSkin(skin.id);
      return;
    }
    if (onSpendCoins(cost)) {
      onUnlockSkin(skin.id);
      onSelectSkin(skin.id);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 flex flex-col gap-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-amber-400" />
            <span>MYSTICAL ARCANUM SHOP</span>
          </h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Spend earned coins to open card packs, discover rare spells, and unlock board skins.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-amber-950/80 border-2 border-amber-500/50 px-5 py-2.5 rounded-2xl shadow-xl shadow-amber-500/10">
          <Coins className="w-6 h-6 text-amber-400 fill-amber-400" />
          <div className="flex flex-col">
            <span className="text-xs text-amber-300/80 font-bold uppercase">Your Balance</span>
            <span className="text-xl font-black text-amber-100">{coins} COINS</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => { setActiveTab('packs'); setOpenedCards(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'packs'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Booster Card Packs</span>
        </button>
        <button
          onClick={() => { setActiveTab('skins'); setOpenedCards(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'skins'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Board & Piece Skins</span>
        </button>
      </div>

      {/* PACKS TAB */}
      {activeTab === 'packs' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Standard Pack */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-700 p-6 rounded-3xl shadow-xl flex flex-col justify-between items-center text-center gap-4 hover:border-slate-500 transition-all">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-600 shadow-inner">
                <Package className="w-12 h-12 text-slate-300 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Standard Booster</h3>
                <p className="text-xs text-slate-400 mt-1">3 Random Spells. High chance of D, C, and B rank cards.</p>
              </div>
              <button
                onClick={() => handleOpenPack('standard', 100)}
                disabled={coins < 100 || isOpening}
                className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  coins >= 100
                    ? 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white shadow-lg shadow-slate-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>100 COINS</span>
              </button>
            </div>

            {/* Rare Pack */}
            <div className="bg-gradient-to-b from-indigo-950/80 to-slate-950 border-2 border-indigo-500/60 p-6 rounded-3xl shadow-xl shadow-indigo-500/10 flex flex-col justify-between items-center text-center gap-4 hover:border-indigo-400 transition-all">
              <div className="p-4 rounded-2xl bg-indigo-900/80 border border-indigo-400/50 shadow-inner">
                <Sparkles className="w-12 h-12 text-indigo-300 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Rare Arcanum Pack</h3>
                <p className="text-xs text-indigo-200 mt-1">4 Spells. GUARANTEES at least one B, A, or S rank card!</p>
              </div>
              <button
                onClick={() => handleOpenPack('rare', 250)}
                disabled={coins < 250 || isOpening}
                className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  coins >= 250
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>250 COINS</span>
              </button>
            </div>

            {/* Royal Pack */}
            <div className="bg-gradient-to-b from-amber-950/90 via-purple-950/80 to-slate-950 border-2 border-amber-500 p-6 rounded-3xl shadow-2xl shadow-amber-500/20 flex flex-col justify-between items-center text-center gap-4 hover:scale-102 transition-all">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-purple-600 border border-amber-300 shadow-xl shadow-amber-500/30">
                <Zap className="w-12 h-12 text-slate-950 fill-slate-950 animate-bounce" />
              </div>
              <div>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Legendary Tier
                </span>
                <h3 className="text-xl font-black text-white mt-1.5">Royal Grimoire</h3>
                <p className="text-xs text-amber-200 mt-1">5 Spells. GUARANTEES at least one A or S rank card!</p>
              </div>
              <button
                onClick={() => handleOpenPack('royal', 500)}
                disabled={coins < 500 || isOpening}
                className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  coins >= 500
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 hover:opacity-95 text-slate-950 shadow-xl shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Coins className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>500 COINS</span>
              </button>
            </div>

          </div>

          {/* Pack Opening Animation & Results */}
          {isOpening && (
            <div className="w-full py-16 bg-slate-900/90 border border-purple-500/50 rounded-3xl flex flex-col items-center justify-center gap-4 text-center animate-pulse">
              <Package className="w-16 h-16 text-purple-400 animate-spin" style={{ animationDuration: '2s' }} />
              <h3 className="text-2xl font-black text-purple-200">Unsealing Mystical Grimoire...</h3>
              <p className="text-sm text-slate-400">Channeling cosmic mana to forge your cards!</p>
            </div>
          )}

          {openedCards && (
            <div className="bg-slate-900/90 border-2 border-amber-500/60 p-6 rounded-3xl shadow-2xl animate-scaleUp">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <h3 className="text-xl font-black text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                  <span>PACK OPENED! ({openedCards.length} Cards Added to Library)</span>
                </h3>
                <button
                  onClick={() => setOpenedCards(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Clear Results
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {openedCards.map((card, idx) => {
                  const styles = RARITY_COLORS[card.rarity] || RARITY_COLORS['D'];
                  return (
                    <div
                      key={idx}
                      onClick={() => onInspectCard(card)}
                      className={`p-4 rounded-2xl border-2 flex flex-col justify-between gap-3 cursor-pointer transition-all hover:scale-105 ${styles.bg} ${styles.border} ${styles.glow}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${styles.badge}`}>
                          {card.rarity}-RANK
                        </span>
                        <span className="text-xs font-bold text-cyan-300">{card.cost} MANA</span>
                      </div>
                      <h4 className="font-extrabold text-base text-white">{card.name}</h4>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">{card.description}</p>
                      <div className="mt-auto pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-amber-300 font-bold">
                        <span>Unlocked!</span>
                        <Info className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SKINS TAB */}
      {activeTab === 'skins' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BOARD_SKINS.map((skin, idx) => {
            const isUnlocked = unlockedSkinIds.includes(skin.id);
            const isActive = activeSkinId === skin.id;
            const cost = idx === 0 || idx === 1 ? 0 : idx * 200; // Obsidian & Classic free, others cost coins

            return (
              <div
                key={skin.id}
                className={`flex flex-col justify-between p-6 rounded-3xl border-2 transition-all ${
                  isActive
                    ? 'bg-slate-900 border-amber-500 shadow-2xl shadow-amber-500/20 ring-2 ring-amber-400/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-black text-white">{skin.name}</h3>
                    {isActive ? (
                      <span className="bg-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>EQUIPPED</span>
                      </span>
                    ) : isUnlocked ? (
                      <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="bg-red-950/80 text-red-300 border border-red-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>{cost} COINS</span>
                      </span>
                    )}
                  </div>

                  {/* Mini preview box */}
                  <div className={`w-full aspect-video rounded-2xl p-3 flex flex-col justify-center items-center bg-gradient-to-br ${skin.previewBg} border border-white/10 mb-4 shadow-inner`}>
                    <div className="grid grid-cols-4 grid-rows-2 w-48 h-24 rounded-lg overflow-hidden border border-black/40 shadow-lg">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-center font-bold text-lg ${
                            i % 2 === 0 ? skin.lightSq : skin.darkSq
                          }`}
                        >
                          {i === 2 ? '♘' : i === 5 ? '♕' : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBuySkin(skin, cost)}
                  disabled={!isUnlocked && coins < cost}
                  className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    isActive
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : isUnlocked
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20'
                      : coins >= cost
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isActive ? (
                    <span>Currently Active</span>
                  ) : isUnlocked ? (
                    <span>Equip Theme</span>
                  ) : (
                    <>
                      <Coins className="w-4 h-4 text-slate-950 fill-slate-950" />
                      <span>Unlock for {cost} Coins</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
