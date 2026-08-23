import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_PRACTICE_MESSAGE, FREEDOM_FIGHT } from '../config';
import type { PersistedState } from '../types';

const STORAGE_KEY = 'purity-app/state/v1';

export const defaultState: PersistedState = {
  partners: [],
  reminders: [],
  settings: {
    practiceMessage: DEFAULT_PRACTICE_MESSAGE,
    learnUrl: FREEDOM_FIGHT.LESSONS_URL,
    onboarded: false,
  },
};

/**
 * Merge a possibly-partial persisted blob with defaults so that adding new
 * fields in future versions never crashes on old data.
 */
export function mergeWithDefaults(parsed: Partial<PersistedState> | null): PersistedState {
  return {
    partners: parsed?.partners ?? defaultState.partners,
    reminders: parsed?.reminders ?? defaultState.reminders,
    settings: {
      ...defaultState.settings,
      ...(parsed?.settings ?? {}),
    },
  };
}

export async function loadState(): Promise<PersistedState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return mergeWithDefaults(parsed);
  } catch {
    return defaultState;
  }
}

export async function saveState(state: PersistedState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
