/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from '../types';
import { RARITY_COLORS } from '../data/cards';
import { X, Sparkles, Zap, Shield, Eye, Clock, Crown, History, Sun, ShieldCheck, Snowflake, ShieldAlert, CloudFog, Move, RefreshCw, RotateCcw } from 'lucide-react';

interface CardModalProps {
  card: Card | null;
  onClose: () => void;
}

export const CardModal: React.FC<CardModalProps> = ({ card, onClose }) => {
  if (!card) return null;

  const styles = RARITY_COLORS[card.rarity] || RARITY_COLORS['D'];

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Snowflake': return <Snowflake className="w-8 h-8 text-cyan-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-8 h-8 text-slate-400" />;
      case 'CloudFog': return <CloudFog className="w-8 h-8 text-purple-400" />;
      case 'Eye': return <Eye className="w-8 h-8 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-8 h-8 text-amber-300" />;
      case 'Shield': return <Shield className="w-8 h-8 text-emerald-300" />;
      case 'Move': return <Move className="w-8 h-8 text-cyan-300" />;
      case 'RefreshCw': return <RefreshCw className="w-8 h-8 text-indigo-300" />;
      case 'RotateCcw': return <RotateCcw className="w-8 h-8 text-amber-400" />;
      case 'Zap': return <Zap className="w-8 h-8 text-purple-300" />;
      case 'Clock': return <Clock className="w-8 h-8 text-indigo-400" />;
      case 'Crown': return <Crown className="w-8 h-8 text-amber-400" />;
      case 'History': return <History className="w-8 h-8 text-amber-300" />;
      case 'Sun': return <Sun className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '12s' }} />;
      case 'ShieldCheck': return <ShieldCheck className="w-8 h-8 text-emerald-400" />;
      default: return <Sparkles className="w-8 h-8 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`relative w-full max-w-md p-6 rounded-3xl border-4 shadow-2xl ${styles.bg} ${styles.border} ${styles.glow} animate-scaleUp`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Card Rarity Badge & Energy Cost */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-sm font-black px-3 py-1 rounded-lg tracking-wider ${styles.badge}`}>
            {card.rarity}-RANK SPELL
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-950 border border-indigo-400/50 text-cyan-200 font-bold shadow-md">
            <Zap className="w-4 h-4 fill-current text-cyan-400" />
            <span>{card.cost} MANA</span>
          </div>
        </div>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center my-6 gap-3">
          <div className="p-5 rounded-2xl bg-slate-900/90 border-2 border-slate-700 shadow-xl shadow-indigo-500/10">
            {getIcon(card.icon)}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {card.name}
          </h2>
          <span className="text-xs uppercase tracking-widest font-mono text-slate-400 bg-slate-900 px-3 py-0.5 rounded-full border border-slate-800">
            Category: {card.category}
          </span>
        </div>

        {/* Description */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 mb-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Arcane Effect:</h4>
          <p className="text-sm md:text-base text-slate-200 font-medium leading-relaxed">
            {card.description}
          </p>
        </div>

        {/* Flavor Text */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 italic text-sm text-slate-400 text-center">
          {card.flavorText}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 hover:opacity-90 font-bold text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
        >
          Close Grimoire
        </button>
      </div>
    </div>
  );
};
