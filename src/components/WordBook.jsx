import { useEffect, useMemo, useRef, useState } from 'react';
import { PACKS } from '../data/words';
import { getBox } from '../lib/progress';
import { speak, stopSpeech } from '../lib/speech';
import { sfx } from '../lib/sound';
import { plural, wait } from '../lib/utils';
import { StarLevel } from './ui';

// Word Book: every word with its syllable break and meaning, for reading.
export default function WordBook({ state, startPack = 'all', onBack }) {
  const [packId, setPackId] = useState(startPack);
  const [query, setQuery] = useState('');
  const [lit, setLit] = useState({ key: null, i: -1 });
  const run = useRef(0);

  useEffect(
    () => () => {
      run.current += 1;
      stopSpeech();
    },
    [],
  );

  const q = query.trim().toLowerCase();
  const sections = useMemo(
    () =>
      PACKS.filter((p) => packId === 'all' || p.id === packId)
        .map((pack) => ({
          pack,
          words: pack.words
            .map((w, k) => ({ w, n: k + 1 }))
            .filter(({ w }) => !q || w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q)),
        }))
        .filter((s) => s.words.length > 0),
    [packId, q],
  );
  const shown = sections.reduce((sum, s) => sum + s.words.length, 0);

  function hear(text) {
    run.current += 1;
    setLit({ key: null, i: -1 });
    speak(text);
  }

  async function clap(key, w) {
    const me = ++run.current;
    setLit({ key, i: -1 });
    await speak(w.word, { rate: 0.7 });
    for (let k = 0; k < w.syllables.length; k++) {
      if (run.current !== me) return;
      setLit({ key, i: k });
      sfx.clap();
      await wait(650);
    }
    if (run.current === me) setLit({ key: null, i: -1 });
  }

  function pickPack(id) {
    sfx.tap();
    setPackId(id);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="screen book">
      <div className="book-top">
        <button type="button" className="btn c-white" onClick={onBack}>
          ⬅ Back
        </button>
        <h1>📖 My Word Book</h1>
      </div>

      <p className="book-help">
        Tap 🔊 to hear a word. Tap the coloured parts to clap the beats! 👏
      </p>

      <input
        type="search"
        className="book-search"
        placeholder="🔍 Find a word"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Find a word"
      />

      <div className="book-filter" aria-label="Choose a quest">
        <button
          type="button"
          className={`filter-chip ${packId === 'all' ? 'on' : ''}`}
          aria-pressed={packId === 'all'}
          onClick={() => pickPack('all')}
        >
          📚 All
        </button>
        {PACKS.map((p) => (
          <button
            type="button"
            key={p.id}
            className={`filter-chip ${packId === p.id ? 'on' : ''}`}
            aria-pressed={packId === p.id}
            onClick={() => pickPack(p.id)}
          >
            {p.emoji} {p.title}
          </button>
        ))}
      </div>

      {sections.map(({ pack, words }) => (
        <section key={pack.id} className="book-section" style={{ '--c': pack.color }}>
          <div className="book-section-head">
            <span className="book-section-emoji" aria-hidden="true">{pack.emoji}</span>
            <div>
              <h2>
                {pack.title} <span className="count-pill">{words.length}</span>
              </h2>
              {pack.subtitle && <p>{pack.subtitle}</p>}
            </div>
          </div>

          <div className="book-grid">
            {words.map(({ w, n }) => {
              const key = `${pack.id}-${n}`;
              return (
                <article key={key} className="book-card">
                  <div className="book-head">
                    <span className="book-num">{n}</span>
                    <span className="book-pic" aria-hidden="true">{w.emoji || '🔤'}</span>
                    <span className="book-word word-font">{w.word}</span>
                    <button
                      type="button"
                      className="btn c-sky icon-btn"
                      onClick={() => hear(w.word)}
                      aria-label={`Hear ${w.word}`}
                    >
                      🔊
                    </button>
                  </div>

                  <button
                    type="button"
                    className="book-syls"
                    onClick={() => clap(key, w)}
                    aria-label={`Clap ${w.word}: ${w.syllables.join(', ')}`}
                  >
                    {w.syllables.map((s, k) => (
                      <span
                        key={k}
                        className={`bsyl bsyl-${k % 5} word-font ${lit.key === key && lit.i === k ? 'lit' : ''}`}
                      >
                        {s}
                      </span>
                    ))}
                    <span className="beat-count">👏 {plural(w.syllables.length, 'beat')}</span>
                  </button>

                  {w.meaning && (
                    <div className="book-meaning">
                      <p>{w.meaning}</p>
                      <button
                        type="button"
                        className="mini-btn"
                        onClick={() => hear(w.meaning)}
                        aria-label={`Hear the meaning of ${w.word}`}
                      >
                        🔊
                      </button>
                    </div>
                  )}

                  <StarLevel box={getBox(state, w.id)} />
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {shown === 0 && <p className="book-empty">No words found. Try another word! 🐝</p>}

      <div className="book-bottom">
        <button type="button" className="btn btn-big c-white" onClick={onBack}>
          ⬅ Back
        </button>
        <button
          type="button"
          className="btn btn-big c-honey"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ⬆ Top
        </button>
      </div>
    </div>
  );
}
