/**
 * HNTR LEGEND Pro - AutoCapturePanel
 * Automatische Erfassung von GPS, Wetter und Zeit
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { getCurrentLocation } from '../services/locationService';
import { getCurrentWeather, formatWeatherDisplay } from '../services/weatherService';
import { formatiereKoordinaten } from '../utils/geoHelpers';
import { formatiereDatumZeit } from '../utils/schonzeitHelper';
import { GPSKoordinaten, Wetter } from '../types';

interface AutoCapturePanelProps {
  onUpdate: (data: {
    gps: GPSKoordinaten | null;
    wetter: Wetter | null;
    zeitpunkt: string;
  }) => void;
}

const AutoCapturePanel: React.FC<AutoCapturePanelProps> = ({ onUpdate }) => {
  const { colors } = useTheme();

  // State
  const [gps, setGps] = useState<GPSKoordinaten | null>(null);
  const [wetter, setWetter] = useState<Wetter | null>(null);
  const [zeitpunkt, setZeitpunkt] = useState<string>(new Date().toISOString());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Daten erfassen
  const erfasseDaten = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // GPS erfassen
      const position = await getCurrentLocation();
      setGps(position);

      // Wetter erfassen (wenn GPS verfügbar)
      if (position) {
        const wetterDaten = await getCurrentWeather(position.latitude, position.longitude);
        setWetter(wetterDaten);
      }

      // Zeitpunkt aktualisieren
      const jetztISO = new Date().toISOString();
      setZeitpunkt(jetztISO);

      // Parent informieren
      onUpdate({
        gps: position,
        wetter: position ? await getCurrentWeather(position.latitude, position.longitude) : null,
        zeitpunkt: jetztISO,
      });
    } catch (err) {
      console.error('[AutoCapture] Fehler:', err);
      setError('Automatische Erfassung fehlgeschlagen. Daten können manuell eingegeben werden.');
    } finally {
      setIsLoading(false);
    }
  }, [onUpdate]);

  // Initial erfassen
  useEffect(() => {
    erfasseDaten();
  }, []);

  // Styles
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerIcon: {
      fontSize: 18,
      marginRight: 10,
    },
    headerTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: colors.textLight,
      marginTop: 2,
    },
    refreshButton: {
      padding: 8,
    },
    refreshIcon: {
      fontSize: 18,
    },
    content: {
      paddingHorizontal: 14,
      paddingBottom: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowIcon: {
      fontSize: 16,
      marginRight: 12,
      width: 24,
      textAlign: 'center',
    },
    rowLabel: {
      fontSize: 13,
      color: colors.textLight,
      width: 80,
    },
    rowValue: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    editButton: {
      padding: 4,
    },
    editIcon: {
      fontSize: 14,
    },
    errorContainer: {
      padding: 14,
      backgroundColor: colors.card,
      borderRadius: 12,
    },
    errorText: {
      fontSize: 13,
      color: '#E53E3E',
      marginBottom: 8,
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 13,
      color: colors.textLight,
      marginTop: 8,
    },
    expandButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    expandButtonText: {
      fontSize: 13,
      color: colors.primary,
      marginLeft: 4,
    },
  });

  // Loading-Anzeige
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Erfasse GPS und Wetter...</Text>
        </View>
      </View>
    );
  }

  // Fehler-Anzeige
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={erfasseDaten}>
          <Text style={{ color: colors.primary, fontSize: 14 }}>Erneut versuchen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(!expanded)}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>✅</Text>
          <View>
            <Text style={styles.headerTitle}>Daten automatisch erfasst</Text>
            <Text style={styles.headerSubtitle}>
              {formatiereDatumZeit(zeitpunkt)}
              {wetter && ` · ${wetter.temperatur}°C`}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={erfasseDaten}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Expandierter Inhalt */}
      {expanded && (
        <View style={styles.content}>
          {/* Zeitpunkt */}
          <View style={styles.row}>
            <Text style={styles.rowIcon}>🕐</Text>
            <Text style={styles.rowLabel}>Zeit</Text>
            <Text style={styles.rowValue}>{formatiereDatumZeit(zeitpunkt)}</Text>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>

          {/* GPS */}
          <View style={styles.row}>
            <Text style={styles.rowIcon}>📍</Text>
            <Text style={styles.rowLabel}>Position</Text>
            <Text style={styles.rowValue}>
              {gps ? formatiereKoordinaten(gps) : 'Nicht verfügbar'}
            </Text>
          </View>

          {/* Wetter */}
          {wetter && (
            <>
              <View style={styles.row}>
                <Text style={styles.rowIcon}>🌡️</Text>
                <Text style={styles.rowLabel}>Temperatur</Text>
                <Text style={styles.rowValue}>
                  {wetter.temperatur}°C
                  {wetter.gefuehlteTemperatur && ` (gefühlt ${wetter.gefuehlteTemperatur}°C)`}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowIcon}>💨</Text>
                <Text style={styles.rowLabel}>Wind</Text>
                <Text style={styles.rowValue}>
                  {wetter.windRichtung || '?'} {wetter.windGeschwindigkeit || 0} m/s
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowIcon}>☁️</Text>
                <Text style={styles.rowLabel}>Wetter</Text>
                <Text style={styles.rowValue}>{wetter.bewölkung || 'Keine Angabe'}</Text>
              </View>

              <View style={[styles.row, styles.rowLast]}>
                <Text style={styles.rowIcon}>🌙</Text>
                <Text style={styles.rowLabel}>Mond</Text>
                <Text style={styles.rowValue}>{wetter.mondphase || 'Keine Angabe'}</Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Expand Button */}
      <TouchableOpacity style={styles.expandButton} onPress={() => setExpanded(!expanded)}>
        <Text>{expanded ? '▲' : '▼'}</Text>
        <Text style={styles.expandButtonText}>{expanded ? 'Weniger' : 'Details anzeigen'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AutoCapturePanel;
