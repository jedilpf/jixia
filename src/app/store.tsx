import { createContext, useContext, useMemo, useReducer } from 'react';
import type { Dispatch, PropsWithChildren } from 'react';
import type { AppAction } from '@/app/actions';
import { appReducer, createAppInitialState } from '@/app/reducer';
import type { GameState } from '@/core/types';

interface AppStoreValue {
  state: GameState;
  dispatch: Dispatch<AppAction>;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(appReducer, undefined, createAppInitialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }
  return ctx;
}
