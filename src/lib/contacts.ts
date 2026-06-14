import { Contact, ContactField } from 'expo-contacts';
import * as LegacyContacts from 'expo-contacts/legacy';
import { Platform } from 'react-native';

export type PickedContact = {
  name: string;
  phoneNumber: string;
};

/**
 * Present the native contact picker and return the selected contact's name and
 * first phone number. Returns null if the user cancels (or denies access on
 * Android, where we request contacts permission before opening the picker).
 */
export async function pickContact(): Promise<PickedContact | null> {
  if (Platform.OS === 'android') {
    const permission = await LegacyContacts.requestPermissionsAsync();
    if (permission.status !== 'granted') return null;

    const picked = await LegacyContacts.presentContactPickerAsync();
    if (!picked) return null;

    const composedName = [picked.firstName, picked.lastName]
      .filter((part): part is string => Boolean(part))
      .join(' ')
      .trim();
    const name = (picked.name ?? composedName) || 'Unnamed contact';
    const phoneNumber = picked.phoneNumbers?.find((p) => p.number)?.number ?? '';

    return { name, phoneNumber };
  }

  const contact = await Contact.presentPicker();
  if (!contact) return null;

  const details = await contact.getDetails([
    ContactField.FULL_NAME,
    ContactField.GIVEN_NAME,
    ContactField.FAMILY_NAME,
    ContactField.PHONES,
  ]);

  const composedName = [details.givenName, details.familyName]
    .filter((part): part is string => Boolean(part))
    .join(' ')
    .trim();
  const name = (details.fullName ?? composedName) || 'Unnamed contact';

  const phones = details.phones ?? [];
  const phoneNumber = phones.find((p) => p.number)?.number ?? '';

  return { name, phoneNumber };
}
