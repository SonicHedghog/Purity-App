import {
  getFirstPartner,
  getNextIndex,
  isValidPhone,
  movePartner,
  normalizeOrder,
  normalizePhone,
  pickRandomPartner,
  sortByOrder,
} from './partners';
import type { AccountabilityPartner } from '../types';

function makePartner(
  id: string,
  order: number,
  overrides: Partial<AccountabilityPartner> = {}
): AccountabilityPartner {
  return {
    id,
    name: `Partner ${id}`,
    phoneNumber: '5551234567',
    order,
    createdAt: 0,
    ...overrides,
  };
}

describe('sortByOrder', () => {
  it('orders partners ascending by order without mutating input', () => {
    const input = [makePartner('a', 2), makePartner('b', 0), makePartner('c', 1)];
    const sorted = sortByOrder(input);
    expect(sorted.map((p) => p.id)).toEqual(['b', 'c', 'a']);
    expect(input.map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('getFirstPartner', () => {
  it('returns the lowest-ordered partner', () => {
    const partners = [makePartner('a', 5), makePartner('b', 1)];
    expect(getFirstPartner(partners)?.id).toBe('b');
  });

  it('returns null when there are no partners', () => {
    expect(getFirstPartner([])).toBeNull();
  });
});

describe('getNextIndex', () => {
  it('advances and wraps to the start', () => {
    expect(getNextIndex(0, 3)).toBe(1);
    expect(getNextIndex(2, 3)).toBe(0);
  });

  it('stays at 0 when there is one or zero partners', () => {
    expect(getNextIndex(0, 1)).toBe(0);
    expect(getNextIndex(0, 0)).toBe(0);
  });
});

describe('pickRandomPartner', () => {
  it('returns null for an empty list', () => {
    expect(pickRandomPartner([])).toBeNull();
  });

  it('uses the injected random function deterministically', () => {
    const partners = [makePartner('a', 0), makePartner('b', 1), makePartner('c', 2)];
    expect(pickRandomPartner(partners, undefined, () => 0)?.id).toBe('a');
    expect(pickRandomPartner(partners, undefined, () => 0.99)?.id).toBe('c');
  });

  it('excludes a partner by id when more than one exists', () => {
    const partners = [makePartner('a', 0), makePartner('b', 1)];
    expect(pickRandomPartner(partners, 'a', () => 0)?.id).toBe('b');
  });

  it('still returns the only partner even if it is excluded', () => {
    const partners = [makePartner('a', 0)];
    expect(pickRandomPartner(partners, 'a', () => 0)?.id).toBe('a');
  });
});

describe('movePartner', () => {
  it('moves a partner up and renormalizes order', () => {
    const partners = [makePartner('a', 0), makePartner('b', 1), makePartner('c', 2)];
    const moved = movePartner(partners, 'c', 'up');
    expect(moved.map((p) => p.id)).toEqual(['a', 'c', 'b']);
    expect(moved.map((p) => p.order)).toEqual([0, 1, 2]);
  });

  it('is a no-op when moving the first partner up', () => {
    const partners = [makePartner('a', 0), makePartner('b', 1)];
    expect(movePartner(partners, 'a', 'up')).toBe(partners);
  });
});

describe('normalizeOrder', () => {
  it('assigns contiguous order values', () => {
    const partners = [makePartner('a', 10), makePartner('b', 50)];
    expect(normalizeOrder(partners).map((p) => p.order)).toEqual([0, 1]);
  });
});

describe('phone helpers', () => {
  it('strips formatting characters', () => {
    expect(normalizePhone('(555) 123-4567')).toBe('5551234567');
    expect(normalizePhone('+1 555.123.4567')).toBe('+15551234567');
  });

  it('validates that a number has enough digits', () => {
    expect(isValidPhone('(555) 123-4567')).toBe(true);
    expect(isValidPhone('12')).toBe(false);
    expect(isValidPhone('abc')).toBe(false);
  });
});
