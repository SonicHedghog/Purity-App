import * as Clipboard from 'expo-clipboard';
import * as SMS from 'expo-sms';
import { Alert, Linking, Platform } from 'react-native';

import type { AccountabilityPartner } from '../types';
import { normalizePhone } from './partners';

export type SendResult = 'sent' | 'cancelled' | 'unavailable' | 'copied';

/** Build an sms: deep link with the body pre-filled as a fallback path. */
export function buildSmsUrl(phoneNumber: string, body: string): string {
  const normalized = normalizePhone(phoneNumber);
  const separator = Platform.OS === 'ios' ? '&' : '?';
  return `sms:${normalized}${separator}body=${encodeURIComponent(body)}`;
}

/**
 * Open the device messaging app with the recipient and message pre-filled. The
 * user still taps "send" themselves (the OS does not allow silent sending).
 *
 * Order of preference:
 *  1. expo-sms composer (pre-fills recipient + body on both platforms)
 *  2. sms: deep link (pre-fills where supported)
 *  3. copy the message to the clipboard so the user can paste it manually
 */
export async function sendPracticeMessage(
  partner: AccountabilityPartner,
  message: string
): Promise<SendResult> {
  const isAvailable = await SMS.isAvailableAsync();
  if (isAvailable) {
    const { result } = await SMS.sendSMSAsync([normalizePhone(partner.phoneNumber)], message);
    return result === 'sent' ? 'sent' : 'cancelled';
  }

  const url = buildSmsUrl(partner.phoneNumber, message);
  if (await Linking.canOpenURL(url)) {
    await Linking.openURL(url);
    return 'sent';
  }

  await Clipboard.setStringAsync(message);
  Alert.alert(
    'Message copied',
    `Messaging isn't available on this device, so we copied your message to the clipboard. Open your messaging app, start a text to ${partner.name} (${partner.phoneNumber}), and paste it.`
  );
  return 'copied';
}
