// Daily Quiz engine: exercise generation, scoring, weekly leaderboard with stacking handicap.
// All persistence is localStorage (frontend-only, matches current app architecture).

import type { Paper } from '@/contexts/AuthContext';

export interface Exercise {
  id: string;
  paper: Paper | 'General';
  question: string;
  choices: string[];
  correctIndex: number;
  basePoints: number; // before handicap
}

export interface DailyAttempt {
  userId: string;
  userName: string;
  paper: Paper | 'General';
  date: string; // YYYY-MM-DD
  weekKey: string; // YYYY-Www
  correctCount: number;
  totalCount: number;
  rawPoints: number;
  awardedPoints: number; // after handicap
  handicapPct: number; // 0, 25, 50, ...
}

export const DAILY_QUIZ_SIZE = 10;

// ---------------- Date helpers ----------------
export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

// ISO week key e.g. 2026-W19
export function weekKey(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// ---------------- Curated bank (small sample per paper) ----------------
const CURATED: Exercise[] = [
  // O Level Edexcel
  { id: 'oe1', paper: 'O Level Edexcel', question: 'Solve: 3x + 7 = 22', choices: ['x = 5', 'x = 6', 'x = 7', 'x = 8'], correctIndex: 0, basePoints: 10 },
  { id: 'oe2', paper: 'O Level Edexcel', question: 'Factorise: x² − 9', choices: ['(x−3)(x+3)', '(x−9)(x+1)', '(x−3)²', 'x(x−9)'], correctIndex: 0, basePoints: 10 },
  // O Level CIS
  { id: 'oc1', paper: 'O Level CIS', question: 'Simplify: 2(3x − 4) + 5x', choices: ['11x − 8', '6x − 8', '11x + 8', '6x − 4'], correctIndex: 0, basePoints: 10 },
  { id: 'oc2', paper: 'O Level CIS', question: 'Mean of 4, 8, 10, 14', choices: ['9', '8', '10', '11'], correctIndex: 0, basePoints: 10 },
  // Pure 1
  { id: 'p1a', paper: 'Pure 1', question: 'Discriminant of x² − 4x + 1', choices: ['12', '8', '−12', '16'], correctIndex: 0, basePoints: 12 },
  { id: 'p1b', paper: 'Pure 1', question: 'd/dx of 3x² + 2x', choices: ['6x + 2', '3x + 2', '6x', '5x'], correctIndex: 0, basePoints: 12 },
  // Pure 2
  { id: 'p2a', paper: 'Pure 2', question: 'log₂(32)', choices: ['5', '4', '6', '3'], correctIndex: 0, basePoints: 12 },
  { id: 'p2b', paper: 'Pure 2', question: 'Solve: 2^x = 16', choices: ['4', '3', '5', '2'], correctIndex: 0, basePoints: 12 },
  // Pure 3
  { id: 'p3a', paper: 'Pure 3', question: '∫ 2x dx', choices: ['x² + C', '2 + C', 'x + C', '2x² + C'], correctIndex: 0, basePoints: 14 },
  { id: 'p3b', paper: 'Pure 3', question: 'sin(π/2)', choices: ['1', '0', '−1', '½'], correctIndex: 0, basePoints: 14 },
  // Pure 4
  { id: 'p4a', paper: 'Pure 4', question: '|3 − 4i|', choices: ['5', '7', '1', '25'], correctIndex: 0, basePoints: 14 },
  { id: 'p4b', paper: 'Pure 4', question: 'd/dx of ln(x)', choices: ['1/x', 'x', 'ln(x)', 'e^x'], correctIndex: 0, basePoints: 14 },
  // M1
  { id: 'm1a', paper: 'M1', question: 'Force on 5kg with a = 2 m/s²', choices: ['10 N', '7 N', '2.5 N', '25 N'], correctIndex: 0, basePoints: 12 },
  { id: 'm1b', paper: 'M1', question: 'Momentum of 2kg at 3 m/s', choices: ['6 kg·m/s', '5 kg·m/s', '1.5 kg·m/s', '9 kg·m/s'], correctIndex: 0, basePoints: 12 },
  // S1
  { id: 's1a', paper: 'S1', question: 'P(heads) on a fair coin', choices: ['0.5', '1', '0.25', '0'], correctIndex: 0, basePoints: 10 },
  { id: 's1b', paper: 'S1', question: 'Median of 3, 7, 9, 11, 15', choices: ['9', '7', '11', '8'], correctIndex: 0, basePoints: 10 },
  // M2
  { id: 'm2a', paper: 'M2', question: 'KE of 4kg at 3 m/s', choices: ['18 J', '12 J', '36 J', '6 J'], correctIndex: 0, basePoints: 14 },
  { id: 'm2b', paper: 'M2', question: 'Work = Force × ?', choices: ['Distance', 'Time', 'Mass', 'Velocity'], correctIndex: 0, basePoints: 14 },
];

// ---------------- Generated arithmetic/algebra ----------------
function seededRand(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function shuffleChoices(correct: string, distractors: string[], rand: () => number) {
  const all = [correct, ...distractors];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return { choices: all, correctIndex: all.indexOf(correct) };
}

function generateExercise(paper: Paper | 'General', rand: () => number, idx: number): Exercise {
  const kind = Math.floor(rand() * 4);
  let question = '';
  let correct = '';
  let distractors: string[] = [];
  let basePoints = 8;

  if (kind === 0) {
    const a = 2 + Math.floor(rand() * 12);
    const b = 2 + Math.floor(rand() * 12);
    question = `Compute: ${a} × ${b}`;
    correct = String(a * b);
    distractors = [String(a * b + a), String(a * b - b), String(a * (b + 1))];
    basePoints = 8;
  } else if (kind === 1) {
    const a = 2 + Math.floor(rand() * 9);
    const b = 1 + Math.floor(rand() * 20);
    const c = a * (1 + Math.floor(rand() * 10)) + b;
    question = `Solve for x: ${a}x + ${b} = ${c}`;
    const x = (c - b) / a;
    correct = `x = ${x}`;
    distractors = [`x = ${x + 1}`, `x = ${x - 1}`, `x = ${Math.round((c + b) / a)}`];
    basePoints = 10;
  } else if (kind === 2) {
    const a = 2 + Math.floor(rand() * 9);
    const b = 2 + Math.floor(rand() * 9);
    question = `Expand: (x + ${a})(x + ${b})`;
    correct = `x² + ${a + b}x + ${a * b}`;
    distractors = [
      `x² + ${a * b}x + ${a + b}`,
      `x² + ${a + b}x + ${a + b}`,
      `x² + ${a - b}x + ${a * b}`,
    ];
    basePoints = 12;
  } else {
    const n = 2 + Math.floor(rand() * 8);
    const p = 2 + Math.floor(rand() * 4);
    question = `Differentiate: ${n}x^${p}`;
    correct = `${n * p}x^${p - 1}`;
    distractors = [`${n}x^${p - 1}`, `${n * p}x^${p}`, `${n + p}x^${p - 1}`];
    basePoints = 12;
  }

  const { choices, correctIndex } = shuffleChoices(correct, distractors, rand);
  return {
    id: `gen-${paper}-${idx}`,
    paper,
    question,
    choices,
    correctIndex,
    basePoints,
  };
}

// ---------------- Daily set: mix of curated + generated ----------------
function dateSeed(date: string, paper: Paper | 'General'): number {
  let h = 0;
  const s = date + '|' + paper;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

export function getDailyExercises(paper: Paper | 'General', date = todayKey()): Exercise[] {
  const rand = seededRand(dateSeed(date, paper));
  const curated = CURATED.filter((e) => e.paper === paper);
  const pickedCurated = [...curated]
    .sort(() => rand() - 0.5)
    .slice(0, Math.min(curated.length, Math.ceil(DAILY_QUIZ_SIZE / 3)));

  const generated: Exercise[] = [];
  let i = 0;
  while (pickedCurated.length + generated.length < DAILY_QUIZ_SIZE) {
    generated.push(generateExercise(paper, rand, i++));
  }
  return [...pickedCurated, ...generated].slice(0, DAILY_QUIZ_SIZE);
}

// ---------------- Storage ----------------
const ATTEMPTS_KEY = 'tutor-quest-quiz-attempts';
const WINNERS_KEY = 'tutor-quest-quiz-winners'; // { [paper]: { userId, streak, lastWeek } }

export function loadAttempts(): DailyAttempt[] {
  try { return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]'); } catch { return []; }
}
function saveAttempts(a: DailyAttempt[]) {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(a));
}

interface WinnerRecord { userId: string; streak: number; lastWeek: string; }
function loadWinners(): Record<string, WinnerRecord> {
  try { return JSON.parse(localStorage.getItem(WINNERS_KEY) || '{}'); } catch { return {}; }
}
function saveWinners(w: Record<string, WinnerRecord>) {
  localStorage.setItem(WINNERS_KEY, JSON.stringify(w));
}

// ---------------- Handicap (stacking, per paper) ----------------
// Look up the user's CURRENT consecutive-win streak for that paper as of last week.
// New-week winners cause streak +1; a non-win resets streak to 0.
function currentHandicapPct(userId: string, paper: Paper | 'General'): number {
  const winners = loadWinners();
  const rec = winners[paper];
  if (!rec || rec.userId !== userId) return 0;
  // Stacking: -25% per consecutive win already accumulated, capped at 90%.
  return Math.min(90, rec.streak * 25);
}

export function getUserHandicap(userId: string, paper: Paper | 'General'): number {
  return currentHandicapPct(userId, paper);
}

// ---------------- Submit attempt ----------------
export function hasAttemptedToday(userId: string, paper: Paper | 'General', date = todayKey()): boolean {
  return loadAttempts().some(a => a.userId === userId && a.paper === paper && a.date === date);
}

export function submitAttempt(params: {
  userId: string;
  userName: string;
  paper: Paper | 'General';
  exercises: Exercise[];
  answers: number[];
}): DailyAttempt {
  const { userId, userName, paper, exercises, answers } = params;
  const date = todayKey();
  const wk = weekKey();
  let correctCount = 0;
  let rawPoints = 0;
  exercises.forEach((ex, i) => {
    if (answers[i] === ex.correctIndex) {
      correctCount++;
      rawPoints += ex.basePoints;
    }
  });
  const handicapPct = currentHandicapPct(userId, paper);
  const awardedPoints = Math.round(rawPoints * (1 - handicapPct / 100));

  const attempt: DailyAttempt = {
    userId, userName, paper, date, weekKey: wk,
    correctCount, totalCount: exercises.length,
    rawPoints, awardedPoints, handicapPct,
  };
  const all = loadAttempts();
  // prevent dupes
  if (!all.some(a => a.userId === userId && a.paper === paper && a.date === date)) {
    all.push(attempt);
    saveAttempts(all);
  }
  return attempt;
}

// ---------------- Leaderboard ----------------
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalPoints: number;
  daysActive: number;
}

export function getWeeklyLeaderboard(paper: Paper | 'General', wk = weekKey()): LeaderboardEntry[] {
  const attempts = loadAttempts().filter(a => a.paper === paper && a.weekKey === wk);
  const map = new Map<string, LeaderboardEntry>();
  attempts.forEach(a => {
    const cur = map.get(a.userId) || { userId: a.userId, userName: a.userName, totalPoints: 0, daysActive: 0 };
    cur.totalPoints += a.awardedPoints;
    cur.daysActive += 1;
    cur.userName = a.userName;
    map.set(a.userId, cur);
  });
  return [...map.values()].sort((a, b) => b.totalPoints - a.totalPoints);
}

// Finalize the previous week: update winner streaks per paper.
// Call this on page load; it's idempotent per (paper, week).
const FINALIZED_KEY = 'tutor-quest-quiz-finalized';
function loadFinalized(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(FINALIZED_KEY) || '{}'); } catch { return {}; }
}
function saveFinalized(f: Record<string, string>) {
  localStorage.setItem(FINALIZED_KEY, JSON.stringify(f));
}

