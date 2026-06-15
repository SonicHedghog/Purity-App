import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { pickContact } from '../lib/contacts';
import { isValidPhone } from '../lib/partners';
import { useAppState } from '../state/AppStateContext';
import { colors, fontSize, spacing } from '../theme';
import type { PartnersStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<PartnersStackParamList, 'PartnerForm'>;

export function PartnerFormScreen({ navigation, route }: Props) {
  const partnerId = route.params?.partnerId;
  const { partners, addPartner, updatePartner } = useAppState();
  const existing = partners.find((p) => p.id === partnerId);

  const [name, setName] = useState(existing?.name ?? '');
  const [phone, setPhone] = useState(existing?.phoneNumber ?? '');

  const handlePickContact = async () => {
    try {
      const picked = await pickContact();
      if (!picked) return;
      setName((current) => current || picked.name);
      setPhone(picked.phoneNumber);
      if (!picked.phoneNumber) {
        Alert.alert('No number found', 'That contact has no phone number. Please enter one.');
      }
    } catch {
      Alert.alert(
        'Could not open contacts',
        'We were unable to open your contacts. You can enter the details manually instead.'
      );
    }
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      Alert.alert('Name required', 'Please enter a name for this partner.');
      return;
    }
    if (!isValidPhone(phone)) {
      Alert.alert('Invalid number', 'Please enter a valid phone number.');
      return;
    }
    if (existing) {
      updatePartner(existing.id, { name: trimmedName, phoneNumber: phone });
    } else {
      addPartner({ name: trimmedName, phoneNumber: phone });
    }
    navigation.goBack();
  };

  return (
    <Screen scroll>
      <Text style={styles.intro}>
        {existing
          ? 'Update this partner’s details.'
          : 'Enter a partner’s details, or import them from your contacts.'}
      </Text>

      {Platform.OS !== 'web' ? (
        <>
          <Button
            label="Pick from contacts"
            variant="secondary"
            onPress={handlePickContact}
            icon={<Ionicons name="person-add" size={18} color={colors.text} />}
            style={styles.pick}
          />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or enter manually</Text>
            <View style={styles.line} />
          </View>
        </>
      ) : null}

      <TextField label="Name" value={name} onChangeText={setName} placeholder="e.g. Sam" />
      <TextField
        label="Phone number"
        value={phone}
        onChangeText={setPhone}
        placeholder="e.g. (555) 123-4567"
        keyboardType="phone-pad"
      />

      <Button label={existing ? 'Save changes' : 'Add partner'} onPress={handleSave} />
      <Button label="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  pick: {
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
