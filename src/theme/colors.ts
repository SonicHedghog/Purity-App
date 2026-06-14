/**
 * Purity App color palette.
 *
 * Calm, trustworthy indigo/blue as the primary brand color with white surfaces,
 * a teal accent for positive actions, and a strong red reserved exclusively for
 * the "Triggered" emergency actions so they are unmistakable.
 */
export const colors = {
  primary: '#4C6EF5',
  primaryDark: '#3B5BDB',
  primaryLight: '#DBE4FF',

  accent: '#0CA678',
  accentDark: '#099268',
  accentLight: '#C3FAE8',

  danger: '#E03131',
  dangerDark: '#C92A2A',
  dangerLight: '#FFE3E3',

  background: '#F6F8FC',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F9',

  text: '#1A1B25',
  textMuted: '#6B7280',
  textInverse: '#FFFFFF',

  border: '#E2E8F0',
  overlay: 'rgba(16, 24, 40, 0.45)',

  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorName = keyof typeof colors;
