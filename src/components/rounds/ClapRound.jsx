import { useEffect, useRef, useState } from 'react';
import { speak, stopSpeech } from '../../lib/speech';
import { sfx } from '../../lib/sound';
import { plural, wait } from '../../lib/utils';
import { FeedbackBar, RoundShell, SyllableChips, WordPicture } from '../ui';

// Clap It: tap once for each beat (syllable) in the word.
export default function ClapRound({ word, onDone, celebrate }) {
  const beats = word.syllables.length;
  const [claps, setClaps] = useState(0);
  const [result, setResult] = useState(null);
  const [lit, setLit] = useState(-1);
  const [pop, setPop] = useState(0);
  const run = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => speak(word.word, { rate: 0.75 }), 350);
    return () => {
      clearTimeout(t);
      run.current += 1;
      stopSpeech();
    };
  }, [word]);

  function tap() {
    if (result !== null) return;
    sfx.clap();
    setClaps((c) => Math.min(c + 1, 8));
    setPop((p) => p + 1);
  }

  async function clapTogether() {
    const me = ++run.current;
    await wait(400);
    await speak(word.word, { rate: 0.7 });
    for (let k = 0; k < beats; k++) {
      if (run.current !== me) return;
      setLit(k);
      sfx.clap();
      await wait(650);
    }
    if (run.current === me) setLit(-1);
  }

  function check() {
    const ok = claps === beats;
    setResult(ok);
    if (ok) {
      sfx.correct();
      celebrate();
    } else {
      sfx.oops();
    }
    clapTogether();
  }

  return (
    <RoundShell mode="clap">
      <p className="prompt">Say the word. Tap the hands for each beat!</p>
      <div className="word-card compact">
        <WordPicture word={word} />
        <div className="big-word word-font">{word.word}</div>
        {result !== null && <SyllableChips syllables={word.syllables} lit={lit} />}
      </div>

      <div className="action-row">
        <button type="button" className="btn c-sky" onClick={() => { run.current += 1; speak(word.word, { rate: 0.75 }); }}>
          🔊 Hear it
        </button>
      </div>

      <div className="clap-zone">
        <button type="button" className="hand-btn" onClick={tap} disabled={result !== null} aria-label="Clap">
          <span key={pop} className="hand-emoji">👏</span>
        </button>
        <div className="clap-dots" aria-live="polite">
          {claps === 0 ? (
            <span className="muted">No claps yet</span>
          ) : (
            Array.from({ length: claps }, (_, k) => (
              <span key={k} className="clap-dot">{k + 1}</span>
            ))
          )}
        </div>
        {result === null && (
          <div className="action-row">
            <button type="button" className="btn c-white" onClick={() => setClaps(0)} disabled={!claps}>
              ↺ Start over
            </button>
            <button type="button" className="btn btn-big c-grass" onClick={check} disabled={!claps}>
              ✓ Check
            </button>
          </div>
        )}
      </div>

      {result !== null && (
        <FeedbackBar ok={result} onNext={() => onDone(result)}>
          {result ? (
            <>Yes! <b>{word.word}</b> has {plural(beats, 'beat')}! 🎉</>
          ) : (
            <>Good try! <b>{word.word}</b> has {plural(beats, 'beat')}. Clap with me!</>
          )}
        </FeedbackBar>
      )}
    </RoundShell>
  );
}
