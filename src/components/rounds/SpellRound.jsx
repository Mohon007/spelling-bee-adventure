import { useEffect, useState } from 'react';
import { speak, stopSpeech } from '../../lib/speech';
import { sfx } from '../../lib/sound';
import { ALPHABET, lettersOf, shuffle } from '../../lib/utils';
import { FeedbackBar, RoundShell, SyllableChips, WordPicture } from '../ui';

const MAX_TRIES = 3;

function makeTiles(target) {
  const extra = target.length <= 5 ? 3 : target.length <= 8 ? 2 : 0;
  const others = shuffle(ALPHABET.filter((c) => !target.includes(c))).slice(0, extra);
  return shuffle([...target, ...others]).map((ch, id) => ({ id, ch }));
}

// Spell It: Look - Say - Cover - Write - Check.
export default function SpellRound({ word, onDone, celebrate }) {
  const target = lettersOf(word.word);
  const [s, setS] = useState(() => ({
    phase: 'look',
    tiles: makeTiles(target),
    slots: Array(target.length).fill(null),
    marks: Array(target.length).fill(null),
    tries: 0,
    hints: 0,
    checking: false,
    success: false,
  }));

  useEffect(() => {
    const t = setTimeout(() => speak(word.word), 350);
    return () => {
      clearTimeout(t);
      stopSpeech();
    };
  }, [word]);

  const tileById = (id) => s.tiles.find((t) => t.id === id);
  const used = new Set(s.slots.filter((id) => id !== null));
  const canEdit = s.phase === 'write' && !s.checking;

  function revealSlots() {
    const left = [...s.tiles];
    return [...target].map((ch) => left.splice(left.findIndex((t) => t.ch === ch), 1)[0].id);
  }

  function evaluate(next) {
    const marks = next.slots.map((id, i) => (tileById(id).ch === target[i] ? 'ok' : 'bad'));
    if (marks.every((m) => m === 'ok')) {
      const success = next.tries === 0 && next.hints === 0;
      setS({ ...next, marks, phase: 'done', success });
      sfx.correct();
      if (success) celebrate();
      setTimeout(() => speak(success ? `Perfect! ${word.word}` : word.word), 250);
      return;
    }
    const tries = next.tries + 1;
    sfx.oops();
    if (tries >= MAX_TRIES) {
      setS({ ...next, tries, slots: revealSlots(), marks: Array(target.length).fill('ok'), phase: 'done', success: false });
      setTimeout(() => speak(`It is spelled ${[...target].join(', ')}. ${word.word}`), 250);
      return;
    }
    setS({ ...next, marks, tries, checking: true });
    setTimeout(() => {
      setS((prev) => ({
        ...prev,
        checking: false,
        slots: prev.slots.map((id, i) => (prev.marks[i] === 'bad' ? null : id)),
        marks: prev.marks.map((m) => (m === 'bad' ? null : m)),
      }));
    }, 1100);
  }

  function commit(next) {
    if (next.slots.every((id) => id !== null)) evaluate(next);
    else setS(next);
  }

  function place(tile) {
    if (!canEdit || used.has(tile.id)) return;
    const i = s.slots.indexOf(null);
    if (i < 0) return;
    sfx.tap();
    const slots = [...s.slots];
    slots[i] = tile.id;
    commit({ ...s, slots });
  }

  function removeAt(i) {
    if (!canEdit || s.slots[i] === null || s.marks[i] === 'ok') return;
    const slots = [...s.slots];
    slots[i] = null;
    setS({ ...s, slots });
  }

  function backspace() {
    for (let i = s.slots.length - 1; i >= 0; i--) {
      if (s.slots[i] !== null && s.marks[i] !== 'ok') {
        removeAt(i);
        return;
      }
    }
  }

  function hint() {
    if (!canEdit) return;
    const i = s.marks.findIndex((m) => m !== 'ok');
    if (i < 0) return;
    const slots = [...s.slots];
    const marks = [...s.marks];
    slots[i] = null;
    const taken = new Set(slots.filter((id) => id !== null));
    let tile = s.tiles.find((t) => t.ch === target[i] && !taken.has(t.id));
    if (!tile) {
      const j = slots.findIndex((id, k) => id !== null && marks[k] !== 'ok' && tileById(id).ch === target[i]);
      tile = tileById(slots[j]);
      slots[j] = null;
    }
    slots[i] = tile.id;
    marks[i] = 'ok';
    speak(target[i].toUpperCase());
    commit({ ...s, slots, marks, hints: s.hints + 1 });
  }

  function cover() {
    sfx.tap();
    setS({ ...s, phase: 'write' });
    speak(`Now spell ${word.word}`);
  }

  if (s.phase === 'look') {
    return (
      <RoundShell mode="spell">
        <p className="prompt">👀 Look closely and say it out loud!</p>
        <div className="word-card">
          <WordPicture word={word} size="lg" />
          <div className="big-word word-font">{word.word}</div>
          <SyllableChips syllables={word.syllables} />
        </div>
        <div className="action-row">
          <button type="button" className="btn c-sky" onClick={() => speak(word.word)}>
            🔊 Hear it
          </button>
          <button type="button" className="btn btn-big c-grass" onClick={cover}>
            🙈 Cover it &amp; spell!
          </button>
        </div>
      </RoundShell>
    );
  }

  const firstEmpty = s.slots.indexOf(null);

  return (
    <RoundShell mode="spell">
      <p className="prompt">{s.phase === 'done' ? '✅ Check your spelling!' : '✍️ Tap the letters to spell the word.'}</p>
      <div className="word-card compact">
        <WordPicture word={word} />
        <div className="action-row tight">
          <button type="button" className="btn c-sky" onClick={() => speak(word.word)}>
            🔊 Hear it
          </button>
          {s.phase === 'write' && (
            <button type="button" className="btn c-honey" onClick={hint} disabled={!canEdit}>
              💡 Helper
            </button>
          )}
        </div>
      </div>

      <div className="slots" aria-label="Your spelling">
        {s.slots.map((id, i) => (
          <button
            type="button"
            key={i}
            className={`slot word-font ${s.marks[i] || ''} ${s.phase === 'write' && i === firstEmpty ? 'cursor' : ''}`}
            onClick={() => removeAt(i)}
            aria-label={id === null ? `Empty box ${i + 1}` : `Letter ${tileById(id).ch}`}
          >
            {id === null ? '' : tileById(id).ch}
          </button>
        ))}
      </div>

      {s.phase === 'write' && (
        <>
          <div className="tiles">
            {s.tiles.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`tile word-font ${used.has(t.id) ? 'used' : ''}`}
                onClick={() => place(t)}
                disabled={used.has(t.id) || !canEdit}
                aria-label={`Letter ${t.ch}`}
              >
                {t.ch}
              </button>
            ))}
          </div>
          <div className="action-row">
            <button type="button" className="btn c-white" onClick={backspace} disabled={!canEdit}>
              ⌫ Undo
            </button>
          </div>
          {s.tries > 0 && !s.checking && (
            <p className="gentle">Almost! The green letters are right. Try the rest again.</p>
          )}
        </>
      )}

      {s.phase === 'done' && (
        <>
          <div className="word-card compact">
            <div className="big-word word-font">{word.word}</div>
            {word.meaning && <p className="meaning">{word.meaning}</p>}
          </div>
          <FeedbackBar ok={s.success} onNext={() => onDone(s.success)}>
            {s.success
              ? 'Perfect spelling! You are a star! ⭐'
              : 'You did it! We will practise this word again soon. 💪'}
          </FeedbackBar>
        </>
      )}
    </RoundShell>
  );
}
