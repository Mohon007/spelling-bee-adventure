import { useEffect, useRef, useState } from 'react';
import Home from './components/Home';
import PackView from './components/PackView';
import Session from './components/Session';
import ParentCorner from './components/ParentCorner';
import WordBook from './components/WordBook';
import AskMyKid from './components/AskMyKid';
import { ALL_WORDS, getPack } from './data/words';
import { MODES } from './lib/modes';
import { packRounds, practiceRounds, reviseRounds } from './lib/rounds';
import { setRate, stopSpeech } from './lib/speech';
import { setSoundOn } from './lib/sound';
import { useProgress } from './lib/useProgress';

const HOME = { name: 'home' };

export default function App() {
  const [state, actions] = useProgress();
  const stateRef = useRef(state);
  stateRef.current = state;

  const [screen, setScreen] = useState(HOME);
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    setRate(state.settings.rate);
    setSoundOn(state.settings.sound);
  }, [state.settings.rate, state.settings.sound]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen.name, screen.packId, sessionKey]);

  function startSession(title, build, back) {
    setSessionKey((k) => k + 1);
    setScreen({ name: 'session', title, build, back, rounds: build(stateRef.current) });
  }

  function goTo(next) {
    stopSpeech();
    setScreen(next);
  }

  if (screen.name === 'session') {
    return (
      <main className="app">
        <Session
          key={sessionKey}
          title={screen.title}
          rounds={screen.rounds}
          allWords={ALL_WORDS}
          actions={actions}
          onExit={() => goTo(screen.back)}
          onAgain={() => startSession(screen.title, screen.build, screen.back)}
        />
      </main>
    );
  }

  if (screen.name === 'pack') {
    const pack = getPack(screen.packId);
    if (pack) {
      const back = { name: 'pack', packId: pack.id };
      return (
        <main className="app">
          <PackView
            pack={pack}
            state={state}
            onBack={() => goTo(HOME)}
            onBook={() => goTo({ name: 'book', packId: pack.id, back })}
            onMode={(mode) =>
              startSession(`${pack.title} · ${MODES[mode].title}`, (s) => packRounds(s, pack, mode), back)
            }
            onWord={(word) => startSession(word.word, () => [{ mode: 'learn', word }], back)}
          />
        </main>
      );
    }
  }

  if (screen.name === 'book') {
    return (
      <main className="app">
        <WordBook state={state} startPack={screen.packId} onBack={() => goTo(screen.back)} />
      </main>
    );
  }

  if (screen.name === 'ask') {
    return (
      <main className="app">
        <AskMyKid
          state={state}
          actions={actions}
          onBack={() => goTo(HOME)}
          onPlay={(words) => startSession('Revise games', () => reviseRounds(words), { name: 'ask' })}
        />
      </main>
    );
  }

  if (screen.name === 'parent') {
    return (
      <main className="app">
        <ParentCorner state={state} actions={actions} onBack={() => goTo(HOME)} />
      </main>
    );
  }

  return (
    <main className="app">
      <Home
        state={state}
        onPractice={() => startSession("Today's Practice", (s) => practiceRounds(s, ALL_WORDS), HOME)}
        onPack={(packId) => goTo({ name: 'pack', packId })}
        onParent={() => goTo({ name: 'parent' })}
        onBook={() => goTo({ name: 'book', packId: 'all', back: HOME })}
        onAsk={() => goTo({ name: 'ask' })}
        onSettings={actions.setSettings}
      />
    </main>
  );
}
