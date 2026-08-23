import { BRACE_STEPS, buildPracticeMessage } from './brace';
import { DEFAULT_PRACTICE_MESSAGE } from '../config';

describe('BRACE_STEPS', () => {
  it('spells BRACE in order', () => {
    expect(BRACE_STEPS.map((s) => s.letter)).toEqual(['B', 'R', 'A', 'C', 'E']);
  });

  it('gives every step a title and description', () => {
    for (const step of BRACE_STEPS) {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.description.length).toBeGreaterThan(0);
      expect(step.durationSeconds).toBeGreaterThan(0);
    }
  });
});

describe('buildPracticeMessage', () => {
  it('falls back to the default when empty or whitespace', () => {
    expect(buildPracticeMessage('')).toBe(DEFAULT_PRACTICE_MESSAGE);
    expect(buildPracticeMessage('   ')).toBe(DEFAULT_PRACTICE_MESSAGE);
    expect(buildPracticeMessage(null)).toBe(DEFAULT_PRACTICE_MESSAGE);
    expect(buildPracticeMessage(undefined)).toBe(DEFAULT_PRACTICE_MESSAGE);
  });

  it('trims and uses a custom message', () => {
    expect(buildPracticeMessage('  call me  ')).toBe('call me');
  });
});
