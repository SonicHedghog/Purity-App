import { Contact, ContactField } from 'expo-contacts';

export type PickedContact = {
  name: string;
  phoneNumber: string;
};

/**
 * Present the native contact picker and return the selected contact's name and
 * first phone number. Returns null if the user cancels. The picker is a system
 * UI, so it does not require us to hold the full contacts permission.
 */
export async function pickContact(): Promise<PickedContact | null> {
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
