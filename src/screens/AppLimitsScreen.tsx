import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { TextField } from '../components/TextField';
import {
  applyAndroidBlocking,
  applyIosBlocking,
  getBlockerPermissions,
  getInstalledApps,
  grantAllowance,
  isAppBlockerAvailable,
  openOverlaySettings,
  openUsageStatsSettings,
  pickIosApps,
  relockNow,
  requestIosAuthorization,
  type BlockerPermissions,
  type InstalledApp,
} from '../lib/appBlocker';
import {
  canUseAllowance,
  clampDailyLimit,
  formatMinutes,
  isAppLimited,
  todayKey,
  toggleLimitedApp,
} from '../lib/appLimits';
import { useAppState } from '../state/AppStateContext';
import { colors, fontSize, radius, spacing } from '../theme';

export function AppLimitsScreen() {
  const { appLimits, updateAppLimits } = useAppState();
  const available = isAppBlockerAvailable();

  const [permissions, setPermissions] = useState<BlockerPermissions | null>(null);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [limitDraft, setLimitDraft] = useState(String(appLimits.dailyLimitMinutes));

  const refreshPermissions = useCallback(() => {
    if (!available) return;
    void getBlockerPermissions().then(setPermissions);
  }, [available]);

  useFocusEffect(refreshPermissions);

  const openPicker = async () => {
    const apps = await getInstalledApps();
    setInstalledApps(apps);
    setSearch('');
    setPickerOpen(true);
  };

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return installedApps;
    return installedApps.filter((app) => app.name.toLowerCase().includes(q));
  }, [installedApps, search]);

  const saveLimit = () => {
    const minutes = clampDailyLimit(Number(limitDraft));
    setLimitDraft(String(minutes));
    updateAppLimits({ dailyLimitMinutes: minutes });
    Alert.alert('Saved', `Daily free time set to ${formatMinutes(minutes)}.`);
  };

  const spendAllowance = async () => {
    const unlocked = await grantAllowance(appLimits.dailyLimitMinutes);
    if (unlocked) {
      updateAppLimits({ lastGrantDate: todayKey() });
      Alert.alert(
        'Free time started',
        `Your limited apps are open for ${formatMinutes(appLimits.dailyLimitMinutes)}. They re-lock automatically when time is up.`
      );
    } else {
      Alert.alert(
        'Could not start free time',
        'Make sure app limits are enabled and try again.'
      );
    }
  };

  const relock = async () => {
    await relockNow();
    Alert.alert('Re-locked', 'Your limited apps are blocked again.');
  };

  const chooseIosApps = async () => {
    const authorized = await requestIosAuthorization();
    if (!authorized) {
      Alert.alert(
        'Screen Time access needed',
        'Purity App needs Screen Time permission to limit apps. This feature also requires a build approved by Apple for Family Controls.'
      );
      return;
    }
    const items = await pickIosApps();
    updateAppLimits({ iosItems: items });
    await applyIosBlocking(items, appLimits.enabled);
  };

  const toggleEnabled = async (enabled: boolean) => {
    updateAppLimits({ enabled });
    if (Platform.OS === 'android') {
      applyAndroidBlocking(
        appLimits.apps.map((a) => a.packageName),
        enabled
      );
    } else if (Platform.OS === 'ios') {
      await applyIosBlocking(appLimits.iosItems, enabled);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <Screen scroll>
        <SectionHeader
          title="App Limits"
          subtitle="Block distracting apps after your daily free time is used up."
        />
        <Card style={styles.card}>
          <Text style={styles.muted}>
            App limits control other apps installed on your phone, so they only work in the
            Android or iOS app — not in a web browser. Install Purity App on your phone to use
            this feature.
          </Text>
        </Card>
      </Screen>
    );
  }

  if (!available) {
    return (
      <Screen scroll>
        <SectionHeader
          title="App Limits"
          subtitle="Block distracting apps after your daily free time is used up."
        />
        <Card style={styles.card}>
          <Text style={styles.muted}>
            App limits use native system features that are not included in Expo Go. Run a
            development build (npx expo run:android) or install a production build of Purity
            App to use this feature.
          </Text>
        </Card>
      </Screen>
    );
  }

  const allowanceAvailable = canUseAllowance(appLimits);

  return (
    <Screen scroll>
      <Card style={styles.enableCard}>
        <View style={styles.enableText}>
          <Text style={styles.enableTitle}>App limits</Text>
          <Text style={styles.muted}>
            {appLimits.enabled
              ? 'Limited apps are blocked outside your daily free time.'
              : 'Turn on to start blocking your limited apps.'}
          </Text>
        </View>
        <Switch
          value={appLimits.enabled}
          onValueChange={(v) => void toggleEnabled(v)}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
      </Card>

      {Platform.OS === 'android' ? (
        <>
          <View style={styles.section}>
            <SectionHeader
              title="Permissions"
              subtitle="Android needs these to see and block app usage."
            />
            <Card style={styles.card}>
              <PermissionRow
                label="Usage access"
                granted={permissions?.usageStats ?? false}
                onPress={openUsageStatsSettings}
              />
              <PermissionRow
                label="Display over other apps"
                granted={permissions?.overlay ?? false}
                onPress={openOverlaySettings}
              />
              <Text style={styles.muted}>
                Tap a permission to open its system settings, then come back here.
              </Text>
            </Card>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Limited apps"
              subtitle="These apps are blocked once your free time runs out."
              action={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Choose apps"
                  onPress={() => void openPicker()}
                  hitSlop={8}>
                  <Ionicons name="add-circle" size={28} color={colors.primary} />
                </Pressable>
              }
            />
            {appLimits.apps.length === 0 ? (
              <Card style={styles.card}>
                <Text style={styles.muted}>No apps selected yet. Tap + to choose apps.</Text>
              </Card>
            ) : (
              <View style={styles.list}>
                {appLimits.apps.map((app) => (
                  <Card key={app.packageName} style={styles.appRow}>
                    <Text style={styles.appName}>{app.name}</Text>
                    <Pressable
                      accessibilityLabel={`Remove ${app.name}`}
                      onPress={() =>
                        updateAppLimits({ apps: toggleLimitedApp(appLimits.apps, app) })
                      }
                      hitSlop={8}>
                      <Ionicons name="trash-outline" size={22} color={colors.danger} />
                    </Pressable>
                  </Card>
                ))}
              </View>
            )}
          </View>
        </>
      ) : (
        <View style={styles.section}>
          <SectionHeader
            title="Limited apps"
            subtitle="Choose apps and categories with Apple's Screen Time picker."
          />
          <Card style={styles.card}>
            <Text style={styles.muted}>
              {appLimits.iosItems.length > 0
                ? `${appLimits.iosItems.length} item${appLimits.iosItems.length === 1 ? '' : 's'} selected.`
                : 'No apps selected yet.'}
            </Text>
            <Button label="Choose apps" onPress={() => void chooseIosApps()} />
            <Text style={styles.muted}>
              Note: blocking on iOS requires Apple&apos;s Family Controls approval for this
              app. Until then, selections are saved but apps are not blocked.
            </Text>
          </Card>
        </View>
      )}

      <View style={styles.section}>
        <SectionHeader
          title="Daily free time"
          subtitle="How long you can use limited apps each day."
        />
        <Card style={styles.card}>
          <TextField
            label="Minutes per day"
            value={limitDraft}
            onChangeText={setLimitDraft}
            keyboardType="number-pad"
            placeholder="30"
          />
          <Button label="Save limit" onPress={saveLimit} />
          <Text style={styles.muted}>
            Current: {formatMinutes(appLimits.dailyLimitMinutes)}
          </Text>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Free time"
          subtitle="Spend today's allowance, or lock everything back up."
        />
        <Card style={styles.card}>
          <Button
            label={
              allowanceAvailable
                ? `Use today's free time (${formatMinutes(appLimits.dailyLimitMinutes)})`
                : 'Free time already used today'
            }
            onPress={() => void spendAllowance()}
            disabled={!allowanceAvailable || !appLimits.enabled}
          />
          <Button label="Re-lock now" variant="secondary" onPress={() => void relock()} />
        </Card>
      </View>

      {pickerOpen ? (
        <Modal animationType="slide" onRequestClose={() => setPickerOpen(false)}>
          <Screen>
            <SectionHeader
              title="Choose apps to limit"
              action={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Done"
                  onPress={() => setPickerOpen(false)}
                  hitSlop={8}>
                  <Ionicons name="checkmark-circle" size={30} color={colors.primary} />
                </Pressable>
              }
            />
            <TextField
              label="Search"
              value={search}
              onChangeText={setSearch}
              placeholder="Search apps"
            />
            <FlatList
              data={filteredApps}
              keyExtractor={(item) => item.packageName}
              renderItem={({ item }) => {
                const selected = isAppLimited(appLimits.apps, item.packageName);
                return (
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    style={styles.pickerRow}
                    onPress={() =>
                      updateAppLimits({
                        apps: toggleLimitedApp(appLimits.apps, {
                          packageName: item.packageName,
                          name: item.name,
                        }),
                      })
                    }>
                    {item.iconBase64 ? (
                      <Image
                        source={{ uri: `data:image/png;base64,${item.iconBase64}` }}
                        style={styles.appIcon}
                      />
                    ) : (
                      <View style={[styles.appIcon, styles.appIconFallback]}>
                        <Ionicons name="apps" size={18} color={colors.textMuted} />
                      </View>
                    )}
                    <Text style={styles.pickerName}>{item.name}</Text>
                    <Ionicons
                      name={selected ? 'checkbox' : 'square-outline'}
                      size={24}
                      color={selected ? colors.primary : colors.textMuted}
                    />
                  </Pressable>
                );
              }}
            />
          </Screen>
        </Modal>
      ) : null}
    </Screen>
  );
}

function PermissionRow({
  label,
  granted,
  onPress,
}: {
  label: string;
  granted: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" style={styles.permissionRow} onPress={onPress}>
      <Ionicons
        name={granted ? 'checkmark-circle' : 'alert-circle'}
        size={22}
        color={granted ? colors.accent : colors.danger}
      />
      <Text style={styles.permissionLabel}>{label}</Text>
      <Text
        style={[styles.permissionStatus, { color: granted ? colors.accent : colors.danger }]}>
        {granted ? 'Granted' : 'Needed'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  section: {
    marginTop: spacing.xl,
  },
  muted: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  enableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  enableText: {
    flex: 1,
    gap: spacing.xs,
  },
  enableTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  permissionLabel: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  permissionStatus: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerName: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  appIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
  },
  appIconFallback: {
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
