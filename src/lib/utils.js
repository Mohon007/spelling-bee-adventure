export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const sample = (list) => list[Math.floor(Math.random() * list.length)];

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
export const VOWELS = ['a', 'e', 'i', 'o', 'u'];

// Lowercase letters only, used for spelling checks.
export const lettersOf = (word) => word.toLowerCase().replace(/[^a-z]/g, '');

export function pickDistractors(target, pool, count) {
  const seen = new Set([target.word.toLowerCase()]);
  const out = [];
  for (const w of shuffle(pool)) {
    const key = w.word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(w);
    if (out.length >= count) break;
  }
  return out;
}

export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
