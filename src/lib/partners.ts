import type { AccountabilityPartner } from '../types';

/** Generate a reasonably unique id without pulling in a uuid dependency. */
export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Partners sorted by their call order (ascending). */
export function sortByOrder(partners: AccountabilityPartner[]): AccountabilityPartner[] {
  return [...partners].sort((a, b) => a.order - b.order);
}

/** The partner that should be contacted first on the Triggered screen. */
export function getFirstPartner(
  partners: AccountabilityPartner[]
): AccountabilityPartner | null {
  const sorted = sortByOrder(partners);
  return sorted[0] ?? null;
}

/**
 * Advance to the next partner in the ordered list, wrapping back to the start
 * once the end is reached. Returns the current index when there is at most one
 * partner.
 */
export function getNextIndex(currentIndex: number, length: number): number {
  if (length <= 1) return 0;
  return (currentIndex + 1) % length;
}

/**
 * Pick a random partner, optionally excluding one by id (so "practice again"
 * can avoid repeating the same person when more than one exists).
 */
export function pickRandomPartner(
  partners: AccountabilityPartner[],
  excludeId?: string,
  random: () => number = Math.random
): AccountabilityPartner | null {
  if (partners.length === 0) return null;
  const pool =
    excludeId && partners.length > 1 ? partners.filter((p) => p.id !== excludeId) : partners;
  const index = Math.floor(random() * pool.length);
  return pool[index] ?? null;
}

/** Move a partner up or down one slot and renormalize the order values. */
export function movePartner(
  partners: AccountabilityPartner[],
  id: string,
  direction: 'up' | 'down'
): AccountabilityPartner[] {
  const sorted = sortByOrder(partners);
  const index = sorted.findIndex((p) => p.id === id);
  if (index === -1) return partners;
  const target = direction === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= sorted.length) return partners;
  const next = [...sorted];
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((p, i) => ({ ...p, order: i }));
}

/** Reassign order values to be contiguous 0..n-1 based on current ordering. */
export function normalizeOrder(partners: AccountabilityPartner[]): AccountabilityPartner[] {
  return sortByOrder(partners).map((p, i) => ({ ...p, order: i }));
}

const DIGITS_AND_SYMBOLS = /[^\d+*#]/g;

/** Strip spaces, dashes and parentheses for use in tel:/sms: URLs. */
export function normalizePhone(input: string): string {
  return input.replace(DIGITS_AND_SYMBOLS, '');
}

/** Minimal sanity check: at least 3 dialable digits after normalizing. */
export function isValidPhone(input: string): boolean {
  const normalized = normalizePhone(input);
  const digitCount = (normalized.match(/\d/g) ?? []).length;
  return digitCount >= 3;
}
