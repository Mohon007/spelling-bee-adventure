import { useEffect, useMemo, useState } from 'react';
import { ALL_WORDS, PACKS, getPack } from '../data/words';
import { GRADUATE, applyCheck } from '../lib/progress';
import { speak, stopSpeech } from '../lib/speech';
import { sfx } from '../lib/sound';
import { plural, shuffle } from '../lib/utils';
import Bee from './Bee';
import Confetti from './Confetti';
import FairyRescue, { rescueNeed } from './FairyRescue';
import { SyllableChips, WordPicture } from './ui';

const WORD = new Map(ALL_WORDS.map((w) => [w.id, w]));

const KINDS = [
  { key: 'revise', emoji: '🔁', title: 'Revise words', blurb: 'Words your child missed. Ask these the most.' },
  { key: 'due', emoji: '⏰', title: 'Due today', blurb: 'Revise words + known words ready for a check-up.' },
  { key: 'fresh', emoji: '❓', title: 'Not asked yet', blurb: 'Find out which words your child already knows.' },
  { key: 'all', emoji: '📚', title: 'All words', blurb: 'Every word in the list you picked.' },
];

const SIZES = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: 'All', value: 0 },
];

const REASK_GAP = 3; // a missed word comes back after 3 other words
const MAX_REASK = 2; // at most 2 extra tries per word in one session

const SCIENCE = [
  ['Testing effect', 'Spelling a word from memory builds stronger memory than reading it again.'],
  ['Feedback right away', 'After a miss, your child sees and hears the right spelling at once.'],
  ['Relearning', `A missed word comes back after ${REASK_GAP} other words, then every day, until it is right on ${GRADUATE} different days.`],
  ['Spaced check-ups', 'Known words come back after 3, 7, 14, then 30 days, so they are not forgotten.'],
  ['Mixed order', 'Shuffled words stop your child guessing from the order.'],
  ['Short sets', '10–20 words at a time keeps attention fresh. Little and often works best.'],
];

function wordsIn(packId) {
  if (packId === 'all') return ALL_WORDS;
  const seen = new Set();
  return (getPack(packId)?.words || []).filter((w) => !seen.has(w.id) && seen.add(w.id));
}

function buildLists(state, words) {
  const now = Date.now();
  const rec = (id) => state.check[id];
  const revise = words
    .filter((w) => rec(w.id)?.status === 'revise')
    .sort((a, b) => rec(b.id).wrong - rec(a.id).wrong || rec(a.id).last - rec(b.id).last);
  const know = words.filter((w) => rec(w.id)?.status === 'know');
  const fresh = words.filter((w) => !rec(w.id));
  const due = [
    ...revise.filter((w) => rec(w.id).due <= now),
    ...know.filter((w) => rec(w.id).due <= now).sort((a, b) => rec(a.id).due - rec(b.id).due),
  ];
  return { revise, know, fresh, due, all: words };
}

function Dots({ streak }) {
  return (
    <span className="dots" aria-label={`${streak} of ${GRADUATE} days right`}>
      {Array.from({ length: GRADUATE }, (_, k) => (
        <span key={k} className={k < streak ? 'on' : ''} />
      ))}
    </span>
  );
}

