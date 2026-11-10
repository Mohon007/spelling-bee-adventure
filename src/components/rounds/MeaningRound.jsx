import { useEffect, useState } from 'react';
import { speak, stopSpeech } from '../../lib/speech';
import { sfx } from '../../lib/sound';
import { pickDistractors, shuffle } from '../../lib/utils';
import { FeedbackBar, RoundShell, WordPicture } from '../ui';

// Meaning Match: hear what a word means, then read and pick the word.
export default function MeaningRound({ word, allWords, onDone, celebrate }) {
  const [options] = useState(() => {
    const samePack = allWords.filter((w) => w.packId === word.packId);
    const pool = samePack.length >= 3 ? samePack : allWords;
    return shuffle([word, ...pickDistractors(word, pool, 2)]);
  });
  const [wrong, setWrong] = useState([]);
  const [solved, setSolved] = useState(false);
  const clue = word.meaning || `Find the word ${word.word}`;

  useEffect(() => {
    const t = setTimeout(() => speak(`Which word means: ${clue}`), 350);
    return () => {
      clearTimeout(t);
      stopSpeech();
    };
  }, [clue]);

  function pick(option) {
    if (solved || wrong.includes(option.id)) return;
    if (option.id === word.id) {
      setSolved(true);
      sfx.correct();
      if (wrong.length === 0) celebrate();
      setTimeout(() => speak(word.word), 250);
    } else {
      setWrong((w) => [...w, option.id]);
      sfx.oops();
      setTimeout(() => speak(`That says ${option.word}. Try again!`), 200);
    }
  }

  return (
    <RoundShell mode="meaning">
      <p className="prompt">🧩 Which word means this?</p>
      <div className="word-card">
        <WordPicture word={word} hidden={!solved} size="lg" />
        <p className="clue">“{clue}”</p>
        <button type="button" className="btn c-sky" onClick={() => speak(clue)}>
          🔊 Hear it again
        </button>
      </div>

      <div className="word-options">
        {options.map((o) => (
          <button
            type="button"
            key={o.id}
            className={`word-opt word-font ${wrong.includes(o.id) ? 'wrong' : ''} ${solved && o.id === word.id ? 'right' : ''}`}
            onClick={() => pick(o)}
            disabled={solved || wrong.includes(o.id)}
          >
            {o.word}
          </button>
        ))}
      </div>

      {solved && (
        <FeedbackBar ok={wrong.length === 0} onNext={() => onDone(wrong.length === 0)}>
          {wrong.length === 0 ? (
            <>Yes! That is <b>{word.word}</b>! 🎉</>
          ) : (
            <>You got it! The word is <b>{word.word}</b>.</>
          )}
        </FeedbackBar>
      )}
    </RoundShell>
  );
}
