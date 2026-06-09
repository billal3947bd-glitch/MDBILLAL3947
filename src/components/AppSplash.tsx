/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Cpu, Shield, GraduationCap, Heart, CheckCircle } from "lucide-react";

interface AppSplashProps {
  onComplete: () => void;
  lang: string;
}

export const AppSplash: React.FC<AppSplashProps> = ({ onComplete, lang }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const isBengali = lang === "bn";

  const statusMessages = isBengali
    ? [
        "গেম ইঞ্জিন লোড হচ্ছে...",
        "চিকুর সাথে সংযোগ স্থাপন করা হচ্ছে...",
        "৩ডি গ্রাফিক্স অপ্টিমাইজ করা হচ্ছে...",
        "এআই টিউটর চালিত হচ্ছে...",
        "সিস্টেম প্রস্তুত!",
      ]
    : [
        "Loading Game Modules...",
        "Connecting with Chiku...",
        "Optimizing 3D Graphics...",
        "Booting AI Classroom Tutor...",
        "Engine Ready!",
      ];

  useEffect(() => {
    // 3.5-second accurate countdown/loading progress (3500ms total)
    const duration = 3500;
    const intervalTime = 35; // Increment every 35ms
    const totalSteps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min(Math.round((currentStep / totalSteps) * 100), 100);
      setProgress(nextProgress);

      // Dynamically cycle through message steps
      const msgIndex = Math.min(
        Math.floor((nextProgress / 100) * statusMessages.length),
        statusMessages.length - 1
      );
      setStatusText(statusMessages[msgIndex]);

      if (nextProgress >= 100) {
        clearInterval(timer);
        // Add a tiny delay for the user to see "Engine Ready" / "সিস্টেম প্রস্তুত!" before completing
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isBengali]);

  return (
    <div className="fixed inset-0 bg-[#020617] z-50 flex flex-col items-center justify-between py-16 px-6 overflow-hidden select-none font-sans">
      
      {/* Immersive Animated Hologram Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.18),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(236,72,153,0.12),transparent_50%)]" />

      {/* Cybernetic Blueprint Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
        backgroundImage: "linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)",
        backgroundSize: "32px 32px"
      }} />

      {/* Top Floating Mini Badges */}
      <div className="flex items-center gap-3 relative z-10 opacity-70">
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black text-indigo-400 tracking-wider uppercase">
          <Cpu size={10} className="animate-spin text-cyan-400" /> SYSTEM ONLINE
        </span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black text-emerald-400 tracking-wider uppercase">
          <Shield size={10} /> SECURE
        </span>
      </div>

      {/* Core Center Display Content */}
      <div className="flex flex-col items-center text-center max-w-md relative z-10">
        
        {/* Animated App Launcher Icon Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-36 h-36 md:w-40 md:h-40 mb-8 shrink-0 group"
        >
          {/* Neon glowing radial backdrops */}
          <div className="absolute inset-1 bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-600 rounded-[2.5rem] blur-xl opacity-60 group-hover:blur-2xl transition-all duration-500 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 rounded-[2.75rem] p-[3px] shadow-[0_20px_40px_rgba(30,27,75,0.8)]" />
          
          <div className="w-full h-full bg-slate-950 rounded-[2.6rem] overflow-hidden relative border border-slate-900">
            <img
              src="/light_math_icon_1780819415933.png"
              alt="Light Math Art Icon"
              className="w-full h-full object-cover transition-transform duration-500 scale-100 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>

        {/* Cinematic Title Logo Wording */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200">
              LIGHT MATH
            </h1>
            <Sparkles size={24} className="text-yellow-300 animate-pulse fill-yellow-300" />
          </div>
          <div className="h-[2px] w-32 bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 mx-auto rounded-full" />
          <p className="text-sm font-extrabold text-cyan-400 tracking-widest uppercase mt-2">
            {isBengali ? "গণিত শিখো আনন্দের সাথে" : "THE MATH ADVENTURE GAME"}
          </p>
        </motion.div>

        {/* Elegant Minimal Loading Bar */}
        <div className="w-64 mt-12 flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-[11px] font-bold font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              {progress < 100 ? (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
              ) : (
                <CheckCircle size={10} className="text-emerald-400" />
              )}
              {statusText}
            </span>
            <span className="text-cyan-400 font-extrabold">{progress}%</span>
          </div>

          <div className="h-2 w-full bg-slate-900 border border-slate-800/80 rounded-full overflow-hidden p-[2px]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 rounded-full"
              transition={{ ease: "easeOut" }}
            />
          </div>
        </div>

      </div>

      {/* Signature Powered By Header (Bottom) */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="flex flex-col items-center gap-1 relative z-10"
      >
        <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">
          POWERED BY
        </span>
        <div className="flex items-center gap-1.5">
          <div className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-md">
            <span className="text-sm font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-300">
              AREFIN STUDIO
            </span>
          </div>
        </div>
        <p className="text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-widest">
          STANDALONE RUNTIME v1.5.0
        </p>
      </motion.div>

    </div>
  );
};
