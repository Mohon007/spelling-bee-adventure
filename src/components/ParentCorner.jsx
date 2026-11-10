import { useState } from 'react';
import { ALL_WORDS, PACKS } from '../data/words';
import { LEARNED_BOX, MAX_BOX, countAtLeast, streakNow } from '../lib/progress';
import { canSpeak, speak } from '../lib/speech';
import { Meter } from './ui';

const SPEEDS = [
  { label: '🐢 Slow', value: 0.7 },
  { label: '🙂 Normal', value: 0.85 },
  { label: '🐇 Quick', value: 1 },
];

const SCIENCE = [
  ['Spaced repetition', 'Each word moves through 5 boxes (Leitner system). Right answers make a word come back later (1, 3, 7, 16 days). Mistakes bring it back soon. Today\'s Practice picks the words that are due.'],
  ['Retrieval practice', 'Pulling a word out of memory (spelling it, finding a letter) builds stronger memory than reading it again.'],
  ['Look, Say, Cover, Write, Check', 'Spell It follows the classic school method: see the word, say it, hide it, build it, then check each letter.'],
  ['Syllable clapping', 'Clapping beats trains phonological awareness, which helps children break long words into small parts.'],
  ['Dual coding', 'Every word is seen, heard and shown with a picture. Many senses = more memory hooks.'],
  ['Easy to hard', 'New words get recognition games first (Missing Letter, Meaning Match). Strong words get full spelling.'],
  ['Short sessions', 'About 8 words per game (5–10 minutes) keeps attention fresh. Little and often beats long and rare.'],
  ['Kind feedback', 'Helpers and second tries mean a child always finishes a word successfully, so mistakes never feel scary.'],
];

export default function ParentCorner({ state, actions, onBack }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const { settings } = state;
  const total = ALL_WORDS.length;
  const tricky = ALL_WORDS.filter((w) => (state.words[w.id]?.wrong || 0) > 0)
    .sort((a, b) => state.words[b.id].wrong - state.words[a.id].wrong)
    .slice(0, 12);

  return (
    <div className="screen parent">
      <div className="topbar">
        <button type="button" className="btn c-white" onClick={onBack}>
          ⬅ Home
        </button>
      </div>
      <h1>Grown-ups corner</h1>

      <section className="panel">
        <h2>Settings</h2>
        <label className="field">
          <span>Child's name</span>
          <input
            type="text"
            value={settings.name}
            maxLength={24}
            placeholder="Super Speller"
            onChange={(e) => actions.setSettings({ name: e.target.value })}
          />
        </label>

        <div className="field">
          <span>Voice speed</span>
          <div className="seg">
            {SPEEDS.map((sp) => (
              <button
                type="button"
                key={sp.value}
                className={settings.rate === sp.value ? 'on' : ''}
                aria-pressed={settings.rate === sp.value}
                onClick={() => actions.setSettings({ rate: sp.value })}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span>Sound effects</span>
          <div className="seg">
            <button type="button" className={settings.sound ? 'on' : ''} aria-pressed={settings.sound} onClick={() => actions.setSettings({ sound: true })}>
              🔔 On
            </button>
            <button type="button" className={!settings.sound ? 'on' : ''} aria-pressed={!settings.sound} onClick={() => actions.setSettings({ sound: false })}>
              🔕 Off
            </button>
          </div>
        </div>

        <button type="button" className="btn c-sky" onClick={() => speak('Hello! Let us learn to spell helicopter.')}>
          🔊 Test the voice
        </button>
        {!canSpeak && <p className="warn">This browser has no speech voice. Try Chrome, Edge or Safari.</p>}
      </section>

      <section className="panel">
        <h2>Progress</h2>
        <div className="stats small">
          <div className="stat"><b>{countAtLeast(state, ALL_WORDS, 1)}</b><small>words met</small></div>
          <div className="stat"><b>{countAtLeast(state, ALL_WORDS, LEARNED_BOX)}</b><small>learned</small></div>
          <div className="stat"><b>{countAtLeast(state, ALL_WORDS, MAX_BOX)}</b><small>mastered</small></div>
          <div className="stat"><b>{state.stars}</b><small>stars</small></div>
          <div className="stat"><b>{streakNow(state.streak)}</b><small>day streak</small></div>
        </div>
        <p className="muted">Total words in the game: {total}. "Learned" = box 3 or higher. "Mastered" = box 5.</p>
        <div className="pack-progress">
          {PACKS.map((p) => (
            <div key={p.id} className="pp-row">
              <span className="pp-name">{p.emoji} {p.title}</span>
              <Meter value={countAtLeast(state, p.words, LEARNED_BOX)} max={p.words.length} label="learned" />
            </div>
          ))}
        </div>
        {tricky.length > 0 && (
          <>
            <h3>Tricky words</h3>
            <div className="chip-row">
              {tricky.map((w) => (
                <span key={w.id} className="chip word-font">
                  {w.word} <small>×{state.words[w.id].wrong}</small>
                </span>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="panel">
        <h2>How it helps your child learn</h2>
        <ul className="science">
          {SCIENCE.map(([title, text]) => (
            <li key={title}>
              <b>{title}.</b> {text}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Add new words</h2>
        <p>
          Add a new JSON file to <code>src/data/packs/</code> (copy an existing one). It shows up as a new
          quest automatically. Then push to GitHub and Vercel redeploys. See <code>src/data/packs/README.md</code>.
        </p>
      </section>

      <section className="panel danger">
        <h2>Start over</h2>
        <p>This clears stars and progress on this device.</p>
        {confirmReset ? (
          <div className="action-row left">
            <button type="button" className="btn c-white" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn c-berry"
              onClick={() => {
                actions.reset();
                setConfirmReset(false);
              }}
            >
              Yes, reset everything
            </button>
          </div>
        ) : (
          <button type="button" className="btn c-white" onClick={() => setConfirmReset(true)}>
            Reset progress
          </button>
        )}
      </section>
    </div>
  );
}
