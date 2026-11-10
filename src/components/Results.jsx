import { useEffect } from 'react';
import Bee from './Bee';
import { speak } from '../lib/speech';
import { sfx } from '../lib/sound';
import { plural } from '../lib/utils';

export default function Results({ results, onAgain, onBack }) {
  const scored = results.filter((r) => r.correct !== null);
  const stars = scored.filter((r) => r.correct).length;
  const met = results.filter((r) => r.correct === null).length;
  const perfect = scored.length > 0 && stars === scored.length;

  const again = [];
  const seen = new Set();
  for (const r of results) {
    if (r.correct === false && !seen.has(r.word.id)) {
      seen.add(r.word.id);
      again.push(r.word);
    }
  }

  const headline = perfect ? 'Perfect! You are a Spelling Star!' : 'Great job, Super Speller!';

  useEffect(() => {
    sfx.win();
    const line = scored.length
      ? `${headline} You earned ${plural(stars, 'star')}!`
      : `Hooray! You met ${plural(met, 'new word')}!`;
    const t = setTimeout(() => speak(line), 500);
    return () => clearTimeout(t);
    // Say it once when the results first show.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="results">
      <Bee size={140} cheer className="bob" />
      <h1>{headline}</h1>

      {scored.length > 0 && (
        <>
          <div className="star-row" aria-label={`${stars} of ${scored.length} stars`}>
            {scored.map((r, k) => (
              <span key={k} className={`big-star ${r.correct ? 'on' : ''}`} style={{ animationDelay: `${k * 0.12}s` }}>
                ⭐
              </span>
            ))}
          </div>
          <p className="results-line">You earned {plural(stars, 'star')}!</p>
        </>
      )}
      {met > 0 && <p className="results-line">You met {plural(met, 'new word')}. 👀</p>}

      {again.length > 0 && (
        <div className="again-box">
          <h2>Let's practise these again soon:</h2>
          <div className="chip-row">
            {again.map((w) => (
              <button type="button" key={w.id} className="chip word-font" onClick={() => speak(w.word)}>
                {w.emoji} {w.word} 🔊
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="action-row">
        <button type="button" className="btn btn-big c-white" onClick={onBack}>
          ⬅ Back
        </button>
        <button type="button" className="btn btn-big c-honey" onClick={onAgain}>
          🔁 Play again
        </button>
      </div>
    </div>
  );
}
