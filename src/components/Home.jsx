import Bee from './Bee';
import { Meter } from './ui';
import { ALL_WORDS, GROUPS, PACKS } from '../data/words';
import { LEARNED_BOX, countAtLeast, countDue, streakNow } from '../lib/progress';
import { plural } from '../lib/utils';

export default function Home({ state, onPractice, onPack, onParent }) {
  const name = state.settings.name.trim();
  const learned = countAtLeast(state, ALL_WORDS, LEARNED_BOX);
  const due = countDue(state, ALL_WORDS);
  const streak = streakNow(state.streak);

  return (
    <div className="screen">
      <header className="hero">
        <Bee size={112} className="bob" />
        <div>
          <p className="eyebrow">Spelling Bee Adventure</p>
          <h1>Hi, {name || 'Super Speller'}!</h1>
          <p className="hero-sub">Look, listen, clap and spell. Let's grow your word garden!</p>
        </div>
      </header>

      <div className="stats">
        <div className="stat">
          <span className="stat-emoji" aria-hidden="true">⭐</span>
          <b>{state.stars}</b>
          <small>Stars</small>
        </div>
        <div className="stat">
          <span className="stat-emoji" aria-hidden="true">🔥</span>
          <b>{streak}</b>
          <small>Day streak</small>
        </div>
        <div className="stat">
          <span className="stat-emoji" aria-hidden="true">🌻</span>
          <b>{learned}</b>
          <small>of {ALL_WORDS.length} learned</small>
        </div>
      </div>

      <button type="button" className="practice-cta" onClick={onPractice}>
        <span className="cta-emoji" aria-hidden="true">🐝</span>
        <span className="cta-text">
          <b>Today's Practice</b>
          <small>
            {due > 0 ? `${plural(due, 'word')} ready to review` : 'Meet new words and keep your streak going'}
          </small>
        </span>
        <span className="cta-go">Go ➜</span>
      </button>

      {GROUPS.map((group) => (
        <section key={group}>
          <h2 className="section-title">{group}</h2>
          <div className="pack-grid">
            {PACKS.filter((p) => p.group === group).map((p) => (
              <button
                type="button"
                key={p.id}
                className="pack-card"
                style={{ '--c': p.color }}
                onClick={() => onPack(p.id)}
              >
                <span className="pack-emoji" aria-hidden="true">{p.emoji}</span>
                <span className="pack-title">{p.title}</span>
                <span className="pack-sub">{p.subtitle}</span>
                <Meter value={countAtLeast(state, p.words, LEARNED_BOX)} max={p.words.length} label="learned" />
              </button>
            ))}
          </div>
        </section>
      ))}

      <footer className="home-foot">
        <button type="button" className="btn c-white" onClick={onParent}>
          ⚙️ Grown-ups corner
        </button>
      </footer>
    </div>
  );
}
