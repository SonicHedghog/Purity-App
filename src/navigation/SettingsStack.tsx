import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { colors, fontSize } from '../theme';
import { AppLimitsScreen } from '../screens/AppLimitsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import type { SettingsStackParamList } from './types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: fontSize.lg },
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="AppLimits"
        component={AppLimitsScreen}
        options={{ title: 'App Limits' }}
      />
    </Stack.Navigator>
  );
}
