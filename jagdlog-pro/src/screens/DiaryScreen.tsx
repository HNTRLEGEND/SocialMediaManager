/**
 * HNTR LEGEND Pro - Diary Screen
 * Chronologische Timeline aller Jagdeinträge mit erweiterten Filtern
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../state/ThemeContext';
import { useApp } from '../state/AppContext';
import EntryCard from '../components/EntryCard';
import FilterModal, { FilterOptions } from '../components/FilterModal';
import { getEntries, EintragFilter, countEntries } from '../services/storageService';
import { JagdEintrag, EintragTyp } from '../types';
import { relativeDatum } from '../utils/dateHelpers';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Filter-Typ Definition
interface FilterState {
  typ: EintragTyp | null;
  suchbegriff: string;
}

// Schnell-Filter Pills
const QUICK_FILTERS: { id: EintragTyp | 'alle'; label: string; icon: string }[] = [
  { id: 'alle', label: 'Alle', icon: '📝' },
  { id: 'beobachtung', label: 'Beobachtungen', icon: '👁️' },
  { id: 'abschuss', label: 'Abschüsse', icon: '🎯' },
  { id: 'nachsuche', label: 'Nachsuchen', icon: '🐕' },
];

// Leere Filter
const EMPTY_FILTERS: FilterOptions = {
  typ: null,
  wildartId: null,
  wildartKategorie: null,
  vonDatum: null,
  bisDatum: null,
  suchbegriff: '',
  jagdart: null,
};

const DiaryScreen: React.FC = () => {
  const { colors } = useTheme();
  const { aktivesRevier, isDbReady, lastUpdate } = useApp();
  const navigation = useNavigation<NavigationProp>();

  // State
  const [eintraege, setEintraege] = useState<JagdEintrag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter State
  const [quickFilter, setQuickFilter] = useState<EintragTyp | null>(null);
  const [searchText, setSearchText] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>(EMPTY_FILTERS);

  // Anzahl aktiver erweiterter Filter
  const activeAdvancedFilterCount = useMemo(() => {
    return [
      advancedFilters.wildartId,
      advancedFilters.wildartKategorie,
      advancedFilters.vonDatum,
      advancedFilters.bisDatum,
      advancedFilters.jagdart,
    ].filter(Boolean).length;
  }, [advancedFilters]);

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

      // Schnell-Filter (Typ)
      const activeTyp = advancedFilters.typ || quickFilter;
      if (activeTyp) {
        filterParams.typ = activeTyp;
      }

      // Suchbegriff
      const activeSearch = advancedFilters.suchbegriff || searchText;
      if (activeSearch.trim()) {
        filterParams.suchbegriff = activeSearch.trim();
      }

      // Wildart
      if (advancedFilters.wildartId) {
        filterParams.wildartId = advancedFilters.wildartId;
      }

      // Datum
      if (advancedFilters.vonDatum) {
        filterParams.vonDatum = advancedFilters.vonDatum + 'T00:00:00';
      }
      if (advancedFilters.bisDatum) {
        filterParams.bisDatum = advancedFilters.bisDatum + 'T23:59:59';
      }

      const data = await getEntries(filterParams);
      setEintraege(data);

      // Gesamtzahl laden (für Anzeige)
      const total = await countEntries({
        revierId: aktivesRevier?.id,
        nurAktive: true,
      });
      setTotalCount(total);
    } catch (error) {
      console.error('[Diary] Fehler beim Laden:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isDbReady, aktivesRevier, quickFilter, searchText, advancedFilters]);

  useEffect(() => {
    loadData();
  }, [loadData, lastUpdate]);

  // Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Eintrag antippen
  const handleEntryPress = (eintrag: JagdEintrag) => {
    navigation.navigate('EntryDetail', { id: eintrag.id });
  };

  // Erweiterte Filter anwenden
  const handleApplyFilters = (filters: FilterOptions) => {
    setAdvancedFilters(filters);
    // Wenn im erweiterten Filter ein Typ gesetzt ist, quickFilter zurücksetzen
    if (filters.typ) {
      setQuickFilter(null);
    }
  };

  // Filter zurücksetzen
  const resetAllFilters = () => {
    setQuickFilter(null);
    setSearchText('');
    setAdvancedFilters(EMPTY_FILTERS);
  };

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

  // Hat aktive Filter?
  const hasActiveFilters = quickFilter || searchText.trim() || activeAdvancedFilterCount > 0;

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
      alignItems: 'center',
      gap: 8,
    },
    filterScroll: {
      flexDirection: 'row',
      flex: 1,
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
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconButtonActive: {
      backgroundColor: colors.primary + '20',
    },
    iconButtonText: {
      fontSize: 18,
    },
    filterBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: colors.primary,
      width: 16,
      height: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterBadgeText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#fff',
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
    activeFiltersBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.primary + '10',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    activeFiltersText: {
      fontSize: 13,
      color: colors.primary,
    },
    clearFiltersButton: {
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    clearFiltersText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '600',
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

  // Schnell-Filter-Pill rendern
  const renderFilterPill = (option: (typeof QUICK_FILTERS)[number]) => {
    const isActive =
      option.id === 'alle' ? !quickFilter && !advancedFilters.typ : quickFilter === option.id;

    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.filterPill, isActive && styles.filterPillActive]}
        onPress={() => {
          if (option.id === 'alle') {
            setQuickFilter(null);
            setAdvancedFilters({ ...advancedFilters, typ: null });
          } else {
            setQuickFilter(option.id);
            setAdvancedFilters({ ...advancedFilters, typ: null });
          }
        }}
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
            <View style={styles.filterScroll}>{QUICK_FILTERS.map(renderFilterPill)}</View>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowSearch(!showSearch)}>
              <Text style={styles.iconButtonText}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, activeAdvancedFilterCount > 0 && styles.iconButtonActive]}
              onPress={() => setShowFilterModal(true)}
            >
              <Text style={styles.iconButtonText}>⚙️</Text>
              {activeAdvancedFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeAdvancedFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {showSearch && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Wildart, Ort oder Notiz suchen..."
                placeholderTextColor={colors.textLight}
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
                autoFocus
              />
            </View>
          )}
        </View>

        {hasActiveFilters && (
          <View style={styles.activeFiltersBar}>
            <Text style={styles.activeFiltersText}>
              Keine Ergebnisse für aktive Filter
            </Text>
            <TouchableOpacity style={styles.clearFiltersButton} onPress={resetAllFilters}>
              <Text style={styles.clearFiltersText}>Filter löschen</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyTitle}>Noch keine Einträge</Text>
          <Text style={styles.emptyText}>
            {hasActiveFilters
              ? 'Keine Einträge gefunden. Versuche andere Filter.'
              : 'Erstelle deinen ersten Jagdeintrag über den „+" Button.'}
          </Text>
        </View>

        <FilterModal
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={handleApplyFilters}
          currentFilters={advancedFilters}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter-Leiste */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <View style={styles.filterScroll}>{QUICK_FILTERS.map(renderFilterPill)}</View>
          <TouchableOpacity
            style={[styles.iconButton, showSearch && styles.iconButtonActive]}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Text style={styles.iconButtonText}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, activeAdvancedFilterCount > 0 && styles.iconButtonActive]}
            onPress={() => setShowFilterModal(true)}
          >
            <Text style={styles.iconButtonText}>⚙️</Text>
            {activeAdvancedFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeAdvancedFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Such-Eingabe */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Wildart, Ort oder Notiz suchen..."
              placeholderTextColor={colors.textLight}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
              autoFocus
            />
          </View>
        )}
      </View>

      {/* Aktive Filter Info */}
      {hasActiveFilters && (
        <View style={styles.activeFiltersBar}>
          <Text style={styles.activeFiltersText}>
            {eintraege.length} von {totalCount} Einträgen
          </Text>
          <TouchableOpacity style={styles.clearFiltersButton} onPress={resetAllFilters}>
            <Text style={styles.clearFiltersText}>Filter löschen</Text>
          </TouchableOpacity>
        </View>
      )}

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
              <Text style={styles.datumText}>{relativeDatum(gruppe.eintraege[0].zeitpunkt)}</Text>
              <View style={styles.datumLine} />
            </View>

            {/* Einträge dieses Tages */}
            {gruppe.eintraege.map((eintrag) => (
              <EntryCard
                key={eintrag.id}
                eintrag={eintrag}
                onPress={() => handleEntryPress(eintrag)}
              />
            ))}
          </View>
        )}
        ListFooterComponent={
          <Text style={styles.countText}>
            {eintraege.length} Eintrag{eintraege.length !== 1 ? 'e' : ''}
            {hasActiveFilters ? ` (gefiltert)` : ''}
          </Text>
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        currentFilters={advancedFilters}
      />
    </View>
  );
};

export default DiaryScreen;
