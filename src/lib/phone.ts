import { Alert, Linking, Platform } from 'react-native';

import type { AccountabilityPartner } from '../types';
import { normalizePhone } from './partners';

/** Build the platform-appropriate tel: URL for a phone number. */
export function buildTelUrl(phoneNumber: string): string {
  const normalized = normalizePhone(phoneNumber);
  // `telprompt` shows a confirm dialog on iOS; `tel` opens the dialer directly.
  const scheme = Platform.OS === 'ios' ? 'telprompt' : 'tel';
  return `${scheme}:${normalized}`;
}

/**
 * Open the phone dialer for a partner. The OS will not let us auto-dial or
 * detect whether the call was answered, so the user taps call themselves and
 * uses the "next partner" button if there is no answer.
 */
export async function callPartner(partner: AccountabilityPartner): Promise<void> {
  const url = buildTelUrl(partner.phoneNumber);
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      'Could not start call',
      `We were unable to open the dialer for ${partner.name}. You can dial ${partner.phoneNumber} manually.`
    );
  }
}
