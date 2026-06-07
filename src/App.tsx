/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GameStage, OperationType } from "./types";
import { StartScreen } from "./components/StartScreen";
import { ModeSelectionScreen } from "./components/ModeSelectionScreen";
import { GameScreen } from "./components/GameScreen";
import { GameOverScreen } from "./components/GameOverScreen";
import { LeaderboardsScreen } from "./components/LeaderboardsScreen";
import { StoreScreen } from "./components/StoreScreen";
import { SettingsModal } from "./components/SettingsModal";
import { InstallerSplash } from "./components/InstallerSplash";
import { startBackgroundMusic, playClickSound } from "./utils/soundEffects";
import { LanguageCode } from "./utils/translations";
import { Settings } from "lucide-react";
import { updateDailyMissionsOnGameEnd } from "./utils/missions";

export default function App() {
  const [currentStage, setCurrentStage] = useState<GameStage>(GameStage.START);
  const [showSettings, setShowSettings] = useState(false);
  
  // Game Language reactive state
  const [lang, setLang] = useState<LanguageCode>(() => {
    return (localStorage.getItem("math_game_language") || "en") as LanguageCode;
  });

  // Track if standalone launch package has loaded
  const [hasInitialized, setHasInitialized] = useState(() => {
    return localStorage.getItem("math_app_initialized") === "true";
  });

  // Game Configuration State
  const [playerName, setPlayerName] = useState("PLAYER 1");
  const [selectedCharId, setSelectedCharId] = useState("mr-smart");
  const [selectedOperation, setSelectedOperation] = useState<OperationType>(OperationType.ADDITION);

  // Results State
  const [finalScore, setFinalScore] = useState(0);
  const [finalLevel, setFinalLevel] = useState(1);
  const [reviewQuestions, setReviewQuestions] = useState<any[]>([]);

  // Active Premium Wallpaper Background state
  const [activeWallpaper, setActiveWallpaper] = useState(() => {
    return localStorage.getItem("math_equipped_wallpaper") || "";
  });

  // Autoplay synthesized background chords on first user gesture
  useEffect(() => {
    const handleInteraction = () => {
      startBackgroundMusic();
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  // Keep in sync when the user navigates stages (returns from Store, etc.)
  useEffect(() => {
    setActiveWallpaper(localStorage.getItem("math_equipped_wallpaper") || "");
  }, [currentStage]);

  const handleFinishGame = (score: number, level: number, questions: any[]) => {
    updateDailyMissionsOnGameEnd(score, level, questions);
    setFinalScore(score);
    setFinalLevel(level);
    setReviewQuestions(questions);
    setCurrentStage(GameStage.GAME_OVER);
  };

  const handleRestartGame = () => {
    // Retain configuration, just boot straight to the math grid
    setCurrentStage(GameStage.GAMEPLAY);
  };

  if (!hasInitialized) {
    return (
      <InstallerSplash
        onComplete={() => setHasInitialized(true)}
        lang={lang}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-start sm:justify-center items-center overflow-y-auto overflow-x-hidden py-4 sm:py-10 px-2 sm:px-4 select-none">
      
      {/* 2. DYNAMIC PREMIUM WALLPAPER BACKGROUND LAYERS */}
      {activeWallpaper === "theme_cyberpunk" && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden transition-all duration-700 bg-gradient-to-br from-indigo-950 via-slate-950 to-fuchsia-950/70">
          {/* Cyan/Magenta retro grid layout */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "linear-gradient(to right, #ec4899 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />
          {/* Cyber glowing horizontal line */}
          <div className="absolute top-[40%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-455 to-transparent blur-[1px] animate-pulse" />
          <div className="absolute top-[70%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent blur-[1px] animate-pulse" />
        </div>
      )}

      {activeWallpaper === "theme_cosmic" && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden transition-all duration-700 bg-slate-950">
          {/* Deep celestial gradient clouds */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 via-transparent to-blue-900/30 opacity-60 mix-blend-color-dodge" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px] animate-pulse" style={{ animationDuration: "10s" }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-fuchsia-500/10 blur-[100px] animate-pulse" style={{ animationDuration: "14s" }} />
          {/* Celestial blinking stars */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-25 animate-pulse" />
        </div>
      )}

      {activeWallpaper === "theme_royal" && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden transition-all duration-700 bg-gradient-to-b from-amber-950/30 via-slate-950 to-amber-950/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)]" />
          {/* Gold speckles */}
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage: "radial-gradient(#fbbf24 2px, transparent 2px)",
            backgroundSize: "32px 32px"
          }} />
          {/* Floating gold pieces */}
          <div className="absolute top-[15%] left-[20%] w-2 h-2 rotate-45 bg-amber-400 opacity-60 animate-bounce" />
          <div className="absolute top-[60%] right-[15%] w-3.5 h-3.5 rotate-45 bg-amber-300 opacity-40 animate-pulse" style={{ animationDuration: "3s" }} />
          <div className="absolute bottom-[25%] left-[10%] w-2.5 h-2.5 rotate-45 bg-yellow-400 opacity-50 animate-bounce animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-[120px]" />
        </div>
      )}

      {/* 1. TOPOGRAPHIC CONTOUR GRAPHICS - matches EX. UI Mockup lines exactly but with vibrant dark theme colors */}
      <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden mix-blend-screen z-0">
        <svg
          className="absolute w-full h-full min-w-[1200px]"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Layered contours */}
          <path d="M 0 150 Q 250 80 500 120 T 1000 70 L 1000 0 L 0 0 Z" fill="none" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="2.5" />
          <path d="M 0 350 Q 300 280 600 320 T 1000 240 L 1000 0 L 0 0 Z" fill="none" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="2" />
          <path d="M 0 550 Q 200 480 500 520 T 1000 420" fill="none" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="1.5" />
          <path d="M 0 750 Q 350 680 700 710 T 1000 640" fill="none" stroke="rgba(139, 92, 246, 0.1)" strokeWidth="1" strokeDasharray="3,3" />
          <path d="M 0 920 Q 250 880 500 900 T 1000 830" fill="none" stroke="rgba(99, 102, 241, 0.08)" strokeWidth="1" />
          
          {/* Abstract circles simulating topographic mounds */}
          <circle cx="850" cy="150" r="100" fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1.5" />
          <circle cx="850" cy="150" r="150" fill="none" stroke="rgba(139, 92, 246, 0.08)" strokeWidth="1" />
          <circle cx="850" cy="150" r="200" fill="none" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="0.8" strokeDasharray="2,2" />

          <circle cx="150" cy="800" r="90" fill="none" stroke="rgba(139, 92, 246, 0.1)" strokeWidth="1.5" />
          <circle cx="150" cy="800" r="140" fill="none" stroke="rgba(6, 182, 212, 0.08)" strokeWidth="1" />
        </svg>
      </div>

      {/* Floating particles in background for friendly magical depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[15%] w-4 h-4 rounded-full bg-cyan-400 opacity-20 blur-sm animate-pulse" />
        <div className="absolute top-[25%] right-[20%] w-6 h-6 rounded-full bg-indigo-400 opacity-20 blur-sm animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-[20%] left-[25%] w-5 h-5 rounded-full bg-violet-400 opacity-20 blur-sm animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* 2. MAIN APP COMPONENT PORTAL - STAGE CONTROLLER */}
      <main className="w-full max-w-md md:max-w-4xl lg:max-w-5xl z-10 flex flex-col justify-center relative my-auto min-h-[500px]">
        <AnimatePresence mode="wait">
          {currentStage === GameStage.START && (
            <motion.div
              key={`start-${lang}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <StartScreen
                playerName={playerName}
                setPlayerName={setPlayerName}
                selectedCharId={selectedCharId}
                setSelectedCharId={setSelectedCharId}
                onNavigate={setCurrentStage}
                onOpenSettings={() => setShowSettings(true)}
              />
            </motion.div>
          )}

          {currentStage === GameStage.OPERATION_SELECT && (
            <motion.div
              key={`op-${lang}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <ModeSelectionScreen
                onSelectOperation={setSelectedOperation}
                onNavigate={setCurrentStage}
              />
            </motion.div>
          )}

          {currentStage === GameStage.GAMEPLAY && (
            <motion.div
              key={`game-${lang}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <GameScreen
                playerName={playerName}
                selectedOperation={selectedOperation}
                selectedCharId={selectedCharId}
                onFinishGame={handleFinishGame}
                onNavigate={setCurrentStage}
              />
            </motion.div>
          )}

          {currentStage === GameStage.GAME_OVER && (
            <motion.div
              key={`over-${lang}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <GameOverScreen
                playerName={playerName}
                finalScore={finalScore}
                finalLevel={finalLevel}
                selectedOperation={selectedOperation}
                selectedCharId={selectedCharId}
                reviewQuestions={reviewQuestions}
                onNavigate={setCurrentStage}
                onRestartGame={handleRestartGame}
              />
            </motion.div>
          )}

          {currentStage === GameStage.LEADERBOARD && (
            <motion.div
              key={`leaderboard-${lang}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <LeaderboardsScreen onNavigate={setCurrentStage} />
            </motion.div>
          )}

          {currentStage === GameStage.STORE && (
            <motion.div
              key={`store-${lang}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <StoreScreen
                onNavigate={setCurrentStage}
                selectedCharId={selectedCharId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent settings trigger gear button */}
      <button
        id="global-settings-toggle"
        onClick={() => {
          playClickSound();
          setShowSettings(true);
        }}
        className="absolute top-4 left-4 z-40 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 p-2.5 rounded-full hover:scale-110 active:scale-95 text-slate-400 hover:text-white transition-all shadow-md flex items-center justify-center cursor-pointer group"
        title="Settings / ভাষা"
      >
        <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {/* Settings Modal Component Overlay */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            onLanguageChange={(newLang) => setLang(newLang)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
