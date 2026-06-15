import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { FREEDOM_FIGHT } from '../config';
import { useAppState } from '../state/AppStateContext';
import { colors } from '../theme';

export function LearnScreen() {
  const { settings } = useAppState();

  return (
    <SafeAreaView style={styles.safe}>
      <WebView
        source={{ uri: settings.learnUrl || FREEDOM_FIGHT.LESSONS_URL }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        style={styles.web}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
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
});
