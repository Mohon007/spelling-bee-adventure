import { useEffect, useState } from 'react';
import { speak, stopSpeech } from '../../lib/speech';
import { sfx } from '../../lib/sound';
import { ALPHABET, VOWELS, sample, shuffle } from '../../lib/utils';
import { FeedbackBar, RoundShell, WordPicture } from '../ui';

function makePuzzle(text) {
  const lower = text.toLowerCase();
  const letterIdx = [...lower].map((c, i) => i).filter((i) => /[a-z]/.test(lower[i]));
  const vowelIdx = letterIdx.filter((i) => i > 0 && VOWELS.includes(lower[i]));
  const laterIdx = letterIdx.filter((i) => i > 0);
  const idx = sample(vowelIdx.length ? vowelIdx : laterIdx.length ? laterIdx : letterIdx);
  const answer = lower[idx];
  const pool = VOWELS.includes(answer) ? VOWELS : ALPHABET.filter((c) => !VOWELS.includes(c));
  const others = shuffle(pool.filter((c) => c !== answer)).slice(0, 2);
  return { idx, answer, options: shuffle([answer, ...others]) };
}

// Missing Letter: listen and pick the letter that fills the gap.
export default function MissingRound({ word, onDone, celebrate }) {
  const [puzzle] = useState(() => makePuzzle(word.word));
  const [wrong, setWrong] = useState([]);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => speak(word.word), 350);
    return () => {
      clearTimeout(t);
      stopSpeech();
    };
  }, [word]);

  function pick(ch) {
    if (solved || wrong.includes(ch)) return;
    if (ch === puzzle.answer) {
      setSolved(true);
      sfx.correct();
      if (wrong.length === 0) celebrate();
      setTimeout(() => speak(word.word), 250);
    } else {
      setWrong((w) => [...w, ch]);
      sfx.oops();
    }
  }

  return (
    <RoundShell mode="missing">
      <p className="prompt">🔍 Listen. Which letter is missing?</p>
      <div className="word-card">
        <WordPicture word={word} size="lg" />
        <div className="big-word word-font">
          {[...word.word].map((ch, k) =>
            k === puzzle.idx ? (
              <span key={k} className={`gap ${solved ? 'filled' : ''}`}>
                {solved ? ch : '?'}
              </span>
            ) : (
              <span key={k}>{ch}</span>
            ),
          )}
        </div>
        <button type="button" className="btn c-sky" onClick={() => speak(word.word)}>
          🔊 Hear it
        </button>
      </div>

      <div className="letter-options">
        {puzzle.options.map((ch) => (
          <button
            type="button"
            key={ch}
            className={`letter-opt word-font ${wrong.includes(ch) ? 'wrong' : ''} ${solved && ch === puzzle.answer ? 'right' : ''}`}
            onClick={() => pick(ch)}
            disabled={solved || wrong.includes(ch)}
          >
            {ch}
          </button>
        ))}
      </div>

      {solved && (
        <FeedbackBar ok={wrong.length === 0} onNext={() => onDone(wrong.length === 0)}>
          {wrong.length === 0 ? (
            <>Super! <b>{word.word}</b> needs the letter <b>{puzzle.answer}</b>.</>
          ) : (
            <>You found it! <b>{word.word}</b> needs the letter <b>{puzzle.answer}</b>.</>
          )}
        </FeedbackBar>
      )}
    </RoundShell>
  );
}
