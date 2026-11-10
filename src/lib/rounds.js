import { getBox, isNew } from './progress';
import { sample, shuffle } from './utils';

const dueOf = (state, id) => state.words[id]?.due ?? 0;

// Words that need help come first, then new words, then strong words.
const rank = (state, id) => {
  const box = getBox(state, id);
  return box === 0 ? 2.5 : box;
};

// Easy games for new words, full spelling once a word is getting strong.
export function quizModeFor(box) {
  if (box <= 1) return sample(['missing', 'meaning']);
  if (box === 2) return sample(['missing', 'spell']);
  return 'spell';
}

export function pickToLearn(state, words, n = 6) {
  const fresh = words.filter((w) => isNew(state, w.id));
  const list = fresh.length ? fresh : [...words].sort((a, b) => getBox(state, a.id) - getBox(state, b.id));
  return list.slice(0, n);
}

export function pickForPack(state, words, n = 8) {
  const sorted = shuffle(words).sort(
    (a, b) => rank(state, a.id) - rank(state, b.id) || dueOf(state, a.id) - dueOf(state, b.id),
  );
  return shuffle(sorted.slice(0, n));
}

// Today's Practice: due words first, a few new words, then weakest words.
export function pickPractice(state, allWords, n = 8, maxNew = 3) {
  const now = Date.now();
  const picked = allWords
    .filter((w) => !isNew(state, w.id) && dueOf(state, w.id) <= now)
    .sort((a, b) => dueOf(state, a.id) - dueOf(state, b.id))
    .slice(0, n);

  const fresh = allWords.filter((w) => isNew(state, w.id));
  picked.push(...fresh.slice(0, Math.min(maxNew, n - picked.length)));

  if (picked.length < n) {
    const ids = new Set(picked.map((w) => w.id));
    const rest = allWords
      .filter((w) => !isNew(state, w.id) && !ids.has(w.id))
      .sort((a, b) => getBox(state, a.id) - getBox(state, b.id) || dueOf(state, a.id) - dueOf(state, b.id));
    picked.push(...rest.slice(0, n - picked.length));
  }
  if (picked.length < n) {
    const ids = new Set(picked.map((w) => w.id));
    picked.push(...fresh.filter((w) => !ids.has(w.id)).slice(0, n - picked.length));
  }
  return shuffle(picked);
}

export function practiceRounds(state, allWords) {
  const words = pickPractice(state, allWords);
  const learn = words.filter((w) => isNew(state, w.id)).map((word) => ({ mode: 'learn', word }));
  const quiz = shuffle(words).map((word) => ({ mode: quizModeFor(getBox(state, word.id)), word }));
  return [...learn, ...quiz];
}

export function packRounds(state, pack, mode) {
  const words = mode === 'learn' ? pickToLearn(state, pack.words) : pickForPack(state, pack.words);
  return words.map((word) => ({ mode, word }));
}
