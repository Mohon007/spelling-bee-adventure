// Progress is stored in the browser (localStorage) and uses the Leitner
// spaced-repetition system: each word lives in a "box" 0-5.
// Right answer -> next box (comes back later). Wrong answer -> box 1 (comes back soon).

import seed from '../data/revise-start.json';
import { ALL_WORDS } from '../data/words';

const KEY = 'spelling-bee-adventure.v1';
const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;

// How long a word waits before it is due again, by box.
const WAIT = [0, 10 * MIN, 1 * DAY, 3 * DAY, 7 * DAY, 16 * DAY];

export const MAX_BOX = 5;
export const LEARNED_BOX = 3;

export function defaultState() {
  return {
    words: {},
    check: {},
    stars: 0,
    streak: { last: null, count: 0 },
    settings: { name: '', rate: 0.7, sound: true, voiceV: 2 },
  };
}

// Put the starter words (data/revise-start.json) into the Revise list once per version.
function applySeed(state) {
  const version = Number(seed?.version) || 0;
  if (!version || state.seedV === version) return state;
  const known = new Set(ALL_WORDS.map((w) => w.id));
  const now = Date.now();
  const check = { ...state.check };
  const words = { ...state.words };
  for (const raw of seed.words || []) {
    const id = String(raw).trim().toLowerCase();
    if (!known.has(id)) continue;
    const old = check[id];
    check[id] = {
      status: 'revise',
      streak: 0,
      right: old?.right || 0,
      wrong: old?.wrong || 0,
      last: old?.last || now,
      lastRightDay: null,
      due: now,
    };
    const w = words[id] || { right: 0, wrong: 0 };
    words[id] = { ...w, box: 1, due: now, last: w.last || now };
  }
  return { ...state, check, words, seedV: version };
}

export const freshState = () => applySeed(defaultState());

export function loadState() {
  return applySeed(readState());
}

function readState() {
  const base = defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw);
    // One-time switch to the new slow default voice for older saves.
    if (saved.settings && !saved.settings.voiceV) {
      saved.settings = { ...saved.settings, rate: base.settings.rate, voiceV: 2 };
    }
    return {
      ...base,
      ...saved,
      words: saved.words || {},
      check: saved.check || {},
      streak: { ...base.streak, ...(saved.streak || {}) },
      settings: { ...base.settings, ...(saved.settings || {}) },
    };
  } catch {
    return base;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage blocked (private mode). The game still works for this visit.
  }
}

export const getBox = (state, id) => state.words[id]?.box ?? 0;
export const isNew = (state, id) => !state.words[id];

// 0-3 stars shown on a word tile.
export const starsFor = (box) => (box >= 5 ? 3 : box >= 3 ? 2 : box >= 1 ? 1 : 0);

const dayKey = (time) => new Date(time).toLocaleDateString('en-CA');

function bumpStreak(streak) {
  const today = dayKey(Date.now());
  if (streak.last === today) return streak;
  const yesterday = dayKey(Date.now() - DAY);
  return { last: today, count: streak.last === yesterday ? streak.count + 1 : 1 };
}

export function streakNow(streak) {
  const today = dayKey(Date.now());
  const yesterday = dayKey(Date.now() - DAY);
  return streak.last === today || streak.last === yesterday ? streak.count : 0;
}

export function applyAnswer(state, id, correct) {
  const old = state.words[id] || { box: 0, right: 0, wrong: 0 };
  const box = correct ? Math.min(MAX_BOX, (old.box || 0) + 1) : 1;
  return {
    ...state,
    stars: state.stars + (correct ? 1 : 0),
    streak: bumpStreak(state.streak),
    words: {
      ...state.words,
      [id]: {
        box,
        due: Date.now() + WAIT[box],
        right: (old.right || 0) + (correct ? 1 : 0),
        wrong: (old.wrong || 0) + (correct ? 0 : 1),
        last: Date.now(),
      },
    },
  };
}

// First time a child meets a word in "Look & Listen".
export function applyIntroduce(state, id) {
  if (state.words[id]) return state;
  return {
    ...state,
    streak: bumpStreak(state.streak),
    words: { ...state.words, [id]: { box: 1, due: Date.now(), right: 0, wrong: 0, last: Date.now() } },
  };
}

export function countDue(state, words) {
  const now = Date.now();
  return words.filter((w) => {
    const p = state.words[w.id];
    return p && p.due <= now;
  }).length;
}

export const countAtLeast = (state, words, box) =>
  words.filter((w) => getBox(state, w.id) >= box).length;

// ---------- Ask My Kid (grown-up spelling check) ----------
// Two queues: "know" and "revise".
// A missed word goes to "revise" and comes back every day.
// It moves to "know" after being right on GRADUATE different days in a row.
// Known words come back for a check-up after 3, 7, 14, then 30 days.

export const GRADUATE = 3;
const KNOW_WAIT = [0, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY];

function startOfTomorrow() {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

export const checkStatus = (state, id) => state.check[id]?.status || 'new';

export function applyCheck(state, id, ok) {
  const old = state.check[id];
  const now = Date.now();
  const today = dayKey(now);
  let rec;
  if (ok) {
    // Count at most one correct answer per day, so learning is spaced.
    const streak = old?.lastRightDay === today ? old.streak : (old?.streak || 0) + 1;
    const status = !old || old.status === 'know' || streak >= GRADUATE ? 'know' : 'revise';
    rec = {
      status,
      streak,
      right: (old?.right || 0) + 1,
      wrong: old?.wrong || 0,
      last: now,
      lastRightDay: today,
      due: status === 'know' ? now + KNOW_WAIT[Math.min(streak, KNOW_WAIT.length - 1)] : startOfTomorrow(),
    };
  } else {
    rec = {
      status: 'revise',
      streak: 0,
      right: old?.right || 0,
      wrong: (old?.wrong || 0) + 1,
      last: now,
      lastRightDay: null,
      due: now,
    };
  }

  // A missed word also becomes due in the games (Today's Practice).
  let words = state.words;
  if (!ok) {
    const w = state.words[id] || { right: 0, wrong: 0 };
    words = { ...state.words, [id]: { ...w, box: 1, due: now, last: now } };
  }

  return {
    ...state,
    words,
    streak: bumpStreak(state.streak),
    check: { ...state.check, [id]: rec },
  };
}

// Undo: put back the records from before the last answer.
export function restoreCheck(state, id, prevCheck, prevWord) {
  const check = { ...state.check };
  const words = { ...state.words };
  if (prevCheck) check[id] = prevCheck;
  else delete check[id];
  if (prevWord) words[id] = prevWord;
  else delete words[id];
  return { ...state, check, words };
}
