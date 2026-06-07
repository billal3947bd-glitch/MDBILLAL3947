/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, ChevronLeft, ChevronRight, Play, Sparkles, User, ShoppingBag, Settings, Flame, Coins, Calendar, CheckCircle2, Target } from "lucide-react";
import { Avatar, CHARACTERS_LIST } from "./Avatars";
import { GameStage } from "../types";
import { CheeringMonkey } from "./CheeringMonkey";
import { getTranslation } from "../utils/translations";
import { playClickSound, playLevelUpSound } from "../utils/soundEffects";
import { DAILY_MISSIONS, checkAndResetDailyMissions, claimMissionReward } from "../utils/missions";

interface StartScreenProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  selectedCharId: string;
  setSelectedCharId: (id: string) => void;
  onNavigate: (stage: GameStage) => void;
  onOpenSettings: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  playerName,
  setPlayerName,
  selectedCharId,
  setSelectedCharId,
  onNavigate,
  onOpenSettings,
}) => {
  const [coins, setCoins] = useState(() => {
    return parseInt(localStorage.getItem("math_coins") || "100", 10);
  });

  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem("math_daily_streak") || "0", 10);
  });

  const [streakClaimedMessage, setStreakClaimedMessage] = useState<string | null>(null);

  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isWindowsOS, setIsWindowsOS] = useState(false);

  useEffect(() => {
    setIsMobileDevice(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.ontouchstart !== undefined || navigator.maxTouchPoints > 0)
    );
    setIsWindowsOS(navigator.userAgent.indexOf("Windows") !== -1);
  }, []);

  useEffect(() => {
    try {
      checkAndResetDailyMissions();
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      const lastPlayedStr = localStorage.getItem("math_last_played_date");
      const savedStreak = parseInt(localStorage.getItem("math_daily_streak") || "0", 10);
      
      const getYesterdayStr = () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };
      
      const yesterdayStr = getYesterdayStr();
      const currentCoins = parseInt(localStorage.getItem("math_coins") || "100", 10);
      
      if (!lastPlayedStr) {
        // First ever play! Start of Day 1
        const streakBonus = 25; // starting bonus
        const newCoins = currentCoins + streakBonus;
        
        localStorage.setItem("math_daily_streak", "1");
        localStorage.setItem("math_last_played_date", todayStr);
        localStorage.setItem("math_coins", newCoins.toString());
        
        setCoins(newCoins);
        setStreak(1);
        setStreakClaimedMessage(getTranslation("streakCelebration") + "Day 1! (+25 Math Coins)");
      } else if (lastPlayedStr === todayStr) {
        // Already loaded today
        setStreak(savedStreak || 1);
      } else if (lastPlayedStr === yesterdayStr) {
        // Consecutive gameplay continued! Increment streak!
        const nextStreak = savedStreak + 1;
        const streakBonus = 15 + Math.min(nextStreak * 5, 50);
        const newCoins = currentCoins + streakBonus;
        
        localStorage.setItem("math_daily_streak", nextStreak.toString());
        localStorage.setItem("math_last_played_date", todayStr);
        localStorage.setItem("math_coins", newCoins.toString());
        
        setCoins(newCoins);
        setStreak(nextStreak);
        setStreakClaimedMessage(`${getTranslation("streakCelebration")} Day ${nextStreak}! (+${streakBonus} Math Coins)`);
      } else {
        // Broke streak (last played older than yesterday). Reset.
        const streakBonus = 15;
        const newCoins = currentCoins + streakBonus;
        
        localStorage.setItem("math_daily_streak", "1");
        localStorage.setItem("math_last_played_date", todayStr);
        localStorage.setItem("math_coins", newCoins.toString());
        
        setCoins(newCoins);
        setStreak(1);
        setStreakClaimedMessage(getTranslation("streakCelebration") + "Day 1! (+15 Math Coins)");
      }
    } catch (e) {
      console.error("Error updating streak", e);
    }
  }, []);

  const [equippedFrame] = useState(() => {
    return localStorage.getItem("math_equipped_frame") || "";
  });

  const [missionsState, setMissionsState] = useState(() => {
    return DAILY_MISSIONS.map(m => {
      const progress = parseInt(localStorage.getItem(m.progressKey) || "0", 10);
      const claimed = localStorage.getItem(m.claimedKey) === "true";
      return { id: m.id, progress, claimed };
    });
  });

  const refreshMissions = () => {
    setMissionsState(
      DAILY_MISSIONS.map(m => {
        const progress = parseInt(localStorage.getItem(m.progressKey) || "0", 10);
        const claimed = localStorage.getItem(m.claimedKey) === "true";
        return { id: m.id, progress, claimed };
      })
    );
    setCoins(parseInt(localStorage.getItem("math_coins") || "100", 10));
  };

  const handleClaimReward = (id: number) => {
    const res = claimMissionReward(id);
    if (res.success) {
      playLevelUpSound();
      setStreakClaimedMessage(`🎉 Reward Claimed! +${res.reward} Coins.`);
      refreshMissions();
    }
  };

  const [charIndex, setCharIndex] = useState(
    CHARACTERS_LIST.findIndex((c) => c.id === selectedCharId) || 0
  );

  const activeChar = CHARACTERS_LIST[charIndex];

  const characterSkins: Record<string, { shadowColor: string; speed: number; focus: number; power: number }> = {
    "mr-smart": {
      shadowColor: "0 20px 50px -12px rgba(245, 158, 11, 0.35), 0 0 15px rgba(245, 158, 11, 0.15)",
      speed: 82,
      focus: 94,
      power: 88,
    },
    "ms-smarty": {
      shadowColor: "0 20px 50px -12px rgba(236, 72, 153, 0.35), 0 0 15px rgba(236, 72, 153, 0.15)",
      speed: 88,
      focus: 86,
      power: 92,
    },
    "robo-calc": {
      shadowColor: "0 20px 50px -12px rgba(20, 184, 166, 0.35), 0 0 15px rgba(20, 184, 166, 0.15)",
      speed: 96,
      focus: 90,
      power: 84,
    },
    "pencil-bot": {
      shadowColor: "0 20px 50px -12px rgba(234, 179, 8, 0.35), 0 0 15px rgba(234, 179, 8, 0.15)",
      speed: 84,
      focus: 96,
      power: 90,
    }
  };

  const skin = characterSkins[activeChar.id] || {
    shadowColor: "0 20px 50px -12px rgba(99, 102, 241, 0.3)",
    speed: 80,
    focus: 80,
    power: 80,
  };

  const handlePrevChar = () => {
    const nextIndex = charIndex === 0 ? CHARACTERS_LIST.length - 1 : charIndex - 1;
    setCharIndex(nextIndex);
    setSelectedCharId(CHARACTERS_LIST[nextIndex].id);
    setPlayerName(CHARACTERS_LIST[nextIndex].name);
  };

  const handleNextChar = () => {
    const nextIndex = charIndex === CHARACTERS_LIST.length - 1 ? 0 : charIndex + 1;
    setCharIndex(nextIndex);
    setSelectedCharId(CHARACTERS_LIST[nextIndex].id);
    setPlayerName(CHARACTERS_LIST[nextIndex].name);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full max-w-sm md:max-w-4xl lg:max-w-5xl mx-auto">
      {/* Light Math Start Card - Bento style */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ boxShadow: skin.shadowColor }}
        className="w-full bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-slate-800 p-4 sm:p-6 md:p-8 relative flex flex-col select-none"
        id="start-screen-card"
      >
        {/* Subtle holographic cyan/indigo grid dots */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#6366f1_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>

        {/* Floating Settings button at the top left */}
        <button
          onClick={() => {
            playClickSound();
            onOpenSettings();
          }}
          className="absolute top-4 left-4 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 p-1.5 rounded-full text-slate-400 hover:text-white transition-all shadow-sm z-20 cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95 group"
          title="Settings / ভাষা"
          id="start-screen-settings-btn"
        >
          <Settings size={14} className="group-hover:rotate-45 transition-transform duration-300" />
        </button>

        {/* Floating Coin counter at the top right */}
        <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm z-20">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
          <span className="text-[10px] font-black text-amber-400 font-mono">{coins} cr</span>
        </div>

        {/* Brand / Logo Title with Animated Custom Icon */}
        <div className="text-center mt-4 mb-2 z-10 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.15 }}
            className="mb-4 w-24 h-24 rounded-3xl overflow-hidden border-2 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.45)] relative flex items-center justify-center bg-slate-950"
          >
            <img
              src="/src/assets/images/light_math_icon_1780819415933.png"
              alt="Light Math Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
            {/* Holographic scanning overlay */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-cyan-400 opacity-60 animate-bounce pointer-events-none" style={{ animationDuration: "3s" }} />
          </motion.div>
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="text-4xl md:text-5xl font-black tracking-wider text-white drop-shadow-[0_2px_10px_rgba(99,102,241,0.3)] font-sans flex flex-col uppercase"
            id="game-logo-text"
          >
            <span className="text-xl md:text-2xl font-bold text-cyan-400 tracking-widest mb-[-6px]">
              LIGHT
            </span>
            <span>MATH</span>
          </motion.h1>
          <p className="text-xs font-semibold text-slate-400 tracking-wide mt-1">
            {getTranslation("tagline")}
          </p>
        </div>

        {/* Dynamic Responsiveness Split Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start z-10 mt-2">
          
          {/* LEFT COLUMN: HERO AVATAR VIEWER & STATS BOARD */}
          <div className="flex flex-col items-center justify-center w-full bg-slate-950/30 border border-slate-800/40 p-4 md:p-6 rounded-[2rem] shadow-inner relative">
            {/* Animated Cheering Monkey "Chiku" */}
            <CheeringMonkey stage="idle" />

        {/* Character Card Viewer */}
        <div className="w-full flex flex-col items-center justify-center my-6 z-10 relative">
          <div className="flex items-center justify-between w-full px-2">
            {/* Left Prev Arrow Button */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevChar}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full border border-slate-700 hover:border-indigo-500 shadow-lg cursor-pointer transition-colors"
              aria-label="Previous character"
              id="btn-prev-character"
            >
              <ChevronLeft size={24} />
            </motion.button>

            {/* Avatar display frame */}
            <div className={`p-4 rounded-full border-4 ${activeChar.id === 'mr-smart' ? 'bg-amber-500/10 border-amber-500/40' : activeChar.id === 'ms-smarty' ? 'bg-pink-500/10 border-pink-500/40' : activeChar.id === 'robo-calc' ? 'bg-teal-500/10 border-teal-500/40' : 'bg-yellow-500/10 border-yellow-500/40'} relative shadow-inner w-32 h-32 flex items-center justify-center`}>
              {/* Equipped Background glow tints */}
              {activeChar.id === selectedCharId && equippedFrame === "glow_cyan" && (
                <div className="absolute inset-0 rounded-full border-4 border-cyan-400 blur-sm animate-pulse z-0 pointer-events-none" />
              )}
              {activeChar.id === selectedCharId && equippedFrame === "neon_violet" && (
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-pink-500 z-0 pointer-events-none animate-spin" style={{ animationDuration: "12s" }} />
              )}

              <div className="relative z-10 w-28 h-28 flex items-center justify-center">
                <Avatar avatarKey={activeChar.avatarKey} className="w-24 h-24" />
              </div>
              
              {/* Float Grand Crown above if selected character and crown equipped */}
              {activeChar.id === selectedCharId && equippedFrame === "crown_gold" ? (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-25 pointer-events-none">
                  <span className="text-4xl drop-shadow-[0_2px_10px_rgba(245,158,11,0.8)] animate-bounce inline-block">👑</span>
                </div>
              ) : (
                <div className="absolute -top-1 -right-1 bg-amber-500 border border-amber-600 rounded-full p-1 shadow-md animate-bounce z-20">
                  <Sparkles size={14} className="text-white" />
                </div>
              )}
            </div>

            {/* Right Next Arrow Button */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNextChar}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full border border-slate-700 hover:border-indigo-500 shadow-lg cursor-pointer transition-colors"
              aria-label="Next character"
              id="btn-next-character"
            >
              <ChevronRight size={24} />
            </motion.button>
          </div>

          {/* Character Label Container */}
          <div className="mt-4 px-6 py-1.5 bg-slate-800/80 border border-slate-700 rounded-full text-center min-w-[150px] shadow-md">
            <span className="font-extrabold text-sm tracking-widest text-[#f8fafc]">
              {activeChar.name}
            </span>
          </div>

          <p className="text-xs text-center text-slate-400 italic mt-2 px-6 h-8 flex items-center justify-center mb-1">
            {activeChar.description}
          </p>

          {/* Custom stats board */}
          <div className="w-full mt-2.5 px-5 py-3 bg-slate-950/60 border border-slate-800/60 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span>Power Stats</span>
              <span className={`text-[9px] font-extrabold ${activeChar.id === 'mr-smart' ? 'text-amber-400' : activeChar.id === 'ms-smarty' ? 'text-pink-400' : activeChar.id === 'robo-calc' ? 'text-teal-400' : 'text-yellow-400'}`}>Active</span>
            </div>
            
            <div className="flex flex-col gap-1.5">
              {/* Stat 1: Speed */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-400 w-12 text-left tracking-wider uppercase">CALC SPEED</span>
                <div className="flex-grow h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40 relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    animate={{ width: `${skin.speed}%` }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                  />
                </div>
                <span className="text-[9px] font-black text-white w-6 text-right shrink-0">{skin.speed}%</span>
              </div>
              
              {/* Stat 2: Accuracy Focus */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-400 w-12 text-left tracking-wider uppercase">FOCUS</span>
                <div className="flex-grow h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40 relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    animate={{ width: `${skin.focus}%` }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                  />
                </div>
                <span className="text-[9px] font-black text-white w-6 text-right shrink-0">{skin.focus}%</span>
              </div>
              
              {/* Stat 3: Streak Power */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-400 w-12 text-left tracking-wider uppercase">STREAK</span>
                <div className="flex-grow h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40 relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    animate={{ width: `${skin.power}%` }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                  />
                </div>
                <span className="text-[9px] font-black text-white w-6 text-right shrink-0">{skin.power}%</span>
              </div>
            </div>
          </div>
          </div> {/* End LEFT COLUMN */}

          {/* RIGHT COLUMN: ACTIONS, DAILY STREAKS & DAILY MISSIONS */}
          <div className="flex flex-col items-stretch gap-4 w-full">

          {/* Daily Streak Tracker bento widget */}
          <div className="w-full mt-3 px-4 py-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex flex-col gap-2 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 blur-md rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <Flame size={12} className="text-orange-500 fill-orange-500 animate-pulse" />
                <span>{getTranslation("streakTitle")}</span>
              </span>
              <span className="text-[9px] font-bold bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                {streak} {getTranslation("streakDay").replace("{n}", "")}
              </span>
            </div>

            {/* Horizontal timeline of 5 days */}
            <div className="flex items-center justify-between px-1.5 py-2 relative">
              {/* Connecting line behind bubbles */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800/60 rounded-full z-0 pointer-events-none" />
              
              {[1, 2, 3, 4, 5].map((dayIdx) => {
                const isActive = streak >= dayIdx;
                const isCurrent = streak === dayIdx;
                
                return (
                  <div key={dayIdx} className="flex flex-col items-center gap-1 z-10 relative animate-fade-in">
                    <motion.div
                      animate={isCurrent ? { scale: [1, 1.15, 1], rotate: [0, 4, -4, 0] } : {}}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all cursor-default ${
                        isActive 
                          ? "bg-gradient-to-b from-amber-400 to-orange-500 border-amber-300 text-slate-900 shadow-[0_0_8px_rgba(245,158,11,0.35)] animate-pulse"
                          : "bg-slate-900 border-slate-850 text-slate-500"
                      }`}
                    >
                      {isActive ? (
                        <span className="text-[10px] font-black">⭐</span>
                      ) : (
                        <span className="text-[9px] font-black font-mono">{dayIdx}</span>
                      )}
                    </motion.div>
                    <span className={`text-[8px] font-bold tracking-wider uppercase ${
                      isCurrent ? "text-amber-450 font-extrabold" : isActive ? "text-slate-300" : "text-slate-600"
                    }`}>
                      {getTranslation("streakDay").replace("{n}", String(dayIdx))}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <p className="text-[9px] text-slate-500 text-center leading-normal italic">
              Play daily to boost math multipliers & earn bonus coin crates!
            </p>
          </div>

          {/* Daily Missions bento widget */}
          <div className="w-full mt-3 px-4 py-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex flex-col gap-3 shadow-inner relative overflow-hidden" id="daily-missions-section">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 blur-md rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                <Target size={12} className="text-indigo-400" />
                <span>{getTranslation("dailyMissions")}</span>
              </span>
              <span className="text-[8px] font-bold bg-indigo-950/60 border border-indigo-900/40 text-indigo-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                TODAY
              </span>
            </div>

            {/* List of 4 missions */}
            <div className="flex flex-col gap-2.5">
              {DAILY_MISSIONS.map((m) => {
                const state = missionsState.find(s => s.id === m.id) || { progress: 0, claimed: false };
                const isCompleted = state.progress >= m.target;
                const isClaimed = state.claimed;
                
                // Calculate display progress percentage
                const progressPercent = Math.min(100, (state.progress / m.target) * 100);

                return (
                  <div key={m.id} className="bg-slate-900/60 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between gap-3 relative overflow-hidden">
                    <div className="flex-grow min-w-0 flex flex-col gap-1">
                      {/* Name of mission and Reward coins */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black text-slate-200 leading-snug">
                          {getTranslation(m.translationKey)}
                        </span>
                        <div className="inline-flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md text-[8px] font-black text-amber-400 font-mono">
                          <Coins size={8} />
                          <span>+{m.reward}</span>
                        </div>
                      </div>

                      {/* Progress slider tracking bar */}
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-grow h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/20 relative">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-cyan-500'}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[8px] font-mono font-black text-slate-400 min-w-[28px] text-right">
                          {Math.min(state.progress, m.target)}/{m.target}
                        </span>
                      </div>
                    </div>

                    {/* Claim / Status Action Button */}
                    <div className="shrink-0">
                      {isClaimed ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-950/20 border border-teal-900/30 text-teal-400 text-[8px] font-black uppercase tracking-wider">
                          <CheckCircle2 size={10} className="stroke-[3]" />
                          <span>{getTranslation("missionClaimed")}</span>
                        </div>
                      ) : isCompleted ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleClaimReward(m.id)}
                          className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-[9px] font-black rounded-lg shadow-md uppercase tracking-wider cursor-pointer border border-amber-300 flex items-center gap-0.5 animate-pulse"
                        >
                          <span>{getTranslation("missionClaim")}</span>
                        </motion.button>
                      ) : (
                        <div className="px-2 py-0.5 rounded-lg bg-slate-950/50 border border-slate-850 text-slate-500 text-[8px] font-bold uppercase tracking-wider">
                          <span>{Math.round(progressPercent)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Player Name Edit Form */}
        <div className="w-full px-4 mb-4 z-10">
          <label className="block text-xs font-bold text-slate-400 tracking-wide mb-1 uppercase text-center">
            {getTranslation("placeholderEnterName")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <User size={16} />
            </div>
            <input
              type="text"
              maxLength={15}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value || "PLAYER 1")}
              className="w-full bg-slate-950/80 border-2 border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-3 text-sm font-extrabold text-white focus:outline-none transition-all text-center tracking-wider placeholder-slate-600"
              placeholder={getTranslation("placeholderEnterName")}
              id="input-player-name"
            />
          </div>
        </div>

        {/* Action Button Grid */}
        <div className="w-full flex flex-col gap-2.5 z-10 px-2 mt-1">
          {/* New Game Button - Styled like a sleek 3D neon button */}
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ y: 2 }}
            onClick={() => {
              playClickSound();
              onNavigate(GameStage.OPERATION_SELECT);
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-extrabold text-white text-base tracking-widest uppercase border-b-6 border-emerald-700 active:border-b-2 rounded-2xl py-3 shadow-[0_4px_14px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer"
            id="btn-new-game"
          >
            <Play size={18} fill="#FFF" />
            {getTranslation("newGame")}
          </motion.button>

          {/* Math Store Button - Purple/fuchsia cyber gradient */}
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ y: 2 }}
            onClick={() => {
              playClickSound();
              onNavigate(GameStage.STORE);
            }}
            className="w-full bg-gradient-to-r from-[#818cf8] to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 font-extrabold text-white text-sm tracking-widest uppercase border-b-6 border-indigo-700 active:border-b-2 rounded-2xl py-2.5 shadow-[0_4px_14px_rgba(99,102,241,0.25)] flex items-center justify-center gap-2 transition-all cursor-pointer"
            id="btn-math-store"
          >
            <ShoppingBag size={15} className="fill-white/10" />
            {getTranslation("store")}
          </motion.button>

          {/* Leaderboards Button - Styled like a golden 3D button */}
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ y: 2 }}
            onClick={() => {
              playClickSound();
              onNavigate(GameStage.LEADERBOARD);
            }}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 font-extrabold text-white text-sm tracking-widest uppercase border-b-6 border-amber-700 active:border-b-2 rounded-2xl py-2.5 shadow-[0_4px_14px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 transition-all cursor-pointer"
            id="btn-leaderboards"
          >
            <Trophy size={15} fill="#FFF" />
            {getTranslation("leaderboard")}
          </motion.button>

          {/* Settings Command Panel - Sleek direct access trigger layout */}
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ y: 2 }}
            onClick={() => {
              playClickSound();
              onOpenSettings();
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 font-extrabold text-white text-xs tracking-widest uppercase border-b-6 border-slate-900 active:border-b-2 rounded-2xl py-2.5 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            id="btn-start-settings"
          >
            <Settings size={13} />
            {getTranslation("settings")}
          </motion.button>
        </div>
        </div> {/* End RIGHT COLUMN */}
        </div> {/* End Split Grid */}

        {/* Graphic Footer credits & Device Status Badge */}
        <div className="mt-6 flex flex-col items-center gap-1.5 select-none text-center">
          <div className="text-[10px] font-bold text-slate-600 tracking-widest uppercase">
            E.X. UI • MATH ENGINE
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-wider bg-slate-950/65 border border-slate-800/80 uppercase">
            {isWindowsOS ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-cyan-400">Windows System Active</span>
                <span className="text-slate-500">• keys 1-4 shortcuts active</span>
              </>
            ) : isMobileDevice ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400">Mobile System Active</span>
                <span className="text-slate-500">• Touch Optimized view</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-indigo-400">Responsive Web Engaged</span>
                <span className="text-slate-500">• AUTO SCALING READY</span>
              </>
            )}
          </div>
        </div>

        {/* Animated Custom Celebratory Streak Reward Claim Overlay */}
        <AnimatePresence>
          {streakClaimedMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-x-4 bottom-24 bg-slate-950 border-2 border-amber-500 rounded-[2rem] p-5 shadow-2xl flex flex-col items-center text-center backdrop-blur-md z-45"
              id="streak-toast-card"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center text-2xl mb-3 animate-bounce">
                🍌
              </div>
              
              <h4 className="text-[11px] font-black tracking-widest text-[#f59e0b] uppercase mb-1">
                Streak Bonus Claimed!
              </h4>
              <p className="text-[10px] font-black text-slate-200 leading-snug tracking-wider mb-4 px-2 uppercase">
                {streakClaimedMessage}
              </p>
              
              <button
                onClick={() => {
                  playClickSound();
                  setStreakClaimedMessage(null);
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[10px] py-1.5 px-4 tracking-wider uppercase rounded-xl shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
              >
                YAY! awesome
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
