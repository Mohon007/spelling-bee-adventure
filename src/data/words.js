// Every *.json file in ./packs becomes a word pack automatically.
// To add new words, drop a new JSON file in ./packs (see ./packs/README.md).
const files = import.meta.glob('./packs/*.json', { eager: true });

function cleanWord(raw, packId) {
  if (!raw || typeof raw.word !== 'string' || !raw.word.trim()) return null;
  const word = raw.word.trim();
  const sylText = typeof raw.syllables === 'string' && raw.syllables.trim() ? raw.syllables : word;
  const syllables = sylText.split('-').map((s) => s.trim()).filter(Boolean);
  return {
    id: word.toLowerCase(),
    word,
    syllables: syllables.length ? syllables : [word],
    meaning: typeof raw.meaning === 'string' ? raw.meaning.trim() : '',
    emoji: typeof raw.emoji === 'string' ? raw.emoji.trim() : '',
    packId,
  };
}

export const PACKS = Object.entries(files)
  .map(([path, mod]) => {
    const p = mod.default ?? mod;
    const id = p.id || path.split('/').pop().replace(/\.json$/, '');
    const words = (Array.isArray(p.words) ? p.words : [])
      .map((w) => cleanWord(w, id))
      .filter(Boolean);
    return {
      id,
      title: p.title || id,
      subtitle: p.subtitle || '',
      group: p.group || 'My New Words',
      emoji: p.emoji || '📚',
      color: p.color || '#4D9DE0',
      order: Number.isFinite(p.order) ? p.order : 999,
      words,
    };
  })
  .filter((p) => p.words.length > 0)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

// One entry per spelling, so progress is shared if a word is in two packs.
const byId = new Map();
for (const pack of PACKS) {
  for (const w of pack.words) if (!byId.has(w.id)) byId.set(w.id, w);
}
export const ALL_WORDS = [...byId.values()];

export const GROUPS = [...new Set(PACKS.map((p) => p.group))];

export const getPack = (id) => PACKS.find((p) => p.id === id);
