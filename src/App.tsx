/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Board, Card, GameMode, PieceColor, PlayerState, Position, GameHistorySnapshot, AILevel } from './types';
import { createInitialBoard, executeMove, isCheckmate, isStalemate, getAIMove, getLegalMoves } from './engine/chessEngine';
import { applyCardEffect } from './engine/cardEffects';
import { ALL_CARDS, generateStarterDeck, drawRandomCard } from './data/cards';
import { BOARD_SKINS } from './data/skins';
import { Navbar } from './components/Navbar';
import { GameBoard } from './components/GameBoard';
import { CardHand } from './components/CardHand';
import { CardModal } from './components/CardModal';
import { CardPackShop } from './components/CardPackShop';
import { DeckBuilder } from './components/DeckBuilder';
import { OracleModal } from './components/OracleModal';
import { WinModal } from './components/WinModal';
import { Swords, Bot, User, ShieldAlert, Sparkles, Wand2 } from 'lucide-react';

export default function App() {
  // Persistent Local Storage State
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('arcane_chess_coins');
    return saved ? parseInt(saved, 10) : 350; // Start with 350 coins to open packs!
  });

  const [unlockedCardIds, setUnlockedCardIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('arcane_chess_unlocked_cards');
    if (saved) return JSON.parse(saved);
    return ALL_CARDS.filter(c => c.unlockedByDefault).map(c => c.id);
  });

  const [unlockedSkinIds, setUnlockedSkinIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('arcane_chess_unlocked_skins');
    return saved ? JSON.parse(saved) : ['obsidian', 'classic'];
  });

  const [activeSkinId, setActiveSkinId] = useState<string>(() => {
    return localStorage.getItem('arcane_chess_active_skin') || 'obsidian';
  });

  const [customCards, setCustomCards] = useState<Card[]>(() => {
    const saved = localStorage.getItem('arcane_chess_custom_cards');
    return saved ? JSON.parse(saved) : [];
  });

  // Match Configuration & Mode
  const [currentMode, setCurrentMode] = useState<GameMode>('match');
  const [playerColor, setPlayerColor] = useState<PieceColor>('w');
  const [aiDifficulty, setAiDifficulty] = useState<AILevel>('medium');

  // Active Match State
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [turn, setTurn] = useState<PieceColor>('w');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [cardTarget1, setCardTarget1] = useState<Position | null>(null);
  const [gameMessage, setGameMessage] = useState<string>("Welcome! Draw ability cards and conquer the board!");
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const [history, setHistory] = useState<GameHistorySnapshot[]>([]);
  const [turnCounter, setTurnCounter] = useState<number>(1);

  // Player Stats
  const [whiteState, setWhiteState] = useState<PlayerState>(() => ({
    color: 'w',
    hand: generateStarterDeck(unlockedCardIds).slice(0, 4),
    deck: generateStarterDeck(unlockedCardIds).slice(4),
    discard: [],
    energy: 2,
    maxEnergy: 5,
    capturedPieces: [],
  }));

  const [blackState, setBlackState] = useState<PlayerState>(() => ({
    color: 'b',
    hand: generateStarterDeck(unlockedCardIds).slice(0, 4),
    deck: generateStarterDeck(unlockedCardIds).slice(4),
    discard: [],
    energy: 2,
    maxEnergy: 5,
    capturedPieces: [],
  }));

  // Modals
  const [inspectedCard, setInspectedCard] = useState<Card | null>(null);
  const [isOracleOpen, setIsOracleOpen] = useState<boolean>(false);
  const [winner, setWinner] = useState<PieceColor | 'draw' | null>(null);
  const [coinsEarned, setCoinsEarned] = useState<number>(0);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('arcane_chess_coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('arcane_chess_unlocked_cards', JSON.stringify(unlockedCardIds));
  }, [unlockedCardIds]);

  useEffect(() => {
    localStorage.setItem('arcane_chess_unlocked_skins', JSON.stringify(unlockedSkinIds));
  }, [unlockedSkinIds]);

  useEffect(() => {
    localStorage.setItem('arcane_chess_active_skin', activeSkinId);
  }, [activeSkinId]);

  useEffect(() => {
    localStorage.setItem('arcane_chess_custom_cards', JSON.stringify(customCards));
  }, [customCards]);

  const activeSkin = BOARD_SKINS.find(s => s.id === activeSkinId) || BOARD_SKINS[0];
  const allAvailableCards = [...ALL_CARDS, ...customCards];

  // Start a fresh new match
  const handleNewGame = () => {
    const newBoard = createInitialBoard();
    setBoard(newBoard);
    setTurn('w');
    setSelectedPos(null);
    setActiveCard(null);
    setCardTarget1(null);
    setHistory([]);
    setWinner(null);
    setTurnCounter(1);
    setGameMessage("Match reset! White leads the vanguard.");

    const wDeck = generateStarterDeck(unlockedCardIds);
    const bDeck = generateStarterDeck(unlockedCardIds);

    setWhiteState({
      color: 'w',
      hand: wDeck.slice(0, 4),
      deck: wDeck.slice(4),
      discard: [],
      energy: 2,
      maxEnergy: 5,
      capturedPieces: [],
    });

    setBlackState({
      color: 'b',
      hand: bDeck.slice(0, 4),
      deck: bDeck.slice(4),
      discard: [],
      energy: 2,
      maxEnergy: 5,
      capturedPieces: [],
    });
  };

  // Helper to get active state for current turn
  const getCurrentState = () => (turn === 'w' ? whiteState : blackState);
  const getOpponentState = () => (turn === 'w' ? blackState : whiteState);
  const setCurrentState = (st: PlayerState) => (turn === 'w' ? setWhiteState(st) : setBlackState(st));
  const setOpponentState = (st: PlayerState) => (turn === 'w' ? setBlackState(st) : setWhiteState(st));

  // Push snapshot before move
  const pushHistory = () => {
    setHistory(prev => [
      ...prev,
      {
        board: board.map(row => row.map(cell => (cell ? { ...cell } : null))),
        turn,
        whiteState: { ...whiteState, hand: [...whiteState.hand], capturedPieces: [...whiteState.capturedPieces] },
        blackState: { ...blackState, hand: [...blackState.hand], capturedPieces: [...blackState.capturedPieces] },
      },
    ]);
  };

  // Switch Turn and handle Mana & Card Draw rules
  const nextTurn = () => {
    const currentState = getCurrentState();

    // If Time Warp is active, player takes a bonus consecutive turn!
    if (currentState.timeWarpActive) {
      setCurrentState({ ...currentState, timeWarpActive: false });
      setGameMessage("⏳ Time Warp bonus turn! Take another action!");
      return;
    }

    const nextColor: PieceColor = turn === 'w' ? 'b' : 'w';
    const nextSt = nextColor === 'w' ? whiteState : blackState;

    // +1 Energy per turn (cap at maxEnergy)
    const newEnergy = Math.min(nextSt.maxEnergy, nextSt.energy + 1);
    let newHand = [...nextSt.hand];
    let newDeck = [...nextSt.deck];

    // Draw 1 card every 2 turns if hand < 5
    if (turnCounter % 2 === 0 && newHand.length < 5) {
      if (newDeck.length === 0) {
        newDeck = generateStarterDeck(unlockedCardIds);
      }
      const drawn = newDeck.pop();
      if (drawn) newHand.push(drawn);
    }

    if (nextColor === 'w') {
      setWhiteState(prev => ({ ...prev, energy: newEnergy, hand: newHand, deck: newDeck }));
    } else {
      setBlackState(prev => ({ ...prev, energy: newEnergy, hand: newHand, deck: newDeck }));
    }

    setTurn(nextColor);
    setTurnCounter(c => c + 1);
  };

  // Undo move (Casual / Sandbox / Fate Rewrite)
  const handleUndo = () => {
    if (history.length === 0 || isAIThinking) return;
    const last = history[history.length - 1];
    setBoard(last.board);
    setTurn(last.turn);
    setWhiteState(last.whiteState);
    setBlackState(last.blackState);
    setHistory(history.slice(0, -1));
    setSelectedPos(null);
    setActiveCard(null);
    setCardTarget1(null);
    setGameMessage("Time reverted!");
  };

  // Handle Square Selection for standard chess moves
  const handleSelectSquare = (pos: Position) => {
    if (isAIThinking || (aiDifficulty !== 'pass_and_play' && turn !== playerColor)) return;
    const clickedPiece = board[pos.row][pos.col];

    // If active card targeting, ignore standard selection
    if (activeCard) return;

    // If clicking own piece, select it (or deselect if already selected)
    if (clickedPiece && clickedPiece.color === turn) {
      if (selectedPos && selectedPos.row === pos.row && selectedPos.col === pos.col) {
        setSelectedPos(null);
        return;
      }
      if (clickedPiece.frozen) {
        setGameMessage(`❄️ ${clickedPiece.type.toUpperCase()} is frozen by Clumsy Move! Cannot move this turn.`);
        return;
      }
      setSelectedPos(pos);
      return;
    }

    // If piece already selected, try to execute legal move
    if (selectedPos) {
      const piece = board[selectedPos.row][selectedPos.col]!;
      const from = selectedPos;
      const to = pos;

      // Verify that the destination is a valid legal move
      const legalMoves = getLegalMoves(board, from);
      const isLegal = legalMoves.some(m => m.row === to.row && m.col === to.col);
      if (!isLegal) {
        setGameMessage("❌ Illegal move! You can only move to highlighted green valid squares.");
        return;
      }

      // Simulate to check checkmate escape or capture
      pushHistory();
      const { newBoard, captured } = executeMove(board, from, to);

      // Check if opponent is placed in checkmate
      const oppColor = turn === 'w' ? 'b' : 'w';
      const oppState = oppColor === 'w' ? whiteState : blackState;

      if (isCheckmate(newBoard, oppColor)) {
        // Did they equip S-Rank Checkmate Escape?!
        if (oppState.checkmateEscapeActive) {
          setGameMessage("🛡️ S-Rank Checkmate Escape triggered! The King defies checkmate once!");
          const newOppSt = { ...oppState, checkmateEscapeActive: false };
          if (oppColor === 'w') setWhiteState(newOppSt); else setBlackState(newOppSt);
          setBoard(newBoard);
          setSelectedPos(null);
          nextTurn();
          return;
        }

        // Glorious Win!
        setBoard(newBoard);
        setWinner(turn);
        const reward = turn === playerColor ? (aiDifficulty === 'hard' ? 300 : 200) : 50;
        setCoinsEarned(reward);
        setCoins(c => c + reward);
        return;
      }

      if (isStalemate(newBoard, oppColor)) {
        setBoard(newBoard);
        setWinner('draw');
        setCoinsEarned(100);
        setCoins(c => c + 100);
        return;
      }

      // Update captured pieces graveyard
      if (captured) {
        const currentSt = getCurrentState();
        setCurrentState({
          ...currentSt,
          capturedPieces: [...currentSt.capturedPieces, captured],
        });
        setGameMessage(`Captured enemy ${captured.type.toUpperCase()}!`);
      } else {
        setGameMessage(`Moved ${piece.type.toUpperCase()} to square.`);
      }

      setBoard(newBoard);
      setSelectedPos(null);
      nextTurn();
    }
  };

  // Handle Card Play Selection
  const handleUseCard = (card: Card) => {
    if (isAIThinking || (aiDifficulty !== 'pass_and_play' && turn !== playerColor)) return;
    const currentState = getCurrentState();
    if (currentState.energy < card.cost) {
      setGameMessage(`⚡ Needs ${card.cost} Mana! You only have ${currentState.energy}.`);
      return;
    }

    if (card.targetType === 'none') {
      // Cast instant spell
      pushHistory();
      const res = applyCardEffect(card, board, turn, getCurrentState(), getOpponentState());
      if (res.success) {
        setBoard(res.newBoard);
        setCurrentState(res.newPlayerState);
        setOpponentState(res.newOpponentState);
        setGameMessage(`✨ ${res.message}`);
        if (res.triggerUndo) {
          handleUndo();
          handleUndo();
        } else {
          nextTurn();
        }
      } else {
        setGameMessage(`❌ ${res.message}`);
      }
    } else {
      // Enter targeting mode
      setActiveCard(card);
      setCardTarget1(null);
      setSelectedPos(null);
      setGameMessage(`⚡ Select target square on the board for ${card.name}...`);
    }
  };

  const handleSelectCardTarget = (pos: Position) => {
    if (!activeCard) return;

    if (activeCard.targetType === 'two_friendly_pieces' && !cardTarget1) {
      setCardTarget1(pos);
      setGameMessage("⚡ Select second friendly piece to swap positions...");
      return;
    }

    pushHistory();
    const res = applyCardEffect(
      activeCard,
      board,
      turn,
      getCurrentState(),
      getOpponentState(),
      cardTarget1 || pos,
      cardTarget1 ? pos : undefined
    );

    if (res.success) {
      setBoard(res.newBoard);
      setCurrentState(res.newPlayerState);
      setOpponentState(res.newOpponentState);
      setGameMessage(`✨ ${res.message}`);
      setActiveCard(null);
      setCardTarget1(null);
      if (res.triggerUndo) {
        handleUndo();
        handleUndo();
      } else {
        nextTurn();
      }
    } else {
      setGameMessage(`❌ ${res.message}`);
      setActiveCard(null);
      setCardTarget1(null);
    }
  };

  // AI Opponent Turn execution
  useEffect(() => {
    if (winner || currentMode !== 'match' || aiDifficulty === 'pass_and_play') return;
    if (turn !== playerColor && !isAIThinking) {
      setIsAIThinking(true);
      const timer = setTimeout(() => {
        const aiSt = turn === 'w' ? whiteState : blackState;
        const aiRes = getAIMove(board, turn, aiSt, aiDifficulty);

        if (aiRes.cardPlay) {
          const { card, target1, target2 } = aiRes.cardPlay;
          const res = applyCardEffect(card, board, turn, getCurrentState(), getOpponentState(), target1, target2);
          if (res.success) {
            setBoard(res.newBoard);
            setCurrentState(res.newPlayerState);
            setOpponentState(res.newOpponentState);
            setGameMessage(`🤖 Enemy AI cast ${card.name}! ${res.message}`);
            setIsAIThinking(false);
            nextTurn();
            return;
          }
        }

        if (aiRes.move) {
          const { from, to } = aiRes.move;
          const { newBoard, captured } = executeMove(board, from, to);

          if (isCheckmate(newBoard, playerColor)) {
            const plSt = playerColor === 'w' ? whiteState : blackState;
            if (plSt.checkmateEscapeActive) {
              setGameMessage("🛡️ Your S-Rank Checkmate Escape saved your King!");
              const newPlSt = { ...plSt, checkmateEscapeActive: false };
              if (playerColor === 'w') setWhiteState(newPlSt); else setBlackState(newPlSt);
              setBoard(newBoard);
              setIsAIThinking(false);
              nextTurn();
              return;
            }
            setBoard(newBoard);
            setWinner(turn);
            setCoinsEarned(50);
            setCoins(c => c + 50);
            setIsAIThinking(false);
            return;
          }

          if (captured) {
            const currentSt = getCurrentState();
            setCurrentState({
              ...currentSt,
              capturedPieces: [...currentSt.capturedPieces, captured],
            });
          }

          setBoard(newBoard);
          setGameMessage(`🤖 Enemy AI moved piece.`);
          setIsAIThinking(false);
          nextTurn();
        } else {
          setIsAIThinking(false);
        }
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [turn, playerColor, aiDifficulty, winner, currentMode]);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${activeSkin.previewBg} text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white`}>
      
      {/* Top Navbar */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        coins={coins}
        onNewGame={handleNewGame}
        onOpenOracle={() => setIsOracleOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-6 w-full max-w-7xl mx-auto">
        
        {/* MATCH MODE */}
        {currentMode === 'match' && (
          <div className="w-full flex flex-col items-center gap-6 animate-fadeIn">
            
            {/* Match Settings Bar (Difficulty & Side) */}
            <div className="flex flex-wrap items-center justify-between w-full max-w-2xl bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-2xl gap-3 text-xs md:text-sm shadow-md">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-300">Opponent Mode:</span>
                {(['easy', 'medium', 'hard', 'pass_and_play'] as AILevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => { setAiDifficulty(lvl); handleNewGame(); }}
                    className={`px-2.5 py-1 rounded-lg font-extrabold capitalize transition-all ${
                      aiDifficulty === lvl
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {lvl === 'pass_and_play' ? 'Local 2P' : `AI (${lvl})`}
                  </button>
                ))}
              </div>

              {aiDifficulty !== 'pass_and_play' && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-bold mr-1">Your Color:</span>
                  <button
                    onClick={() => { setPlayerColor('w'); handleNewGame(); }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      playerColor === 'w' ? 'bg-amber-100 text-slate-950 shadow' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    White ♔
                  </button>
                  <button
                    onClick={() => { setPlayerColor('b'); handleNewGame(); }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      playerColor === 'b' ? 'bg-slate-700 text-white shadow' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Black ♚
                  </button>
                </div>
              )}
            </div>

            {/* Chessboard & Energy Bars */}
            <GameBoard
              board={board}
              turn={turn}
              playerColor={aiDifficulty === 'pass_and_play' ? turn : playerColor}
              whiteState={whiteState}
              blackState={blackState}
              selectedPos={selectedPos}
              onSelectSquare={handleSelectSquare}
              activeCard={activeCard}
              cardTarget1={cardTarget1}
              onSelectCardTarget={handleSelectCardTarget}
              onCancelCard={() => { setActiveCard(null); setCardTarget1(null); }}
              skin={activeSkin}
              isAIThinking={isAIThinking}
              onUndo={handleUndo}
              canUndo={history.length > 0}
              gameMessage={gameMessage}
            />

            {/* Active Player Card Hand */}
            <CardHand
              playerState={aiDifficulty === 'pass_and_play' ? (turn === 'w' ? whiteState : blackState) : (playerColor === 'w' ? whiteState : blackState)}
              isPlayerTurn={aiDifficulty === 'pass_and_play' ? true : turn === playerColor}
              activeCard={activeCard}
              onUseCard={handleUseCard}
              onInspectCard={setInspectedCard}
            />
          </div>
        )}

        {/* DECK LIBRARY MODE */}
        {currentMode === 'deck_library' && (
          <DeckBuilder
            unlockedCardIds={unlockedCardIds}
            onInspectCard={setInspectedCard}
            onOpenShop={() => setCurrentMode('shop')}
          />
        )}

        {/* SHOP MODE */}
        {currentMode === 'shop' && (
          <CardPackShop
            coins={coins}
            onSpendCoins={(amount) => {
              if (coins >= amount) {
                setCoins(c => c - amount);
                return true;
              }
              return false;
            }}
            unlockedCardIds={unlockedCardIds}
            onUnlockCard={(id) => {
              if (!unlockedCardIds.includes(id)) {
                setUnlockedCardIds(prev => [...prev, id]);
              }
            }}
            unlockedSkinIds={unlockedSkinIds}
            onUnlockSkin={(id) => {
              if (!unlockedSkinIds.includes(id)) {
                setUnlockedSkinIds(prev => [...prev, id]);
              }
            }}
            activeSkinId={activeSkinId}
            onSelectSkin={setActiveSkinId}
            onInspectCard={setInspectedCard}
          />
        )}

      </main>

      {/* Modals */}
      <CardModal card={inspectedCard} onClose={() => setInspectedCard(null)} />

      <OracleModal
        isOpen={isOracleOpen}
        onClose={() => setIsOracleOpen(false)}
        board={board}
        turn={turn}
        playerColor={playerColor}
        playerState={playerColor === 'w' ? whiteState : blackState}
        onAddCustomCard={(newCard) => {
          setCustomCards(prev => [...prev, newCard]);
          setUnlockedCardIds(prev => [...prev, newCard.id]);
        }}
      />

      {winner && (
        <WinModal
          winner={winner}
          playerColor={playerColor}
          coinsEarned={coinsEarned}
          onPlayAgain={handleNewGame}
          onClose={() => { setWinner(null); setCurrentMode('deck_library'); }}
        />
      )}

    </div>
  );
}
