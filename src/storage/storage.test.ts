import AsyncStorage from '@react-native-async-storage/async-storage';

import { defaultState, loadState, mergeWithDefaults, saveState } from './storage';
import { DEFAULT_PRACTICE_MESSAGE } from '../config';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('mergeWithDefaults', () => {
  it('returns defaults for null input', () => {
    expect(mergeWithDefaults(null)).toEqual(defaultState);
  });

  it('fills missing settings fields while keeping provided ones', () => {
    const merged = mergeWithDefaults({ settings: { practiceMessage: 'hey' } as never });
    expect(merged.settings.practiceMessage).toBe('hey');
    expect(merged.settings.onboarded).toBe(false);
    expect(merged.partners).toEqual([]);
  });
});

describe('loadState / saveState', () => {
  it('returns defaults when nothing is stored', async () => {
    const state = await loadState();
    expect(state.settings.practiceMessage).toBe(DEFAULT_PRACTICE_MESSAGE);
    expect(state.partners).toEqual([]);
  });

  it('persists and reloads state', async () => {
    const next = {
      ...defaultState,
      partners: [{ id: '1', name: 'Sam', phoneNumber: '5551234567', order: 0, createdAt: 1 }],
      settings: { ...defaultState.settings, onboarded: true },
    };
    await saveState(next);
    const reloaded = await loadState();
    expect(reloaded.partners).toHaveLength(1);
    expect(reloaded.partners[0].name).toBe('Sam');
    expect(reloaded.settings.onboarded).toBe(true);
  });

  it('recovers to defaults on corrupt data', async () => {
    await AsyncStorage.setItem('purity-app/state/v1', '{not valid json');
    const state = await loadState();
    expect(state).toEqual(defaultState);
  });
});
