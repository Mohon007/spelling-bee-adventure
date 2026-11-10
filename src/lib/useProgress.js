import { useEffect, useMemo, useState } from 'react';
import { applyAnswer, applyIntroduce, defaultState, loadState, saveState } from './progress';

export function useProgress() {
  const [state, setState] = useState(loadState);

  useEffect(() => saveState(state), [state]);

  const actions = useMemo(
    () => ({
      answer: (id, correct) => setState((s) => applyAnswer(s, id, correct)),
      introduce: (id) => setState((s) => applyIntroduce(s, id)),
      setSettings: (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
      reset: () => setState(defaultState()),
    }),
    [],
  );

  return [state, actions];
}
