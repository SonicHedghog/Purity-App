import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FREEDOM_FIGHT } from '../config';
import { useAppState } from '../state/AppStateContext';
import { colors } from '../theme';

let WebView: React.ComponentType<{
  source: { uri: string };
  startInLoadingState?: boolean;
  renderLoading?: () => React.ReactElement;
  style?: object;
}> | null = null;

if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  WebView = require('react-native-webview').WebView;
}

function WebIframe({ uri }: { uri: string }) {
  return React.createElement('iframe', {
    src: uri,
    style: {
      flex: 1,
      border: 'none',
      width: '100%',
      height: '100%',
    },
    title: 'Freedom Fight Lessons',
  });
}

export function LearnScreen() {
  const { settings } = useAppState();
  const url = settings.learnUrl || FREEDOM_FIGHT.LESSONS_URL;

  return (
    <SafeAreaView style={styles.safe}>
      {Platform.OS === 'web' ? (
        <WebIframe uri={url} />
      ) : WebView ? (
        <WebView
          source={{ uri: url }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
          style={styles.web}
        />
      ) : null}
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
