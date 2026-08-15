/**
 * Shared domain types for the Purity App. All data is stored locally on the
 * device; nothing here is synced to a server.
 */

export type AccountabilityPartner = {
  id: string;
  name: string;
  /** Raw phone number as entered or imported from contacts. */
  phoneNumber: string;
  /** Position in the call order. Lower = called first on the Triggered screen. */
  order: number;
  createdAt: number;
};

export type Reminder = {
  id: string;
  /** Hour in 24h format (0-23). */
  hour: number;
  /** Minute (0-59). */
  minute: number;
  /** Optional custom label shown in the notification body. */
  label: string;
  enabled: boolean;
};

export type AppSettings = {
  /** Default message pre-filled on the Practice screen. */
  practiceMessage: string;
  /** URL the Learn screen WebView loads (editable; final URL TBD). */
  learnUrl: string;
  /** Whether the first-time onboarding flow has been completed. */
  onboarded: boolean;
};

/** An app the user has chosen to limit (Android package identity). */
export type LimitedApp = {
  packageName: string;
  name: string;
};

/**
 * An opaque Screen Time selection item (iOS). Tokens come from Apple's
 * FamilyActivityPicker and cannot be inspected, only passed back to the API.
 */
export type IosLimitedItem = {
  type: 'app' | 'category' | 'webDomain';
  token: string;
};

export type AppLimits = {
  enabled: boolean;
  /** Shared daily usage budget across all limited apps, in minutes. 0 = fully blocked. */
  dailyLimitMinutes: number;
  /** Apps the limit applies to (Android). */
  apps: LimitedApp[];
  /** Local date key (YYYY-MM-DD) of the last day the daily budget was granted. */
  lastGrantDate: string | null;
  /** Selected Screen Time items to shield (iOS). */
  iosItems: IosLimitedItem[];
};

export type PersistedState = {
  partners: AccountabilityPartner[];
  reminders: Reminder[];
  settings: AppSettings;
  appLimits: AppLimits;
};
