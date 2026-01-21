import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { DiaryScreen } from '../screens/DiaryScreen';
import { HarvestScreen } from '../screens/HarvestScreen';
import { MapScreen } from '../screens/MapScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { NewEntryScreen } from '../screens/NewEntryScreen';
import { AssistantScreen } from '../screens/AssistantScreen';

export type RootStackParamList = {
  Tabs: undefined;
  NewEntry: undefined;
  Assistant: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Tagebuch" component={DiaryScreen} />
      <Tab.Screen name="Abschüsse" component={HarvestScreen} />
      <Tab.Screen name="Karte" component={MapScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="NewEntry" component={NewEntryScreen} options={{ title: 'Neuer Eintrag' }} />
      <Stack.Screen name="Assistant" component={AssistantScreen} options={{ title: 'KI-Begleiter' }} />
    </Stack.Navigator>
  );
}
