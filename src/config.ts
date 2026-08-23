/**
 * App-wide configuration constants.
 *
 * The Freedom Fight content lives behind the user's own account on
 * thefreedomfight.org. We do not host or redistribute their content; the Learn
 * screen simply loads their site in a WebView so the user can sign in and view
 * the lessons they have access to.
 *
 */
export const FREEDOM_FIGHT = {
  /** Where the WebView points for the actual lessons/videos. */
  LESSONS_URL: 'https://app.thefreedomfight.org/courses',
  /** Sign-up page for users who do not yet have an account. */
  SIGNUP_URL: 'https://thefreedomfight.org/create-account/',
  /** Public site home, used as a fallback. */
  HOME_URL: 'https://thefreedomfight.org/',
} as const;

export const DEFAULT_PRACTICE_MESSAGE = "I'm practicing brace";

export const APP_NAME = 'Purity App';
