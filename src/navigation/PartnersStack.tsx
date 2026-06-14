import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { colors, fontSize } from '../theme';
import { PartnerFormScreen } from '../screens/PartnerFormScreen';
import { PartnersScreen } from '../screens/PartnersScreen';
import type { PartnersStackParamList } from './types';

const Stack = createNativeStackNavigator<PartnersStackParamList>();

export function PartnersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: fontSize.lg },
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen
        name="PartnersList"
        component={PartnersScreen}
        options={{ title: 'Accountability Partners' }}
      />
      <Stack.Screen
        name="PartnerForm"
        component={PartnerFormScreen}
        options={({ route }) => ({
          title: route.params?.partnerId ? 'Edit Partner' : 'Add Partner',
          presentation: 'modal',
        })}
      />
    </Stack.Navigator>
  );
}
