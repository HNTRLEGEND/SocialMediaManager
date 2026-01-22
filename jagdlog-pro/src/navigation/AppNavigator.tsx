/**
 * HNTR LEGEND Pro - App Navigator
 * Haupt-Navigation mit Bottom Tabs
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../state/ThemeContext';

// Screens importieren
import DashboardScreen from '../screens/DashboardScreen';
import DiaryScreen from '../screens/DiaryScreen';
import NewEntryScreen from '../screens/NewEntryScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HarvestScreen from '../screens/HarvestScreen';
import EntryDetailScreen from '../screens/EntryDetailScreen';
import EditEntryScreen from '../screens/EditEntryScreen';
import NewPOIScreen from '../screens/NewPOIScreen';
import POIDetailScreen from '../screens/POIDetailScreen';
import { GPSKoordinaten } from '../types';

// Navigation Types
export type RootStackParamList = {
  MainTabs: undefined;
  NewEntry: { typ?: 'beobachtung' | 'abschuss' };
  EntryDetail: { id: string };
  EditEntry: { id: string };
  NewPOI: { coordinates?: GPSKoordinaten };
  POIDetail: { id: string };
  RevierSettings: undefined;
  ContactList: undefined;
  ContactDetail: { id?: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Diary: undefined;
  NewEntryTab: undefined;
  Map: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab-Icon Component
interface TabIconProps {
  name: string;
  focused: boolean;
  color: string;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused, color }) => {
  // Einfache Text-Icons (später durch echte Icons ersetzen)
  const icons: Record<string, string> = {
    Dashboard: '📊',
    Diary: '📖',
    NewEntry: '➕',
    Map: '🗺️',
    Profile: '👤',
  };

  return (
    <Text style={{ fontSize: focused ? 26 : 24, color }}>
      {icons[name] || '•'}
    </Text>
  );
};

/**
 * Bottom Tab Navigator
 */
const MainTabNavigator: React.FC = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name.replace('Tab', '')} focused={focused} color={color} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Übersicht',
          headerTitle: 'HNTR LEGEND Pro',
        }}
      />
      <Tab.Screen
        name="Diary"
        component={DiaryScreen}
        options={{
          title: 'Tagebuch',
          headerTitle: 'Jagdtagebuch',
        }}
      />
      <Tab.Screen
        name="NewEntryTab"
        component={NewEntryScreen}
        options={{
          title: 'Neu',
          headerTitle: 'Neuer Eintrag',
          tabBarLabel: 'Neuer Eintrag',
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Karte',
          headerTitle: 'Revierkarte',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          headerTitle: 'Einstellungen',
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Haupt-Navigator mit Stack für modale Screens
 */
const AppNavigator: React.FC = () => {
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
          notification: colors.secondary,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' as const },
          medium: { fontFamily: 'System', fontWeight: '500' as const },
          bold: { fontFamily: 'System', fontWeight: '700' as const },
          heavy: { fontFamily: 'System', fontWeight: '900' as const },
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NewEntry"
          component={NewEntryScreen}
          options={{
            title: 'Neuer Eintrag',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="EntryDetail"
          component={EntryDetailScreen}
          options={{
            title: 'Eintrag Details',
          }}
        />
        <Stack.Screen
          name="EditEntry"
          component={EditEntryScreen}
          options={{
            title: 'Eintrag bearbeiten',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="NewPOI"
          component={NewPOIScreen}
          options={{
            title: 'Neuer POI',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="POIDetail"
          component={POIDetailScreen}
          options={{
            title: 'POI Details',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
