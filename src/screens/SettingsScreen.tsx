import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { TextField } from '../components/TextField';
import { ensurePermissions, formatTime, syncReminders } from '../lib/notifications';
import { useAppState } from '../state/AppStateContext';
import { colors, fontSize, spacing } from '../theme';

type PickerTarget = { kind: 'new' } | { kind: 'edit'; id: string } | null;

function dateFromHM(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function SettingsScreen() {
  const {
    reminders,
    settings,
    addReminder,
    updateReminder,
    toggleReminder,
    removeReminder,
    setPracticeMessage,
    resetOnboarding,
  } = useAppState();

  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [pickerValue, setPickerValue] = useState<Date>(new Date());
  const [messageDraft, setMessageDraft] = useState(settings.practiceMessage);

  const openAdd = () => {
    setPickerValue(dateFromHM(8, 0));
    setPickerTarget({ kind: 'new' });
  };

  const openEdit = (id: string, hour: number, minute: number) => {
    setPickerValue(dateFromHM(hour, minute));
    setPickerTarget({ kind: 'edit', id });
  };

  const onPickerChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) setPickerValue(date);
  };

  const applyPicker = () => {
    const hour = pickerValue.getHours();
    const minute = pickerValue.getMinutes();
    if (pickerTarget?.kind === 'new') {
      addReminder({ hour, minute, label: '' });
    } else if (pickerTarget?.kind === 'edit') {
      updateReminder(pickerTarget.id, { hour, minute });
    }
    setPickerTarget(null);
  };

  const enableNotifications = async () => {
    const granted = await ensurePermissions();
    if (granted) {
      await syncReminders(reminders);
    }
    Alert.alert(
      granted ? 'Notifications enabled' : 'Notifications blocked',
      granted
        ? 'You will receive your daily reminders.'
        : 'Enable notifications for Purity App in your device settings to receive reminders.'
    );
  };

  const saveMessage = () => {
    setPracticeMessage(messageDraft.trim() || settings.practiceMessage);
    Alert.alert('Saved', 'Your default practice message has been updated.');
  };

  return (
    <Screen scroll>
      <SectionHeader
        title="Daily reminders"
        subtitle="Get a gentle check-in at the times you choose."
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add reminder"
            onPress={openAdd}
            hitSlop={8}>
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </Pressable>
        }
      />

      {reminders.length === 0 ? (
        <Card style={styles.card}>
          <Text style={styles.muted}>No reminders yet. Tap + to add one.</Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {reminders.map((reminder) => (
            <Card key={reminder.id} style={styles.reminderCard}>
              <Pressable
                style={styles.reminderMain}
                onPress={() => openEdit(reminder.id, reminder.hour, reminder.minute)}>
                <Text style={styles.time}>{formatTime(reminder.hour, reminder.minute)}</Text>
                <Text style={styles.muted}>
                  Daily{reminder.label ? ` · ${reminder.label}` : ''}
                </Text>
              </Pressable>
              <View style={styles.reminderActions}>
                <Switch
                  value={reminder.enabled}
                  onValueChange={() => toggleReminder(reminder.id)}
                  trackColor={{ true: colors.primary, false: colors.border }}
                />
                <Pressable
                  accessibilityLabel="Delete reminder"
                  onPress={() => removeReminder(reminder.id)}
                  hitSlop={8}>
                  <Ionicons name="trash-outline" size={22} color={colors.danger} />
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
      )}

      <Button
        label="Enable notifications"
        variant="secondary"
        onPress={enableNotifications}
        style={styles.block}
        icon={<Ionicons name="notifications" size={18} color={colors.text} />}
      />

      <View style={styles.section}>
        <SectionHeader
          title="Default practice message"
          subtitle="Pre-filled when you reach out from the Practice screen."
        />
        <Card style={styles.card}>
          <TextField
            label="Message"
            value={messageDraft}
            onChangeText={setMessageDraft}
            placeholder="I'm practicing brace"
            multiline
          />
          <Button label="Save message" onPress={saveMessage} />
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="About" />
        <Card style={styles.card}>
          <Text style={styles.muted}>
            All your data — partners, reminders, and messages — is stored only on this device.
          </Text>
          <Button
            label="Replay the intro tutorial"
            variant="ghost"
            onPress={resetOnboarding}
            style={styles.block}
          />
        </Card>
      </View>

      {pickerTarget ? (
        <Modal transparent animationType="fade" onRequestClose={() => setPickerTarget(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Pick a time</Text>
              <View style={styles.pickerWrap}>
                <DateTimePicker
                  value={pickerValue}
                  mode="time"
                  display="spinner"
                  onChange={onPickerChange}
                  textColor={colors.text}
                />
              </View>
              <Button label="Set reminder" onPress={applyPicker} />
              <Button label="Cancel" variant="ghost" onPress={() => setPickerTarget(null)} />
            </View>
          </View>
        </Modal>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderMain: {
    flex: 1,
  },
  time: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  muted: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  block: {
    marginTop: spacing.md,
  },
  section: {
    marginTop: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: spacing.sm,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  pickerWrap: {
    alignItems: 'center',
  },
});
