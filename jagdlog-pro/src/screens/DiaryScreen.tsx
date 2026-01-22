/**
 * HNTR LEGEND Pro - Diary Screen
 * Chronologische Timeline aller Jagdeinträge
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { useApp } from '../state/AppContext';
import EntryCard from '../components/EntryCard';
import { getEntries, EintragFilter } from '../services/storageService';
import { JagdEintrag, EintragTyp } from '../types';
import { relativeDatum } from '../utils/dateHelpers';

// Filter-Typ Definition
interface FilterState {
  typ: EintragTyp | null;
  suchbegriff: string;
}

// Filter Pills
const FILTER_OPTIONEN: { id: EintragTyp | 'alle'; label: string; icon: string }[] = [
  { id: 'alle', label: 'Alle', icon: '📝' },
  { id: 'beobachtung', label: 'Beobachtungen', icon: '👁️' },
  { id: 'abschuss', label: 'Abschüsse', icon: '🎯' },
  { id: 'nachsuche', label: 'Nachsuchen', icon: '🐕' },
];

const DiaryScreen: React.FC = () => {
  const { colors } = useTheme();
  const { aktivesRevier, isDbReady } = useApp();

  // State
  const [eintraege, setEintraege] = useState<JagdEintrag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    typ: null,
    suchbegriff: '',
  });
  const [showSearch, setShowSearch] = useState(false);

  // Daten laden
  const loadData = useCallback(async () => {
    if (!isDbReady) return;

    try {
      const filterParams: EintragFilter = {
        nurAktive: true,
        limit: 100,
      };

      // Revier-Filter
      if (aktivesRevier) {
        filterParams.revierId = aktivesRevier.id;
      }

      // Typ-Filter
      if (filter.typ) {
        filterParams.typ = filter.typ;
      }

      // Suchbegriff
      if (filter.suchbegriff.trim()) {
        filterParams.suchbegriff = filter.suchbegriff.trim();
      }

      const data = await getEntries(filterParams);
      setEintraege(data);
    } catch (error) {
      console.error('[Diary] Fehler beim Laden:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isDbReady, aktivesRevier, filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Einträge nach Datum gruppieren
  const gruppierteDaten = useMemo(() => {
    const gruppen: { datum: string; eintraege: JagdEintrag[] }[] = [];
    let aktuelleDatumKey: string | null = null;

    for (const eintrag of eintraege) {
      const datumKey = eintrag.zeitpunkt.split('T')[0]; // YYYY-MM-DD

      if (datumKey !== aktuelleDatumKey) {
        gruppen.push({
          datum: datumKey,
          eintraege: [eintrag],
        });
        aktuelleDatumKey = datumKey;
      } else {
        gruppen[gruppen.length - 1].eintraege.push(eintrag);
      }
    }

    return gruppen;
  }, [eintraege]);

  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    filterContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 8,
    },
    filterPill: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.background,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    filterPillActive: {
      backgroundColor: colors.primary + '20',
    },
    filterPillText: {
      fontSize: 13,
      color: colors.textLight,
    },
    filterPillTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      height: 40,
      backgroundColor: colors.background,
      borderRadius: 20,
      paddingHorizontal: 16,
      color: colors.text,
      fontSize: 14,
    },
    searchToggle: {
      padding: 8,
    },
    searchToggleText: {
      fontSize: 20,
    },
    listContent: {
      padding: 16,
      paddingBottom: 100,
    },
    datumHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      marginTop: 8,
    },
    datumLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    datumText: {
      paddingHorizontal: 12,
      fontSize: 13,
      fontWeight: '600',
      color: colors.textLight,
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    countText: {
      fontSize: 12,
      color: colors.textLight,
      textAlign: 'center',
      marginTop: 8,
    },
  });

  // Filter-Pill rendern
  const renderFilterPill = (option: (typeof FILTER_OPTIONEN)[number]) => {
    const isActive = option.id === 'alle' ? !filter.typ : filter.typ === option.id;

    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.filterPill, isActive && styles.filterPillActive]}
        onPress={() => setFilter({ ...filter, typ: option.id === 'alle' ? null : option.id })}
      >
        <Text>{option.icon}</Text>
        <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Loading
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Empty State
  if (eintraege.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            {FILTER_OPTIONEN.map(renderFilterPill)}
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyTitle}>Noch keine Einträge</Text>
          <Text style={styles.emptyText}>
            {filter.typ || filter.suchbegriff
              ? 'Keine Einträge gefunden. Versuche andere Filter.'
              : 'Erstelle deinen ersten Jagdeintrag über den „+" Button.'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter-Leiste */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          {FILTER_OPTIONEN.map(renderFilterPill)}
          <TouchableOpacity style={styles.searchToggle} onPress={() => setShowSearch(!showSearch)}>
            <Text style={styles.searchToggleText}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Such-Eingabe */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Suchen..."
              placeholderTextColor={colors.textLight}
              value={filter.suchbegriff}
              onChangeText={(text) => setFilter({ ...filter, suchbegriff: text })}
              returnKeyType="search"
            />
          </View>
        )}
      </View>

      {/* Einträge-Liste */}
      <FlatList
        data={gruppierteDaten}
        keyExtractor={(item) => item.datum}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        renderItem={({ item: gruppe }) => (
          <View>
            {/* Datums-Header */}
            <View style={styles.datumHeader}>
              <View style={styles.datumLine} />
              <Text style={styles.datumText}>
                {relativeDatum(gruppe.eintraege[0].zeitpunkt)}
              </Text>
              <View style={styles.datumLine} />
            </View>

            {/* Einträge dieses Tages */}
            {gruppe.eintraege.map((eintrag) => (
              <EntryCard key={eintrag.id} eintrag={eintrag} />
            ))}
          </View>
        )}
        ListFooterComponent={
          <Text style={styles.countText}>
            {eintraege.length} Eintrag{eintraege.length !== 1 ? 'e' : ''}
          </Text>
        }
      />
    </View>
  );
};

export default DiaryScreen;