export default function AskMyKid({ state, actions, onBack, onPlay }) {
  const [packId, setPackId] = useState('all');
  const [kind, setKind] = useState(() => {
    const l = buildLists(state, ALL_WORDS);
    return l.due.length ? 'due' : l.fresh.length ? 'fresh' : 'all';
  });
  const [size, setSize] = useState(20);
  const [mix, setMix] = useState(true);
  const [tab, setTab] = useState('revise');

  const [run, setRun] = useState(null);
  const [reveal, setReveal] = useState(false);
  const [miss, setMiss] = useState(false);
  const [burst, setBurst] = useState(0);

  const words = useMemo(() => wordsIn(packId), [packId]);
  const lists = useMemo(() => buildLists(state, words), [state, words]);

  const current = run && run.pos < run.queue.length ? WORD.get(run.queue[run.pos]) : null;
  const finished = Boolean(run) && !current;

  // Say each new word out loud.
  useEffect(() => {
    if (!current) return undefined;
    setReveal(false);
    setMiss(false);
    const t = setTimeout(() => speak(current.word), 300);
    return () => clearTimeout(t);
  }, [run?.pos, current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (finished) sfx.win();
  }, [finished]);

  useEffect(() => () => stopSpeech(), []);

  // ---------- Session actions ----------
  function startRun(ids, title) {
    if (!ids.length) return;
    sfx.tap();
    setRun({
      title,
      queue: ids,
      pos: 0,
      right: 0,
      wrong: 0,
      reasks: {},
      missed: [],
      graduated: [],
      history: [],
      need: rescueNeed(ids.length),
      lastOk: null,
    });
    window.scrollTo({ top: 0 });
  }

  function startFromSetup() {
    const list = lists[kind];
    const ranked = kind === 'revise' || kind === 'due';
    let ordered = !ranked && mix ? shuffle(list) : list;
    ordered = size ? ordered.slice(0, size) : ordered;
    if (ranked && mix) ordered = shuffle(ordered);
    startRun(ordered.map((w) => w.id), KINDS.find((k) => k.key === kind).title);
  }

  function answer(ok) {
    if (!current || miss) return;
    const id = current.id;
    const prevCheck = state.check[id];
    const prevWord = state.words[id];
    const after = applyCheck(state, id, ok).check[id];
    actions.checkAnswer(id, ok);

    const graduated = ok && prevCheck?.status === 'revise' && after.status === 'know';
    let queue = run.queue;
    const reasks = { ...run.reasks };
    if (!ok && (reasks[id] || 0) < MAX_REASK) {
      queue = [...queue];
      queue.splice(Math.min(run.pos + 1 + REASK_GAP, queue.length), 0, id);
      reasks[id] = (reasks[id] || 0) + 1;
    }
    const next = {
      ...run,
      queue,
      reasks,
      right: run.right + (ok ? 1 : 0),
      wrong: run.wrong + (ok ? 0 : 1),
      missed: !ok && !run.missed.includes(id) ? [...run.missed, id] : run.missed,
      graduated: graduated ? [...run.graduated, id] : run.graduated,
      history: [...run.history, { run, id, prevCheck, prevWord }],
      lastOk: ok,
    };

    if (ok) {
      sfx.correct();
      if (run.right + 1 === run.need) setTimeout(() => sfx.sparkle(), 300);
      setBurst((b) => b + 1);
      setRun({ ...next, pos: run.pos + 1 });
    } else {
      sfx.oops();
      setRun(next);
      setMiss(true);
      setReveal(true);
      speak(`${current.word} is spelled ${[...current.word.replace(/[^a-z]/gi, '')].map((c) => c.toUpperCase()).join(', ')}. ${current.word}.`);
    }
  }

  function nextWord() {
    sfx.tap();
    setMiss(false);
    setRun((r) => ({ ...r, pos: r.pos + 1 }));
  }

  function undo() {
    const last = run?.history[run.history.length - 1];
    if (!last) return;
    stopSpeech();
    actions.restoreCheck(last.id, last.prevCheck, last.prevWord);
    setRun(last.run);
    setMiss(false);
    setReveal(false);
  }

  function stopRun() {
    stopSpeech();
    setRun(null);
  }

  // Keyboard: → / Enter = got it, ← = not yet, Space = say word, Backspace = undo.
  useEffect(() => {
    if (!run || finished) return undefined;
    const onKey = (e) => {
      const onControl = e.target.closest?.('button, input, textarea, select');
      if (miss) {
        if (e.key === 'ArrowRight' || (e.key === 'Enter' && !onControl)) {
          e.preventDefault();
          nextWord();
        }
        return;
      }
      if (e.key === 'ArrowRight' || (e.key === 'Enter' && !onControl)) {
        e.preventDefault();
        answer(true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        answer(false);
      } else if (e.key === ' ' && !onControl) {
        e.preventDefault();
        speak(current.word);
      } else if (e.key === 'Backspace' && !onControl) {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ---------- Views ----------
  if (run && !finished) {
    const rec = state.check[current.id];
    const status = rec?.status || 'new';
    const askedBefore = run.history.some((h) => h.id === current.id);
    const pct = Math.round((run.pos / run.queue.length) * 100);

    return (
      <div className="screen ask">
        <div className="session-top">
          <button type="button" className="btn c-white" onClick={stopRun}>
            ⬅ Stop
          </button>
          <div className="track" role="progressbar" aria-valuemin={0} aria-valuemax={run.queue.length} aria-valuenow={run.pos}>
            <div className="track-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="track-count">
            {run.pos + 1}/{run.queue.length}
          </span>
        </div>

        <div className="ask-bar">
          <span className="tally ok">✓ {run.right}</span>
          <span className="tally no">✗ {run.wrong}</span>
          <button type="button" className="btn c-white ask-undo" onClick={undo} disabled={!run.history.length}>
            ↶ Undo
          </button>
        </div>

        <FairyRescue
          need={run.need}
          got={run.right}
          wrong={run.wrong}
          mood={run.lastOk === null ? null : run.lastOk ? 'happy' : 'oops'}
        />

        <section className={`ask-card ${miss ? 'is-miss' : ''}`}>
          <div className="ask-tags">
            {status === 'new' && <span className="tag tag-new">❓ New word</span>}
            {status === 'know' && <span className="tag tag-know">✅ Known word · check-up</span>}
            {status === 'revise' && (
              <span className="tag tag-revise">
                🔁 Revise word <Dots streak={rec.streak} />
              </span>
            )}
            {askedBefore && <span className="tag tag-again">Again!</span>}
          </div>

          <WordPicture word={current} size="lg" />

          {!miss && <p className="ask-say">Say the word, then ask: “Can you spell it?”</p>}

          <div className="action-row">
            <button type="button" className="btn btn-big c-sky" onClick={() => speak(current.word)}>
              🔊 Say the word
            </button>
            {current.meaning && (
              <button type="button" className="btn c-grape" onClick={() => speak(current.meaning)}>
                📖 Meaning
              </button>
            )}
          </div>

          {reveal ? (
            <div className="ask-reveal">
              <div className="big-word word-font">{current.word}</div>
              <SyllableChips syllables={current.syllables} />
              {current.meaning && <p className="meaning">{current.meaning}</p>}
            </div>
          ) : (
            <button type="button" className="peek-btn" onClick={() => setReveal(true)}>
              👁 Show word (for grown-up)
            </button>
          )}
        </section>

        {miss ? (
          <div className="feedback is-try">
            <div className="feedback-msg">
              Let's learn it! <b>{current.word}</b> goes to the Revise list and comes back soon. 💪
            </div>
            <button type="button" className="btn btn-big c-white" autoFocus onClick={nextWord}>
              Next ➜
            </button>
          </div>
        ) : (
          <div className="ask-answers">
            <button type="button" className="answer-btn no" onClick={() => answer(false)}>
              <span aria-hidden="true">✗</span> Not yet
            </button>
            <button type="button" className="answer-btn yes" onClick={() => answer(true)}>
              <span aria-hidden="true">✓</span> Got it!
            </button>
          </div>
        )}
        <p className="key-help">Keyboard: → got it · ← not yet · Space say word · Backspace undo</p>
        <Confetti trigger={burst} />
      </div>
    );
  }

  if (run && finished) {
    const missedWords = run.missed.map((id) => WORD.get(id));
    const gradWords = run.graduated.map((id) => WORD.get(id));
    const firstTry = run.queue.length - Object.values(run.reasks).reduce((a, b) => a + b, 0);
    return (
      <div className="screen ask">
        <div className="results">
          {run.need ? (
            <FairyRescue need={run.need} got={run.right} wrong={run.wrong} big ended />
          ) : (
            <Bee size={130} cheer className="bob" />
          )}
          <h1>{run.wrong === 0 ? 'Wow! Every word right!' : 'Check-up done! Great effort!'}</h1>
          <div className="ask-score">
            <span className="tally ok">✓ {run.right} got it</span>
            <span className="tally no">✗ {run.wrong} not yet</span>
          </div>
          <p className="results-line">{plural(firstTry, 'word')} asked.</p>

          {gradWords.length > 0 && (
            <div className="again-box ok-box">
              <h2>🎓 Moved to Knows</h2>
              <div className="chip-row">
                {gradWords.map((w) => (
                  <button type="button" key={w.id} className="chip word-font" onClick={() => speak(w.word)}>
                    {w.emoji} {w.word}
                  </button>
                ))}
              </div>
            </div>
          )}

          {missedWords.length > 0 && (
            <div className="again-box">
              <h2>🔁 In the Revise list ({missedWords.length})</h2>
              <div className="chip-row">
                {missedWords.map((w) => (
                  <button type="button" key={w.id} className="chip word-font" onClick={() => speak(w.word)}>
                    {w.emoji} {w.word} 🔊
                  </button>
                ))}
              </div>
              <p className="muted small-note">
                These come back every day until they are right on {GRADUATE} different days.
              </p>
            </div>
          )}

          <div className="action-row">
            {missedWords.length > 0 && (
              <>
                <button type="button" className="btn btn-big c-berry" onClick={() => startRun(shuffle(run.missed), 'Revise again')}>
                  🔁 Ask these again
                </button>
                <button type="button" className="btn btn-big c-grass" onClick={() => onPlay(missedWords)}>
                  🎮 Play games with these
                </button>
              </>
            )}
          </div>
          <div className="action-row">
            <button type="button" className="btn c-white" onClick={undo}>
              ↶ Undo last
            </button>
            <button type="button" className="btn c-honey" onClick={stopRun}>
              ⬅ Back to lists
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Setup ----------
  const selected = lists[kind];
  const count = size ? Math.min(size, selected.length) : selected.length;
  const tabList = { revise: lists.revise, know: lists.know, fresh: lists.fresh }[tab];

  return (
    <div className="screen ask">
      <div className="book-top">
        <button type="button" className="btn c-white" onClick={onBack}>
          ⬅ Back
        </button>
        <h1>🧑‍🏫 Ask My Kid</h1>
      </div>

      <p className="book-help">
        You say a word. Your child spells it out loud (or writes it). You tap <b>✓ Got it</b> or <b>✗ Not yet</b>.
      </p>

      <div className="queue-cards">
        <button type="button" className={`queue-card q-revise ${tab === 'revise' ? 'on' : ''}`} onClick={() => setTab('revise')}>
          <span className="q-emoji">🔁</span>
          <b>{lists.revise.length}</b>
          <small>Revise</small>
        </button>
        <button type="button" className={`queue-card q-know ${tab === 'know' ? 'on' : ''}`} onClick={() => setTab('know')}>
          <span className="q-emoji">✅</span>
          <b>{lists.know.length}</b>
          <small>Knows</small>
        </button>
        <button type="button" className={`queue-card q-new ${tab === 'fresh' ? 'on' : ''}`} onClick={() => setTab('fresh')}>
          <span className="q-emoji">❓</span>
          <b>{lists.fresh.length}</b>
          <small>Not asked</small>
        </button>
      </div>

      <section className="panel">
        <h2>1. Which words?</h2>
        <div className="book-filter">
          <button type="button" className={`filter-chip ${packId === 'all' ? 'on' : ''}`} onClick={() => setPackId('all')}>
            📚 All ({ALL_WORDS.length})
          </button>
          {PACKS.map((p) => (
            <button
              type="button"
              key={p.id}
              className={`filter-chip ${packId === p.id ? 'on' : ''}`}
              onClick={() => setPackId(p.id)}
            >
              {p.emoji} {p.title}
            </button>
          ))}
        </div>

        <h2>2. What to ask?</h2>
        <div className="kind-grid">
          {KINDS.map((k) => (
            <button
              type="button"
              key={k.key}
              className={`kind-card ${kind === k.key ? 'on' : ''}`}
              aria-pressed={kind === k.key}
              disabled={lists[k.key].length === 0}
              onClick={() => setKind(k.key)}
            >
              <span className="kind-emoji">{k.emoji}</span>
              <span className="kind-text">
                <b>
                  {k.title} <span className="count-pill">{lists[k.key].length}</span>
                </b>
                <small>{k.blurb}</small>
              </span>
            </button>
          ))}
        </div>

        <h2>3. How many?</h2>
        <div className="ask-options">
          <div className="seg">
            {SIZES.map((s) => (
              <button
                type="button"
                key={s.label}
                className={size === s.value ? 'on' : ''}
                aria-pressed={size === s.value}
                onClick={() => setSize(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="seg">
            <button type="button" className={mix ? 'on' : ''} aria-pressed={mix} onClick={() => setMix(true)}>
              🔀 Mixed
            </button>
            <button type="button" className={!mix ? 'on' : ''} aria-pressed={!mix} onClick={() => setMix(false)}>
              🔢 In order
            </button>
          </div>
        </div>

        <button type="button" className="btn btn-big c-grass start-btn" disabled={count === 0} onClick={startFromSetup}>
          {count === 0 ? 'No words here yet' : `Start asking ${plural(count, 'word')} ➜`}
        </button>
      </section>

      <section className="panel">
        <div className="list-tabs">
          <button type="button" className={tab === 'revise' ? 'on' : ''} onClick={() => setTab('revise')}>
            🔁 Revise ({lists.revise.length})
          </button>
          <button type="button" className={tab === 'know' ? 'on' : ''} onClick={() => setTab('know')}>
            ✅ Knows ({lists.know.length})
          </button>
          <button type="button" className={tab === 'fresh' ? 'on' : ''} onClick={() => setTab('fresh')}>
            ❓ Not asked ({lists.fresh.length})
          </button>
        </div>

        {tab === 'revise' && lists.revise.length > 0 && (
          <div className="action-row left">
            <button
              type="button"
              className="btn c-berry"
              onClick={() => startRun(shuffle(lists.revise).slice(0, 20).map((w) => w.id), 'Revise words')}
            >
              🔁 Ask Revise words now
            </button>
            <button type="button" className="btn c-grass" onClick={() => onPlay(lists.revise)}>
              🎮 Play games with them
            </button>
          </div>
        )}

        {tabList.length === 0 ? (
          <p className="muted">
            {tab === 'revise' && 'Nothing to revise. Great job! 🎉'}
            {tab === 'know' && 'No known words yet. Start asking to fill this list.'}
            {tab === 'fresh' && 'Every word in this list has been asked.'}
          </p>
        ) : (
          <div className="chip-row left">
            {tabList.map((w) => {
              const rec = state.check[w.id];
              return (
                <button type="button" key={w.id} className="chip word-font" onClick={() => speak(w.word)}>
                  {w.emoji} {w.word}
                  {tab === 'revise' && (
                    <>
                      {' '}
                      <Dots streak={rec.streak} /> <small className="miss-count">✗{rec.wrong}</small>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {tab === 'revise' && lists.revise.length > 0 && (
          <p className="muted small-note">Dots = days right in a row. {GRADUATE} dots → moves to Knows.</p>
        )}
      </section>

      <details className="panel science-box">
        <summary>🔬 Why this works</summary>
        <ul className="science">
          {SCIENCE.map(([title, text]) => (
            <li key={title}>
              <b>{title}.</b> {text}
            </li>
          ))}
        </ul>
      </details>

      <div className="book-bottom">
        <button type="button" className="btn btn-big c-white" onClick={onBack}>
          ⬅ Back
        </button>
      </div>
    </div>
  );
}
