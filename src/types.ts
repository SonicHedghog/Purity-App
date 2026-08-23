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

export type PersistedState = {
  partners: AccountabilityPartner[];
  reminders: Reminder[];
  settings: AppSettings;
};
