/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { X, Volume2, VolumeX, Music, Globe, Check } from "lucide-react";
import { LANGUAGES, TRANSLATIONS, LanguageCode, getTranslation } from "../utils/translations";
import { setMuteState, getMuteState, startBackgroundMusic, stopBackgroundMusic, playClickSound } from "../utils/soundEffects";

interface SettingsModalProps {
  onClose: () => void;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  onLanguageChange,
}) => {
  const [currentLang, setCurrentLang] = useState<LanguageCode>(() => {
    return (localStorage.getItem("math_game_language") || "en") as LanguageCode;
  });

  const [soundOn, setSoundOn] = useState(() => {
    return !getMuteState();
  });

  const [musicOn, setMusicOn] = useState(() => {
    return localStorage.getItem("math_music_enabled") !== "false";
  });

  const handleLanguageSelect = (code: LanguageCode) => {
    setCurrentLang(code);
    localStorage.setItem("math_game_language", code);
    onLanguageChange(code);
  };

  const toggleSound = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    setMuteState(!nextVal); // mute is opposite of soundOn
  };

  const toggleMusic = () => {
    const nextVal = !musicOn;
    setMusicOn(nextVal);
    localStorage.setItem("math_music_enabled", nextVal ? "true" : "false");
    if (nextVal) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-2xl relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 bg-slate-800/50 hover:bg-slate-800 p-2 rounded-full transition-all"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <h2 className="text-xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <span>⚙️</span> {getTranslation("settings", currentLang)}
        </h2>
        <p className="text-[11px] text-slate-400 mb-6">
          Toggle your audio preferences and change system translations instantly.
        </p>

        {/* Action Toggles */}
        <div className="space-y-4 mb-6">
          {/* Sound FX */}
          <div className="flex items-center justify-between bg-slate-950/50 border border-slate-800/60 p-3 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${soundOn ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </div>
              <div>
                <p className="text-[12px] font-black tracking-wide text-white">
                  {getTranslation("soundSfx", currentLang)}
                </p>
                <p className="text-[9px] text-slate-500">Enable in-game pop, ding & buzzer feedback</p>
              </div>
            </div>

            <button
              onClick={toggleSound}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
                soundOn ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${
                  soundOn ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Background Music */}
          <div className="flex items-center justify-between bg-slate-950/50 border border-slate-800/60 p-3 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${musicOn ? "bg-cyan-500/10 text-cyan-400" : "bg-slate-800 text-slate-500"}`}>
                <Music size={18} className={musicOn ? "animate-pulse" : ""} />
              </div>
              <div>
                <p className="text-[12px] font-black tracking-wide text-white">
                  {getTranslation("bgMusic", currentLang)}
                </p>
                <p className="text-[9px] text-slate-500">Soothing retro mathematical synthesized soundtrack</p>
              </div>
            </div>

            <button
              onClick={toggleMusic}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
                musicOn ? "bg-cyan-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${
                  musicOn ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Language Selection Grid */}
        <div className="border-t border-slate-800 pt-5">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Globe size={11} className="text-indigo-400" />
            <span>{getTranslation("language", currentLang)}</span>
          </h3>

          <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
            {LANGUAGES.map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-left border transition-all text-[11px] ${
                    isSelected
                      ? "bg-indigo-500/10 border-indigo-500 text-white font-extrabold"
                      : "bg-slate-950/20 border-slate-800/80 text-slate-300 hover:bg-slate-800/30"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm shrink-0">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  {isSelected && <Check size={10} className="text-indigo-400 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info/prompt */}
        <div className="text-center mt-6 flex flex-col gap-2">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-[11px] font-black uppercase tracking-wider py-2.5 rounded-xl shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer"
          >
            {getTranslation("close", currentLang)}
          </button>

          {/* SIMULATE APP PACKAGE RE-INSTALLATION */}
          <button
            onClick={() => {
              playClickSound();
              const confirmText = currentLang === "bn" 
                ? "আপনি কি সম্পূর্ণ গেম ডাটা মুছে ফেলে প্রথমবার ডাউনলোড করার মতো করে পুনরায় ইনস্টল করতে চান?" 
                : "Are you sure you want to erase all game progress & simulate a brand-new app package installation?";
              if (window.confirm(confirmText)) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-200 text-[10px] font-black uppercase tracking-wider py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            🔄 {currentLang === "bn" ? "ডাউনলোডার পুনরায় স্ক্রিন" : "Simulate Fresh Download"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
