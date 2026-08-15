import {
  DEFAULT_DAILY_LIMIT_MINUTES,
  canUseAllowance,
  clampDailyLimit,
  defaultAppLimits,
  formatMinutes,
  isAppLimited,
  todayKey,
  toggleLimitedApp,
} from './appLimits';
import type { LimitedApp } from '../types';

describe('todayKey', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(todayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(todayKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('canUseAllowance', () => {
  it('is available when never used', () => {
    expect(canUseAllowance(defaultAppLimits, '2026-08-15')).toBe(true);
  });

  it('is unavailable once used today', () => {
    const limits = { ...defaultAppLimits, lastGrantDate: '2026-08-15' };
    expect(canUseAllowance(limits, '2026-08-15')).toBe(false);
  });

  it('resets on a new day', () => {
    const limits = { ...defaultAppLimits, lastGrantDate: '2026-08-14' };
    expect(canUseAllowance(limits, '2026-08-15')).toBe(true);
  });

  it('is unavailable when the limit is zero (always blocked)', () => {
    const limits = { ...defaultAppLimits, dailyLimitMinutes: 0 };
    expect(canUseAllowance(limits, '2026-08-15')).toBe(false);
  });
});

describe('toggleLimitedApp', () => {
  const instagram: LimitedApp = { packageName: 'com.instagram.android', name: 'Instagram' };
  const youtube: LimitedApp = { packageName: 'com.google.android.youtube', name: 'YouTube' };

  it('adds an app that is not in the list', () => {
    expect(toggleLimitedApp([], instagram)).toEqual([instagram]);
  });

  it('removes an app that is already in the list', () => {
    expect(toggleLimitedApp([instagram], instagram)).toEqual([]);
  });

  it('keeps the list sorted by name', () => {
    const apps = toggleLimitedApp([youtube], instagram);
    expect(apps.map((a) => a.name)).toEqual(['Instagram', 'YouTube']);
  });
});

describe('isAppLimited', () => {
  it('matches by package name', () => {
    const apps = [{ packageName: 'com.instagram.android', name: 'Instagram' }];
    expect(isAppLimited(apps, 'com.instagram.android')).toBe(true);
    expect(isAppLimited(apps, 'com.google.android.youtube')).toBe(false);
  });
});

describe('clampDailyLimit', () => {
  it('rounds and clamps to 0–480', () => {
    expect(clampDailyLimit(30.4)).toBe(30);
    expect(clampDailyLimit(-5)).toBe(0);
    expect(clampDailyLimit(9999)).toBe(480);
  });

  it('falls back to the default for non-numeric input', () => {
    expect(clampDailyLimit(NaN)).toBe(DEFAULT_DAILY_LIMIT_MINUTES);
  });
});

describe('formatMinutes', () => {
  it('formats minutes, hours, and mixed durations', () => {
    expect(formatMinutes(45)).toBe('45 min');
    expect(formatMinutes(60)).toBe('1 hr');
    expect(formatMinutes(90)).toBe('1 hr 30 min');
  });

  it('describes zero as always blocked', () => {
    expect(formatMinutes(0)).toBe('No free time (always blocked)');
  });
});
