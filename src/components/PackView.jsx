import { Meter, StarLevel } from './ui';
import { MODES, MODE_ORDER } from '../lib/modes';
import { LEARNED_BOX, countAtLeast, getBox } from '../lib/progress';

export default function PackView({ pack, state, onBack, onMode, onWord, onBook }) {
  const learned = countAtLeast(state, pack.words, LEARNED_BOX);

  return (
    <div className="screen">
      <div className="topbar">
        <button type="button" className="btn c-white" onClick={onBack}>
          ⬅ Home
        </button>
        <button type="button" className="btn c-honey" onClick={onBook}>
          📖 Read words
        </button>
      </div>

      <header className="pack-hero" style={{ '--c': pack.color }}>
        <span className="pack-hero-emoji" aria-hidden="true">{pack.emoji}</span>
        <div className="pack-hero-text">
          <p className="eyebrow">{pack.group}</p>
          <h1>{pack.title}</h1>
          <p>{pack.subtitle}</p>
          <Meter value={learned} max={pack.words.length} label="learned" />
        </div>
      </header>

      <h2 className="section-title">Pick a game</h2>
      <div className="mode-grid">
        {MODE_ORDER.map((m) => (
          <button type="button" key={m} className={`mode-card c-${MODES[m].color}`} onClick={() => onMode(m)}>
            <span className="mode-emoji" aria-hidden="true">{MODES[m].emoji}</span>
            <b>{MODES[m].title}</b>
            <small>{MODES[m].blurb}</small>
          </button>
        ))}
      </div>

      <h2 className="section-title">
        Words <span className="count-pill">{pack.words.length}</span>
      </h2>
      <p className="hint-text">Tap a word to hear it and learn it.</p>
      <div className="word-grid">
        {pack.words.map((w, k) => {
          const box = getBox(state, w.id);
          return (
            <button
              type="button"
              key={`${w.id}-${k}`}
              className={`word-tile ${box >= LEARNED_BOX ? 'is-learned' : ''}`}
              onClick={() => onWord(w)}
            >
              <span className="wt-pic" aria-hidden="true">{w.emoji || '🔤'}</span>
              <span className="wt-word word-font">{w.word}</span>
              <StarLevel box={box} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
