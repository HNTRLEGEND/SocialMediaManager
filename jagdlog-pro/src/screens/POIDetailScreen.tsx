/**
 * HNTR LEGEND Pro - POI Detail Screen
 * Detailansicht und Bearbeitung eines POI
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { useApp } from '../state/AppContext';
import { getPOI, updatePOI, deletePOI } from '../services/storageService';
import { MapFeature, POIKategorie } from '../types';
import { relativeDatum, formatiereDatum } from '../utils/dateHelpers';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'POIDetail'>;

// POI-Kategorien mit Icons
const POI_ICONS: Record<POIKategorie, string> = {
  hochsitz: '🪵',
  kanzel: '🏠',
  leiter: '🪜',
  kirrung: '🌾',
  salzlecke: '🧂',
  wildacker: '🌿',
  suhle: '💧',
  luderplatz: '🦴',
  fuetterung: '🥕',
  wildkamera: '📷',
  treffpunkt: '📍',
  parken: '🅿️',
  zugang: '🚪',
  schranke: '🚧',
  gefahr: '⚠️',
  hinweis: '📌',
  sonstiges: '📎',
};

// POI-Kategorien Labels
const POI_LABELS: Record<POIKategorie, string> = {
  hochsitz: 'Hochsitz',
  kanzel: 'Kanzel',
  leiter: 'Leiter',
  kirrung: 'Kirrung',
  salzlecke: 'Salzlecke',
  wildacker: 'Wildacker',
  suhle: 'Suhle',
  luderplatz: 'Luderplatz',
  fuetterung: 'Fütterung',
  wildkamera: 'Wildkamera',
  treffpunkt: 'Treffpunkt',
  parken: 'Parkplatz',
  zugang: 'Zugang',
  schranke: 'Schranke',
  gefahr: 'Gefahrenstelle',
  hinweis: 'Hinweis',
  sonstiges: 'Sonstiges',
};

// Status-Farben
const STATUS_FARBEN = {
  aktiv: '#48BB78',
  inaktiv: '#A0AEC0',
  wartung: '#ED8936',
};

const POIDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id } = route.params;
  const { colors } = useTheme();
  const { refreshData } = useApp();

  const [poi, setPoi] = useState<MapFeature | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Daten laden
  const loadData = useCallback(async () => {
    try {
      const data = await getPOI(id);
      setPoi(data);
    } catch (error) {
      console.error('[POIDetail] Fehler beim Laden:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Koordinaten parsen
  const getCoordinates = (): { lat: number; lon: number } | null => {
    if (!poi?.coordinates) return null;
    try {
      const coords = JSON.parse(poi.coordinates);
      // GeoJSON: [longitude, latitude]
      return { lon: coords[0], lat: coords[1] };
    } catch {
      return null;
    }
  };

  // In Karten-App öffnen
  const openInMaps = () => {
    const coords = getCoordinates();
    if (coords) {
      const url = `https://maps.google.com/?q=${coords.lat},${coords.lon}`;
      Linking.openURL(url);
    }
  };

  // Status ändern
  const handleStatusChange = async (newStatus: 'aktiv' | 'inaktiv' | 'wartung') => {
    if (!poi) return;

    try {
      await updatePOI(id, { poiStatus: newStatus });
      setPoi({ ...poi, poiStatus: newStatus });
      refreshData();
    } catch (error) {
      Alert.alert('Fehler', 'Status konnte nicht geändert werden.');
    }
  };

  // Löschen bestätigen
  const handleDelete = () => {
    Alert.alert(
      'POI löschen',
      `Möchtest du "${poi?.name}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePOI(id);
              refreshData();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Fehler', 'POI konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  // Kontrollieren markieren
  const markAsChecked = async () => {
    if (!poi) return;

    const jetzt = new Date().toISOString();
    try {
      await updatePOI(id, { letzteKontrolle: jetzt });
      setPoi({ ...poi, letzteKontrolle: jetzt });
      refreshData();
      Alert.alert('Erledigt', 'Kontrolle wurde vermerkt.');
    } catch (error) {
      Alert.alert('Fehler', 'Kontrolle konnte nicht gespeichert werden.');
    }
  };

  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 100,
    },
    // Header
    headerCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      alignItems: 'center',
    },
    headerIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    headerName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    headerKategorie: {
      fontSize: 14,
      color: colors.textLight,
    },
    // Status Badge
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginTop: 12,
      gap: 6,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 13,
      fontWeight: '600',
    },
    // Sections
    section: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textLight,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    // Detail Rows
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    detailRowLast: {
      borderBottomWidth: 0,
    },
    detailLabel: {
      fontSize: 14,
      color: colors.textLight,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    // Beschreibung
    beschreibungText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 22,
    },
    // GPS
    gpsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    gpsText: {
      fontSize: 14,
      color: colors.text,
    },
    gpsButton: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    gpsButtonText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '600',
    },
    // Status-Wechsel
    statusOptions: {
      flexDirection: 'row',
      gap: 8,
    },
    statusOption: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: colors.background,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
    statusOptionActive: {
      backgroundColor: colors.primary + '20',
    },
    statusOptionText: {
      fontSize: 12,
      color: colors.textLight,
    },
    statusOptionTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    // Quick Actions
    quickActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    quickAction: {
      flex: 1,
      backgroundColor: colors.background,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    quickActionIcon: {
      fontSize: 20,
      marginBottom: 4,
    },
    quickActionText: {
      fontSize: 12,
      color: colors.text,
    },
    // Footer Actions
    actionsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    editButton: {
      backgroundColor: colors.primary,
    },
    deleteButton: {
      backgroundColor: colors.error + '20',
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    editButtonText: {
      color: '#fff',
    },
    deleteButtonText: {
      color: colors.error,
    },
    // Meta
    metaInfo: {
      paddingVertical: 8,
    },
    metaText: {
      fontSize: 12,
      color: colors.textLight,
      textAlign: 'center',
    },
  });

  // Loading
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Nicht gefunden
  if (!poi) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: colors.text, fontSize: 16 }}>POI nicht gefunden</Text>
      </View>
    );
  }

  const coords = getCoordinates();
  const statusFarbe = STATUS_FARBEN[poi.poiStatus || 'aktiv'];
  const icon = poi.poiKategorie ? POI_ICONS[poi.poiKategorie] : '📍';
  const label = poi.poiKategorie ? POI_LABELS[poi.poiKategorie] : 'POI';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerCard}>
          <Text style={styles.headerIcon}>{icon}</Text>
          <Text style={styles.headerName}>{poi.name}</Text>
          <Text style={styles.headerKategorie}>{label}</Text>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusFarbe + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusFarbe }]} />
            <Text style={[styles.statusText, { color: statusFarbe }]}>
              {poi.poiStatus === 'aktiv' ? 'Aktiv' : poi.poiStatus === 'inaktiv' ? 'Inaktiv' : 'Wartung nötig'}
            </Text>
          </View>
        </View>

        {/* Beschreibung */}
        {poi.beschreibung && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Beschreibung</Text>
            <Text style={styles.beschreibungText}>{poi.beschreibung}</Text>
          </View>
        )}

        {/* Position */}
        {coords && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Position</Text>
            <View style={styles.gpsRow}>
              <Text style={styles.gpsText}>
                📍 {coords.lat.toFixed(6)}, {coords.lon.toFixed(6)}
              </Text>
              <TouchableOpacity style={styles.gpsButton} onPress={openInMaps}>
                <Text style={styles.gpsButtonText}>In Karte öffnen</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Status ändern */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status ändern</Text>
          <View style={styles.statusOptions}>
            {(['aktiv', 'inaktiv', 'wartung'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusOption, poi.poiStatus === s && styles.statusOptionActive]}
                onPress={() => handleStatusChange(s)}
              >
                <View style={[styles.statusDot, { backgroundColor: STATUS_FARBEN[s] }]} />
                <Text style={[styles.statusOptionText, poi.poiStatus === s && styles.statusOptionTextActive]}>
                  {s === 'aktiv' ? 'Aktiv' : s === 'inaktiv' ? 'Inaktiv' : 'Wartung'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Kontrollen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kontrollen</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Letzte Kontrolle</Text>
            <Text style={styles.detailValue}>
              {poi.letzteKontrolle ? relativeDatum(poi.letzteKontrolle) : 'Nie'}
            </Text>
          </View>

          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Nächste Kontrolle</Text>
            <Text style={styles.detailValue}>
              {poi.naechsteKontrolle ? formatiereDatum(poi.naechsteKontrolle) : 'Nicht geplant'}
            </Text>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction} onPress={markAsChecked}>
              <Text style={styles.quickActionIcon}>✅</Text>
              <Text style={styles.quickActionText}>Kontrolliert</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => Alert.alert('Foto', 'Foto-Funktion kommt bald!')}
            >
              <Text style={styles.quickActionIcon}>📷</Text>
              <Text style={styles.quickActionText}>Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => Alert.alert('Navigation', 'Navigation kommt bald!')}
            >
              <Text style={styles.quickActionIcon}>🧭</Text>
              <Text style={styles.quickActionText}>Navigieren</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Aktionen */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => Alert.alert('Bearbeiten', 'POI-Bearbeitung wird mit dem nächsten Update verfügbar sein.')}
          >
            <Text style={[styles.actionButtonText, styles.editButtonText]}>✏️ Bearbeiten</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>🗑️ Löschen</Text>
          </TouchableOpacity>
        </View>

        {/* Meta-Info */}
        <View style={styles.metaInfo}>
          <Text style={styles.metaText}>
            Erstellt: {relativeDatum(poi.erstelltAm)} · Sync: {poi.syncStatus}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default POIDetailScreen;
