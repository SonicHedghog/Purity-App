import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import NewBookScreen from '../screens/NewBookScreen';
import BookDetailScreen from '../screens/BookDetailScreen';
import CameraScreen from '../screens/CameraScreen';
import PageEditorScreen from '../screens/PageEditorScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#4A90D9' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Virtufy Books' }}
        />
        <Stack.Screen
          name="NewBook"
          component={NewBookScreen}
          options={{ title: 'New Book' }}
        />
        <Stack.Screen
          name="BookDetail"
          component={BookDetailScreen}
          options={{ title: 'Book Details' }}
        />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ title: 'Scan Pages', headerShown: false }}
        />
        <Stack.Screen
          name="PageEditor"
          component={PageEditorScreen}
          options={{ title: 'Edit Page' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
