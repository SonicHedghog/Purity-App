import { DEFAULT_PRACTICE_MESSAGE } from '../config';

export type BraceStep = {
  letter: string;
  title: string;
  description: string;
  /** Seconds to dwell on this step in the guided walkthrough. */
  durationSeconds: number;
};

/**
 * The BRACE technique taught in The Freedom Fight. Used both for the guided
 * practice walkthrough and the onboarding explanation.
 */
export const BRACE_STEPS: BraceStep[] = [
  {
    letter: 'B',
    title: 'Breathe',
    description:
      'Combat breathing: inhale steadily through your nose for 4 seconds, then exhale slowly through your mouth for 4 seconds. This oxygenates your prefrontal cortex so you can think clearly.',
    durationSeconds: 32,
  },
  {
    letter: 'R',
    title: 'Remember',
    description:
      'Recall the truth about God, His promises, and your identity in Christ. Bring a memorized verse to mind to re-engage higher reasoning.',
    durationSeconds: 20,
  },
  {
    letter: 'A',
    title: 'Affirm',
    description:
      'Believe and declare those promises out loud. Knowing truth is not enough — affirming it gives you the courage to reach out for help.',
    durationSeconds: 20,
  },
  {
    letter: 'C',
    title: 'Call',
    description:
      'Break isolation. Call or text an accountability partner and tell them you are tempted. Making the call often makes the difference.',
    durationSeconds: 20,
  },
  {
    letter: 'E',
    title: 'Escape',
    description:
      'Flee the temptation. Leave the situation and escape to a healthy outlet — go for a walk, work out, or spend time with a friend.',
    durationSeconds: 20,
  },
];

/**
 * Build the message that gets sent to an accountability partner. Falls back to
 * the default ("I'm practicing brace") when the user leaves the field blank.
 */
export function buildPracticeMessage(custom?: string | null): string {
  const trimmed = custom?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_PRACTICE_MESSAGE;
}
