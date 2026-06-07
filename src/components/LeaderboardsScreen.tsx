/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Trophy, Search, Trash2, Calendar, Star } from "lucide-react";
import { GameStage, LeaderboardEntry } from "../types";
import { Avatar } from "./Avatars";
import { playClickSound } from "../utils/soundEffects";

interface LeaderboardsScreenProps {
  onNavigate: (stage: GameStage) => void;
}

// Seed mock leaderboard entries to fill the initial lists beautifully
const SEED_SCORES: LeaderboardEntry[] = [
  {
    id: "seed-1",
    name: "MR. SMART",
    score: 340,
    level: 6,
    operation: "Addition",
    characterId: "mr-smart",
    date: "Jun 1, 2026"
  },
  {
    id: "seed-2",
    name: "MS. SMARTY",
    score: 295,
    level: 5,
    operation: "All Mixed",
    characterId: "ms-smarty",
    date: "Jun 3, 2026"
  },
  {
    id: "seed-3",
    name: "ROBO-CALC",
    score: 245,
    level: 4,
    operation: "Multiplication",
    characterId: "robo-calc",
    date: "Jun 5, 2026"
  },
  {
    id: "seed-4",
    name: "PENCIL-BOT",
    score: 180,
    level: 3,
    operation: "Subtraction",
    characterId: "pencil-bot",
    date: "Jun 6, 2026"
  }
];

