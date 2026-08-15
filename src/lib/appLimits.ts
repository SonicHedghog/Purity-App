import type { AppLimits, LimitedApp } from '../types';

export const DEFAULT_DAILY_LIMIT_MINUTES = 30;

export const defaultAppLimits: AppLimits = {
  enabled: false,
  dailyLimitMinutes: DEFAULT_DAILY_LIMIT_MINUTES,
  apps: [],
  lastGrantDate: null,
  iosItems: [],
};

/** Local-timezone date key (YYYY-MM-DD) used to track the once-a-day allowance. */
export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Whether the daily allowance is still available for the given day. */
export function canUseAllowance(limits: AppLimits, day: string = todayKey()): boolean {
  return limits.dailyLimitMinutes > 0 && limits.lastGrantDate !== day;
}

/** Add or remove an app from the limited list, keyed by package name. */
export function toggleLimitedApp(apps: LimitedApp[], app: LimitedApp): LimitedApp[] {
  if (apps.some((a) => a.packageName === app.packageName)) {
    return apps.filter((a) => a.packageName !== app.packageName);
  }
  return [...apps, app].sort((a, b) => a.name.localeCompare(b.name));
}

export function isAppLimited(apps: LimitedApp[], packageName: string): boolean {
  return apps.some((a) => a.packageName === packageName);
}

/** Clamp a raw minutes input to a sane 0–480 range (0 = fully blocked). */
export function clampDailyLimit(raw: number): number {
  if (!Number.isFinite(raw)) return DEFAULT_DAILY_LIMIT_MINUTES;
  return Math.min(480, Math.max(0, Math.round(raw)));
}

export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return 'No free time (always blocked)';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}
