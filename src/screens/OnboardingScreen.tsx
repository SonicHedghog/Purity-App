import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { APP_NAME } from '../config';
import { useAppState } from '../state/AppStateContext';
import { colors, fontSize, radius, spacing } from '../theme';

type Slide = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    icon: 'shield-checkmark',
    title: `Welcome to ${APP_NAME}`,
    body: 'A companion for your journey through The Freedom Fight. Everything here stays private on your device.',
  },
  {
    icon: 'people',
    title: 'Add accountability partners',
    body: 'Save trusted people by name and number, or pick them from your contacts. They are who you reach when you need support.',
  },
  {
    icon: 'alert-circle',
    title: 'One tap when you are triggered',
    body: 'The big Triggered button calls your first partner instantly. No answer? Tap "next partner" to try the next person.',
  },
  {
    icon: 'fitness',
    title: 'Practice the BRACE technique',
    body: 'Walk through Breathe, Remember, Affirm, Call, Escape — and send a quick "I\'m practicing brace" message to a partner.',
  },
  {
    icon: 'notifications',
    title: 'Daily reminders',
    body: 'Set check-in reminders at the times that work for you. You can change everything later in Settings.',
  },
];

export function OnboardingScreen() {
  const { completeOnboarding } = useAppState();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.top}>
        <Button
          label="Skip"
          variant="ghost"
          onPress={completeOnboarding}
          style={styles.skip}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons name={slide.icon} size={56} color={colors.primary} />
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.bodyText}>{slide.body}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View key={s.title} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Button
          label={isLast ? 'Get started' : 'Next'}
          onPress={() => (isLast ? completeOnboarding() : setIndex((i) => i + 1))}
        />
        {index > 0 ? (
          <Button
            label="Back"
            variant="ghost"
            onPress={() => setIndex((i) => Math.max(0, i - 1))}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  top: {
    alignItems: 'flex-end',
  },
  skip: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  bodyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  footer: {
    gap: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
});
