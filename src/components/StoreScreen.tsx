/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GameStage } from "../types";
import { 
  ArrowLeft, 
  Coins, 
  Sparkles, 
  Crown, 
  Shield, 
  Clock, 
  Check, 
  Lock, 
  ShoppingBag,
  Info,
  Palette
} from "lucide-react";
import { Avatar } from "./Avatars";

// Define the store item type
export interface StoreItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: "frame" | "booster" | "vibe" | "wallpaper";
  icon: React.ReactNode;
  unlockedLabel?: string;
}

interface StoreScreenProps {
  onNavigate: (stage: GameStage) => void;
  selectedCharId: string;
}

export const StoreScreen: React.FC<StoreScreenProps> = ({ onNavigate, selectedCharId }) => {
  const [coins, setCoins] = useState<number>(100);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [equippedFrame, setEquippedFrame] = useState<string>("");
  const [equippedBooster, setEquippedBooster] = useState<string>("");
  const [equippedWallpaper, setEquippedWallpaper] = useState<string>("");
  const [notEnoughCoinsId, setNotEnoughCoinsId] = useState<string | null>(null);
  const [purchasedSuccessId, setPurchasedSuccessId] = useState<string | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    // Coins (defaults to 100 on new load to let them experiment immediately)
    const storedCoins = localStorage.getItem("math_coins");
    if (storedCoins !== null) {
      setCoins(parseInt(storedCoins, 10));
    } else {
      localStorage.setItem("math_coins", "100");
      setCoins(100);
    }

    // Unlocked items
    const storedUnlocked = localStorage.getItem("math_unlocked_items");
    if (storedUnlocked) {
      setUnlockedItems(JSON.parse(storedUnlocked));
    }

    // Equipped items
    const storedFrame = localStorage.getItem("math_equipped_frame") || "";
    setEquippedFrame(storedFrame);

    const storedBooster = localStorage.getItem("math_equipped_booster") || "";
    setEquippedBooster(storedBooster);

    const storedWallpaper = localStorage.getItem("math_equipped_wallpaper") || "";
    setEquippedWallpaper(storedWallpaper);
  }, []);

  const saveCoins = (newCoins: number) => {
    setCoins(newCoins);
    localStorage.setItem("math_coins", newCoins.toString());
  };

  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(450, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      // AudioContext not supported or blocked
    }
  };

  const playUnlockSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
      osc1.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
      osc1.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.24); // C6

      osc2.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.24);
      
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      
      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.45);
      osc2.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      // AudioContext not supported
    }
  };

  const playFailSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(180, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      // Ignore
    }
  };

  const handleBuyItem = (item: StoreItem) => {
    if (unlockedItems.includes(item.id)) return; // Already bought

    if (coins < item.cost) {
      playFailSound();
      setNotEnoughCoinsId(item.id);
      setTimeout(() => setNotEnoughCoinsId(null), 1200);
      return;
    }

    // Process unlock
    const newCoins = coins - item.cost;
    saveCoins(newCoins);
    playUnlockSound();

    const newUnlocked = [...unlockedItems, item.id];
    setUnlockedItems(newUnlocked);
    localStorage.setItem("math_unlocked_items", JSON.stringify(newUnlocked));

    setPurchasedSuccessId(item.id);
    setTimeout(() => setPurchasedSuccessId(null), 2000);

    // Auto equip if beautiful frame
    if (item.category === "frame") {
      setEquippedFrame(item.id);
      localStorage.setItem("math_equipped_frame", item.id);
    } else if (item.category === "booster") {
      setEquippedBooster(item.id);
      localStorage.setItem("math_equipped_booster", item.id);
    } else if (item.category === "wallpaper") {
      setEquippedWallpaper(item.id);
      localStorage.setItem("math_equipped_wallpaper", item.id);
    }
  };

  const handleEquipItem = (item: StoreItem) => {
    playClickSound();
    if (item.category === "frame") {
      const targetFrame = equippedFrame === item.id ? "" : item.id;
      setEquippedFrame(targetFrame);
      localStorage.setItem("math_equipped_frame", targetFrame);
    } else if (item.category === "booster") {
      const targetBooster = equippedBooster === item.id ? "" : item.id;
      setEquippedBooster(targetBooster);
      localStorage.setItem("math_equipped_booster", targetBooster);
    } else if (item.category === "wallpaper") {
      const targetWallpaper = equippedWallpaper === item.id ? "" : item.id;
      setEquippedWallpaper(targetWallpaper);
      localStorage.setItem("math_equipped_wallpaper", targetWallpaper);
    }
  };

  // Define Items List with custom SVG style decorations
  const items: StoreItem[] = [
    {
      id: "glow_cyan",
      name: "Cyber Aura",
      description: "Draws an ultra-cool holographic grid of high-voltage neon cyan around your avatar!",
      cost: 45,
      category: "frame",
      icon: <Sparkles className="text-cyan-400 stroke-[2.5]" size={20} />
    },
    {
      id: "crown_gold",
      name: "Grand Crown",
      description: "Float a massive royal golden crown above your customized mathematical avatar!",
      cost: 85,
      category: "frame",
      icon: <Crown className="text-amber-400 animate-bounce fill-amber-400/20 stroke-[2.5]" size={20} />
    },
    {
      id: "shield_life",
      name: "Life Infusion",
      description: "Gives +1 Extra Heart life token automatically at game start! (Max load of 4 Hearts)",
      cost: 35,
      category: "booster",
      icon: <Shield className="text-emerald-400 fill-emerald-950/40" size={20} />
    },
    {
      id: "clock_time",
      name: "Chronos Fluid",
      description: "Injects +3 extra seconds per question, granting a massive thinking window!",
      cost: 30,
      category: "booster",
      icon: <Clock className="text-indigo-400" size={20} />
    },
    {
      id: "neon_violet",
      name: "Cosmic Pulse",
      description: "Wraps a gorgeous mystical violet neon glow cluster with spinning nebula stars!",
      cost: 65,
      category: "frame",
      icon: <Sparkles className="text-pink-400 animate-spin" size={20} />
    },
    {
      id: "theme_cyberpunk",
      name: "Neon Cyberpunk Matrix",
      description: "A gorgeous cyber neon grid background with pulsing fuchsia & cyan matrix overlays!",
      cost: 50,
      category: "wallpaper",
      icon: <Palette className="text-pink-400" size={20} />
    },
    {
      id: "theme_cosmic",
      name: "Cosmic Nebula Sky",
      description: "Spectacular outer-space background styled with spinning violet nebula clouds & blinking stars!",
      cost: 110,
      category: "wallpaper",
      icon: <Palette className="text-purple-400 animate-pulse" size={20} />
    },
    {
      id: "theme_royal",
      name: "Golden Royal Palace",
      description: "The ultimate hyper-luxurious metallic gold background with radial amber sunbursts & crown particles!",
      cost: 220,
      category: "wallpaper",
      icon: <Palette className="text-amber-400 animate-bounce" size={20} />
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full max-w-sm md:max-w-4xl lg:max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-slate-800 shadow-2xl p-4 sm:p-5 md:p-8 relative flex flex-col select-none"
        id="store-screen-card"
      >
        {/* Holographic matrix background points */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#6366f1_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>

        {/* Store Topbar Banner */}
        <div className="w-full flex items-center justify-between gap-2 z-10 mb-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <ShoppingBag className="text-indigo-400" size={18} />
            </div>
            <div className="text-left font-sans">
              <h2 className="text-lg font-black text-white uppercase tracking-wider">MATH BAZAAR</h2>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Premium Swag Shop</span>
            </div>
          </div>

          {/* Golden Coins Balance display module */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full shadow-[inset_0_1px_3px_rgba(245,158,11,0.1)] relative"
          >
            <Coins size={14} className="text-amber-400 animate-pulse fill-amber-400/20" />
            <motion.span 
              key={coins}
              initial={{ scale: 1.3, color: "#fbbf24" }}
              animate={{ scale: 1, color: "#ffffff" }}
              className="text-xs font-black font-mono text-white"
            >
              {coins}
            </motion.span>
            <span className="text-[9px] font-black text-amber-500">cr</span>
          </motion.div>
        </div>

        {/* Dynamic Responsiveness Split Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-start z-10 mt-2">
          
          {/* LEFT COLUMN: ACTIVE USER/AVATAR LIVE PREVIEW MODULE */}
          <div className="w-full flex flex-col gap-3">
            {/* Dynamic Live Avatar Preview with unlocked cosmetic framing effect */}
            <div className="w-full bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4 flex flex-col items-center justify-center mb-4 relative overflow-hidden z-10 shrink-0">
          <div className="absolute top-2 left-3 flex items-center gap-1">
            <Info size={11} className="text-slate-500" />
            <span className="text-[8px] font-black tracking-widest text-slate-500 uppercase">Live Preview</span>
          </div>

          {/* Absolute Glow animations based on selected frame ID */}
          <div className="relative p-6">
            <AnimatePresence>
              {equippedFrame === "glow_cyan" && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.15, opacity: [0.4, 0.75, 0.4] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full border-4 border-cyan-400/80 blur-md pointer-events-none z-0"
                />
              )}
              {equippedFrame === "neon_violet" && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.15, opacity: [0.5, 0.85, 0.5], rotate: 360 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-dashed border-pink-500 blur-[2px] pointer-events-none z-0"
                />
              )}
            </AnimatePresence>

            <div className="relative z-10 bg-slate-900 border border-slate-800 rounded-full p-1 shadow-lg">
              <Avatar avatarKey={selectedCharId} className="w-16 h-16" />
            </div>

            {/* Float Gold Crown above if equipped */}
            <AnimatePresence>
              {equippedFrame === "crown_gold" && (
                <motion.div
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: -6, opacity: 1 }}
                  exit={{ y: 15, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                >
                  <Crown size={26} className="text-amber-400 fill-amber-300 drop-shadow-[0_2px_10px_rgba(245,158,11,0.8)]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="text-center mt-1">
            <span className="text-[10px] font-black text-slate-400 tracking-wide uppercase">
              {equippedFrame ? "FRAME ACTIVE" : "NO COSMETIC FRAME active"}
            </span>
            {equippedWallpaper && (
              <div className="text-[9px] text-fuchsia-400 font-extrabold flex items-center justify-center gap-1 mt-0.5">
                <Check size={10} className="stroke-[3]" />
                <span>WALLPAPER: {equippedWallpaper === "theme_cyberpunk" ? "Neon Cyberpunk" : equippedWallpaper === "theme_cosmic" ? "Cosmic Nebula" : "Golden Royal"}</span>
              </div>
            )}
            {equippedBooster && (
              <div className="text-[9px] text-teal-400 font-extrabold flex items-center justify-center gap-1 mt-0.5">
                <Check size={10} className="stroke-[3]" />
                <span>BOOSTER: {equippedBooster === "shield_life" ? "Extra Heart (+1)" : "+3s Time Boost"}</span>
              </div>
            )}
          </div>
        </div>
        </div> {/* End LEFT COLUMN */}

        {/* RIGHT COLUMN: LIST OF AVAILABLE ITEMS / SHOP OFFERS */}
        <div className="w-full flex flex-col gap-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center md:text-left mb-1">
            🎁 SHOP DEALS & BOOSTERS
          </div>

          {/* Scrollable list of shop offers */}
          <div className="flex-grow h-76 max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-2.5 z-10 mb-4 no-scrollbar">
          {items.map((item) => {
            const isUnlocked = unlockedItems.includes(item.id);
            const isEquipped = equippedFrame === item.id || equippedBooster === item.id || equippedWallpaper === item.id;
            const isNotEnough = notEnoughCoinsId === item.id;
            const isSuccess = purchasedSuccessId === item.id;

            return (
              <motion.div
                key={item.id}
                layout
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 relative overflow-hidden transition-all ${
                  isEquipped 
                    ? "bg-slate-900 border-indigo-500/80 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
                    : isUnlocked
                      ? "bg-slate-905 border-slate-800"
                      : "bg-slate-950/60 border-slate-850/80 hover:border-slate-800"
                }`}
              >
                {/* Visual Icon Bubble */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                  isEquipped ? "bg-indigo-500/20" : "bg-slate-900 border border-slate-800"
                }`}>
                  {item.icon}
                </div>

                <div className="flex-grow flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-white uppercase tracking-wide leading-none">{item.name}</span>
                    <span className="text-[8px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded-full uppercase font-black tracking-widest text-[7px]">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold leading-normal mt-1 max-w-[195px]">
                    {item.description}
                  </span>
                </div>

                {/* Purchase or Equip control button */}
                <div className="shrink-0 min-w-[70px] text-right">
                  <AnimatePresence mode="wait">
                    {isSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-[9px] font-black text-emerald-400 uppercase tracking-widest text-center"
                      >
                        BOUGHT!
                      </motion.div>
                    ) : isNotEnough ? (
                      <motion.div
                        key="failed"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-[9px] font-black text-red-400 uppercase tracking-widest text-center leading-tight"
                      >
                        NO COINS!
                      </motion.div>
                    ) : isUnlocked ? (
                      <motion.button
                        key="equip"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEquipItem(item)}
                        className={`w-full py-1.5 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all border flex items-center justify-center gap-1 ${
                          isEquipped
                            ? "bg-indigo-600 text-white border-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.3)] animate-pulse"
                            : "bg-slate-800 text-slate-350 border-slate-700 hover:text-white hover:bg-slate-750"
                        }`}
                      >
                        {isEquipped ? <Check size={10} className="stroke-[3]" /> : null}
                        <span>{isEquipped ? "ACTIVE" : "EQUIP"}</span>
                      </motion.button>
                    ) : (
                      <motion.button
                        key="buy"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBuyItem(item)}
                        className="w-full py-1.5 px-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[9px] tracking-widest uppercase border border-amber-600 rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-1"
                      >
                        <Lock size={9} className="stroke-[3]" />
                        <span>{item.cost}</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
        </div> {/* End RIGHT COLUMN */}
        </div> {/* End Split Grid */}

        {/* Back and Navigation block */}
        <div className="w-full flex items-center justify-between gap-4 z-10 pt-3 border-t border-slate-800">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playClickSound();
              onNavigate(GameStage.START);
            }}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-650 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
            id="store-back-btn"
          >
            <ArrowLeft size={14} className="stroke-[3]" />
            <span>BACK TO HOME</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
