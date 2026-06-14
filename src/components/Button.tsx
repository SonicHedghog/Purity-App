import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fontSize, radius, spacing } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const backgrounds: Record<ButtonVariant, string> = {
  primary: colors.primary,
  secondary: colors.surfaceMuted,
  danger: colors.danger,
  ghost: 'transparent',
};

const textColors: Record<ButtonVariant, string> = {
  primary: colors.textInverse,
  secondary: colors.text,
  danger: colors.textInverse,
  ghost: colors.primary,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: backgrounds[variant] },
        variant === 'ghost' && styles.ghost,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColors[variant]} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.label, { color: textColors[variant] }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
