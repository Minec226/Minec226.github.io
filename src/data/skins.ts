/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BoardSkin } from '../types';

export const BOARD_SKINS: BoardSkin[] = [
  {
    id: 'obsidian',
    name: 'Obsidian Arcane',
    lightSq: 'bg-slate-700/80 hover:bg-slate-600/80 text-slate-200 border border-slate-600/30',
    darkSq: 'bg-slate-900/95 hover:bg-slate-800/90 text-slate-400 border border-slate-800/50',
    border: 'border-4 border-slate-800 shadow-2xl shadow-indigo-500/10 bg-slate-950 p-3 rounded-2xl ring-1 ring-white/10',
    highlight: 'ring-2 ring-amber-400/90 bg-amber-500/20',
    targetHighlight: 'ring-2 ring-cyan-400/90 bg-cyan-500/20 animate-pulse',
    previewBg: 'from-slate-900 to-indigo-950',
  },
  {
    id: 'classic',
    name: 'Classic Royal Wood',
    lightSq: 'bg-[#e2ceb1] hover:bg-[#ebd8bd] text-amber-950 border border-amber-900/10',
    darkSq: 'bg-[#8c6442] hover:bg-[#9c714b] text-amber-100 border border-amber-950/20',
    border: 'border-8 border-[#5c3e21] shadow-2xl shadow-black/40 bg-[#3a2613] p-3 rounded-2xl ring-1 ring-amber-500/30',
    highlight: 'ring-2 ring-amber-400/90 bg-amber-400/30',
    targetHighlight: 'ring-2 ring-emerald-500/90 bg-emerald-500/30 animate-pulse',
    previewBg: 'from-amber-950 to-stone-900',
  },
  {
    id: 'cyber',
    name: 'Neon Cyber Grid',
    lightSq: 'bg-purple-900/60 hover:bg-purple-800/70 text-fuchsia-200 border border-fuchsia-500/20 shadow-[inset_0_0_10px_rgba(217,70,239,0.1)]',
    darkSq: 'bg-indigo-950/90 hover:bg-indigo-900/90 text-cyan-400 border border-cyan-500/20 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]',
    border: 'border-4 border-fuchsia-600/60 shadow-2xl shadow-fuchsia-500/20 bg-black p-3 rounded-2xl ring-2 ring-cyan-500/50',
    highlight: 'ring-2 ring-fuchsia-400 bg-fuchsia-500/30',
    targetHighlight: 'ring-2 ring-cyan-400 bg-cyan-500/30 animate-pulse',
    previewBg: 'from-fuchsia-950 via-purple-950 to-black',
  },
  {
    id: 'emerald',
    name: 'Emerald Forest Sanctuary',
    lightSq: 'bg-emerald-100/90 hover:bg-emerald-50/90 text-emerald-950 border border-emerald-900/10',
    darkSq: 'bg-emerald-800/90 hover:bg-emerald-700/90 text-emerald-100 border border-emerald-950/20',
    border: 'border-4 border-emerald-900 shadow-2xl shadow-emerald-950/40 bg-emerald-950 p-3 rounded-2xl ring-1 ring-emerald-500/20',
    highlight: 'ring-2 ring-amber-400 bg-amber-400/30',
    targetHighlight: 'ring-2 ring-teal-300 bg-teal-400/30 animate-pulse',
    previewBg: 'from-emerald-950 to-teal-950',
  },
  {
    id: 'marble',
    name: 'Celestial Gold Marble',
    lightSq: 'bg-slate-100 hover:bg-white text-slate-800 border border-amber-500/20 shadow-[inset_0_0_8px_rgba(245,158,11,0.05)]',
    darkSq: 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 shadow-[inset_0_0_12px_rgba(0,0,0,0.5)]',
    border: 'border-4 border-amber-500/60 shadow-2xl shadow-amber-500/10 bg-slate-900 p-3 rounded-2xl ring-1 ring-amber-400/40',
    highlight: 'ring-2 ring-amber-500 bg-amber-400/30',
    targetHighlight: 'ring-2 ring-indigo-400 bg-indigo-500/30 animate-pulse',
    previewBg: 'from-slate-900 via-stone-900 to-amber-950',
  }
];
