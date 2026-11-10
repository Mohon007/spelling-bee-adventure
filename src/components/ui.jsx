import { MODES } from '../lib/modes';
import { starsFor } from '../lib/progress';
import { sfx } from '../lib/sound';

export function RoundShell({ mode, children }) {
  const m = MODES[mode];
  return (
    <section className={`round c-${m.color}`}>
      <div className="round-tag">
        <span aria-hidden="true">{m.emoji}</span> {m.title}
      </div>
      {children}
    </section>
  );
}

export function WordPicture({ word, hidden = false, size = 'md' }) {
  if (hidden) {
    return (
      <div className={`pic pic-${size} pic-hidden`} aria-hidden="true">
        🤔
      </div>
    );
  }
  return (
    <div className={`pic pic-${size}`} aria-hidden="true">
      {word.emoji ? word.emoji : <span className="pic-letter word-font">{word.word[0]}</span>}
    </div>
  );
}

export function SyllableChips({ syllables, lit = -1 }) {
  return (
    <div className="syllables" aria-label={`${syllables.length} beats: ${syllables.join(' ')}`}>
      {syllables.map((s, k) => (
        <span key={k} className={`syl word-font ${lit === k ? 'lit' : ''}`}>
          {s}
        </span>
      ))}
      <span className="beat-count">
        {syllables.length} {syllables.length === 1 ? 'beat' : 'beats'}
      </span>
    </div>
  );
}

export function StarLevel({ box }) {
  const n = starsFor(box);
  return (
    <span className="star-level" aria-label={`${n} of 3 stars`}>
      {[0, 1, 2].map((k) => (
        <span key={k} className={k < n ? 'on' : ''}>
          ★
        </span>
      ))}
    </span>
  );
}

export function Meter({ value, max, label }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="meter" role="img" aria-label={`${value} of ${max} ${label}`}>
      <div className="meter-bar">
        <div className="meter-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="meter-text">
        {value}/{max} {label}
      </span>
    </div>
  );
}

export function FeedbackBar({ ok, children, onNext, nextLabel = 'Next ➜' }) {
  return (
    <div className={`feedback ${ok ? 'is-ok' : 'is-try'}`} role="status">
      <div className="feedback-msg">{children}</div>
      <button
        type="button"
        className="btn btn-big c-white"
        autoFocus
        onClick={() => {
          sfx.tap();
          onNext();
        }}
      >
        {nextLabel}
      </button>
    </div>
  );
}
