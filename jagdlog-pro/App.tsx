/**
 * HNTR LEGEND Pro - Haupt-App
 * Digitales Jagdtagebuch & Reviermanagement
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider, useTheme } from './src/state/ThemeContext';
import { AppProvider, useApp } from './src/state/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { getDatabase } from './src/data/db';
import { seedDemoData } from './src/data/seedData';
import { initFeatureFlags } from './src/services/featureFlagService';

// TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 Minuten
      retry: 1,
    },
  },
});

/**
 * Lade-Screen während App initialisiert
 */
const LoadingScreen: React.FC = () => {
  return (
    <View style={loadingStyles.container}>
      <Text style={loadingStyles.icon}>🦌</Text>
      <Text style={loadingStyles.title}>HNTR LEGEND Pro</Text>
      <ActivityIndicator size="large" color="#4A7C2C" style={loadingStyles.spinner} />
      <Text style={loadingStyles.subtitle}>Lade Daten...</Text>
    </View>
  );
};

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5E5E5',
    marginBottom: 24,
  },
  spinner: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0A0',
  },
});

/**
 * Haupt-App-Inhalt mit Navigation
 */
const AppContent: React.FC = () => {
  const { isDbReady, isLoading } = useApp();
  const { isDark } = useTheme();

  if (!isDbReady || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppNavigator />
    </>
  );
};

/**
 * App-Initialisierung und Provider-Wrapper
 */
const AppWithProviders: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  // App initialisieren
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('[App] Initialisiere...');

        // Feature Flags initialisieren
        await initFeatureFlags();

        // Datenbank öffnen
        await getDatabase();

        // Demo-Daten erstellen wenn nötig
        await seedDemoData();

        console.log('[App] Initialisierung abgeschlossen');
        setIsInitialized(true);
      } catch (error) {
        console.error('[App] Initialisierungsfehler:', error);
        // Trotzdem fortfahren
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
};

/**
 * Root App Component
 */
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppWithProviders />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