export const LeaderboardsScreen: React.FC<LeaderboardsScreenProps> = ({ onNavigate }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filterOp, setFilterOp] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const storageKey = "light-math-leaderboards";
    const existingRaw = localStorage.getItem(storageKey);
    let loadedEntries: LeaderboardEntry[] = [];

    if (existingRaw) {
      try {
        loadedEntries = JSON.parse(existingRaw);
      } catch (err) {
        loadedEntries = [];
      }
    }

    if (loadedEntries.length === 0) {
      // First-time fallback seed
      localStorage.setItem(storageKey, JSON.stringify(SEED_SCORES));
      setEntries(SEED_SCORES);
    } else {
      setEntries(loadedEntries);
    }
  }, []);

  const handleClearLeaderboards = () => {
    playClickSound();
    const storageKey = "light-math-leaderboards";
    localStorage.removeItem(storageKey);
    setEntries([]);
    setShowClearConfirm(false);
  };

  const getFilteredEntries = () => {
    return entries
      .filter((entry) => {
        if (filterOp !== "ALL" && entry.operation !== filterOp) return false;
        if (searchQuery.trim() !== "") {
          return entry.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      })
      .sort((a, b) => b.score - a.score);
  };

  const filtered = getFilteredEntries();

  // Highlight ranks with customized styling badges
  const renderRankBadge = (rankIdx: number) => {
    if (rankIdx === 0) {
      return (
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 border border-amber-600 flex items-center justify-center shadow-md shrink-0 select-none">
          <Trophy size={13} className="text-white fill-white stroke-[2.5]" />
        </div>
      );
    } else if (rankIdx === 1) {
      return (
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-slate-350 to-slate-400 border border-slate-500 flex items-center justify-center shadow-md shrink-0 select-none">
          <Trophy size={13} className="text-white fill-white stroke-[2.5]" />
        </div>
      );
    } else if (rankIdx === 2) {
      return (
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 border border-amber-800 flex items-center justify-center shadow-md shrink-0 select-none">
          <Trophy size={13} className="text-white fill-white stroke-[2.5]" />
        </div>
      );
    } else {
      return (
        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-350 text-xs font-black shrink-0 select-none">
          {rankIdx + 1}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full max-w-sm md:max-w-2xl lg:max-w-3xl mx-auto select-none">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-slate-800 shadow-2xl p-4 sm:p-6 md:p-8 relative flex flex-col items-center"
        id="leaderboards-card"
      >
        {/* Subtle holographic grid dots */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#6366f1_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>

        {/* 1. Header Title */}
        <div className="text-center mt-2 mb-4 z-10 w-full relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-950 p-1 rounded-full px-3 border border-indigo-500/50 shadow flex items-center gap-1">
            <Trophy size={14} className="text-indigo-400 fill-indigo-950/25" />
            <span className="text-[9px] font-black tracking-widest text-[#818cf8] uppercase">
              HALL OF FAME
            </span>
          </div>

          <h2 className="text-3xl font-black text-white tracking-wider uppercase font-sans mt-3">
            LEADERBOARD
          </h2>
          <div className="h-1 bg-slate-800 w-24 mx-auto rounded-full mt-1.5"></div>
        </div>

        {/* 2. Operations Filter tabs row */}
        <div className="w-full flex gap-1.5 overflow-x-auto py-1 z-10 mb-3 no-scrollbar scroll-smooth pr-1 shrink-0">
          {["ALL", "Addition", "Subtraction", "Multiplication", "Division", "All Mixed"].map((op) => {
            const isSelected = filterOp === op;
            return (
              <button
                key={op}
                onClick={() => {
                  playClickSound();
                  setFilterOp(op);
                }}
                className={`text-[9px] px-2.5 py-1.5 rounded-full border-2 font-black tracking-wider uppercase whitespace-nowrap scroll-mx-4 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                    : "bg-slate-950/40 text-slate-400 border-slate-800/80"
                }`}
              >
                {op === "All Mixed" ? "Mixed" : op}
              </button>
            );
          })}
        </div>

        {/* 3. Search Bar */}
        <div className="w-full mb-3.5 z-10 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search Player..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all tracking-wide"
            id="search-ranks-input"
          />
        </div>

        {/* 4. Scrollable Rankings List wrapper */}
        <div className="w-full h-64 bg-slate-950/50 border border-slate-800/85 rounded-2xl overflow-y-auto mb-5 z-10 p-2 pr-1 flex flex-col gap-2 shadow-inner no-scrollbar">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((entry, idx) => {
                return (
                  <motion.div
                    key={entry.id}
                    layoutId={entry.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center justify-between p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl shadow-sm transition-all relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3">
                      {/* Position Trophy badge */}
                      {renderRankBadge(idx)}

                      {/* Character avatar */}
                      <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                        <Avatar avatarKey={entry.characterId} className="w-7 h-7" animate={false} />
                      </div>

                      {/* Name segment */}
                      <div className="flex flex-col">
                        <span className="font-extrabold text-white text-xs uppercase leading-snug tracking-wide max-w-[110px] truncate">
                          {entry.name}
                        </span>
                        <span className="text-[8px] text-slate-500 font-semibold flex items-center gap-1">
                          <span>{entry.operation}</span>
                          <span>•</span>
                          <span>{entry.date}</span>
                        </span>
                      </div>
                    </div>

                    {/* Score segment */}
                    <div className="text-right shrink-0">
                      <span className="font-black text-cyan-400 text-sm leading-none block">
                        {entry.score}
                      </span>
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                        Level {entry.level}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col items-center justify-center text-center p-4"
              >
                <div className="w-10 h-10 bg-slate-900 text-indigo-450 border border-slate-800 rounded-full flex items-center justify-center mb-2">
                  <Star size={18} className="animate-spin text-indigo-400" />
                </div>
                <p className="text-xs font-bold text-slate-400">No records match Filters!</p>
                <p className="text-[10px] text-slate-650 mt-0.5">Solve questions to set initial ranks.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5. Navigation & Clear Records trigger */}
        <div className="w-full flex items-center justify-between gap-4 z-10 pt-2 border-t border-slate-800 relative">
          
          {/* Back button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              playClickSound();
              onNavigate(GameStage.START);
            }}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl border border-b-6 border-slate-700 active:border-b-2 hover:translate-y-[-1px] active:translate-y-1 hover:shadow shadow-sm flex items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label="Back to home"
            id="leaderboards-back-btn"
          >
            <ArrowLeft size={22} className="stroke-[3]" />
          </motion.button>

          {/* Trigger display confirmation panel for Wiping scores */}
          {entries.length > 0 && (
            <div className="relative flex-grow">
              {!showClearConfirm ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    playClickSound();
                    setShowClearConfirm(true);
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 font-extrabold text-white text-[11px] tracking-wider uppercase border-b-4 border-red-700 active:border-b-2 rounded-2xl py-3 shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  id="leaderboards-clear-trigger"
                >
                  <Trash2 size={13} fill="#FFF" />
                  Clear Ranks
                </motion.button>
              ) : (
                <div className="flex items-center justify-between gap-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-1.5 absolute -top-14 right-0 left-0 shadow-lg z-30">
                  <span className="text-[9px] font-black text-slate-400 uppercase px-1 leading-snug">
                    Confirm Wipe?
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleClearLeaderboards}
                      className="bg-red-500 hover:bg-red-600 text-white font-black text-[9px] px-2.5 py-1 rounded-lg shadow cursor-pointer uppercase transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        setShowClearConfirm(false);
                      }}
                      className="bg-slate-800 hover:bg-slate-705 text-slate-300 font-black text-[9px] px-2.5 py-1 rounded-lg shadow cursor-pointer uppercase transition-colors"
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
