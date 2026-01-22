/**
 * HNTR LEGEND Pro - New POI Screen
 * Erstellen eines neuen POI (Point of Interest)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { useApp } from '../state/AppContext';
import { savePOI } from '../services/storageService';
import { getCurrentLocation } from '../services/locationService';
import { POIKategorie, GPSKoordinaten } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'NewPOI'>;

// POI-Kategorien mit Icons und Labels
const POI_KATEGORIEN: { id: POIKategorie; label: string; icon: string }[] = [
  { id: 'hochsitz', label: 'Hochsitz', icon: '🪵' },
  { id: 'kanzel', label: 'Kanzel', icon: '🏠' },
  { id: 'leiter', label: 'Leiter', icon: '🪜' },
  { id: 'kirrung', label: 'Kirrung', icon: '🌾' },
  { id: 'salzlecke', label: 'Salzlecke', icon: '🧂' },
  { id: 'wildacker', label: 'Wildacker', icon: '🌿' },
  { id: 'suhle', label: 'Suhle', icon: '💧' },
  { id: 'luderplatz', label: 'Luderplatz', icon: '🦴' },
  { id: 'fuetterung', label: 'Fütterung', icon: '🥕' },
  { id: 'wildkamera', label: 'Wildkamera', icon: '📷' },
  { id: 'treffpunkt', label: 'Treffpunkt', icon: '📍' },
  { id: 'parken', label: 'Parkplatz', icon: '🅿️' },
  { id: 'zugang', label: 'Zugang', icon: '🚪' },
  { id: 'schranke', label: 'Schranke', icon: '🚧' },
  { id: 'gefahr', label: 'Gefahrenstelle', icon: '⚠️' },
  { id: 'hinweis', label: 'Hinweis', icon: '📌' },
  { id: 'sonstiges', label: 'Sonstiges', icon: '📎' },
];

// Status-Optionen
const STATUS_OPTIONEN = [
  { id: 'aktiv', label: 'Aktiv', color: '#48BB78' },
  { id: 'inaktiv', label: 'Inaktiv', color: '#A0AEC0' },
  { id: 'wartung', label: 'Wartung nötig', color: '#ED8936' },
] as const;

const NewPOIScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { aktivesRevier, refreshData } = useApp();

  // Initiale Koordinaten aus Route-Params (falls von Karte aufgerufen)
  const initialCoords = route.params?.coordinates;

  // State
  const [name, setName] = useState('');
  const [beschreibung, setBeschreibung] = useState('');
  const [kategorie, setKategorie] = useState<POIKategorie>('hochsitz');
  const [status, setStatus] = useState<'aktiv' | 'inaktiv' | 'wartung'>('aktiv');
  const [gps, setGps] = useState<GPSKoordinaten | null>(initialCoords || null);
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // GPS-Position ermitteln wenn nicht vorgegeben
  useEffect(() => {
    if (!initialCoords) {
      loadCurrentPosition();
    }
  }, [initialCoords]);

  const loadCurrentPosition = async () => {
    setIsLoadingGps(true);
    try {
      const position = await getCurrentLocation();
      if (position) {
        setGps(position);
      }
    } catch (error) {
      console.log('[NewPOI] GPS nicht verfügbar');
    } finally {
      setIsLoadingGps(false);
    }
  };

  // Speichern
  const handleSave = async () => {
    // Validierung
    if (!name.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Namen für den POI ein.');
      return;
    }

    if (!aktivesRevier) {
      Alert.alert('Fehler', 'Kein aktives Revier ausgewählt.');
      return;
    }

    if (!gps) {
      Alert.alert('Fehler', 'Bitte warte bis die GPS-Position ermittelt wurde oder gib sie manuell ein.');
      return;
    }

    setIsSaving(true);

    try {
      await savePOI({
        revierId: aktivesRevier.id,
        typ: 'poi',
        name: name.trim(),
        beschreibung: beschreibung.trim() || undefined,
        geometryType: 'Point',
        coordinates: JSON.stringify([gps.longitude, gps.latitude]),
        poiKategorie: kategorie,
        poiStatus: status,
        fotoIds: [],
      });

      refreshData();

      Alert.alert('Gespeichert', `${name} wurde erfolgreich angelegt.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('[NewPOI] Fehler beim Speichern:', error);
      Alert.alert('Fehler', 'Der POI konnte nicht gespeichert werden.');
    } finally {
      setIsSaving(false);
    }
  };

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
    section: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textLight,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputGroupLast: {
      marginBottom: 0,
    },
    label: {
      fontSize: 13,
      color: colors.textLight,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.text,
      fontSize: 15,
    },
    inputMultiline: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    // Kategorie-Grid
    kategorieGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -4,
    },
    kategorieItem: {
      width: '25%',
      padding: 4,
    },
    kategorieBox: {
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 12,
      alignItems: 'center',
    },
    kategorieBoxActive: {
      backgroundColor: colors.primary + '20',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    kategorieIcon: {
      fontSize: 24,
      marginBottom: 4,
    },
    kategorieLabel: {
      fontSize: 11,
      color: colors.textLight,
      textAlign: 'center',
    },
    kategorieLabelActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    // Status-Optionen
    statusRow: {
      flexDirection: 'row',
      gap: 8,
    },
    statusOption: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: colors.background,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
    statusOptionActive: {
      backgroundColor: colors.primary + '20',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 13,
      color: colors.textLight,
    },
    statusTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    // GPS
    gpsContainer: {
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    gpsText: {
      fontSize: 14,
      color: colors.text,
    },
    gpsAccuracy: {
      fontSize: 12,
      color: colors.textLight,
      marginTop: 2,
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
    // Footer
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Kategorie-Auswahl */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategorie</Text>
          <View style={styles.kategorieGrid}>
            {POI_KATEGORIEN.map((kat) => (
              <View key={kat.id} style={styles.kategorieItem}>
                <TouchableOpacity
                  style={[styles.kategorieBox, kategorie === kat.id && styles.kategorieBoxActive]}
                  onPress={() => setKategorie(kat.id)}
                >
                  <Text style={styles.kategorieIcon}>{kat.icon}</Text>
                  <Text
                    style={[styles.kategorieLabel, kategorie === kat.id && styles.kategorieLabelActive]}
                    numberOfLines={1}
                  >
                    {kat.label}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Grunddaten */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grunddaten</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="z.B. Hochsitz Eicheneck"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={[styles.inputGroup, styles.inputGroupLast]}>
            <Text style={styles.label}>Beschreibung</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={beschreibung}
              onChangeText={setBeschreibung}
              placeholder="Optionale Beschreibung..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONEN.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.statusOption, status === opt.id && styles.statusOptionActive]}
                onPress={() => setStatus(opt.id)}
              >
                <View style={[styles.statusDot, { backgroundColor: opt.color }]} />
                <Text style={[styles.statusText, status === opt.id && styles.statusTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* GPS-Position */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Position</Text>
          <View style={styles.gpsContainer}>
            {isLoadingGps ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.gpsText}>Ermittle Position...</Text>
              </View>
            ) : gps ? (
              <View>
                <Text style={styles.gpsText}>
                  📍 {gps.latitude.toFixed(6)}, {gps.longitude.toFixed(6)}
                </Text>
                {gps.accuracy && (
                  <Text style={styles.gpsAccuracy}>Genauigkeit: ±{gps.accuracy.toFixed(0)}m</Text>
                )}
              </View>
            ) : (
              <Text style={styles.gpsText}>Keine Position verfügbar</Text>
            )}
            <TouchableOpacity style={styles.gpsButton} onPress={loadCurrentPosition}>
              <Text style={styles.gpsButtonText}>🔄 Aktualisieren</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer mit Speichern-Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, (!gps || isSaving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!gps || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {POI_KATEGORIEN.find((k) => k.id === kategorie)?.icon} POI speichern
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default NewPOIScreen;
