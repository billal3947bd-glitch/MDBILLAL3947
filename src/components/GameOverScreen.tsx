/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Award, RefreshCw, Trophy, Home, Eye, CheckCircle, XCircle, Coins } from "lucide-react";
import { GameStage, LeaderboardEntry, OperationType } from "../types";
import { Avatar } from "./Avatars";
import { playClickSound } from "../utils/soundEffects";

interface GameOverScreenProps {
  playerName: string;
  finalScore: number;
  finalLevel: number;
  selectedOperation: OperationType;
  selectedCharId: string;
  reviewQuestions: Array<{
    question: string;
    correctAnswer: number;
    playerAnswer: number;
    wasCorrect: boolean;
  }>;
  onNavigate: (stage: GameStage) => void;
  onRestartGame: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  playerName,
  finalScore,
  finalLevel,
  selectedOperation,
  selectedCharId,
  reviewQuestions,
  onNavigate,
  onRestartGame,
}) => {
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [coins] = useState(() => {
    return parseInt(localStorage.getItem("math_coins") || "100", 10);
  });

  // Operation label generator
  const getOpLabel = (op: OperationType) => {
    switch (op) {
      case OperationType.ADDITION:
        return "Addition";
      case OperationType.SUBTRACTION:
        return "Subtraction";
      case OperationType.MULTIPLICATION:
        return "Multiplication";
      case OperationType.DIVISION:
        return "Division";
      case OperationType.MIXED:
        return "All Mixed";
    }
  };

  useEffect(() => {
    // Generate and push local highscore entry to localStorage on mount
    const storageKey = "light-math-leaderboards";
    const existingRaw = localStorage.getItem(storageKey);
    let entries: LeaderboardEntry[] = [];
    
    if (existingRaw) {
      try {
        entries = JSON.parse(existingRaw);
      } catch (err) {
        entries = [];
      }
    }

    // Check if score makes it to the personal highscores list (e.g. check top entries)
    const personalHigh = entries
      .filter((e) => e.name.toLowerCase() === playerName.toLowerCase())
      .reduce((max, val) => (val.score > max ? val.score : max), 0);

    if (finalScore > personalHigh || entries.length === 0) {
      setIsNewHighScore(true);
    }

    // Create entry
    const newEntry: LeaderboardEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name: playerName.trim() || "PLAYER 1",
      score: finalScore,
      level: finalLevel,
      operation: getOpLabel(selectedOperation),
      characterId: selectedCharId,
      date: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    };

    // Sort, prune, and save top 50 scores globally
    const updatedEntries = [...entries, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);

    localStorage.setItem(storageKey, JSON.stringify(updatedEntries));
  }, [playerName, finalScore, finalLevel, selectedOperation, selectedCharId]);

  const correctCount = reviewQuestions.filter((q) => q.wasCorrect).length;
  const totalCount = reviewQuestions.length;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full max-w-sm md:max-w-4xl lg:max-w-5xl mx-auto select-none">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-slate-800 shadow-2xl p-4 sm:p-6 md:p-8 relative flex flex-col items-center"
        id="game-over-card"
      >
        {/* Subtle holographic grid dots */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#6366f1_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>

        {/* Dynamic header title based on effort */}
        <div className="text-center mt-2 mb-4 z-10 w-full">
          <motion.h2
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-4xl font-black text-white tracking-wider uppercase font-sans drop-shadow-[0_2px_10px_rgba(99,102,241,0.3)]"
          >
            {finalScore > 100 ? "AMAZING!" : "GAME OVER!"}
          </motion.h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
            MATH RUN COMPLETED
          </p>
        </div>

        {/* Dynamic Grid Column splits */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-start z-10 mt-2">
          
          {/* LEFT COLUMN: HERO AVATAR, SCORE SUMMARY, GENERAL ACTIONS */}
          <div className="flex flex-col items-center w-full bg-slate-950/30 border border-slate-800/40 p-4 rounded-[2rem] shadow-inner relative">
            {/* Character Avatar Box */}
            <div className="relative mb-5 z-10">
              <div className="w-24 h-24 rounded-full border-4 border-slate-800 bg-slate-950/80 relative shadow-lg flex items-center justify-center">
            <Avatar avatarKey={selectedCharId} className="w-20 h-20" />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 border border-amber-600 rounded-full p-1 shadow-sm">
              <Award size={16} className="text-white fill-white" />
            </div>
          </div>
          {isNewHighScore && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -top-3 -left-8 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full border border-amber-600 shadow-md transform -rotate-12 tracking-wide uppercase"
            >
              ⭐ New Best!
            </motion.div>
          )}
        </div>

        {/* Score Metrics Tally Card */}
        <div className="w-full bg-slate-950/50 border border-slate-800/85 rounded-2xl p-4 flex flex-col gap-2.5 mb-5 z-10 text-center">
          <h4 className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
            {playerName}&apos;s SUMMARY
          </h4>
          
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 shadow-inner">
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                Final Score
              </span>
              <span className="text-2xl font-black text-white font-sans">
                {finalScore}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 shadow-inner">
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                Level Reached
              </span>
              <span className="text-2xl font-black text-white font-sans">
                Lvl {finalLevel}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-2 py-1 mt-1 border-t border-slate-800">
            <span>Accuracy:</span>
            <span>{correctCount}/{totalCount} ({accuracy}%)</span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-amber-400 px-2 py-1.5 mt-1 border-t border-slate-800/60 font-sans">
            <span className="flex items-center gap-1.5">
              <Coins size={13} className="text-amber-400 fill-amber-400/10 animate-pulse" />
              Math Coins Bank:
            </span>
            <span className="font-mono font-black">{coins} cr</span>
          </div>
        </div>

        {/* Primary Action Buttons kept inside Left Column container */}
        <div className="w-full flex flex-col gap-3 z-10 px-1">
          {/* Replay Game Button */}
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ y: 2 }}
            onClick={() => {
              playClickSound();
              onRestartGame();
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-extrabold text-white text-base tracking-widest uppercase border-b-6 border-emerald-700 active:border-b-2 rounded-2xl py-3.5 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            id="btn-play-again"
          >
            <RefreshCw size={18} className="stroke-[2.5]" />
            PLAY AGAIN
          </motion.button>

          {/* View Leaderboard Button */}
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ y: 2 }}
            onClick={() => {
              playClickSound();
              onNavigate(GameStage.LEADERBOARD);
            }}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 font-extrabold text-white text-base tracking-widest uppercase border-b-6 border-amber-700 active:border-b-2 rounded-2xl py-3 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            id="btn-view-ranks"
          >
            <Trophy size={18} fill="#FFF" />
            LEADERBOARD
          </motion.button>

          {/* Home button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playClickSound();
              onNavigate(GameStage.START);
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-2xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors mt-1"
            id="btn-back-to-menu-gameover"
          >
            <Home size={14} className="stroke-[2.5]" />
            Return to Menu
          </motion.button>
        </div>
        </div> {/* End LEFT COLUMN */}

        {/* RIGHT COLUMN: EDUCATIONAL REVIEW OR DETAILED ANSWERS */}
        <div className="w-full flex flex-col gap-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center md:text-left mb-1">
            🎓 LEARNING ROOM & ANSWERS
          </div>

        {/* Summary lists of question details for Educational review */}
        {totalCount > 0 && (
          <div className="w-full z-10 mb-5">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                playClickSound();
                setShowReview(!showReview);
              }}
              className="w-full flex items-center justify-between px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-extrabold text-slate-200 shadow-sm cursor-pointer transition-colors"
              id="btn-toggle-quiz-review"
            >
              <span className="flex items-center gap-1.5 font-sans">
                <Eye size={14} className="stroke-[2.5]" />
                {showReview ? "HIDE ANSWERS" : "REVIEW QUESTIONS"}
              </span>
              <span className="text-[10px] font-bold bg-slate-950 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-800 font-mono">
                {totalCount} item{totalCount > 1 ? "s" : ""}
              </span>
            </motion.button>

            {showReview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 bg-slate-950 border border-slate-800 rounded-xl max-h-[150px] overflow-y-auto p-2 no-scrollbar"
                id="quiz-review-container"
              >
                <div className="flex flex-col gap-1.5">
                  {reviewQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs font-semibold ${
                        q.wasCorrect
                          ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300"
                          : "bg-red-950/20 border-red-900/40 text-red-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-mono">
                        {q.wasCorrect ? (
                          <CheckCircle size={14} className="text-emerald-400 fill-emerald-950/40" />
                        ) : (
                          <XCircle size={14} className="text-red-400 fill-red-950/40" />
                        )}
                        <span>{q.question}</span>
                      </div>
                      
                      <div className="font-sans font-bold">
                        {q.wasCorrect ? (
                          <span>{q.correctAnswer}</span>
                        ) : (
                          <span>
                            Set <span className="line-through text-red-400 font-normal">{q.playerAnswer === -999 ? "Time" : q.playerAnswer}</span> • Correct: {q.correctAnswer}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        </div> {/* End RIGHT COLUMN */}
        </div> {/* End Split Grid */}
      </motion.div>
    </div>
  );
};
