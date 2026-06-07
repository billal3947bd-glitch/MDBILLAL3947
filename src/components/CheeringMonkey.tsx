import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageCircle } from "lucide-react";

interface CheeringMonkeyProps {
  stage?: "idle" | "playing" | "gameover" | "level_up";
  feedbackState?: "none" | "correct" | "wrong";
  currentLevel?: number;
}

export const CheeringMonkey: React.FC<CheeringMonkeyProps> = ({
  stage = "idle",
  feedbackState = "none",
  currentLevel = 1
}) => {
  const [speech, setSpeech] = useState("Ami Chiku! 🍌 Let's solve some fun math today! Tumi parbei!");
  const [monkeyPose, setMonkeyPose] = useState<"happy" | "dancing" | "cheering" | "thinking" | "oops">("happy");
  const [bubbleKey, setBubbleKey] = useState(0);

  // Lists of motivational messages
  const idleMessages = [
    "Ami Chiku! 🍌 Let's solve some fun math today! Tumi parbei!",
    "Math is like a puzzle! Chalay jao, tumi parbe! 🧠",
    "Have you visited the Math Bazaar? Store er designs khub shundor! 🦖",
    "Be a math superhero today! 💪 Let's click start!",
    "Chiku is cheering for you! Let's go! 🌟"
  ];

  const incorrectMessages = [
    "Oops! No problem, Chiku knows you'll clear the next one! 💪",
    "Vul thakei amra shikhi! Try once more, cool chinte koro!",
    "Chinta koro nah, standard step! Tumi oboshshoi parbe!",
    "Practice makes us perfect! 🍌 Chimpanzee power!"
  ];

  const correctMessages = [
    "Wow! Incredible speed! 🔥 Darun sothik uttor!",
    "FATFATI! 🎉 Ekdom joss hoyeche!",
    "Oshadharon! Sothik answer! Tumi toh math master! 👑",
    "Sabash! +1 Coins earned! Keep going!",
    "Yes! Correct! Chiku is so happy! 🥳"
  ];

  const levelUpMessages = [
    "OH MY BANANA! 🍌 Level UP! 🔥 Tumi toh math wizard!",
    "Incredible! New Level unlocked! Chiku is dancing with joy! 💃",
    "Boba-feated! You are scoring like a pro!"
  ];

  // React to stage and feedback changes
  useEffect(() => {
    let chosenPose: "happy" | "dancing" | "cheering" | "thinking" | "oops" = "happy";
    let message = "";

    if (feedbackState === "correct") {
      chosenPose = "cheering";
      message = correctMessages[Math.floor(Math.random() * correctMessages.length)];
    } else if (feedbackState === "wrong") {
      chosenPose = "oops";
      message = incorrectMessages[Math.floor(Math.random() * incorrectMessages.length)];
    } else if (stage === "level_up") {
      chosenPose = "dancing";
      message = levelUpMessages[Math.floor(Math.random() * levelUpMessages.length)];
    } else if (stage === "playing") {
      chosenPose = "thinking";
      message = "Chinta koro... carefully calculate output! 🧠✨";
    } else {
      chosenPose = "happy";
      // Pick a random idle message
      message = idleMessages[Math.floor(Math.random() * idleMessages.length)];
    }

    setMonkeyPose(chosenPose);
    setSpeech(message);
    setBubbleKey(prev => prev + 1);
  }, [feedbackState, stage, currentLevel]);

  // Periodic random encouragement to keep the child motivated
  useEffect(() => {
    if (feedbackState !== "none" || stage === "level_up") return;

    const interval = setInterval(() => {
      let message = "";
      if (stage === "playing") {
        message = "Careful math calculation is easy! Keep focusing! ⚡";
        setMonkeyPose("thinking");
      } else {
        message = idleMessages[Math.floor(Math.random() * idleMessages.length)];
        setMonkeyPose("happy");
      }
      setSpeech(message);
      setBubbleKey(prev => prev + 1);
    }, 12000);

    return () => clearInterval(interval);
  }, [stage, feedbackState]);

  // Define pose SVG path variations or emoji accents
  const getMonkeyFace = () => {
    switch (monkeyPose) {
      case "cheering":
        return "🤩";
      case "dancing":
        return "🕺🐒🎉";
      case "thinking":
        return "🧐";
      case "oops":
        return "🙈";
      case "happy":
      default:
        return "🐒";
    }
  };

  return (
    <div className="relative w-full flex items-center justify-end gap-3 px-1 my-3 pr-2 z-30 select-none">
      
      {/* Dynamic Cheering Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bubbleKey}
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 20 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="relative max-w-[210px] bg-slate-900 border-2 border-indigo-500/30 rounded-2xl rounded-tr-none px-3 py-2 text-left shadow-lg"
        >
          {/* Neon mini accent point */}
          <div className="absolute top-1 right-2 flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="text-[7px] text-indigo-400 font-extrabold uppercase tracking-wide">Chiku</span>
          </div>

          <p className="text-[10px] font-bold text-slate-100 leading-normal max-w-[195px] pr-4 pt-1">
            "{speech}"
          </p>

          {/* Speech bubble pointer path tail */}
          <div className="absolute -right-[10px] top-0 w-0 h-0 border-t-[10px] border-t-slate-900 border-r-[10px] border-r-transparent" />
          {/* Outer stroke shadow mimic */}
          <div className="absolute -right-[11px] top-[-1px] w-0 h-0 border-t-[11px] border-t-indigo-500/20 border-r-[11px] border-r-transparent -z-10" />
        </motion.div>
      </AnimatePresence>

      {/* Playful Animated Monkey Avatar illustration box */}
      <motion.div
        animate={{
          y: monkeyPose === "dancing" ? [0, -12, 0, -12, 0] : monkeyPose === "cheering" ? [0, -8, 0] : [0, -2, 0],
          rotate: monkeyPose === "dancing" ? [0, -5, 5, -5, 5, 0] : [0, -1, 1, 0]
        }}
        transition={{
          repeat: monkeyPose === "dancing" ? Infinity : 0,
          duration: monkeyPose === "dancing" ? 1.5 : 4,
          ease: "easeInOut"
        }}
        className="w-14 h-14 bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-400 rounded-2xl border-2 border-amber-500 flex flex-col items-center justify-center relative shadow-[0_4px_12px_rgba(245,158,11,0.25)] cursor-pointer group shrink-0"
        whileHover={{ scale: 1.1 }}
        onClick={() => {
          // Play click reaction
          setMonkeyPose("dancing");
          setSpeech("Hahaha! Tame monkey loves banana and coding math! 🍌 Tumi khub valo kheleshcho!");
          setBubbleKey(prev => prev + 1);
        }}
      >
        {/* Sparkle badge on the monkey helmet */}
        <div className="absolute -top-1 -left-1 bg-amber-400 border border-amber-600 rounded-full p-0.5 shadow-md">
          <Sparkles size={8} className="text-slate-950 animate-pulse" />
        </div>

        {/* Monkey Face emoji / aesthetic frame */}
        <div className="relative text-2xl flex items-center justify-center h-8">
          {getMonkeyFace()}
        </div>

        {/* Title bottom sticker */}
        <span className="text-[7px] font-black text-slate-900 bg-white/90 border border-amber-600/30 rounded-full px-2 py-0.2 uppercase tracking-wide inline-block mt-0.5 shadow-xs">
          {monkeyPose === "cheering" ? "YAY! 🎉" : monkeyPose === "dancing" ? "DANCE!" : "CHIKU"}
        </span>

        {/* Back glowing halo wrapper */}
        <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-sm -z-10 animate-pulse pointer-events-none" />
      </motion.div>

    </div>
  );
};
