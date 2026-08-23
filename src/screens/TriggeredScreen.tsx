import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { callPartner } from '../lib/phone';
import { getNextIndex, sortByOrder } from '../lib/partners';
import { useAppState } from '../state/AppStateContext';
import { colors, fontSize, radius, spacing } from '../theme';
import type { RootTabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<RootTabParamList, 'Triggered'>;

export function TriggeredScreen({ navigation }: Props) {
  const { partners } = useAppState();
  const sorted = sortByOrder(partners);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const startCall = () => {
    if (sorted.length === 0) return;
    setActiveIndex(0);
    void callPartner(sorted[0]);
  };

  const callNext = () => {
    if (activeIndex === null) return;
    const next = getNextIndex(activeIndex, sorted.length);
    setActiveIndex(next);
    void callPartner(sorted[next]);
  };

  const reset = () => setActiveIndex(null);

  const activePartner = activeIndex !== null ? sorted[activeIndex] : null;

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Feeling triggered?</Text>
        <Text style={styles.subtitle}>
          You are not alone. Reach out right now — one tap calls your first partner.
        </Text>
      </View>

      {sorted.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="people-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Add a partner first</Text>
          <Text style={styles.emptyText}>
            You need at least one accountability partner before you can use this button.
          </Text>
          <Button label="Add a partner" onPress={() => navigation.navigate('Partners')} />
        </Card>
      ) : (
        <View style={styles.center}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Triggered, call my first partner"
            onPress={startCall}
            style={({ pressed }) => [styles.bigButton, pressed && styles.bigButtonPressed]}>
            <Ionicons name="call" size={48} color={colors.textInverse} />
            <Text style={styles.bigButtonText}>TRIGGERED</Text>
            <Text style={styles.bigButtonHint}>Tap to call your first partner</Text>
          </Pressable>

          {activePartner ? (
            <Card style={styles.activeCard}>
              <Text style={styles.activeLabel}>
                Calling partner {activeIndex! + 1} of {sorted.length}
              </Text>
              <Text style={styles.activeName}>{activePartner.name}</Text>
              <Text style={styles.activePhone}>{activePartner.phoneNumber}</Text>

              <Button
                label="Call again"
                onPress={() => void callPartner(activePartner)}
                icon={<Ionicons name="call" size={18} color={colors.textInverse} />}
                style={styles.spaced}
              />
              {sorted.length > 1 ? (
                <Button
                  label="No answer — next partner"
                  variant="secondary"
                  onPress={callNext}
                  style={styles.spaced}
                />
              ) : null}
              <Button label="I got through — done" variant="ghost" onPress={reset} />
            </Card>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  bigButton: {
    width: 240,
    height: 240,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  bigButtonPressed: {
    backgroundColor: colors.dangerDark,
    transform: [{ scale: 0.97 }],
  },
  bigButtonText: {
    color: colors.textInverse,
    fontSize: fontSize.xxl,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  bigButtonHint: {
    color: colors.textInverse,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    opacity: 0.9,
  },
  activeCard: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  activeLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  activeName: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xs,
  },
  activePhone: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  spaced: {
    alignSelf: 'stretch',
    marginBottom: spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
