import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { BraceWalkthrough } from '../components/BraceWalkthrough';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { TextField } from '../components/TextField';
import { buildPracticeMessage, BRACE_STEPS } from '../lib/brace';
import { sendPracticeMessage } from '../lib/messaging';
import { pickRandomPartner } from '../lib/partners';
import { useAppState } from '../state/AppStateContext';
import { colors, fontSize, radius, spacing } from '../theme';
import type { AccountabilityPartner } from '../types';
import type { RootTabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<RootTabParamList, 'Practice'>;

export function PracticeScreen({ navigation }: Props) {
  const { partners, settings } = useAppState();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState(settings.practiceMessage);
  const [walkthrough, setWalkthrough] = useState(false);
  const [sending, setSending] = useState(false);

  const selected: AccountabilityPartner | null =
    partners.find((p) => p.id === selectedId) ?? null;

  // Auto-pick a random partner in an effect when none is chosen yet (or the
  // chosen one was removed).
  useEffect(() => {
    if (partners.length > 0 && !selected) {
      const next = pickRandomPartner(partners)?.id ?? null;
      if (next !== selectedId) setSelectedId(next);
    }
  }, [partners, selected, selectedId]);

  const shuffle = () =>
    setSelectedId(pickRandomPartner(partners, selectedId ?? undefined)?.id ?? null);

  const handleSend = async () => {
    if (!selected) {
      Alert.alert('Add a partner first', 'You need a partner to practice reaching out.');
      return;
    }
    setSending(true);
    try {
      const result = await sendPracticeMessage(selected, buildPracticeMessage(message));
      if (result === 'sent') {
        Alert.alert('Nice work', `Your message app opened a text to ${selected.name}.`);
      }
    } catch {
      Alert.alert('Could not open messages', 'Something went wrong opening your message app.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen scroll>
      <SectionHeader
        title="Practice BRACE"
        subtitle="Rehearse the technique so it is second nature when you need it."
      />

      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconBadge}>
            <Ionicons name="walk" size={22} color={colors.primaryDark} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>Guided walkthrough</Text>
            <Text style={styles.cardBody}>
              Step through {BRACE_STEPS.map((s) => s.letter).join(' · ')} with a breathing
              guide and prompts.
            </Text>
          </View>
        </View>
        <Button label="Start walkthrough" onPress={() => setWalkthrough(true)} />
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconBadge}>
            <Ionicons name="chatbubble-ellipses" size={22} color={colors.primaryDark} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>Reach out to a partner</Text>
            <Text style={styles.cardBody}>
              We pick a partner at random. Edit your message, then send it from your messaging
              app.
            </Text>
          </View>
        </View>

        {partners.length === 0 ? (
          <Button label="Add a partner" onPress={() => navigation.navigate('Partners')} />
        ) : (
          <>
            <View style={styles.partnerRow}>
              <View style={styles.flex}>
                <Text style={styles.partnerLabel}>Sending to</Text>
                <Text style={styles.partnerName}>{selected?.name ?? '—'}</Text>
              </View>
              {partners.length > 1 ? (
                <Button
                  label="Shuffle"
                  variant="secondary"
                  onPress={shuffle}
                  icon={<Ionicons name="shuffle" size={16} color={colors.text} />}
                  style={styles.shuffle}
                />
              ) : null}
            </View>

            <TextField
              label="Message"
              value={message}
              onChangeText={setMessage}
              placeholder={settings.practiceMessage}
              multiline
            />

            <Button
              label="Open messaging app"
              onPress={handleSend}
              loading={sending}
              icon={<Ionicons name="send" size={18} color={colors.textInverse} />}
            />
          </>
        )}
      </Card>

      <BraceWalkthrough
        visible={walkthrough}
        onClose={() => setWalkthrough(false)}
        onReachOut={() => {
          setWalkthrough(false);
          if (partners.length === 0) {
            navigation.navigate('Partners');
            return;
          }
          void handleSend();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  cardBody: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  partnerLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  partnerName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  shuffle: {
    minHeight: 40,
    paddingHorizontal: spacing.lg,
  },
});
