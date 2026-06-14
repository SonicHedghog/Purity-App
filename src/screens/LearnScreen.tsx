import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { FREEDOM_FIGHT } from '../config';
import { useAppState } from '../state/AppStateContext';
import { colors, fontSize, spacing } from '../theme';

export function LearnScreen() {
  const { settings, setLearnUrl } = useAppState();
  const [editing, setEditing] = useState(false);
  const [draftUrl, setDraftUrl] = useState(settings.learnUrl);
  const [reloadKey, setReloadKey] = useState(0);

  const openEditor = () => {
    setDraftUrl(settings.learnUrl);
    setEditing(true);
  };

  const saveUrl = () => {
    const next = draftUrl.trim();
    if (next.length > 0) {
      setLearnUrl(next);
      setReloadKey((k) => k + 1);
    }
    setEditing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <View style={styles.bar}>
        <View style={styles.barText}>
          <Text style={styles.barTitle}>Freedom Fight lessons</Text>
          <Text style={styles.barSubtitle} numberOfLines={1}>
            {settings.learnUrl}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit lessons URL"
          onPress={openEditor}
          style={styles.iconButton}>
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.ctaRow}>
        <Button
          label="Create a Freedom Fight account"
          variant="secondary"
          onPress={() => Linking.openURL(FREEDOM_FIGHT.SIGNUP_URL)}
          style={styles.cta}
        />
      </View>

      <WebView
        key={reloadKey}
        source={{ uri: settings.learnUrl }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        style={styles.web}
      />

      <Modal
        visible={editing}
        animationType="slide"
        transparent
        onRequestClose={() => setEditing(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Lessons URL</Text>
            <Text style={styles.modalHint}>
              Point this to the Freedom Fight lessons page. You can update it any time.
            </Text>
            <TextField
              label="URL"
              value={draftUrl}
              onChangeText={setDraftUrl}
              placeholder="https://thefreedomfight.org/..."
              keyboardType="url"
              autoFocus
            />
            <Button label="Save" onPress={saveUrl} />
            <Button label="Cancel" variant="ghost" onPress={() => setEditing(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  barText: {
    flex: 1,
  },
  barTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  barSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  iconButton: {
    padding: spacing.sm,
  },
  ctaRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cta: {
    minHeight: 44,
  },
  web: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
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
  },
  modalHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
});
