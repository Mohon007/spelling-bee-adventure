import { useEffect, useMemo, useState } from 'react';
import {
  applyAnswer,
  applyCheck,
  applyIntroduce,
  freshState,
  loadState,
  restoreCheck,
  saveState,
} from './progress';

export function useProgress() {
  const [state, setState] = useState(loadState);

  useEffect(() => saveState(state), [state]);

  const actions = useMemo(
    () => ({
      answer: (id, correct) => setState((s) => applyAnswer(s, id, correct)),
      introduce: (id) => setState((s) => applyIntroduce(s, id)),
      checkAnswer: (id, ok) => setState((s) => applyCheck(s, id, ok)),
      restoreCheck: (id, prevCheck, prevWord) => setState((s) => restoreCheck(s, id, prevCheck, prevWord)),
      setSettings: (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
      reset: () => setState(freshState()),
    }),
    [],
  );

  return [state, actions];
}
