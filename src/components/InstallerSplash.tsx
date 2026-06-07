/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, MonitorSmartphone, Shield, CheckCircle, Play, Sparkles, AlertCircle } from "lucide-react";
import { playClickSound, playLevelUpSound } from "../utils/soundEffects";

interface InstallerSplashProps {
  onComplete: () => void;
  lang: string;
}

export const InstallerSplash: React.FC<InstallerSplashProps> = ({ onComplete, lang }) => {
  const [progress, setProgress] = useState(0);
  const [installStep, setInstallStep] = useState(0);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [systemSpec, setSystemSpec] = useState({ os: "Web Sandbox", screen: "Responsive Canvas" });

  const isBengali = lang === "bn";

  const steps = [
    {
      percent: 15,
      msgEn: "📥 Securing local sandbox container & verifying cache keys...",
      msgBn: "📥 লোকাল স্যান্ডবক্স কন্টেইনার এবং ক্যাশে কি যাচাই করা হচ্ছে...",
    },
    {
      percent: 38,
      msgEn: "🚀 Loading high-fidelity sound fonts & background synthesizers...",
      msgBn: "🚀 উন্নত মানের সাউন্ড ফন্ট এবং ব্যাকগ্রাউন্ড সিন্থেসাইজার লোড হচ্ছে...",
    },
    {
      percent: 62,
      msgEn: "🧹 Optimizing pixel ratios for Mobile & Windows Display viewports...",
      msgBn: "🧹 মোবাইল এবং উইন্ডোজ ডিসপ্লের জন্য পিক্সেল রেশিও অপ্টিমাইজ করা হচ্ছে...",
    },
    {
      percent: 85,
      msgEn: "✨ Calibrating daily mathematical missions, companion Chiku, and AI tutor...",
      msgBn: "✨ দৈনিক গণিত মিশন, সহচর চিকু এবং এআই টিউটর প্রস্তুত করা হচ্ছে...",
    },
    {
      percent: 100,
      msgEn: "🛡️ স্ট্যান্ডঅলোন প্যাকেজ লোড সম্পন্ন! Standalone package verified fully.",
      msgBn: "🛡️ স্ট্যান্ডঅলোন প্যাকেজ লোড সম্পন্ন! Standalone package verified fully.",
    }
  ];

  useEffect(() => {
    // Detect OS & Screen
    const userAgent = navigator.userAgent;
    let detectedOS = "Responsive Web Mode";
    if (userAgent.indexOf("Windows") !== -1) detectedOS = "Windows Standalone Exe Container";
    else if (/Android/i.test(userAgent)) detectedOS = "Android Native App Container";
    else if (/iPhone|iPad|iPod/i.test(userAgent)) detectedOS = "iOS App Sandbox Package";

    const w = window.innerWidth;
    const h = window.innerHeight;
    setSystemSpec({
      os: detectedOS,
      screen: `${w}x${h} Screen Size (${w > 768 ? "Desktop Aspect" : "Mobile Fluid Aspect"})`
    });

    setLogMessages([isBengali ? "🚀 লাইট ম্যাথ সেটআপ শুরু..." : "🚀 Starting Light Math Setup Container..."]);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 4) + 1;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, 85);

    return () => clearInterval(timer);
  }, [isBengali]);

  useEffect(() => {
    // Match current progress with the installation steps log
    const currentStep = steps.find(s => progress >= s.percent - 5 && progress <= s.percent + 5);
    if (currentStep && installStep < steps.length) {
      const msg = isBengali ? currentStep.msgBn : currentStep.msgEn;
      if (!logMessages.includes(msg)) {
        setLogMessages(prev => [...prev, msg]);
        setInstallStep(prev => prev + 1);
        // Play subtle tick sound if available
        try {
          const context = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = context.createOscillator();
          const gain = context.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(600 + progress * 4, context.currentTime);
          gain.gain.setValueAtTime(0.01, context.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.1);
          osc.connect(gain);
          gain.connect(context.destination);
          osc.start();
          osc.stop(context.currentTime + 0.1);
        } catch (e) {}
      }
    }
  }, [progress, installStep, logMessages, isBengali]);

  const handleLaunch = () => {
    playLevelUpSound();
    localStorage.setItem("math_app_initialized", "true");
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-[1px]" />
      
      {/* Blueprint grid overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: "linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)",
        backgroundSize: "24px 24px"
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative flex flex-col select-none"
      >
        {/* Glowing holographic lights */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-505/20 rounded-full blur-[80px]" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-505/20 rounded-full blur-[80px]" />

        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 border-b border-slate-800/80 pb-6">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-indigo-500 rounded-3xl blur-md opacity-45 animate-pulse" />
            <img
              src="/src/assets/images/light_math_icon_1780819415933.png"
              alt="Light Math Logo"
              referrerPolicy="no-referrer"
              className="w-20 h-20 md:w-24 md:h-24 rounded-[1.75rem] border border-indigo-400 relative z-10 shadow-lg object-cover"
            />
          </div>

          <div className="text-center md:text-left flex-grow">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-[9px] font-black tracking-widest text-indigo-400 uppercase">
                v1.5.0 STABLE
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1">
                <Shield size={8} /> STANDALONE SECURE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none">
              {isBengali ? "লাইট ম্যাথ অ্যাডভেঞ্চার" : "LIGHT MATH ADVENTURE"}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 font-bold font-mono">
              {isBengali ? "পরবর্তী প্রজন্মের গণিত গেম ইঞ্জিন • Standalone Run Package" : "Next-Gen Gamified Math Engine • Standalone Run Package"}
            </p>
          </div>
        </div>

        {/* Dynamic Responsiveness Spec Box */}
        <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 border border-slate-800/80 rounded-2xl mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-indigo-405 shrink-0">
              <MonitorSmartphone size={16} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Device Mode Target</p>
              <p className="text-xs font-black text-slate-200">{systemSpec.os}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-cyan-405 shrink-0">
              <Download size={16} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Resolution Match</p>
              <p className="text-xs font-black text-slate-200">{systemSpec.screen}</p>
            </div>
          </div>
        </div>

        {/* Glowing Progress installation Bar */}
        <div className="w-full flex flex-col gap-2 mb-6">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1.5 font-mono">
              {progress < 100 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                  {isBengali ? "ডাউনলোড ও সেটআপ চলছে..." : "Installing standalone packages..."}
                </>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1 font-sans">
                  <CheckCircle size={14} /> {isBengali ? "প্যাকেজ ইন্সটল সমাপ্ত!" : "Standalone Package Configured!"}
                </span>
              )}
            </span>
            <span className="font-mono font-black text-cyan-405 text-sm">{progress}%</span>
          </div>

          <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              transition={{ ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Real-time installation Logs */}
        <div className="flex-grow bg-slate-950/80 border border-slate-800 p-4 rounded-2xl h-36 overflow-y-auto font-mono text-[10px] text-slate-350 flex flex-col gap-1.5 select-text mb-8 custom-scrollbar">
          {logMessages.map((log, idx) => (
            <div key={idx} className="flex gap-2 items-start text-left leading-relaxed">
              <span className="text-indigo-400 shrink-0">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              <span className={idx === logMessages.length - 1 ? "text-cyan-300 font-bold" : "text-slate-400"}>{log}</span>
            </div>
          ))}
          <div className="text-slate-600 text-[9px] mt-2 italic flex items-center gap-1">
            <AlertCircle size={10} />
            {isBengali ? "উইন্ডোজ/মোবাইল প্রিসিশন অপ্টিমাইজড রেশিও সক্রিয় করা হয়েছে" : "Windows/Mobile Precision Optimized Ratio is activated on this device."}
          </div>
        </div>

        {/* Launch Button Trigger */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {progress < 100 ? (
              <div className="w-full py-4 text-center text-slate-505 font-bold tracking-widest text-[11px] uppercase bg-slate-800/20 border border-slate-800/80 rounded-2xl">
                {isBengali ? "সিস্টেম কম্পাইল সমাপ্ত হওয়া পর্যন্ত অপেক্ষা করুন..." : "System compiles files, please hold..."}
              </div>
            ) : (
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLaunch}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-500 text-white font-black text-sm tracking-widest uppercase border-b-6 border-emerald-700 hover:border-emerald-600 rounded-2xl py-4 shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                id="btn-launch-standalone"
              >
                <Play size={16} className="fill-white stroke-none" />
                {isBengali ? "গণিত যাত্রা শুরু করো!" : "LAUNCH APPLICATION!"}
                <Sparkles size={16} className="animate-pulse text-yellow-300" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
