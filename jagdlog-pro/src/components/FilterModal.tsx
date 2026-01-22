/**
 * HNTR LEGEND Pro - Filter Modal
 * Erweiterte Filteroptionen für das Tagebuch
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { WILDARTEN, WildartKategorie, WildartDefinition, getWildartenListe } from '../constants/wildarten';
import { EintragTyp } from '../types';

export interface FilterOptions {
  typ: EintragTyp | null;
  wildartId: string | null;
  wildartKategorie: WildartKategorie | null;
  vonDatum: string | null;
  bisDatum: string | null;
  suchbegriff: string;
  jagdart: string | null;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

// Eintragstypen
const EINTRAG_TYPEN: { id: EintragTyp; label: string; icon: string }[] = [
  { id: 'beobachtung', label: 'Beobachtungen', icon: '👁️' },
  { id: 'abschuss', label: 'Abschüsse', icon: '🎯' },
  { id: 'nachsuche', label: 'Nachsuchen', icon: '🐕' },
  { id: 'revierereignis', label: 'Revierereignisse', icon: '📋' },
];

// Wildart-Kategorien
const WILDART_KATEGORIEN: { id: WildartKategorie; label: string }[] = [
  { id: WildartKategorie.SCHALENWILD, label: 'Schalenwild' },
  { id: WildartKategorie.NIEDERWILD, label: 'Niederwild' },
  { id: WildartKategorie.RAUBWILD, label: 'Raubwild' },
  { id: WildartKategorie.FEDERWILD, label: 'Federwild' },
];

// Jagdarten
const JAGDARTEN = [
  'Ansitz',
  'Pirsch',
  'Drückjagd',
  'Treibjagd',
  'Fallenjagd',
  'Lockjagd',
];

// Datums-Voreinstellungen
const DATUM_PRESETS = [
  { label: 'Heute', days: 0 },
  { label: 'Letzte 7 Tage', days: 7 },
  { label: 'Letzte 30 Tage', days: 30 },
  { label: 'Dieses Jahr', days: 365 },
];

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
}) => {
  const { colors } = useTheme();
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters, visible]);

  // Filter zurücksetzen
  const resetFilters = () => {
    setFilters({
      typ: null,
      wildartId: null,
      wildartKategorie: null,
      vonDatum: null,
      bisDatum: null,
      suchbegriff: '',
      jagdart: null,
    });
  };

  // Anzahl aktiver Filter
  const activeFilterCount = [
    filters.typ,
    filters.wildartId,
    filters.wildartKategorie,
    filters.vonDatum,
    filters.bisDatum,
    filters.jagdart,
  ].filter(Boolean).length;

  // Datum-Preset anwenden
  const applyDatePreset = (days: number) => {
    const heute = new Date();
    const von = new Date();

    if (days === 0) {
      // Heute
      setFilters({
        ...filters,
        vonDatum: heute.toISOString().split('T')[0],
        bisDatum: heute.toISOString().split('T')[0],
      });
    } else if (days === 365) {
      // Dieses Jahr
      const jahresAnfang = new Date(heute.getFullYear(), 0, 1);
      setFilters({
        ...filters,
        vonDatum: jahresAnfang.toISOString().split('T')[0],
        bisDatum: heute.toISOString().split('T')[0],
      });
    } else {
      von.setDate(von.getDate() - days);
      setFilters({
        ...filters,
        vonDatum: von.toISOString().split('T')[0],
        bisDatum: heute.toISOString().split('T')[0],
      });
    }
  };

  // Wildarten für ausgewählte Kategorie
  const alleWildarten = getWildartenListe();
  const filteredWildarten = filters.wildartKategorie
    ? alleWildarten.filter((w: WildartDefinition) => w.kategorie === filters.wildartKategorie)
    : alleWildarten;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '85%',
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    resetButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    resetText: {
      fontSize: 14,
      color: colors.primary,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textLight,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    // Chips
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.background,
      gap: 6,
    },
    chipActive: {
      backgroundColor: colors.primary + '20',
    },
    chipText: {
      fontSize: 13,
      color: colors.textLight,
    },
    chipTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    chipIcon: {
      fontSize: 14,
    },
    // Datum
    datumRow: {
      flexDirection: 'row',
      gap: 12,
    },
    datumInput: {
      flex: 1,
    },
    datumLabel: {
      fontSize: 12,
      color: colors.textLight,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.text,
      fontSize: 14,
    },
    presetsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    presetChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: colors.background,
    },
    presetText: {
      fontSize: 12,
      color: colors.textLight,
    },
    // Wildart Suche
    wildartSearch: {
      marginBottom: 12,
    },
    wildartList: {
      maxHeight: 150,
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 8,
    },
    wildartItem: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
    },
    wildartItemActive: {
      backgroundColor: colors.primary + '20',
    },
    wildartText: {
      fontSize: 14,
      color: colors.text,
    },
    wildartTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    // Footer
    footer: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.background,
    },
    applyButton: {
      backgroundColor: colors.primary,
    },
    footerButtonText: {
      fontSize: 15,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: colors.text,
    },
    applyButtonText: {
      color: '#fff',
    },
    badgeText: {
      fontSize: 12,
      color: colors.primary,
      marginLeft: 4,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.container}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Text>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetText}>Zurücksetzen</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Eintragstyp */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Eintragstyp</Text>
              <View style={styles.chipsRow}>
                {EINTRAG_TYPEN.map((typ) => (
                  <TouchableOpacity
                    key={typ.id}
                    style={[styles.chip, filters.typ === typ.id && styles.chipActive]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        typ: filters.typ === typ.id ? null : typ.id,
                      })
                    }
                  >
                    <Text style={styles.chipIcon}>{typ.icon}</Text>
                    <Text style={[styles.chipText, filters.typ === typ.id && styles.chipTextActive]}>
                      {typ.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Zeitraum */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Zeitraum</Text>
              <View style={styles.datumRow}>
                <View style={styles.datumInput}>
                  <Text style={styles.datumLabel}>Von</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="JJJJ-MM-TT"
                    placeholderTextColor={colors.textLight}
                    value={filters.vonDatum || ''}
                    onChangeText={(text) => setFilters({ ...filters, vonDatum: text || null })}
                  />
                </View>
                <View style={styles.datumInput}>
                  <Text style={styles.datumLabel}>Bis</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="JJJJ-MM-TT"
                    placeholderTextColor={colors.textLight}
                    value={filters.bisDatum || ''}
                    onChangeText={(text) => setFilters({ ...filters, bisDatum: text || null })}
                  />
                </View>
              </View>
              <View style={styles.presetsRow}>
                {DATUM_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset.label}
                    style={styles.presetChip}
                    onPress={() => applyDatePreset(preset.days)}
                  >
                    <Text style={styles.presetText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Wildart Kategorie */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Wildart Kategorie</Text>
              <View style={styles.chipsRow}>
                {WILDART_KATEGORIEN.map((kat) => (
                  <TouchableOpacity
                    key={kat.id}
                    style={[
                      styles.chip,
                      filters.wildartKategorie === kat.id && styles.chipActive,
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        wildartKategorie: filters.wildartKategorie === kat.id ? null : kat.id,
                        wildartId: null, // Reset wildart when category changes
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filters.wildartKategorie === kat.id && styles.chipTextActive,
                      ]}
                    >
                      {kat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Wildart Auswahl */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Wildart</Text>
              <ScrollView style={styles.wildartList} nestedScrollEnabled>
                {filteredWildarten.slice(0, 20).map((wildart) => (
                  <TouchableOpacity
                    key={wildart.id}
                    style={[
                      styles.wildartItem,
                      filters.wildartId === wildart.id && styles.wildartItemActive,
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        wildartId: filters.wildartId === wildart.id ? null : wildart.id,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.wildartText,
                        filters.wildartId === wildart.id && styles.wildartTextActive,
                      ]}
                    >
                      {wildart.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Jagdart */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Jagdart</Text>
              <View style={styles.chipsRow}>
                {JAGDARTEN.map((jagdart) => (
                  <TouchableOpacity
                    key={jagdart}
                    style={[
                      styles.chip,
                      filters.jagdart === jagdart && styles.chipActive,
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        jagdart: filters.jagdart === jagdart ? null : jagdart,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filters.jagdart === jagdart && styles.chipTextActive,
                      ]}
                    >
                      {jagdart}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.footerButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={[styles.footerButtonText, styles.cancelButtonText]}>
                Abbrechen
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.applyButton]}
              onPress={() => {
                onApply(filters);
                onClose();
              }}
            >
              <Text style={[styles.footerButtonText, styles.applyButtonText]}>
                Filter anwenden
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default FilterModal;
