/**
 * Safe wrapper around the `expo-app-blocker` native module.
 *
 * The module only exists in a development/production build that includes its
 * native code — it is not available in Expo Go or on web. Every export here
 * degrades gracefully so the rest of the app can render without crashing;
 * callers check `isAppBlockerAvailable()` before offering native features.
 */
import { Platform } from 'react-native';

import type { IosLimitedItem } from '../types';

export type BlockerPermissions = {
  allGranted: boolean;
  overlay: boolean;
  usageStats: boolean;
  notifications: boolean;
  iosAuthorized: boolean;
};

export type InstalledApp = {
  packageName: string;
  name: string;
  iconBase64?: string | null;
};

type AppBlockerModule = typeof import('expo-app-blocker');

let cachedModule: AppBlockerModule | null | undefined;

function getModule(): AppBlockerModule | null {
  if (cachedModule !== undefined) return cachedModule;
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    cachedModule = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require('expo-app-blocker') as AppBlockerModule;
  } catch {
    cachedModule = null;
  }
  return cachedModule;
}

/** True when the native module is present (dev/production build, not Expo Go/web). */
export function isAppBlockerAvailable(): boolean {
  return getModule() !== null;
}

export async function getBlockerPermissions(): Promise<BlockerPermissions> {
  const mod = getModule();
  const none: BlockerPermissions = {
    allGranted: false,
    overlay: false,
    usageStats: false,
    notifications: false,
    iosAuthorized: false,
  };
  if (!mod) return none;
  try {
    const status = await mod.getPermissionStatus();
    if (status.details.platform === 'android') {
      return {
        allGranted: status.allGranted,
        overlay: status.details.overlay,
        usageStats: status.details.usageStats,
        notifications: status.details.notifications,
        iosAuthorized: false,
      };
    }
    return {
      ...none,
      allGranted: status.allGranted,
      iosAuthorized: status.details.authorized,
    };
  } catch {
    return none;
  }
}

export async function requestIosAuthorization(): Promise<boolean> {
  const mod = getModule();
  if (!mod || Platform.OS !== 'ios') return false;
  try {
    const status = await mod.requestPermissions();
    return status.allGranted;
  } catch {
    return false;
  }
}

export function openOverlaySettings(): void {
  getModule()?.openOverlaySettings();
}

export function openUsageStatsSettings(): void {
  getModule()?.openUsageStatsSettings();
}

export async function getInstalledApps(): Promise<InstalledApp[]> {
  const mod = getModule();
  if (!mod) return [];
  try {
    return await mod.getInstalledApps();
  } catch {
    return [];
  }
}

/**
 * Apply the current Android limit configuration: which apps are blocked and
 * whether the enforcement service is running.
 */
export function applyAndroidBlocking(packageNames: string[], enabled: boolean): void {
  const mod = getModule();
  if (!mod || Platform.OS !== 'android') return;
  mod.setBlockedApps(enabled ? packageNames : []);
  if (enabled && packageNames.length > 0) {
    mod.startMonitoring();
  } else {
    mod.stopMonitoring();
  }
}

/**
 * Present Apple's FamilyActivityPicker and return the chosen Screen Time
 * items as opaque tokens.
 */
export async function pickIosApps(): Promise<IosLimitedItem[]> {
  const mod = getModule();
  if (!mod || Platform.OS !== 'ios') return [];
  try {
    const items = await mod.presentFamilyActivityPicker();
    return items.map((item) => ({ type: item.type, token: item.token }));
  } catch {
    return [];
  }
}

/**
 * Apply the iOS Family Controls shield configuration. No-ops unless the app
 * was built with the Family Controls entitlement and authorization granted.
 */
export async function applyIosBlocking(
  items: IosLimitedItem[],
  enabled: boolean
): Promise<void> {
  const mod = getModule();
  if (!mod || Platform.OS !== 'ios') return;
  try {
    await mod.setBlockConfiguration({
      blockedItems: items.map((item) => ({ type: item.type, token: item.token })),
      isActive: enabled && items.length > 0,
    });
  } catch {
    // Family Controls not authorized / entitlement missing — stay dark.
  }
}

/** Grant the user their daily allowance of minutes inside limited apps. */
export async function grantAllowance(minutes: number): Promise<boolean> {
  const mod = getModule();
  if (!mod) return false;
  try {
    const result = await mod.temporaryUnlock(minutes);
    return result.unlocked;
  } catch {
    return false;
  }
}

/** Seconds left on the active allowance, or 0. */
export function getRemainingAllowanceSeconds(): number {
  const mod = getModule();
  if (!mod) return 0;
  try {
    return mod.getRemainingUnlockTime();
  } catch {
    return 0;
  }
}

/** End the allowance early and re-block limited apps. */
export async function relockNow(): Promise<void> {
  const mod = getModule();
  if (!mod) return;
  try {
    await mod.relockApps();
  } catch {
    // Nothing to relock.
  }
}
