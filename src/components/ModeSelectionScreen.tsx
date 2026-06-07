/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Check, FastForward, HelpCircle } from "lucide-react";
import { GameStage, OperationType } from "../types";

interface ModeSelectionScreenProps {
  onSelectOperation: (op: OperationType) => void;
  onNavigate: (stage: GameStage) => void;
}

export const ModeSelectionScreen: React.FC<ModeSelectionScreenProps> = ({
  onSelectOperation,
  onNavigate,
}) => {
  const [selectedOp, setSelectedOp] = useState<OperationType>(OperationType.ADDITION);

  const operations = [
    {
      type: OperationType.ADDITION,
      label: "ADDITION",
      symbol: "+",
      colorClass: "bg-slate-800 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.25)]",
      inactiveClass: "bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200",
      description: "Plus (+) calculations",
    },
    {
      type: OperationType.SUBTRACTION,
      label: "SUBTRACTION",
      symbol: "−",
      colorClass: "bg-slate-800 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.25)]",
      inactiveClass: "bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200",
      description: "Minus (−) calculations",
    },
    {
      type: OperationType.MULTIPLICATION,
      label: "MULTIPLICATION",
      symbol: "✕",
      colorClass: "bg-slate-800 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.25)]",
      inactiveClass: "bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200",
      description: "Times (✕) tables",
    },
    {
      type: OperationType.DIVISION,
      label: "DIVISION",
      symbol: "∕",
      colorClass: "bg-slate-800 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.25)]",
      inactiveClass: "bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200",
      description: "Sharing (∕) fractions",
    },
    {
      type: OperationType.MIXED,
      label: "ALL MIXED",
      symbol: "+ - / ✕",
      colorClass: "bg-slate-800 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.25)]",
      inactiveClass: "bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200",
      description: "Combined challenge!",
    },
  ];

  const handleContinue = () => {
    onSelectOperation(selectedOp);
    onNavigate(GameStage.GAMEPLAY);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full max-w-sm md:max-w-3xl lg:max-w-4xl mx-auto">
      {/* Mode Selection Card Container - Bento style */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-slate-800 shadow-2xl p-4 sm:p-6 md:p-8 relative flex flex-col items-center select-none"
        id="mode-selection-card"
      >
        {/* Subtle holographic grid dots */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#6366f1_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>

        {/* Title */}
        <div className="text-center mt-3 mb-6 z-10 w-full font-sans">
          <h2 className="text-2xl font-black text-white tracking-wider uppercase leading-tight">
            SELECT YOUR
            <br />
            <span className="text-xl font-extrabold text-cyan-400 tracking-widest">OPERATION</span>
          </h2>
          <div className="h-1 bg-slate-800 w-24 mx-auto rounded-full mt-2"></div>
        </div>

        {/* List of operations matching mockup list view */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 z-10 mb-6 md:max-h-none overflow-y-auto pr-1">
          {operations.map((op) => {
            const isSelected = selectedOp === op.type;
            const cardStyle = isSelected ? op.colorClass : op.inactiveClass;
            const shadowStyle = isSelected
              ? "shadow-sm border-b-6"
              : "border-b-4 hover:border-b-6 active:translate-y-0.5 hover:translate-y-[-1px]";

            return (
              <motion.button
                key={op.type}
                onClick={() => setSelectedOp(op.type)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 ${cardStyle} ${shadowStyle} text-left transition-all cursor-pointer font-sans`}
                id={`btn-op-${op.type.toLowerCase()}`}
              >
                {/* Mathematical Symbol Bubble (Left column) */}
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-inner shrink-0 ${
                  isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-950/80 text-slate-400'
                }`}>
                  {op.symbol}
                </span>

                {/* Labelling (Right column) */}
                <div className="flex-grow flex flex-col">
                  <span className={`font-extrabold text-sm tracking-wider uppercase ${
                    isSelected ? 'text-white' : 'text-slate-300'
                  }`}>
                    {op.label}
                  </span>
                  <span className={`text-[10px] font-semibold leading-normal ${
                    isSelected ? 'text-indigo-200' : 'text-slate-500'
                  }`}>
                    {op.description}
                  </span>
                </div>

                {/* Checked Badge indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-5 h-5 rounded-full bg-[#10b981] border border-white flex items-center justify-center shadow-lg shrink-0"
                  >
                    <Check size={11} className="text-white stroke-[4]" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Navigation bottom bar mimicking mockup button alignment */}
        <div className="w-full flex items-center justify-between gap-4 z-10 pt-4 border-t border-slate-800">
          {/* Back Action (Left circle button with left arrow) */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate(GameStage.START)}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl border border-b-6 border-slate-700 active:border-b-2 hover:translate-y-[-1px] active:translate-y-1 hover:shadow shadow-sm flex items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label="Back to home screen"
            id="btn-back-to-home"
          >
            <ArrowLeft size={22} className="stroke-[3]" />
          </motion.button>

          {/* Continue Action (Right rectangular green continue button) */}
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ y: 2 }}
            onClick={handleContinue}
            className="flex-grow bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-extrabold text-white text-base tracking-widest uppercase border-b-6 border-emerald-700 active:border-b-2 rounded-2xl py-3.5 shadow-[0_4px_14px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 transition-all cursor-pointer"
            id="btn-confirm-operation"
          >
            CONTINUE
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
