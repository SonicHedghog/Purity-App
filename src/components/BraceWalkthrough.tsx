import React, { useEffect, useState } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';

import { BRACE_STEPS } from '../lib/brace';
import { colors, fontSize, radius, spacing } from '../theme';
import { Button } from './Button';

const BREATH_MS = 4000;

function BreathingGuide() {
  const [scale] = useState(() => new Animated.Value(0));
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1,
          duration: BREATH_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0,
          duration: BREATH_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    const interval = setInterval(
      () => setPhase((prev) => (prev === 'in' ? 'out' : 'in')),
      BREATH_MS
    );

    return () => {
      animation.stop();
      clearInterval(interval);
    };
  }, [scale]);

  const size = scale.interpolate({ inputRange: [0, 1], outputRange: [120, 200] });

  return (
    <View style={styles.breathContainer}>
      <Animated.View style={[styles.breathCircle, { width: size, height: size }]} />
      <Text style={styles.breathLabel}>
        {phase === 'in' ? 'Breathe in slowly…' : 'Breathe out slowly…'}
      </Text>
    </View>
  );
}

export function BraceWalkthrough({
  visible,
  onClose,
  onReachOut,
}: {
  visible: boolean;
  onClose: () => void;
  onReachOut: () => void;
}) {
  const [index, setIndex] = useState(0);

  const handleClose = () => {
    setIndex(0);
    onClose();
  };

  const step = BRACE_STEPS[index];
  const isLast = index === BRACE_STEPS.length - 1;
  const isCallStep = step.letter === 'C';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.progress}>
            {BRACE_STEPS.map((s, i) => (
              <View key={s.letter} style={[styles.dot, i <= index && styles.dotActive]} />
            ))}
          </View>
          <Button label="Close" variant="ghost" onPress={handleClose} style={styles.close} />
        </View>

        <View style={styles.body}>
          <View style={styles.badge}>
            <Text style={styles.badgeLetter}>{step.letter}</Text>
          </View>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
          {step.letter === 'B' ? <BreathingGuide /> : null}
        </View>

        <View style={styles.footer}>
          {isCallStep ? (
            <Button label="Reach out to a partner now" variant="danger" onPress={onReachOut} />
          ) : null}
          <View style={styles.nav}>
            {index > 0 ? (
              <Button
                label="Back"
                variant="secondary"
                onPress={() => setIndex((i) => Math.max(0, i - 1))}
                style={styles.navButton}
              />
            ) : null}
            <Button
              label={isLast ? 'Done' : 'Next'}
              onPress={() => (isLast ? handleClose() : setIndex((i) => i + 1))}
              style={styles.navButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progress: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 28,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  close: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  badgeLetter: {
    color: colors.textInverse,
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  breathContainer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
  },
  breathCircle: {
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    position: 'absolute',
  },
  breathLabel: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  footer: {
    gap: spacing.md,
  },
  nav: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  navButton: {
    flex: 1,
  },
});
