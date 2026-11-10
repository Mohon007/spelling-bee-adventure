import { useEffect, useRef, useState } from 'react';
import { speak, stopSpeech } from '../../lib/speech';
import { sfx } from '../../lib/sound';
import { wait } from '../../lib/utils';
import { RoundShell, SyllableChips, WordPicture } from '../ui';

// Look & Listen: see it, hear it, clap it, hear the letters, hear the meaning.
export default function LearnRound({ word, onDone }) {
  const [lit, setLit] = useState(null);
  const run = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => speak(word.word), 350);
    return () => {
      clearTimeout(t);
      run.current += 1;
      stopSpeech();
    };
  }, [word]);

  function stopAll() {
    run.current += 1;
    setLit(null);
  }

  async function clap() {
    const me = ++run.current;
    setLit(null);
    await speak(word.word, { rate: 0.7 });
    for (let k = 0; k < word.syllables.length; k++) {
      if (run.current !== me) return;
      setLit({ kind: 'syl', i: k });
      sfx.clap();
      await wait(700);
    }
    if (run.current === me) setLit(null);
  }

  async function letters() {
    const me = ++run.current;
    const chars = [...word.word];
    for (let k = 0; k < chars.length; k++) {
      if (run.current !== me) return;
      if (!/[a-z]/i.test(chars[k])) continue;
      setLit({ kind: 'letter', i: k });
      await speak(chars[k].toUpperCase(), { rate: 0.9 });
      await wait(120);
    }
    if (run.current === me) {
      setLit(null);
      speak(word.word);
    }
  }

  return (
    <RoundShell mode="learn">
      <p className="prompt">Look, listen, and say it with me!</p>
      <div className="word-card">
        <WordPicture word={word} size="lg" />
        <div className="big-word word-font" aria-label={word.word}>
          {[...word.word].map((ch, k) => (
            <span key={k} className={lit?.kind === 'letter' && lit.i === k ? 'lit' : undefined}>
              {ch}
            </span>
          ))}
        </div>
        <SyllableChips syllables={word.syllables} lit={lit?.kind === 'syl' ? lit.i : -1} />
        {word.meaning && <p className="meaning">{word.meaning}</p>}
      </div>

      <div className="action-row">
        <button type="button" className="btn c-sky" onClick={() => { stopAll(); speak(word.word); }}>
          🔊 Hear
        </button>
        <button type="button" className="btn c-berry" onClick={clap}>
          👏 Clap
        </button>
        <button type="button" className="btn c-honey" onClick={letters}>
          🔤 Letters
        </button>
        {word.meaning && (
          <button type="button" className="btn c-grape" onClick={() => { stopAll(); speak(word.meaning); }}>
            📖 Meaning
          </button>
        )}
      </div>

      <div className="next-row">
        <button
          type="button"
          className="btn btn-big c-grass"
          onClick={() => {
            sfx.tap();
            onDone(null);
          }}
        >
          I know this word! ➜
        </button>
      </div>
    </RoundShell>
  );
}
