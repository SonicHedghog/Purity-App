import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import { colors, fontSize } from '../theme';
import { LearnScreen } from '../screens/LearnScreen';
import { PracticeScreen } from '../screens/PracticeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TriggeredScreen } from '../screens/TriggeredScreen';
import { PartnersStack } from './PartnersStack';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<keyof RootTabParamList, IoniconName> = {
  Learn: 'book',
  Partners: 'people',
  Triggered: 'alert-circle',
  Practice: 'fitness',
  Settings: 'settings',
};

export function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: fontSize.lg },
        tabBarActiveTintColor: route.name === 'Triggered' ? colors.danger : colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
      })}>
      <Tab.Screen name="Learn" component={LearnScreen} options={{ title: 'Learn' }} />
      <Tab.Screen
        name="Partners"
        component={PartnersStack}
        options={{ headerShown: false, title: 'Partners' }}
      />
      <Tab.Screen
        name="Triggered"
        component={TriggeredScreen}
        options={{ title: 'Triggered', tabBarActiveTintColor: colors.danger }}
      />
      <Tab.Screen name="Practice" component={PracticeScreen} options={{ title: 'Practice' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}
