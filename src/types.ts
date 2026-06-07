/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GameStage {
  START = "START",
  OPERATION_SELECT = "OPERATION_SELECT",
  GAMEPLAY = "GAMEPLAY",
  GAME_OVER = "GAME_OVER",
  LEADERBOARD = "LEADERBOARD",
  STORE = "STORE"
}

export enum OperationType {
  ADDITION = "ADDITION",
  SUBTRACTION = "SUBTRACTION",
  MULTIPLICATION = "MULTIPLICATION",
  DIVISION = "DIVISION",
  MIXED = "MIXED"
}

export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD"
}

export interface Character {
  id: string;
  name: string;
  avatarKey: string;
  bgColor: string;
  description: string;
}

export interface Question {
  text: string;
  options: number[];
  answer: number;
  num1: number;
  num2: number;
  op: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  level: number;
  operation: string;
  characterId: string;
  date: string;
}
