import { useState } from 'react';
import Confetti from './Confetti';
import Results from './Results';
import FairyRescue, { rescueNeed } from './FairyRescue';
import { sfx } from '../lib/sound';
import LearnRound from './rounds/LearnRound';
import ClapRound from './rounds/ClapRound';
import SpellRound from './rounds/SpellRound';
import MissingRound from './rounds/MissingRound';
import MeaningRound from './rounds/MeaningRound';

const ROUNDS = {
  learn: LearnRound,
  clap: ClapRound,
  spell: SpellRound,
  missing: MissingRound,
  meaning: MeaningRound,
};

export default function Session({ title, rounds, allWords, actions, onExit, onAgain }) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [burst, setBurst] = useState(0);

  const total = rounds.length;
  const finished = index >= total;
  const round = rounds[index];
  const Round = round ? ROUNDS[round.mode] : null;
  const pct = Math.round((Math.min(index, total) / total) * 100);

  // Fairy rescue: right answers break the cage bars.
  const need = rescueNeed(rounds.filter((r) => r.mode !== 'learn').length);
  const got = results.filter((r) => r.correct === true).length;
  const wrong = results.filter((r) => r.correct === false).length;
  const lastScored = [...results].reverse().find((r) => r.correct !== null);
  const mood = lastScored ? (lastScored.correct ? 'happy' : 'oops') : null;

  function handleDone(correct) {
    if (correct === null) actions.introduce(round.word.id);
    else actions.answer(round.word.id, correct);
    if (correct === true && got + 1 === need) setTimeout(() => sfx.sparkle(), 300);
    setResults((list) => [...list, { word: round.word, mode: round.mode, correct }]);
    setIndex((i) => i + 1);
  }

  return (
    <div className="screen session">
      <div className="session-top">
        <button type="button" className="btn c-white icon-btn" onClick={onExit} aria-label="Leave game">
          ✕
        </button>
        <div className="track" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={index}>
          <div className="track-fill" style={{ width: `${pct}%` }} />
          <span className="track-bee" style={{ left: `${pct}%` }} aria-hidden="true">
            🐝
          </span>
          <span className="track-flower" aria-hidden="true">🌻</span>
        </div>
        <span className="track-count">
          {Math.min(index + 1, total)}/{total}
        </span>
      </div>
      <p className="session-title">{title}</p>

      {!finished && <FairyRescue need={need} got={got} wrong={wrong} mood={mood} />}

      {finished ? (
        <Results results={results} rescue={need ? { need, got, wrong } : null} onAgain={onAgain} onBack={onExit} />
      ) : (
        <Round
          key={index}
          word={round.word}
          allWords={allWords}
          onDone={handleDone}
          celebrate={() => setBurst((b) => b + 1)}
        />
      )}
      <Confetti trigger={burst} />
    </div>
  );
}
