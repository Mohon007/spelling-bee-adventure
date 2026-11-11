import { useEffect, useState } from 'react';
import Bee from './Bee';
import { speak } from '../lib/speech';
import { sfx } from '../lib/sound';

// Welcome popup: asks the child's name.
export default function NameModal({ initialName = '', onSave, onSkip }) {
  const [name, setName] = useState(initialName);
  const clean = name.trim();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onSkip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSkip]);

  function submit(e) {
    e.preventDefault();
    if (!clean) return;
    sfx.correct();
    onSave(clean);
    speak(`Hi ${clean}! Let's learn some words together!`);
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="name-title" onSubmit={submit}>
        <Bee size={110} cheer className="bob" />
        <h2 id="name-title">Hi there, Super Speller!</h2>
        <p className="modal-sub">What is your name?</p>
        <input
          className="name-input word-font"
          type="text"
          value={name}
          maxLength={24}
          placeholder="Type your name"
          autoFocus
          autoComplete="off"
          onChange={(e) => setName(e.target.value)}
          aria-label="Your name"
        />
        <button type="submit" className="btn btn-big c-grass modal-go" disabled={!clean}>
          Let's play! ➜
        </button>
        <button type="button" className="modal-skip" onClick={onSkip}>
          Skip for now
        </button>
      </form>
    </div>
  );
}
