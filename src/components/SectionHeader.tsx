import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, spacing } from '../theme';

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
