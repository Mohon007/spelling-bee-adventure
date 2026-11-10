// Progress is stored in the browser (localStorage) and uses the Leitner
// spaced-repetition system: each word lives in a "box" 0-5.
// Right answer -> next box (comes back later). Wrong answer -> box 1 (comes back soon).

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
    stars: 0,
    streak: { last: null, count: 0 },
    settings: { name: '', rate: 0.85, sound: true },
  };
}

export function loadState() {
  const base = defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw);
    return {
      ...base,
      ...saved,
      words: saved.words || {},
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