export function finalizePreviousWeeks() {
  const winners = loadWinners();
  const finalized = loadFinalized();
  const attempts = loadAttempts();
  const currentWk = weekKey();

  // Build all (paper, week) groups present in attempts that are NOT the current week.
  const groups = new Map<string, DailyAttempt[]>();
  attempts.forEach(a => {
    if (a.weekKey === currentWk) return;
    const k = `${a.paper}::${a.weekKey}`;
    const arr = groups.get(k) || [];
    arr.push(a);
    groups.set(k, arr);
  });

  // For each finished week, sort weeks chronologically and update streaks.
  const sortedKeys = [...groups.keys()].sort((a, b) => a.split('::')[1].localeCompare(b.split('::')[1]));
  sortedKeys.forEach((k) => {
    if (finalized[k]) return;
    const [paper, wk] = k.split('::');
    const board = (() => {
      const map = new Map<string, LeaderboardEntry>();
      groups.get(k)!.forEach(a => {
        const cur = map.get(a.userId) || { userId: a.userId, userName: a.userName, totalPoints: 0, daysActive: 0 };
        cur.totalPoints += a.awardedPoints;
        cur.daysActive += 1;
        map.set(a.userId, cur);
      });
      return [...map.values()].sort((a, b) => b.totalPoints - a.totalPoints);
    })();
    if (board.length === 0) { finalized[k] = wk; return; }
    const winner = board[0];
    const prev = winners[paper];
    if (prev && prev.userId === winner.userId) {
      winners[paper] = { userId: winner.userId, streak: prev.streak + 1, lastWeek: wk };
    } else {
      winners[paper] = { userId: winner.userId, streak: 1, lastWeek: wk };
    }
    finalized[k] = wk;
  });

  saveWinners(winners);
  saveFinalized(finalized);
}

export function getReigningChampion(paper: Paper | 'General'): { userId: string; streak: number } | null {
  const w = loadWinners()[paper];
  return w ? { userId: w.userId, streak: w.streak } : null;
}
