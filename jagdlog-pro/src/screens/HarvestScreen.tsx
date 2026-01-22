/**
 * HNTR LEGEND Pro - Harvest Screen
 * Abschuss-Übersicht und Auswertungen
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { useApp } from '../state/AppContext';
import EntryCard from '../components/EntryCard';
import { getEntries } from '../services/storageService';
import { JagdEintrag, AbschussEintrag } from '../types';

const HarvestScreen: React.FC = () => {
  const { colors } = useTheme();
  const { aktivesRevier, isDbReady } = useApp();

  // State
  const [abschuesse, setAbschuesse] = useState<AbschussEintrag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Abschüsse laden
  const loadData = useCallback(async () => {
    if (!isDbReady) return;

    try {
      const eintraege = await getEntries({
        typ: 'abschuss',
        revierId: aktivesRevier?.id,
        nurAktive: true,
        limit: 100,
      });

      // Nur Abschüsse filtern
      const nurAbschuesse = eintraege.filter(
        (e): e is AbschussEintrag => e.typ === 'abschuss'
      );

      setAbschuesse(nurAbschuesse);
    } catch (error) {
      console.error('[Harvest] Fehler beim Laden:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isDbReady, aktivesRevier]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Statistiken berechnen
  const stats = {
    gesamt: abschuesse.length,
    maennlich: abschuesse.filter((a) => a.abschussDetails?.geschlecht === 'männlich').length,
    weiblich: abschuesse.filter((a) => a.abschussDetails?.geschlecht === 'weiblich').length,
    durchschnittGewicht: 0,
  };

  // Durchschnittliches Gewicht berechnen
  const gewichte = abschuesse
    .filter((a) => a.abschussDetails?.gewichtAufgebrochenKg)
    .map((a) => a.abschussDetails!.gewichtAufgebrochenKg!);

  if (gewichte.length > 0) {
    stats.durchschnittGewicht = gewichte.reduce((a, b) => a + b, 0) / gewichte.length;
  }

  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.card,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textLight,
      marginTop: 4,
    },
    listContent: {
      padding: 16,
      paddingBottom: 40,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textLight,
      textAlign: 'center',
    },
  });

  // Empty State
  if (!isLoading && abschuesse.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>Noch keine Abschüsse</Text>
          <Text style={styles.emptyText}>
            Deine Abschüsse werden hier angezeigt, sobald du welche erfasst hast.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Statistik-Header */}
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.gesamt}</Text>
            <Text style={styles.statLabel}>Gesamt</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.maennlich}</Text>
            <Text style={styles.statLabel}>♂ Männlich</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.weiblich}</Text>
            <Text style={styles.statLabel}>♀ Weiblich</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats.durchschnittGewicht > 0 ? `${stats.durchschnittGewicht.toFixed(1)}` : '-'}
            </Text>
            <Text style={styles.statLabel}>Ø kg</Text>
          </View>
        </View>
      </View>

      {/* Abschuss-Liste */}
      <FlatList
        data={abschuesse}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        renderItem={({ item }) => <EntryCard eintrag={item} />}
      />
    </View>
  );
};

export default HarvestScreen;
