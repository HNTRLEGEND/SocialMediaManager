/**
 * HNTR LEGEND Pro - Dashboard Screen
 * Übersicht mit Statistiken, letzten Aktivitäten und Schonzeiten-Warnungen
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { useTheme } from '../state/ThemeContext';
import { useApp } from '../state/AppContext';
import StatCard from '../components/StatCard';
import EntryCard from '../components/EntryCard';
import { getEntries, getGlobalStats, RevierStats } from '../services/storageService';
import { getAktiveSchonzeiten } from '../utils/schonzeitHelper';
import { JagdEintrag } from '../types';
import { MainTabParamList } from '../navigation/AppNavigator';

type DashboardNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Dashboard'>;

const DashboardScreen: React.FC = () => {
  const { colors, toggleTheme, isDark } = useTheme();
  const { aktivesRevier, bundesland, isDbReady, isLoading: appLoading } = useApp();
  const navigation = useNavigation<DashboardNavigationProp>();

  // State
  const [stats, setStats] = useState<RevierStats | null>(null);
  const [letzteEintraege, setLetzteEintraege] = useState<JagdEintrag[]>([]);
  const [schonzeitWarnungen, setSchonzeitWarnungen] = useState<{ wildart: string; warnung: string }[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Daten laden
  const loadData = useCallback(async () => {
    if (!isDbReady) return;

    try {
      // Statistiken laden
      const statsData = await getGlobalStats();
      setStats(statsData);

      // Letzte Einträge laden
      const eintraege = await getEntries({ limit: 5, nurAktive: true });
      setLetzteEintraege(eintraege);

      // Schonzeiten-Warnungen
      if (bundesland) {
        const warnungen = getAktiveSchonzeiten(bundesland);
        setSchonzeitWarnungen(warnungen.slice(0, 3)); // Max 3 Warnungen anzeigen
      }
    } catch (error) {
      console.error('[Dashboard] Fehler beim Laden:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isDbReady, bundesland]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pull-to-Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 100,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    revierName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    revierPlaceholder: {
      fontSize: 14,
      color: colors.textLight,
    },
    themeToggle: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: colors.card,
    },
    themeToggleText: {
      fontSize: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    statsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    warningCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderLeftWidth: 4,
      borderLeftColor: '#D4A017',
    },
    warningTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.secondary,
      marginBottom: 4,
    },
    warningText: {
      fontSize: 13,
      color: colors.textLight,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textLight,
      textAlign: 'center',
      padding: 20,
    },
    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
    fabText: {
      fontSize: 28,
      color: '#FFFFFF',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 12,
      color: colors.textLight,
      fontSize: 14,
    },
  });

  // Loading-Anzeige
  if (isLoading || appLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Lade Daten...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header mit Revier und Theme Toggle */}
        <View style={styles.header}>
          <View>
            {aktivesRevier ? (
              <Text style={styles.revierName}>{aktivesRevier.name}</Text>
            ) : (
              <Text style={styles.revierPlaceholder}>Kein Revier ausgewählt</Text>
            )}
          </View>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Text style={styles.themeToggleText}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>

        {/* Statistik-Karten */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistik</Text>
          <View style={styles.statsRow}>
            <StatCard
              title="Einträge"
              value={stats?.gesamtEintraege ?? 0}
              icon="📝"
              color={colors.primary}
            />
            <StatCard
              title="Abschüsse"
              value={stats?.abschuesse ?? 0}
              icon="🎯"
              color={colors.secondary}
            />
            <StatCard
              title="Beobachtungen"
              value={stats?.beobachtungen ?? 0}
              icon="👁️"
              color="#4299E1"
            />
            <StatCard
              title="Nachsuchen"
              value={stats?.nachsuchen ?? 0}
              icon="🐕"
              color="#805AD5"
            />
          </View>
        </View>

        {/* Schonzeiten-Warnungen */}
        {schonzeitWarnungen.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Aktuelle Schonzeiten</Text>
            {schonzeitWarnungen.map((warnung, index) => (
              <View key={index} style={styles.warningCard}>
                <Text style={styles.warningTitle}>{warnung.wildart}</Text>
                <Text style={styles.warningText}>{warnung.warnung}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Letzte Aktivitäten */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Letzte Aktivitäten</Text>
          {letzteEintraege.length > 0 ? (
            letzteEintraege.map((eintrag) => (
              <EntryCard key={eintrag.id} eintrag={eintrag} />
            ))
          ) : (
            <Text style={styles.emptyText}>
              Noch keine Einträge vorhanden.{'\n'}
              Tippe auf + um deinen ersten Eintrag zu erstellen.
            </Text>
          )}
        </View>

        {/* Top Wildarten */}
        {stats && stats.wildartVerteilung.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Häufigste Wildarten</Text>
            {stats.wildartVerteilung.slice(0, 5).map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 12,
                  backgroundColor: colors.card,
                  borderRadius: 8,
                  marginBottom: 6,
                }}
              >
                <Text style={{ color: colors.text }}>{item.wildart}</Text>
                <Text style={{ color: colors.textLight, fontWeight: '600' }}>
                  {item.anzahl}×
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewEntryTab')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DashboardScreen;
