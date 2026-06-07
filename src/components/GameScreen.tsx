/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Pause, Play, Volume2, VolumeX, X, Check, Award, RefreshCw, LogOut, Coins, Gift } from "lucide-react";
import { GameStage, OperationType, Question } from "../types";
import { generateQuestion } from "../utils/mathGenerator";
import { CheeringMonkey } from "./CheeringMonkey";
import { getTranslation } from "../utils/translations";
import {
  playClickSound,
  playCorrectSound,
  playWrongSound,
  playLevelUpSound,
  playGameOverSound,
  getMuteState,
  setMuteState,
} from "../utils/soundEffects";

interface GameScreenProps {
  playerName: string;
  selectedOperation: OperationType;
  selectedCharId: string;
  onFinishGame: (finalScore: number, finalLevel: number, reviewQuestions: any[]) => void;
  onNavigate: (stage: GameStage) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  playerName,
  selectedOperation,
  selectedCharId,
  onFinishGame,
  onNavigate,
}) => {
  // Check equipped store boosters
  const boosterKey = localStorage.getItem("math_equipped_booster") || "";
  const hasShield = boosterKey === "shield_life";
  const hasClock = boosterKey === "clock_time";

  const BASE_TIME = hasClock ? 18 : 15;
  const INITIAL_LIVES = hasShield ? 4 : 3;

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [questionsSolved, setQuestionsSolved] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(getMuteState());

  // Streak/Combo metrics
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  // Level Up and coins states
  const [showLevelUpToast, setShowLevelUpToast] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftOpened, setGiftOpened] = useState(false);
  const [currentJoke, setCurrentJoke] = useState({ joke: "", giftName: "" });
  const [showBoosterBanner, setShowBoosterBanner] = useState(false);

  // AI Explanatory Tutor States
  const [aiExplainText, setAiExplainText] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [userCoins, setUserCoins] = useState(() => {
    return parseInt(localStorage.getItem("math_coins") || "100", 10);
  });

  const MATH_JOKES = [
    { joke: "Why was the math book sad? It had too many problems!", giftName: "Sad Math Book's Compassion" },
    { joke: "Why did the student do multiplication on the floor? The teacher told them not to use tables!", giftName: "Anti-Tables Badge" },
    { joke: "What do you call a number that can't stay still? A roamin' numeral!", giftName: "Roamin' Numeral Token" },
    { joke: "What did the triangle say to the circle? You're pointless!", giftName: "Pointless Circle Medal" },
    { joke: "Are monsters good at math? Not unless you Count Dracula!", giftName: "Count Dracula's Ledger" }
  ];

  // Consume booster once on mount/start
  useEffect(() => {
    if (hasShield || hasClock) {
      setShowBoosterBanner(true);
      localStorage.removeItem("math_equipped_booster");
      setTimeout(() => setShowBoosterBanner(false), 3000);
    }
  }, [hasShield, hasClock]);

  const awardCoins = (amount: number) => {
    const currentCoins = parseInt(localStorage.getItem("math_coins") || "100", 10);
    const nextCoins = currentCoins + amount;
    localStorage.setItem("math_coins", nextCoins.toString());
    setUserCoins(nextCoins);
  };

  const handleFetchAiHint = async () => {
    const currentCoins = parseInt(localStorage.getItem("math_coins") || "100", 10);
    if (currentCoins < 25) {
      alert(getTranslation("aiNotEnoughCoins"));
      return;
    }

    if (!currentQuestion) return;

    // Deduct 25 coins
    const nextCoins = currentCoins - 25;
    localStorage.setItem("math_coins", nextCoins.toString());
    setUserCoins(nextCoins);
    playClickSound();

    setIsLoadingAi(true);
    setAiExplainText("");
    setShowAiModal(true);

    try {
      const activeLang = localStorage.getItem("math_game_language") || "en";
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          num1: currentQuestion.num1,
          num2: currentQuestion.num2,
          op: selectedOperation,
          text: currentQuestion.text,
          lang: activeLang,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAiExplainText(data.explanation);
      } else {
        setAiExplainText(getTranslation("aiHintError"));
      }
    } catch (e) {
      console.error("AI hint error:", e);
      setAiExplainText(getTranslation("aiHintError"));
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Prep countdown and visual effects states
  const [startCountdown, setStartCountdown] = useState<number | string | null>(3);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; color: string; scale: number }>>([]);

  useEffect(() => {
    if (startCountdown === null) return;
    const interval = setInterval(() => {
      setStartCountdown((prev) => {
        if (prev === 3) return 2;
        if (prev === 2) return 1;
        if (prev === 1) return "GO!";
        clearInterval(interval);
        return null;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [startCountdown]);

  const triggerSparkles = () => {
    const colors = ["#22d3ee", "#818cf8", "#34d399", "#f43f5e", "#fbbf24"];
    const newSparkles = Array.from({ length: 18 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 280,
      y: (Math.random() - 0.5) * 185,
      color: colors[Math.floor(Math.random() * colors.length)],
      scale: Math.random() * 0.9 + 0.5,
    }));
    setSparkles(newSparkles);
    setTimeout(() => {
      setSparkles([]);
    }, 1000);
  };

  // Remaining time per question (in seconds)
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Store history for final review card
  const resultsHistoryRef = useRef<Array<{
    question: string;
    correctAnswer: number;
    playerAnswer: number;
    wasCorrect: boolean;
  }>>([]);

  const isAnsweringBlocked = selectedAnswer !== null;

  const [isWindowsOS, setIsWindowsOS] = useState(false);

  useEffect(() => {
    setIsWindowsOS(navigator.userAgent.indexOf("Windows") !== -1);
  }, []);

  // Initialize first question
  useEffect(() => {
    const q = generateQuestion(selectedOperation, 1);
    setCurrentQuestion(q);
    setTimeLeft(BASE_TIME);
    resultsHistoryRef.current = [];
  }, [selectedOperation, BASE_TIME]);

  // Handle countdown timer
  useEffect(() => {
    if (isPaused || isAnsweringBlocked || !currentQuestion || startCountdown !== null || showGiftModal) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer naturally ran out - handles as incorrect response
          handleTimeOut();
          return BASE_TIME;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isAnsweringBlocked, currentQuestion, startCountdown, showGiftModal, BASE_TIME]);

  const handleTimeOut = () => {
    if (!currentQuestion) return;
    playWrongSound();
    setIsCorrect(false);
    setSelectedAnswer(-999); // dummy non-existent answer
    setCombo(0);
    setLives((prev) => {
      const nextLives = prev - 1;
      if (nextLives <= 0) {
        triggerGameOver(score, level);
      }
      return nextLives;
    });

    resultsHistoryRef.current.push({
      question: currentQuestion.text,
      correctAnswer: currentQuestion.answer,
      playerAnswer: -999, // timed out
      wasCorrect: false,
    });

    // Advance after delay
    setTimeout(() => {
      loadNextQuestion();
    }, 1200);
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setMuteState(nextMuted);
    playClickSound();
  };

  const handleAnswerClick = (option: number) => {
    if (isAnsweringBlocked || isPaused || !currentQuestion) return;

    setSelectedAnswer(option);
    const wasAnswerCorrect = option === currentQuestion.answer;
    setIsCorrect(wasAnswerCorrect);

    if (wasAnswerCorrect) {
      playCorrectSound();
      triggerSparkles();
      
      // Award 1 coin for a standard correct answer
      awardCoins(1);
      
      // Calculate score points (10 scaling with combo + time incentive)
      const comboBonus = Math.floor(combo / 3) * 5;
      const speedBonus = Math.max(1, Math.floor(timeLeft / 2));
      const pointsWon = 10 + comboBonus + speedBonus;
      
      setScore((prev) => prev + pointsWon);
      setCombo((prev) => {
        const nextCombo = prev + 1;
        if (nextCombo > maxCombo) setMaxCombo(nextCombo);
        return nextCombo;
      });

      // Update question counts & compute Level Increase
      setQuestionsSolved((prev) => {
        const nextSolved = prev + 1;
        // Level up every 5 solved questions
        if (nextSolved > 0 && nextSolved % 5 === 0) {
          setLevel((l) => {
            const nextL = l + 1;
            playLevelUpSound();
            
            // Level Up Coins bonus (+10)
            awardCoins(10);
            
            // Check for Milestone Surprise Gifts every 10 levels (Level 10, 20, 30...)
            if (nextL % 10 === 0) {
              const selectedJoke = MATH_JOKES[Math.floor(Math.random() * MATH_JOKES.length)];
              setCurrentJoke(selectedJoke);
              setShowGiftModal(true);
              setGiftOpened(false);
            } else {
              setShowLevelUpToast(true);
              setTimeout(() => {
                setShowLevelUpToast(false);
              }, 2000);
            }
            
            return nextL;
          });
        }
        return nextSolved;
      });

      resultsHistoryRef.current.push({
        question: currentQuestion.text,
        correctAnswer: currentQuestion.answer,
        playerAnswer: option,
        wasCorrect: true,
      });

    } else {
      playWrongSound();
      setCombo(0);
      setLives((prev) => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          triggerGameOver(score, level);
        }
        return nextLives;
      });

      resultsHistoryRef.current.push({
        question: currentQuestion.text,
        correctAnswer: currentQuestion.answer,
        playerAnswer: option,
        wasCorrect: false,
      });
    }

    // Delay before pulling next question
    setTimeout(() => {
      loadNextQuestion();
    }, 1000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnsweringBlocked || isPaused || !currentQuestion || startCountdown !== null || showGiftModal || showAiModal) return;
      if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (currentQuestion.options && currentQuestion.options[idx] !== undefined) {
          handleAnswerClick(currentQuestion.options[idx]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAnsweringBlocked, isPaused, currentQuestion, startCountdown, showGiftModal, showAiModal, handleAnswerClick]);

  const loadNextQuestion = () => {
    if (lives <= 0) return; // safety stop
    setSelectedAnswer(null);
    setIsCorrect(null);
    setTimeLeft(BASE_TIME);
    setCurrentQuestion(generateQuestion(selectedOperation, level));
  };

  const triggerGameOver = (finalScore: number, finalLevel: number) => {
    playGameOverSound();
    setTimeout(() => {
      onFinishGame(finalScore, finalLevel, resultsHistoryRef.current);
    }, 600);
  };

  return (
    <div className="flex flex-col items-center justify-center p-1.5 sm:p-4 w-full max-w-sm md:max-w-4xl lg:max-w-5xl mx-auto relative select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="w-full bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-slate-800 shadow-2xl p-3.5 sm:p-5 md:p-8 relative overflow-hidden"
        id="game-board-card"
      >
        {/* Subtle holographic cyan/indigo grid dots */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#6366f1_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>

        {/* Playful Countdown Prep Screen Overlay */}
        <AnimatePresence>
          {startCountdown !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/98 backdrop-blur-xl z-50 rounded-[2rem] flex flex-col items-center justify-center p-6 text-center select-none"
              id="game-countdown-overlay"
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#6366f1_2px,transparent_2px)] [background-size:24px_24px]"></div>
              
              <motion.div
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: [0.5, 1.25, 1], opacity: 1 }}
                exit={{ scale: 1.6, opacity: 0 }}
                key={startCountdown}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center gap-4"
              >
                <div className="text-[10px] font-black tracking-widest text-[#818cf8] bg-indigo-950/40 border border-indigo-800/40 px-3 py-1 rounded-full shadow-md uppercase">
                  Get Ready, Player!
                </div>
                
                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-200 to-cyan-400 drop-shadow-[0_10px_35px_rgba(99,102,241,0.5)] tracking-tight uppercase">
                  {startCountdown}
                </h1>
                
                <p className="text-xs font-semibold text-slate-500 max-w-[200px] leading-relaxed">
                  Solve the equations fast to rank up!
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Booster Active Banner */}
        <AnimatePresence>
          {showBoosterBanner && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-950 border border-teal-500/50 rounded-full px-4 py-1.5 shadow-md flex items-center gap-1.5 z-40 whitespace-nowrap"
            >
              <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-ping" />
              <span className="text-[10px] font-black text-white uppercase tracking-wider">
                {hasShield ? "🛡️ Life Shield Equipped (+1 Life)" : "⏱️ Chronos Fluid (+3s Extra Time)"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Standard Level Up Toast pop */}
        <AnimatePresence>
          {showLevelUpToast && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.6, opacity: 0, y: -30 }}
              className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-indigo-600 border border-indigo-400 rounded-3xl p-5 shadow-2xl flex flex-col items-center justify-center gap-2 z-40 text-center select-none w-[200px]"
            >
              <Award className="text-amber-355 animate-bounce" size={40} />
              <h4 className="text-lg font-black text-white uppercase tracking-wider">LEVEL UP!</h4>
              <span className="text-2xl font-black text-amber-300">Level {level}</span>
              <div className="flex items-center gap-1 bg-slate-950/40 px-2.5 py-1 rounded-full border border-indigo-455/40 mt-1">
                <Coins size={12} className="text-amber-400" />
                <span className="text-[10px] font-black text-white">+10 COINS!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 10-level Milestone Surprise Gift Box Overlay */}
        <AnimatePresence>
          {showGiftModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/98 backdrop-blur-xl z-50 rounded-[2rem] flex flex-col items-center justify-center p-6 text-center select-none"
              id="gift-chest-overlay"
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d97706_2px,transparent_2px)] [background-size:24px_24px]"></div>
              
              {!giftOpened ? (
                <motion.div 
                   initial={{ scale: 0.5 }}
                   animate={{ scale: 1 }}
                   exit={{ scale: 0.5 }}
                   className="flex flex-col items-center gap-4"
                >
                  <div className="text-[10px] font-black tracking-widest text-amber-400 bg-amber-950/40 border border-amber-800/40 px-4 py-1.5 rounded-full shadow-md uppercase">
                    Level {level} Milestone!
                  </div>
                  
                  <h2 className="text-3xl font-black text-white tracking-wider uppercase font-sans mt-2 leading-none">
                    🎁 SURPRISE CHEST 🎁
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 max-w-[240px] leading-relaxed">
                    You have unlocked a delightful reward chest! Click the box to unlock its funny contents!
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, -3, 3, -3, 3, 0] }}
                    animate={{ rotate: [0, -2, 2, -2, 2, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    onClick={() => {
                      playLevelUpSound();
                      awardCoins(50);
                      setGiftOpened(true);
                    }}
                    className="w-36 h-36 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-3xl border-4 border-amber-600 shadow-[0_0_35px_rgba(245,158,11,0.5)] flex items-center justify-center cursor-pointer relative"
                  >
                    <span className="text-6xl animate-pulse">🎁</span>
                    <div className="absolute -bottom-2 bg-slate-950 px-3 py-1 rounded-full border border-amber-500 text-[10px] font-black tracking-wider text-amber-400 uppercase shadow-md">
                      TAP TO OPEN
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 80 }}
                  className="flex flex-col items-center gap-5 p-4"
                >
                  <Award className="text-amber-400 animate-spin" size={44} style={{ animationDuration: "8s" }} />
                  
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-2xl font-black text-white uppercase tracking-wider leading-none">
                      CHEST UNLOCKED!
                    </h3>
                    <span className="text-[9px] font-black text-amber-400 tracking-wider uppercase">
                      Awarded: {currentJoke.giftName}
                    </span>
                  </div>

                  {/* Joke Box */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-inner max-w-[260px] relative">
                    <p className="text-xs font-semibold text-slate-200 leading-relaxed italic">
                      "{currentJoke.joke}"
                    </p>
                  </div>

                  {/* Grand prize award! */}
                  <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 px-5 py-2 rounded-full shadow-[inset_0_1px_3px_rgba(245,158,11,0.1)] relative">
                    <Coins size={18} className="text-amber-400 animate-pulse" />
                    <span className="text-sm font-black font-mono text-white">+50 CHEST COINS!</span>
                  </div>

                  {/* Dismiss back to play */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      playClickSound();
                      setShowGiftModal(false);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-widest border border-amber-600 rounded-2xl cursor-pointer shadow-lg mt-2"
                  >
                    CONTINUE GAME
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Split Grid Columns */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch z-10 relative">
          
          {/* LEFT COLUMN: CHARACTER CHEERING DESK & MAIN PLAYER SCORE CARD */}
          <div className="flex flex-col justify-between w-full bg-slate-950/30 border border-slate-800/40 p-4 rounded-[2rem] shadow-inner relative gap-4">
            
            <div className="flex flex-col items-center justify-center w-full relative">
              <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase mb-1">COMPANION BUZZ</span>
              {/* Animated Chiku Cheering Monkey */}
              <CheeringMonkey
                stage={showLevelUpToast || showGiftModal ? "level_up" : "playing"}
                feedbackState={isCorrect === true ? "correct" : isCorrect === false ? "wrong" : "none"}
                currentLevel={level}
              />
            </div>

            {/* HEART LIVES AND SCORE ROW CONTAINER */}
            <div className="w-full flex flex-col gap-3.5 bg-slate-900/60 p-4 border border-slate-800 rounded-2xl">
              
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HEALTH & COINS</span>
                {/* Coins in-game counter */}
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-amber-400 font-mono text-[9px] font-black shadow-sm">
                  <Coins size={10} className="text-amber-400 animate-pulse" />
                  <span>{userCoins} cr</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                {/* Hearts container */}
                <div className="flex items-center gap-1.5 bg-slate-950/40 px-3 py-2 rounded-2xl border border-slate-800/80 shadow-sm shrink-0">
                  {[1, 2, 3].map((val) => {
                    const active = lives >= val;
                    return (
                      <motion.div
                        key={val}
                        animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Heart
                          size={22}
                          className={`${
                            active ? "text-[#f0625f] fill-[#f0625f]" : "text-slate-700 fill-slate-850"
                          } drop-shadow-sm`}
                        />
                      </motion.div>
                    );
                  })}
                </div>

                {/* Current Score display module matching image theme */}
                <div className="flex-grow flex flex-col items-center justify-center text-center bg-slate-950/40 border border-slate-800 px-4 py-1.5 rounded-2xl shadow-sm relative min-h-[46px]">
                  <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">
                    SCORE
                  </span>
                  <motion.span
                    key={score}
                    initial={{ scale: 1.3, color: "#10b981" }}
                    animate={{ scale: 1, color: "#ffffff" }}
                    transition={{ duration: 0.25 }}
                    className="text-2xl font-black font-sans leading-none tracking-tight"
                  >
                    {score}
                  </motion.span>

                  {/* Quick Combo pop bubble */}
                  <AnimatePresence>
                    {combo >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute -bottom-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full border border-amber-600 shadow-md tracking-wider uppercase"
                      >
                        Combo x{combo}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* AI Tutor Hint Button */}
            <div className="w-full z-10 relative flex justify-center">
              <motion.button
                whileHover={isAnsweringBlocked || isLoadingAi ? {} : { scale: 1.03 }}
                whileTap={isAnsweringBlocked || isLoadingAi ? {} : { scale: 0.97 }}
                disabled={isAnsweringBlocked || isLoadingAi}
                onClick={handleFetchAiHint}
                className={`w-full py-3 rounded-2xl border border-dashed flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-lg transition-all ${
                  isAnsweringBlocked 
                    ? "bg-slate-900/20 border-slate-800 text-slate-600 cursor-not-allowed opacity-50"
                    : "bg-indigo-950/40 border-indigo-500/50 hover:border-indigo-400 text-indigo-400 hover:text-indigo-300 cursor-pointer hover:shadow-indigo-500/15"
                }`}
              >
                <span className="text-sm">🧠</span>
                <span>{getTranslation("aiHintBtn")} (-25 cr)</span>
              </motion.button>
            </div>

          </div> {/* End LEFT COLUMN */}

          {/* RIGHT COLUMN: INTERACTIVE MATH CANVAS & MULTIPLE CHOICES */}
          <div className="w-full flex flex-col justify-between gap-4">
            
            {/* 1. TOP HEADER CONTAINER - Timer, level badge and Pause screen */}
            <div className="w-full flex items-center justify-between gap-3 z-10 relative">
              
              {/* Progress / Timer slider bar */}
              <div className="flex-grow flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded-full px-2.5 py-1.5 shadow-inner">
                
                {/* Level badge circle */}
                <div className="w-6 h-6 rounded-full bg-indigo-500 border border-indigo-600 flex items-center justify-center text-white font-extrabold text-[12px] shadow-sm shrink-0">
                  {level}
                </div>

                {/* Exp Bar */}
                <div className="flex-grow h-3 bg-slate-950 rounded-full overflow-hidden relative border border-slate-800/40">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                    animate={{ width: `${(timeLeft / 15) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>
                
                <span className="text-[10px] font-black text-cyan-400 shrink-0 font-mono">
                  {timeLeft}s
                </span>
              </div>

              {/* Sound Mute and Pause triggers */}
              <div className="flex items-center gap-1.5 shrink-0">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleMuteToggle}
                  className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer transition-colors shadow-sm"
                  aria-label="Toggle mute"
                  id="game-mute-btn"
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => {
                     playClickSound();
                     setIsPaused(true);
                  }}
                  className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer transition-colors shadow-sm flex items-center justify-center font-bold font-mono"
                  aria-label="Pause game"
                  id="game-pause-btn"
                >
                  <Pause size={16} className="stroke-[3]" />
                </motion.button>
              </div>
            </div>

            {/* 3. CORE MATH QUESTION CANVAS */}
            <div className="w-full py-12 md:py-16 bg-slate-950 border border-slate-800/80 rounded-3xl flex items-center justify-center relative shadow-inner z-10 overflow-hidden min-h-[145px]">
              
              {/* Confetti Sparkles Burst on Correct Answers */}
              <AnimatePresence>
                {sparkles.map((sp) => (
                  <motion.div
                    key={sp.id}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{ x: sp.x, y: sp.y, scale: sp.scale, opacity: [1, 1, 0] }}
                    transition={{ duration: 0.9, ease: [0.1, 0.8, 0.3, 1] }}
                    className="absolute w-3 h-3 rounded-full pointer-events-none z-30"
                    style={{ backgroundColor: sp.color, boxShadow: `0 0 10px ${sp.color}` }}
                  />
                ))}
              </AnimatePresence>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion?.text}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="text-center"
                >
                  <h3 className="text-5xl md:text-6xl lg:text-7xl font-sans font-black text-white tracking-widest select-none drop-shadow-[0_4px_22px_rgba(99,102,241,0.35)]">
                    {currentQuestion?.text}
                  </h3>
                </motion.div>
              </AnimatePresence>

              {/* Dynamic correct/wrong indicator overlay */}
              <AnimatePresence>
                {selectedAnswer !== null && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`absolute inset-0 rounded-3xl flex items-center justify-center ${
                      isCorrect ? "bg-emerald-500/90" : "bg-red-500/90"
                    } z-20`}
                  >
                    <div className="text-white flex flex-col items-center gap-2">
                      {isCorrect ? (
                        <>
                          <Check size={52} className="stroke-[4] drop-shadow-md animate-bounce" />
                          <span className="font-black text-lg uppercase tracking-wider">
                            CORRECT!
                          </span>
                        </>
                      ) : (
                        <>
                          <X size={52} className="stroke-[4] drop-shadow-md animate-bounce" />
                          <span className="font-black text-lg uppercase tracking-wider">
                            WRONG!
                          </span>
                          {selectedAnswer !== -999 && (
                            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full mt-1">
                              Correct: {currentQuestion?.answer}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. ANSWER GRID BUTTONS */}
            <div className="w-full grid grid-cols-2 gap-4 z-10 relative">
              {currentQuestion?.options.map((option, index) => {
                const isThisSelected = selectedAnswer === option;
                const isThisCorrect = option === currentQuestion.answer;

                let buttonColor = "bg-slate-800 text-slate-100 border-slate-700 hover:border-slate-600 hover:bg-slate-700/80 hover:text-white";
                if (selectedAnswer !== null) {
                  if (isThisSelected) {
                    buttonColor = isCorrect
                      ? "bg-emerald-500 text-white border-emerald-700"
                      : "bg-red-500 text-white border-red-700";
                  } else if (isThisCorrect) {
                     buttonColor = "bg-emerald-500 text-white border-emerald-700 opacity-90";
                  } else {
                    buttonColor = "bg-slate-950/20 text-slate-600 border-slate-900 opacity-30";
                  }
                }

                return (
                  <motion.button
                    key={index}
                    disabled={isAnsweringBlocked}
                    onClick={() => handleAnswerClick(option)}
                    whileHover={isAnsweringBlocked ? {} : { scale: 1.04, y: -2 }}
                    whileTap={isAnsweringBlocked ? {} : { y: 2 }}
                    className={`w-full py-8 text-3xl md:text-4xl font-black font-sans rounded-3xl border-2 border-b-6 transition-all shadow-md select-none relative flex items-center justify-center ${buttonColor} ${
                      isAnsweringBlocked ? "cursor-default" : "cursor-pointer"
                    }`}
                    style={{ touchAction: "manipulation" }}
                    id={`game-option-btn-${index}`}
                  >
                    {isWindowsOS && (
                      <span className="absolute top-2 left-3 bg-slate-950/70 border border-slate-800/80 text-cyan-400 font-mono text-[9px] font-black px-1.5 py-0.5 rounded shadow-inner">
                        Key {index + 1}
                      </span>
                    )}
                    {option}
                  </motion.button>
                );
              })}
            </div>

          </div> {/* End RIGHT COLUMN */}

        </div> {/* End Split Grid */}

        <p className="text-[10px] text-center text-slate-600 font-bold tracking-widest mt-6 uppercase z-10 relative">
          E.X. UI • LEVEL PROGRESS
        </p>

        {/* 5. ACTIVE PAUSE SCREEN MODAL OVERLAY */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/95 border border-slate-800 z-40 rounded-[2rem] flex flex-col items-center justify-center p-6 text-center select-none"
              id="game-pause-overlay"
            >
              {/* Decorative Shield icon */}
              <div className="w-16 h-16 rounded-full bg-indigo-500 border-2 border-indigo-400 flex items-center justify-center text-white mb-4 shadow-lg animate-pulse">
                <Pause size={30} className="stroke-[3]" />
              </div>

              <h2 className="text-3xl font-black text-white tracking-wider uppercase mb-1 font-sans">
                GAME PAUSED
              </h2>
              <p className="text-xs text-indigo-300 font-semibold mb-8 uppercase tracking-widest">
                Player: {playerName || "Guest"} • Level {level}
              </p>

              <div className="w-full flex flex-col gap-4 max-w-[220px]">
                {/* Resume button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    playClickSound();
                    setIsPaused(false);
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold tracking-widest uppercase border-b-4 border-emerald-700 active:border-b rounded-2xl py-3 cursor-pointer shadow-md flex items-center justify-center gap-2"
                  id="pause-resume-btn"
                >
                  <Play size={18} fill="#FFF" />
                  Resume
                </motion.button>

                {/* Restart button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    playClickSound();
                    setScore(0);
                    setLevel(1);
                    setQuestionsSolved(0);
                    setLives(3);
                    setCombo(0);
                    setSelectedAnswer(null);
                    setIsCorrect(null);
                    setTimeLeft(15);
                    setIsPaused(false);
                    setCurrentQuestion(generateQuestion(selectedOperation, 1));
                    resultsHistoryRef.current = [];
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-extrabold tracking-widest uppercase border-b-4 border-blue-700 active:border-b rounded-2xl py-3 cursor-pointer shadow-md flex items-center justify-center gap-2"
                  id="pause-restart-btn"
                >
                  <RefreshCw size={18} className="stroke-[2.5]" />
                  Restart
                </motion.button>

                {/* Exit Game/Quit button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    playClickSound();
                    setIsPaused(false);
                    onNavigate(GameStage.START);
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-extrabold tracking-widest uppercase border-b-4 border-red-700 active:border-b rounded-2xl py-3 cursor-pointer shadow-md flex items-center justify-center gap-2"
                  id="pause-exit-btn"
                >
                  <LogOut size={16} className="stroke-[2.5]" />
                  Quit Game
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI CLASSROOM EXPLANATORY MODAL */}
        <AnimatePresence>
          {showAiModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/95 border border-slate-800 z-45 rounded-[2rem] flex flex-col items-center justify-center p-6 text-center select-none"
              id="game-ai-tutor-overlay"
            >
              {/* Graduate Cap Chiku Chimpanzee Mascot Avatar Graphic Frame */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 border-2 border-indigo-300 flex items-center justify-center text-white mb-3 shadow-lg relative animate-bounce mt-4">
                <span className="text-4xl">🎓</span>
                <div className="absolute -bottom-1 -right-1 bg-indigo-500 ring-2 ring-slate-950 rounded-full p-1">
                  <span className="text-[10px] font-black text-white px-1">AI</span>
                </div>
              </div>

              <h2 className="text-base font-black text-indigo-400 tracking-wide uppercase mb-1 font-sans">
                {getTranslation("aiExplainTitle")}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold mb-4 uppercase tracking-widest">
                {currentQuestion?.text} • Math Solver
              </p>

              {/* Chat bubble containing explanation */}
              <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 max-h-[170px] overflow-y-auto leading-relaxed text-[12px] font-medium text-slate-200 text-left relative">
                {isLoadingAi ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-3">
                    <RefreshCw className="animate-spin text-indigo-400" size={24} />
                    <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 font-mono">
                      {getTranslation("aiThinking")}
                    </span>
                  </div>
                ) : (
                  <div className="whitespace-pre-line leading-relaxed italic text-[11.5px] text-indigo-100 font-medium">
                    "{aiExplainText}"
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2 mt-auto mb-2 px-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    playClickSound();
                    setShowAiModal(false);
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs uppercase tracking-wider py-2.5 rounded-xl cursor-pointer shadow-md"
                >
                  {getTranslation("continue")}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
