/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TranslationSet } from "./translations";

export interface DailyMission {
  id: number;
  translationKey: "missionSolvedDesc" | "missionScoreDesc" | "missionComboDesc" | "missionAccuracyDesc";
  target: number;
  reward: number;
  progressKey: string;
  claimedKey: string;
}

export const DAILY_MISSIONS: DailyMission[] = [
  {
    id: 1,
    translationKey: "missionSolvedDesc",
    target: 10,
    reward: 35,
    progressKey: "math_mission_progress_1",
    claimedKey: "math_mission_claimed_1",
  },
  {
    id: 2,
    translationKey: "missionScoreDesc",
    target: 150,
    reward: 45,
    progressKey: "math_mission_progress_2",
    claimedKey: "math_mission_claimed_2",
  },
  {
    id: 3,
    translationKey: "missionComboDesc",
    target: 5,
    reward: 25,
    progressKey: "math_mission_progress_3",
    claimedKey: "math_mission_claimed_3",
  },
  {
    id: 4,
    translationKey: "missionAccuracyDesc",
    target: 1,
    reward: 40,
    progressKey: "math_mission_progress_4",
    claimedKey: "math_mission_claimed_4",
  },
];

/**
 * Checks if the current local date matches the logged date.
 * If not, resets progress and claimed keys of all daily missions.
 */
export function checkAndResetDailyMissions() {
  try {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const lastMissionsDate = localStorage.getItem("math_missions_date");

    if (lastMissionsDate !== todayStr) {
      // Reset progress and claimed keys for all missions
      DAILY_MISSIONS.forEach((m) => {
        localStorage.setItem(m.progressKey, "0");
        localStorage.setItem(m.claimedKey, "false");
      });
      localStorage.setItem("math_missions_date", todayStr);
    }
  } catch (e) {
    console.error("Error in checkAndResetDailyMissions", e);
  }
}

/**
 * Updates daily mission progresses on session gameplay completion.
 */
export function updateDailyMissionsOnGameEnd(
  score: number,
  level: number,
  questions: Array<{
    question: string;
    correctAnswer: number;
    playerAnswer: number;
    wasCorrect: boolean;
  }>
) {
  try {
    // Check/Reset before modifying any values today
    checkAndResetDailyMissions();

    if (!questions || questions.length === 0) return;

    // Mission 1: Correct solved math queries (cumulative)
    const sessionSolved = questions.filter((q) => q.wasCorrect).length;
    const oldSolved = parseInt(localStorage.getItem(DAILY_MISSIONS[0].progressKey) || "0", 10);
    localStorage.setItem(DAILY_MISSIONS[0].progressKey, (oldSolved + sessionSolved).toString());

    // Mission 2: Max Single Game Score (high watermark)
    const oldScore = parseInt(localStorage.getItem(DAILY_MISSIONS[1].progressKey) || "0", 10);
    if (score > oldScore) {
      localStorage.setItem(DAILY_MISSIONS[1].progressKey, score.toString());
    }

    // Mission 3: Max Single Game Combo (high watermark)
    let sessionMaxCombo = 0;
    let currentCombo = 0;
    questions.forEach((q) => {
      if (q.wasCorrect) {
        currentCombo++;
        if (currentCombo > sessionMaxCombo) {
          sessionMaxCombo = currentCombo;
        }
      } else {
        currentCombo = 0;
      }
    });

    const oldCombo = parseInt(localStorage.getItem(DAILY_MISSIONS[2].progressKey) || "0", 10);
    if (sessionMaxCombo > oldCombo) {
      localStorage.setItem(DAILY_MISSIONS[2].progressKey, sessionMaxCombo.toString());
    }

    // Mission 4: High Accuracy (80%+ solved accurately with at least 5 answers)
    const attemptedCount = questions.length;
    if (attemptedCount >= 5) {
      const accuracy = sessionSolved / attemptedCount;
      if (accuracy >= 0.8) {
        localStorage.setItem(DAILY_MISSIONS[3].progressKey, "1");
      }
    }
  } catch (e) {
    console.error("Error in updateDailyMissionsOnGameEnd", e);
  }
}

/**
 * Claims reward coins for a completed mission.
 */
export function claimMissionReward(id: number): { success: boolean; reward: number; error?: string } {
  try {
    const m = DAILY_MISSIONS.find((mission) => mission.id === id);
    if (!m) return { success: false, reward: 0, error: "Mission not found" };

    const progress = parseInt(localStorage.getItem(m.progressKey) || "0", 10);
    const isClaimed = localStorage.getItem(m.claimedKey) === "true";

    if (isClaimed) {
      return { success: false, reward: 0, error: "Already claimed" };
    }

    if (progress < m.target) {
      return { success: false, reward: 0, error: "Not completed" };
    }

    // Mark as claimed
    localStorage.setItem(m.claimedKey, "true");

    // Add Coins
    const currentCoins = parseInt(localStorage.getItem("math_coins") || "100", 10);
    const nextCoins = currentCoins + m.reward;
    localStorage.setItem("math_coins", nextCoins.toString());

    return { success: true, reward: m.reward };
  } catch (e) {
    console.error("Error in claimMissionReward", e);
    return { success: false, reward: 0, error: "Error claiming reward" };
  }
}
