/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";

interface AvatarProps {
  avatarKey: string;
  className?: string;
  animate?: boolean;
}

export const CHARACTERS_LIST = [
  {
    id: "mr-smart",
    name: "MR. SMART",
    avatarKey: "mr-smart",
    bgColor: "bg-amber-100 border-amber-300",
    description: "Likes quick addition and sharp thinking!"
  },
  {
    id: "ms-smarty",
    name: "MS. SMARTY",
    avatarKey: "ms-smarty",
    bgColor: "bg-pink-100 border-pink-300",
    description: "A subtraction and division genius!"
  },
  {
    id: "robo-calc",
    name: "ROBO-CALC",
    avatarKey: "robo-calc",
    bgColor: "bg-teal-100 border-teal-300",
    description: "Calculates answers at light speed!"
  },
  {
    id: "pencil-bot",
    name: "PENCIL-BOT",
    avatarKey: "pencil-bot",
    bgColor: "bg-yellow-100 border-yellow-300",
    description: "Always prepared to write down new equations!"
  }
];

export const Avatar: React.FC<AvatarProps> = ({ avatarKey, className = "w-24 h-24", animate = true }) => {
  const motionProps = animate
    ? {
        animate: {
          y: [0, -6, 0],
          rotate: [0, 1, -1, 0]
        },
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    : {};

  switch (avatarKey) {
    case "mr-smart":
      return (
        <motion.div {...motionProps} className={`relative flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {/* Hair back */}
            <path d="M 25 35 Q 15 20 35 15 Q 50 10 65 15 Q 85 20 75 35 C 75 35 85 45 80 55 C 75 65 65 60 65 60 L 35 60 Q 25 60 20 50 Q 15 40 25 35" fill="#5C3D2E" />
            
            {/* Neck */}
            <rect x="44" y="60" width="12" height="15" rx="3" fill="#FFE0BD" />
            
            {/* Shirt Collar */}
            <path d="M 40 72 L 50 82 L 60 72 L 64 85 L 36 85 Z" fill="#0D5C75" />
            
            {/* Face */}
            <circle cx="50" cy="46" r="23" fill="#FFD1A9" />
            
            {/* Ears */}
            <circle cx="26" cy="48" r="5" fill="#FFD1A9" />
            <circle cx="74" cy="48" r="5" fill="#FFD1A9" />
            
            {/* Spiky hair front */}
            <path d="M 27 30 C 35 25 40 18 42 22 C 45 25 47 15 54 20 C 60 25 62 16 68 24 C 74 32 73 35 73 37 C 60 30 40 30 27 30 Z" fill="#5C3D2E" />
            
            {/* Glasses rim & bridge */}
            <path d="M 29 45 L 71 45" stroke="#333" strokeWidth="2.5" />
            
            {/* Left Frame */}
            <rect x="29" y="37" width="16" height="14" rx="3" fill="none" stroke="#D32F2F" strokeWidth="3" />
            <circle cx="37" cy="44" r="3" fill="#333" />
            {/* Reflection */}
            <circle cx="35" cy="41" r="1.5" fill="#FFF" />

            {/* Right Frame */}
            <rect x="55" y="37" width="16" height="14" rx="3" fill="none" stroke="#D32F2F" strokeWidth="3" />
            <circle cx="63" cy="44" r="3" fill="#333" />
            {/* Reflection */}
            <circle cx="61" cy="41" r="1.5" fill="#FFF" />
            
            {/* Nose */}
            <path d="M 50 45 Q 48 49 50 51" fill="none" stroke="#E29F78" strokeWidth="2" strokeLinecap="round" />
            
            {/* Smile */}
            <path d="M 44 55 Q 50 61 56 55" fill="none" stroke="#D32F2F" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Pencil behind ear */}
            <path d="M 72 40 L 80 25 L 83 26 L 75 41 Z" fill="#FFDA73" />
            <path d="M 80 25 L 83 26 L 82 22 Z" fill="#E05B5B" /> {/* pencil tip */}
          </svg>
        </motion.div>
      );
    case "ms-smarty":
      return (
        <motion.div {...motionProps} className={`relative flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {/* Hair back */}
            <path d="M 18 35 Q 15 65 30 75 Q 35 78 50 78 Q 65 78 70 75 Q 85 65 82 35 C 82 20 68 12 50 12 C 32 12 18 20 18 35" fill="#F07830" />
            
            {/* Neck */}
            <rect x="44" y="62" width="12" height="15" rx="3" fill="#FFE0BD" />
            
            {/* Dress Collar */}
            <path d="M 38 74 L 50 82 L 62 74 L 66 85 L 34 85 Z" fill="#FF5E7E" />
            
            {/* Face */}
            <circle cx="50" cy="46" r="22" fill="#FFE0BD" />
            
            {/* Hair bangs */}
            <path d="M 20 34 C 25 24 35 22 50 24 C 65 22 75 24 80 34 C 80 34 80 18 50 18 C 20 18 20 34 20 34" fill="#F07830" />
            
            {/* Bow on Head */}
            <path d="M 32 20 Q 22 10 28 8 Q 38 12 33 22" fill="#E82C2C" />
            <path d="M 34 22 Q 44 12 39 10 Q 28 8 32 20" fill="#E82C2C" />
            <circle cx="33" cy="18" r="3" fill="#C61A1A" />

            {/* Glasses Round */}
            <circle cx="36" cy="45" r="8" fill="none" stroke="#5E22B0" strokeWidth="3" />
            <circle cx="36" cy="45" r="2" fill="#333" />
            <circle cx="34" cy="43" r="1" fill="#FFF" />

            <circle cx="64" cy="45" r="8" fill="none" stroke="#5E22B0" strokeWidth="3" />
            <circle cx="64" cy="45" r="2" fill="#333" />
            <circle cx="62" cy="43" r="1" fill="#FFF" />

            {/* Bridge */}
            <path d="M 44 45 L 56 45" stroke="#5E22B0" strokeWidth="2.5" />
            
            {/* Cheek blush */}
            <circle cx="28" cy="51" r="3" fill="#FF8E9E" opacity="0.6" />
            <circle cx="72" cy="51" r="3" fill="#FF8E9E" opacity="0.6" />

            {/* Nose */}
            <path d="M 50 47 Q 49 49 50 51" fill="none" stroke="#E29F78" strokeWidth="2" strokeLinecap="round" />
            
            {/* Happy mouth */}
            <path d="M 45 55 Q 50 61 55 55" fill="none" stroke="#D32F2F" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </motion.div>
      );
    case "robo-calc":
      return (
        <motion.div {...motionProps} className={`relative flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {/* Ear Antennas */}
            <line x1="20" y1="45" x2="10" y2="45" stroke="#78909C" strokeWidth="4" strokeLinecap="round" />
            <circle cx="8" cy="45" r="4" fill="#FFC107" />
            
            <line x1="80" y1="45" x2="90" y2="45" stroke="#78909C" strokeWidth="4" strokeLinecap="round" />
            <circle cx="92" cy="45" r="4" fill="#FFC107" />
            
            {/* Top antenna */}
            <line x1="50" y1="28" x2="50" y2="15" stroke="#78909C" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="11" r="5" fill="#FF5252" />
            
            {/* Neck */}
            <rect x="42" y="68" width="16" height="12" rx="2" fill="#455A64" />
            
            {/* Chassis Body */}
            <rect x="30" y="78" width="40" height="15" rx="5" fill="#37474F" />
            
            {/* Robo Head/Screen */}
            <rect x="18" y="24" width="64" height="46" rx="10" fill="#78909C" stroke="#37474F" strokeWidth="4" />
            
            {/* Inner Glowing Screen */}
            <rect x="24" y="30" width="52" height="34" rx="6" fill="#001F3F" stroke="#B0BEC5" strokeWidth="1.5" />
            
            {/* Digital Grid pattern (subtle) */}
            <line x1="26" y1="42" x2="74" y2="42" stroke="#003366" strokeWidth="1" opacity="0.3" />
            <line x1="26" y1="52" x2="74" y2="52" stroke="#003366" strokeWidth="1" opacity="0.3" />

            {/* Glowing Eyes (Happy code symbols or LEDs) */}
            {/* Left Eye LED */}
            <path d="M 32 45 Q 38 38 44 45" fill="none" stroke="#22D3EE" strokeWidth="4" strokeLinecap="round" />
            {/* Right Eye LED */}
            <path d="M 56 45 Q 62 38 68 45" fill="none" stroke="#22D3EE" strokeWidth="4" strokeLinecap="round" />
            
            {/* Glowing LED Mouth */}
            <rect x="44" y="53" width="12" height="4" rx="2" fill="#22D3EE" />
            
            {/* Tiny battery / signal icon in corners */}
            <rect x="68" y="33" width="5" height="3" rx="1" fill="#4CAF50" />
            <rect x="73" y="34" width="1" height="1" fill="#4CAF50" />
          </svg>
        </motion.div>
      );
    case "pencil-bot":
      return (
        <motion.div {...motionProps} className={`relative flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {/* Eraser Band */}
            <rect x="36" y="14" width="28" height="8" fill="#E29F9F" />
            {/* Metal Ring */}
            <rect x="34" y="22" width="32" height="6" fill="#B0BEC5" />
            
            {/* Pencil Shaft */}
            <path d="M 34 28 L 66 28 L 66 70 L 50 86 L 34 70 Z" fill="#FFD54F" />
            {/* Pencil Lead/Wood Cone */}
            <path d="M 34 70 L 66 70 L 50 86 Z" fill="#FFE082" />
            {/* Lead tip */}
            <path d="M 45 80 L 55 80 L 50 86 Z" fill="#37474F" />

            {/* Shaft Stripes */}
            <line x1="42" y1="28" x2="42" y2="70" stroke="#FFB300" strokeWidth="2" />
            <line x1="58" y1="28" x2="58" y2="70" stroke="#FFB300" strokeWidth="2" />

            {/* Glowing Robot visor / glasses */}
            <rect x="30" y="36" width="40" height="18" rx="9" fill="#2B2B2B" stroke="#B0BEC5" strokeWidth="2" />
            
            {/* Visor Screen Eyes */}
            <circle cx="42" cy="45" r="4" fill="#81C784" />
            <circle cx="42" cy="45" r="1.5" fill="#FFF" />
            
            <circle cx="58" cy="45" r="4" fill="#81C784" />
            <circle cx="58" cy="45" r="1.5" fill="#FFF" />
            
            {/* Cute digital blush */}
            <line x1="34" y1="50" x2="38" y2="50" stroke="#FF5252" strokeWidth="1.5" opacity="0.7" />
            <line x1="62" y1="50" x2="66" y2="50" stroke="#FF5252" strokeWidth="1.5" opacity="0.7" />

            {/* Happy curved robot mouth line */}
            <path d="M 46 62 Q 50 66 54 62" fill="none" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>
      );
    default:
      return null;
  }
};
