/**
 * HNTR LEGEND Pro - Entry Detail Screen
 * Detailansicht eines Jagdeintrags mit Bearbeitungs- und Löschfunktion
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { useApp } from '../state/AppContext';
import { getEntry, deleteEntry, getMedia } from '../services/storageService';
import { JagdEintrag, Medium, AbschussDetails, Wetter } from '../types';
import { formatiereZeit, formatiereDatum, relativeDatum } from '../utils/dateHelpers';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'EntryDetail'>;

// Icons für Eintragstypen
const EINTRAG_ICONS: Record<string, string> = {
  beobachtung: '👁️',
  abschuss: '🎯',
  nachsuche: '🐕',
  revierereignis: '📋',
};

// Labels für Eintragstypen
const EINTRAG_LABELS: Record<string, string> = {
  beobachtung: 'Beobachtung',
  abschuss: 'Abschuss',
  nachsuche: 'Nachsuche',
  revierereignis: 'Revierereignis',
};

const EntryDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id } = route.params;
  const { colors } = useTheme();
  const { refreshData } = useApp();

  const [eintrag, setEintrag] = useState<JagdEintrag | null>(null);
  const [medien, setMedien] = useState<Medium[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Daten laden
  const loadData = useCallback(async () => {
    try {
      const entry = await getEntry(id);
      setEintrag(entry);

      if (entry && entry.fotoIds && entry.fotoIds.length > 0) {
        const media = await getMedia(id);
        setMedien(media);
      }
    } catch (error) {
      console.error('[EntryDetail] Fehler beim Laden:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Löschen bestätigen
  const handleDelete = () => {
    Alert.alert(
      'Eintrag löschen',
      'Möchtest du diesen Eintrag wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEntry(id);
              refreshData();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Fehler', 'Der Eintrag konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  // GPS öffnen
  const openInMaps = () => {
    if (eintrag?.gps) {
      const url = `https://maps.google.com/?q=${eintrag.gps.latitude},${eintrag.gps.longitude}`;
      Linking.openURL(url);
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
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    typIcon: {
      fontSize: 32,
      marginRight: 12,
    },
    headerInfo: {
      flex: 1,
    },
    typLabel: {
      fontSize: 12,
      color: colors.textLight,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 2,
    },
    wildartText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    zeitText: {
      fontSize: 14,
      color: colors.textLight,
      marginTop: 8,
    },
    // Anzahl Badge
    anzahlBadge: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    anzahlText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    // Sections
    sectionCard: {
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
      textAlign: 'right',
      maxWidth: '60%',
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
      paddingVertical: 6,
      borderRadius: 8,
    },
    gpsButtonText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
    },
    // Wetter
    wetterGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -4,
    },
    wetterItem: {
      width: '50%',
      padding: 4,
    },
    wetterBox: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    wetterIcon: {
      fontSize: 20,
      marginBottom: 4,
    },
    wetterLabel: {
      fontSize: 11,
      color: colors.textLight,
      marginBottom: 2,
    },
    wetterValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    // Notizen
    notizText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 22,
    },
    // Fotos
    fotoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -4,
    },
    fotoItem: {
      width: '33.33%',
      aspectRatio: 1,
      padding: 4,
    },
    fotoImage: {
      flex: 1,
      borderRadius: 8,
      backgroundColor: colors.border,
    },
    fotoPlaceholder: {
      flex: 1,
      borderRadius: 8,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fotoPlaceholderText: {
      fontSize: 24,
    },
    // Actions
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
  if (!eintrag) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: colors.text, fontSize: 16 }}>Eintrag nicht gefunden</Text>
      </View>
    );
  }

  // Abschuss-Details rendern
  const renderAbschussDetails = (details: AbschussDetails) => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Abschuss-Details</Text>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Geschlecht</Text>
        <Text style={styles.detailValue}>{details.geschlecht}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Altersklasse</Text>
        <Text style={styles.detailValue}>{details.altersklasse}</Text>
      </View>

      {details.gewichtAufgebrochenKg && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Gewicht (aufgebrochen)</Text>
          <Text style={styles.detailValue}>{details.gewichtAufgebrochenKg} kg</Text>
        </View>
      )}

      {details.schussentfernungM && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Schussentfernung</Text>
          <Text style={styles.detailValue}>{details.schussentfernungM} m</Text>
        </View>
      )}

      {details.trefferlage && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Trefferlage</Text>
          <Text style={styles.detailValue}>{details.trefferlage}</Text>
        </View>
      )}

      {details.waffe && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Waffe</Text>
          <Text style={styles.detailValue}>{details.waffe}</Text>
        </View>
      )}

      {details.kaliber && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Kaliber</Text>
          <Text style={styles.detailValue}>{details.kaliber}</Text>
        </View>
      )}

      {details.munition && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Munition</Text>
          <Text style={styles.detailValue}>{details.munition}</Text>
        </View>
      )}

      {details.nachsucheErforderlich && (
        <View style={[styles.detailRow, styles.detailRowLast]}>
          <Text style={styles.detailLabel}>Nachsuche</Text>
          <Text style={[styles.detailValue, { color: colors.warning }]}>Erforderlich</Text>
        </View>
      )}

      {details.verwertung && (
        <View style={[styles.detailRow, styles.detailRowLast]}>
          <Text style={styles.detailLabel}>Verwertung</Text>
          <Text style={styles.detailValue}>
            {details.verwertung.charAt(0).toUpperCase() + details.verwertung.slice(1).replace('_', ' ')}
          </Text>
        </View>
      )}
    </View>
  );

  // Wetter-Sektion rendern
  const renderWetter = (wetter: Wetter) => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Wetter</Text>
      <View style={styles.wetterGrid}>
        <View style={styles.wetterItem}>
          <View style={styles.wetterBox}>
            <Text style={styles.wetterIcon}>🌡️</Text>
            <Text style={styles.wetterLabel}>Temperatur</Text>
            <Text style={styles.wetterValue}>{wetter.temperatur}°C</Text>
          </View>
        </View>

        {wetter.windGeschwindigkeit !== undefined && (
          <View style={styles.wetterItem}>
            <View style={styles.wetterBox}>
              <Text style={styles.wetterIcon}>💨</Text>
              <Text style={styles.wetterLabel}>Wind</Text>
              <Text style={styles.wetterValue}>
                {wetter.windGeschwindigkeit} m/s {wetter.windRichtung || ''}
              </Text>
            </View>
          </View>
        )}

        {wetter.luftfeuchtigkeit !== undefined && (
          <View style={styles.wetterItem}>
            <View style={styles.wetterBox}>
              <Text style={styles.wetterIcon}>💧</Text>
              <Text style={styles.wetterLabel}>Luftfeuchtigkeit</Text>
              <Text style={styles.wetterValue}>{wetter.luftfeuchtigkeit}%</Text>
            </View>
          </View>
        )}

        {wetter.mondphase && (
          <View style={styles.wetterItem}>
            <View style={styles.wetterBox}>
              <Text style={styles.wetterIcon}>🌙</Text>
              <Text style={styles.wetterLabel}>Mondphase</Text>
              <Text style={styles.wetterValue}>{wetter.mondphase}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={styles.typIcon}>{EINTRAG_ICONS[eintrag.typ]}</Text>
            <View style={styles.headerInfo}>
              <Text style={styles.typLabel}>{EINTRAG_LABELS[eintrag.typ]}</Text>
              <Text style={styles.wildartText}>{eintrag.wildartName}</Text>
            </View>
            {eintrag.anzahl > 1 && (
              <View style={styles.anzahlBadge}>
                <Text style={styles.anzahlText}>{eintrag.anzahl}×</Text>
              </View>
            )}
          </View>
          <Text style={styles.zeitText}>
            📅 {formatiereDatum(eintrag.zeitpunkt)} um {formatiereZeit(eintrag.zeitpunkt)}
            {eintrag.jagdart && ` · ${eintrag.jagdart}`}
          </Text>
        </View>

        {/* Abschuss-Details (wenn vorhanden) */}
        {eintrag.typ === 'abschuss' && 'abschussDetails' in eintrag && eintrag.abschussDetails && (
          renderAbschussDetails(eintrag.abschussDetails)
        )}

        {/* Beobachtungs-Details */}
        {eintrag.typ === 'beobachtung' && 'verhalten' in eintrag && eintrag.verhalten && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Verhalten</Text>
            <Text style={styles.notizText}>{eintrag.verhalten}</Text>
          </View>
        )}

        {/* GPS */}
        {eintrag.gps && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Standort</Text>
            <View style={styles.gpsRow}>
              <View>
                <Text style={styles.gpsText}>
                  📍 {eintrag.gps.latitude.toFixed(6)}, {eintrag.gps.longitude.toFixed(6)}
                </Text>
                {eintrag.gps.accuracy && (
                  <Text style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>
                    Genauigkeit: ±{eintrag.gps.accuracy.toFixed(0)}m
                  </Text>
                )}
                {eintrag.ortBeschreibung && (
                  <Text style={{ fontSize: 13, color: colors.text, marginTop: 4 }}>
                    {eintrag.ortBeschreibung}
                  </Text>
                )}
              </View>
              <TouchableOpacity style={styles.gpsButton} onPress={openInMaps}>
                <Text style={styles.gpsButtonText}>In Karte öffnen</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Wetter */}
        {eintrag.wetter && renderWetter(eintrag.wetter)}

        {/* Notizen */}
        {eintrag.notizen && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Notizen</Text>
            <Text style={styles.notizText}>{eintrag.notizen}</Text>
          </View>
        )}

        {/* Fotos */}
        {medien.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Fotos ({medien.length})</Text>
            <View style={styles.fotoGrid}>
              {medien.map((medium) => (
                <View key={medium.id} style={styles.fotoItem}>
                  {medium.lokaleUri ? (
                    <Image source={{ uri: medium.lokaleUri }} style={styles.fotoImage} />
                  ) : (
                    <View style={styles.fotoPlaceholder}>
                      <Text style={styles.fotoPlaceholderText}>📷</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Aktionen */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('EditEntry', { id: eintrag.id })}
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
            Erstellt: {relativeDatum(eintrag.erstelltAm)} · Sync: {eintrag.syncStatus}
          </Text>
          <Text style={styles.metaText}>ID: {eintrag.id}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default EntryDetailScreen;
