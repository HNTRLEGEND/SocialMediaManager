/**
 * HNTR LEGEND Pro - Profile Screen
 * Einstellungen, Revier-Verwaltung und Konto
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { useApp } from '../state/AppContext';
import { BUNDESLAENDER } from '../constants/schonzeiten';
import {
  getCurrentPlan,
  getPlanDisplayName,
  getSeatLimit,
  getFeatureInfos,
} from '../services/featureFlagService';

const ProfileScreen: React.FC = () => {
  const { colors, themeSetting, setThemeSetting, isDark, toggleTheme } = useTheme();
  const { aktivesRevier, reviere, setAktivesRevier, bundesland, setzeBundesland, aktuellerPlan, erstelleRevier } = useApp();

  // State
  const [showRevierPicker, setShowRevierPicker] = useState(false);
  const [showBundeslandPicker, setShowBundeslandPicker] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  // Neues Revier erstellen
  const handleNeuesRevier = () => {
    Alert.prompt(
      'Neues Revier',
      'Gib einen Namen für das neue Revier ein:',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Erstellen',
          onPress: async (name: string | undefined) => {
            if (name && name.trim()) {
              try {
                await erstelleRevier(name.trim(), bundesland);
                Alert.alert('Erfolg', `Revier "${name}" wurde erstellt.`);
              } catch (error) {
                Alert.alert('Fehler', 'Revier konnte nicht erstellt werden.');
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textLight,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowIcon: {
      fontSize: 20,
      marginRight: 12,
      width: 28,
      textAlign: 'center',
    },
    rowLabel: {
      fontSize: 15,
      color: colors.text,
    },
    rowValue: {
      fontSize: 14,
      color: colors.textLight,
    },
    rowArrow: {
      fontSize: 16,
      color: colors.textLight,
    },
    // Toggle
    toggle: {
      width: 50,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.border,
      padding: 2,
    },
    toggleActive: {
      backgroundColor: colors.primary,
    },
    toggleKnob: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
    },
    toggleKnobActive: {
      marginLeft: 22,
    },
    // Picker
    pickerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    picker: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '60%',
    },
    pickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pickerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    pickerClose: {
      fontSize: 20,
      color: colors.textLight,
    },
    pickerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pickerItemText: {
      fontSize: 15,
      color: colors.text,
    },
    pickerItemCheck: {
      fontSize: 16,
      color: colors.primary,
    },
    // Plan Info
    planBadge: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    planBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    featureCheck: {
      fontSize: 14,
      marginRight: 10,
    },
    featureName: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    featureDesc: {
      fontSize: 12,
      color: colors.textLight,
      marginTop: 2,
    },
    // Button
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    buttonText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    buttonTextSecondary: {
      color: colors.primary,
    },
    appInfo: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    appInfoText: {
      fontSize: 12,
      color: colors.textLight,
    },
  });

  const featureInfos = getFeatureInfos();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Revier-Auswahl */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aktuelles Revier</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={() => setShowRevierPicker(true)}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>🌲</Text>
                <Text style={styles.rowLabel}>
                  {aktivesRevier ? aktivesRevier.name : 'Kein Revier'}
                </Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.row, styles.rowLast]} onPress={handleNeuesRevier}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>➕</Text>
                <Text style={[styles.rowLabel, { color: colors.primary }]}>Neues Revier erstellen</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Erscheinungsbild */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Erscheinungsbild</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={toggleTheme}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>{isDark ? '🌙' : '☀️'}</Text>
                <Text style={styles.rowLabel}>Dark Mode</Text>
              </View>
              <View style={[styles.toggle, isDark && styles.toggleActive]}>
                <View style={[styles.toggleKnob, isDark && styles.toggleKnobActive]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.row, styles.rowLast]} onPress={() => setShowBundeslandPicker(true)}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>📍</Text>
                <Text style={styles.rowLabel}>Bundesland</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.rowValue}>
                  {BUNDESLAENDER.find((b) => b.id === bundesland)?.name || bundesland}
                </Text>
                <Text style={styles.rowArrow}> ›</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Abo-Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abonnement</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>⭐</Text>
                <Text style={styles.rowLabel}>Aktueller Plan</Text>
              </View>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{getPlanDisplayName(aktuellerPlan)}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>👥</Text>
                <Text style={styles.rowLabel}>Mitglieder-Limit</Text>
              </View>
              <Text style={styles.rowValue}>{getSeatLimit()} Personen</Text>
            </View>

            <TouchableOpacity
              style={[styles.row, styles.rowLast]}
              onPress={() => setShowFeatures(!showFeatures)}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>🔓</Text>
                <Text style={styles.rowLabel}>Freigeschaltete Features</Text>
              </View>
              <Text style={styles.rowArrow}>{showFeatures ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {/* Features-Liste */}
            {showFeatures && (
              <View style={{ paddingBottom: 8 }}>
                {featureInfos.map((feature) => (
                  <View key={feature.id} style={styles.featureItem}>
                    <Text style={styles.featureCheck}>{feature.aktiviert ? '✅' : '🔒'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.featureName}>{feature.name}</Text>
                      <Text style={styles.featureDesc}>{feature.beschreibung}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Daten & Sicherheit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daten & Sicherheit</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>📤</Text>
                <Text style={styles.rowLabel}>Daten exportieren</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>💾</Text>
                <Text style={styles.rowLabel}>Backup erstellen</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.row, styles.rowLast]}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>🔄</Text>
                <Text style={styles.rowLabel}>Synchronisation</Text>
              </View>
              <Text style={styles.rowValue}>Aus (Demo-Modus)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App-Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>HNTR LEGEND Pro v1.0.0</Text>
          <Text style={styles.appInfoText}>Demo-Modus (Offline)</Text>
        </View>
      </ScrollView>

      {/* Revier-Picker */}
      {showRevierPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.picker}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Revier auswählen</Text>
              <TouchableOpacity onPress={() => setShowRevierPicker(false)}>
                <Text style={styles.pickerClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {reviere.map((revier) => (
                <TouchableOpacity
                  key={revier.id}
                  style={styles.pickerItem}
                  onPress={() => {
                    setAktivesRevier(revier);
                    setShowRevierPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{revier.name}</Text>
                  {aktivesRevier?.id === revier.id && <Text style={styles.pickerItemCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Bundesland-Picker */}
      {showBundeslandPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.picker}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Bundesland wählen</Text>
              <TouchableOpacity onPress={() => setShowBundeslandPicker(false)}>
                <Text style={styles.pickerClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {BUNDESLAENDER.map((bl) => (
                <TouchableOpacity
                  key={bl.id}
                  style={styles.pickerItem}
                  onPress={() => {
                    setzeBundesland(bl.id);
                    setShowBundeslandPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{bl.name}</Text>
                  {bundesland === bl.id && <Text style={styles.pickerItemCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default ProfileScreen;
