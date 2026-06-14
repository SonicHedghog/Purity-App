import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Reminder } from '../types';

const ANDROID_CHANNEL_ID = 'purity-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Format an hour/minute pair as a 12-hour clock string, e.g. "9:05 PM". */
export function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const mm = minute.toString().padStart(2, '0');
  return `${h12}:${mm} ${period}`;
}

/** Convert a reminder into the daily trigger input expected by expo-notifications. */
export function reminderToTrigger(reminder: Reminder): Notifications.DailyTriggerInput {
  return {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour: reminder.hour,
    minute: reminder.minute,
  };
}

export async function ensurePermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  return status === 'granted';
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Daily reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * Cancel every scheduled reminder and re-create one per enabled reminder. We
 * fully rebuild rather than diffing so the scheduled set always matches state.
 */
export async function syncReminders(reminders: Reminder[]): Promise<boolean> {
  const enabled = reminders.filter((r) => r.enabled);

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (enabled.length === 0) return true;

  const granted = await ensurePermissions();
  if (!granted) return false;

  await ensureAndroidChannel();

  for (const reminder of enabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: reminder.id,
      content: {
        title: 'Purity App',
        body: reminder.label.trim() || 'Time for a quick check-in.',
      },
      trigger: reminderToTrigger(reminder),
    });
  }
  return true;
}
