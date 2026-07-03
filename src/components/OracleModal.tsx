/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Board, Card, CardRarity, PieceColor, PlayerState } from '../types';
import { X, Wand2, Sparkles, Zap, MessageSquare, PlusCircle, Check, Loader2, BookOpen } from 'lucide-react';

interface OracleModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board;
  turn: PieceColor;
  playerColor: PieceColor;
  playerState: PlayerState;
  onAddCustomCard?: (card: Card) => void;
}

export const OracleModal: React.FC<OracleModalProps> = ({
  isOpen,
  onClose,
  board,
  turn,
  playerColor,
  playerState,
  onAddCustomCard,
}) => {
  const [activeTab, setActiveTab] = useState<'coach' | 'forge'>('coach');
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState<boolean>(false);

  // Spell Forge states
  const [themeInput, setThemeInput] = useState<string>('');
  const [desiredRarity, setDesiredRarity] = useState<CardRarity | 'ANY'>('ANY');
  const [generatedCard, setGeneratedCard] = useState<any | null>(null);
  const [loadingForge, setLoadingForge] = useState<boolean>(false);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [forgeError, setForgeError] = useState<string | null>(null);

  // Auto-fetch tactical advice when opened on Coach tab
  useEffect(() => {
    if (isOpen && activeTab === 'coach' && !advice && !loadingAdvice) {
      fetchAdvice();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const getBoardSummary = (): string => {
    let wCount = 0, bCount = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p) {
          if (p.color === 'w') wCount++;
          else bCount++;
        }
      }
    }
    return `White has ${wCount} pieces remaining on board. Black has ${bCount} pieces remaining. Player is ${playerColor === 'w' ? 'White' : 'Black'}. It is currently ${turn === 'w' ? 'White' : 'Black'}'s turn.`;
  };

  const fetchAdvice = async () => {
    setLoadingAdvice(true);
    setAdvice('');
    try {
      const res = await fetch('/api/oracle/advise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardSummary: getBoardSummary(),
          hand: playerState.hand.map(c => ({ name: c.name, cost: c.cost, desc: c.description })),
          energy: playerState.energy,
          playerColor,
          turn: turn === 'w' ? 'White' : 'Black',
        }),
      });
      const data = await res.json();
      if (data.error) {
        setAdvice(`🔮 ${data.error}`);
      } else {
        setAdvice(data.advice || "The Oracle sees a clear sky. Proceed with confidence!");
      }
    } catch (err) {
      setAdvice("🔮 The mystical mist disrupted the connection to the Arcane Oracle.");
    } finally {
      setLoadingAdvice(false);
    }
  };

  const handleForgeCard = async () => {
    if (!themeInput.trim()) return;
    setLoadingForge(true);
    setGeneratedCard(null);
    setAddedSuccess(false);
    setForgeError(null);

    try {
      const res = await fetch('/api/oracle/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: themeInput,
          desiredRarity: desiredRarity === 'ANY' ? null : desiredRarity,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setForgeError(data.error);
      } else if (data.card) {
        setGeneratedCard(data.card);
      }
    } catch (err) {
      console.error("Spell forge error:", err);
      setForgeError("The mystical mist disrupted the connection to the Arcane Oracle.");
    } finally {
      setLoadingForge(false);
    }
  };

  const handleSaveCard = () => {
    if (!generatedCard || !onAddCustomCard) return;
    const newCard: Card = {
      id: `custom_${Date.now()}`,
      name: generatedCard.name || 'Custom Spell',
      rarity: (generatedCard.rarity as CardRarity) || 'B',
      cost: typeof generatedCard.cost === 'number' ? generatedCard.cost : 2,
      description: generatedCard.description || 'A mysterious spell forged by the Oracle.',
      flavorText: generatedCard.flavorText || '"Forged from raw starlight and imagination."',
      category: generatedCard.category || 'tactical',
      targetType: 'friendly_piece',
      effectCode: 'REPOSITION_PIECE',
      icon: 'Sparkles',
      unlockedByDefault: true,
    };
    onAddCustomCard(newCard);
    setAddedSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950 border-4 border-purple-500/60 rounded-3xl p-6 shadow-2xl shadow-purple-500/20 flex flex-col gap-6 animate-scaleUp max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-purple-500/30 pb-4">
          <div className="p-3 rounded-2xl bg-purple-900/80 border border-purple-400 shadow-xl shadow-purple-500/20">
            <Wand2 className="w-8 h-8 text-purple-200 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              THE ARCANE ORACLE
            </h2>
            <p className="text-xs text-purple-300 font-medium">Powered by Gemini AI Studio Engine</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('coach')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'coach'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Tactical Oracle Coach</span>
          </button>
          <button
            onClick={() => setActiveTab('forge')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'forge'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Spell Forge (Create Cards)</span>
          </button>
        </div>

        {/* COACH TAB */}
        {activeTab === 'coach' && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-xs text-slate-300">
              <span>Your Energy: <strong className="text-cyan-400">{playerState.energy} Mana</strong></span>
              <span>Cards in Hand: <strong className="text-purple-400">{playerState.hand.length} Spells</strong></span>
              <button
                onClick={fetchAdvice}
                disabled={loadingAdvice}
                className="px-3 py-1 rounded-lg bg-purple-900/80 hover:bg-purple-800 text-purple-200 font-bold border border-purple-500/40"
              >
                Refresh Vision
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/90 border-2 border-purple-500/40 shadow-inner min-h-[180px] flex flex-col justify-center">
              {loadingAdvice ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8 text-center animate-pulse">
                  <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                  <p className="text-sm font-bold text-purple-300">The Oracle is gazing into the timestream...</p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none text-sm md:text-base text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                  {advice || "Click 'Refresh Vision' to seek tactical advice from the Oracle."}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FORGE TAB */}
        {activeTab === 'forge' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-300">
              Describe a magical spell concept or theme. The Oracle will generate balanced stats, rarity, and lore!
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Spell Theme / Idea:</label>
              <input
                type="text"
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                placeholder="e.g. A frozen dragon breath that freezes two pieces at once..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase mr-2">Desired Rarity:</span>
              {(['ANY', 'D', 'C', 'B', 'A', 'S'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setDesiredRarity(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                    desiredRarity === r
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {r === 'ANY' ? 'Any Rank' : `${r}-Rank`}
                </button>
              ))}
            </div>

            <button
              onClick={handleForgeCard}
              disabled={loadingForge || !themeInput.trim()}
              className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                loadingForge || !themeInput.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 text-white shadow-lg shadow-purple-500/30'
              }`}
            >
              {loadingForge ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Forging Spell in Arcanum...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Forge Spell with AI Oracle</span>
                </>
              )}
            </button>

            {forgeError && (
              <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-lg">
                <span>🔮 {forgeError}</span>
              </div>
            )}

            {generatedCard && (
              <div className="p-5 rounded-3xl bg-slate-950 border-2 border-amber-500/60 shadow-xl flex flex-col gap-3 mt-2 animate-scaleUp">
                <div className="flex items-center justify-between">
                  <span className="bg-amber-500 text-slate-950 text-xs font-black px-3 py-0.5 rounded">
                    {generatedCard.rarity}-RANK SPELL
                  </span>
                  <span className="text-xs font-bold text-cyan-300">{generatedCard.cost} MANA</span>
                </div>
                <h4 className="text-xl font-black text-white">{generatedCard.name}</h4>
                <p className="text-sm text-slate-300 font-medium">{generatedCard.description}</p>
                <p className="text-xs italic text-slate-400 border-t border-slate-800 pt-2">{generatedCard.flavorText}</p>

                <button
                  onClick={handleSaveCard}
                  disabled={addedSuccess}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all mt-2 ${
                    addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Added to Library!</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Add to Custom Arcanum Deck</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
