/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, OperationType } from "../types";

/**
 * Generates a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a mathematical question with balanced options based on level and operation
 */
export function generateQuestion(operation: OperationType, level: number): Question {
  let num1 = 0;
  let num2 = 0;
  let answer = 0;
  let opSymbol = "";
  let currentOp = operation;

  // If Mixed, pick a random core operation
  if (operation === OperationType.MIXED) {
    const ops = [
      OperationType.ADDITION,
      OperationType.SUBTRACTION,
      OperationType.MULTIPLICATION,
      OperationType.DIVISION,
    ];
    // Don't introduce division/multiplication too heavily on level 1 mixed to keep a nice tutorial ramp
    if (level === 1) {
      currentOp = Math.random() > 0.6 ? OperationType.SUBTRACTION : OperationType.ADDITION;
    } else {
      currentOp = ops[randomInt(0, ops.length - 1)];
    }
  }

  switch (currentOp) {
    case OperationType.ADDITION:
      opSymbol = "+";
      if (level <= 2) {
        num1 = randomInt(1, 9);
        num2 = randomInt(1, 9);
      } else if (level <= 5) {
        num1 = randomInt(5, 19);
        num2 = randomInt(3, 15);
      } else if (level <= 8) {
        num1 = randomInt(10, 49);
        num2 = randomInt(10, 39);
      } else {
        num1 = randomInt(20, 99);
        num2 = randomInt(20, 99);
      }
      answer = num1 + num2;
      break;

    case OperationType.SUBTRACTION:
      opSymbol = "-";
      if (level <= 2) {
        num1 = randomInt(3, 10);
        num2 = randomInt(1, num1); // Ensure non-negative answers for kids
      } else if (level <= 5) {
        num1 = randomInt(10, 25);
        num2 = randomInt(1, num1);
      } else if (level <= 8) {
        num1 = randomInt(20, 75);
        num2 = randomInt(5, num1);
      } else {
        num1 = randomInt(50, 150);
        num2 = randomInt(10, num1);
      }
      answer = num1 - num2;
      break;

    case OperationType.MULTIPLICATION:
      opSymbol = "✕";
      if (level <= 2) {
        // Simple 1x, 2x, 5x tables
        const multipliers = [1, 2, 5];
        num1 = multipliers[randomInt(0, multipliers.length - 1)];
        num2 = randomInt(1, 10);
      } else if (level <= 5) {
        num1 = randomInt(2, 6);
        num2 = randomInt(2, 9);
      } else if (level <= 8) {
        num1 = randomInt(3, 9);
        num2 = randomInt(3, 9);
      } else {
        num1 = randomInt(4, 12);
        num2 = randomInt(4, 12);
      }
      // Swap positions set randomly
      if (Math.random() > 0.5) {
        const temp = num1;
        num1 = num2;
        num2 = temp;
      }
      answer = num1 * num2;
      break;

    case OperationType.DIVISION:
      opSymbol = "/"; // In game UI, can render division symbol as "÷" or "/"
      if (level <= 2) {
        // Divide by 2, 3 or 5
        const divisors = [2, 5];
        num2 = divisors[randomInt(0, divisors.length - 1)];
        answer = randomInt(1, 8);
        num1 = answer * num2;
      } else if (level <= 5) {
        num2 = randomInt(2, 6);
        answer = randomInt(1, 10);
        num1 = answer * num2;
      } else if (level <= 8) {
        num2 = randomInt(3, 9);
        answer = randomInt(2, 10);
        num1 = answer * num2;
      } else {
        num2 = randomInt(4, 12);
        answer = randomInt(3, 12);
        num1 = answer * num2;
      }
      break;
  }

  // Generate 3 unique distractor options that are mathematically relevant
  const optionsSet = new Set<number>();
  optionsSet.add(answer);

  // Distractors candidate filters
  const generateDistractor = (): number => {
    let dev = 0;
    const rng = Math.random();

    if (currentOp === OperationType.ADDITION || currentOp === OperationType.SUBTRACTION) {
      if (rng < 0.3) {
        dev = Math.random() > 0.5 ? 1 : -1;
      } else if (rng < 0.6) {
        dev = Math.random() > 0.5 ? 2 : -2;
      } else if (rng < 0.8) {
        dev = Math.random() > 0.5 ? 10 : -10;
      } else {
        dev = randomInt(-5, 5);
      }
    } else {
      // Multiplication / Division
      if (rng < 0.4) {
        dev = num2; // Off by num2
      } else if (rng < 0.7) {
        dev = num1; // Off by num1
      } else {
        dev = Math.random() > 0.5 ? 1 : -1;
      }
      if (dev === 0) dev = 1;
      dev = Math.random() > 0.5 ? dev : -dev;
    }

    let cand = answer + dev;

    // Boundary conditions
    if (cand < 0) cand = answer + Math.abs(dev);
    if (cand === answer) cand = answer + randomInt(1, 3);

    return cand;
  };

  // Keep populating until we have 4 options
  let safetyLoop = 0;
  while (optionsSet.size < 4 && safetyLoop < 100) {
    safetyLoop++;
    const cand = generateDistractor();
    optionsSet.add(cand);
  }

  // Fallback if unable to find 4 unique options in safety window
  if (optionsSet.size < 4) {
    let offset = 1;
    while (optionsSet.size < 4) {
      optionsSet.add(answer + offset);
      offset++;
    }
  }

  // Shuffle options
  const options = Array.from(optionsSet);
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    text: `${num1} ${opSymbol === "/" ? "÷" : opSymbol} ${num2}`,
    options,
    answer,
    num1,
    num2,
    op: opSymbol,
  };
}
