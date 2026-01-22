/**
 * HNTR LEGEND Pro - Edit Entry Screen
 * Bearbeitung eines bestehenden Jagdeintrags
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { useApp } from '../state/AppContext';
import { getEntry, updateEntry } from '../services/storageService';
import { JagdEintrag, EintragTyp } from '../types';
import { getWildartenListe, WildartDefinition } from '../constants/wildarten';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'EditEntry'>;

const EditEntryScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id } = route.params;
  const { colors } = useTheme();
  const { refreshData } = useApp();

  const [eintrag, setEintrag] = useState<JagdEintrag | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Bearbeitbare Felder
  const [wildartName, setWildartName] = useState('');
  const [anzahl, setAnzahl] = useState('1');
  const [notizen, setNotizen] = useState('');
  const [ortBeschreibung, setOrtBeschreibung] = useState('');
  const [jagdart, setJagdart] = useState('');

  // Abschuss-Details (wenn Abschuss)
  const [geschlecht, setGeschlecht] = useState<'männlich' | 'weiblich' | 'unbekannt'>('unbekannt');
  const [altersklasse, setAltersklasse] = useState('');
  const [gewicht, setGewicht] = useState('');
  const [schussentfernung, setSchussentfernung] = useState('');
  const [trefferlage, setTrefferlage] = useState('');
  const [waffe, setWaffe] = useState('');
  const [kaliber, setKaliber] = useState('');

  // Daten laden
  const loadData = useCallback(async () => {
    try {
      const entry = await getEntry(id);
      if (entry) {
        setEintrag(entry);
        setWildartName(entry.wildartName);
        setAnzahl(entry.anzahl.toString());
        setNotizen(entry.notizen || '');
        setOrtBeschreibung(entry.ortBeschreibung || '');
        setJagdart(entry.jagdart || '');

        // Abschuss-Details laden
        if (entry.typ === 'abschuss' && 'abschussDetails' in entry && entry.abschussDetails) {
          const details = entry.abschussDetails;
          setGeschlecht(details.geschlecht);
          setAltersklasse(details.altersklasse || '');
          setGewicht(details.gewichtAufgebrochenKg?.toString() || '');
          setSchussentfernung(details.schussentfernungM?.toString() || '');
          setTrefferlage(details.trefferlage || '');
          setWaffe(details.waffe || '');
          setKaliber(details.kaliber || '');
        }
      }
    } catch (error) {
      console.error('[EditEntry] Fehler beim Laden:', error);
      Alert.alert('Fehler', 'Der Eintrag konnte nicht geladen werden.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [id, navigation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Speichern
  const handleSave = async () => {
    if (!eintrag) return;

    // Validierung
    if (!wildartName.trim()) {
      Alert.alert('Fehler', 'Bitte gib eine Wildart an.');
      return;
    }

    const parsedAnzahl = parseInt(anzahl, 10);
    if (isNaN(parsedAnzahl) || parsedAnzahl < 1) {
      Alert.alert('Fehler', 'Die Anzahl muss mindestens 1 sein.');
      return;
    }

    setIsSaving(true);

    try {
      // Wildart-ID suchen
      const wildart = getWildartenListe().find(
        (w: WildartDefinition) => w.name.toLowerCase() === wildartName.toLowerCase()
      );

      const updates: Partial<JagdEintrag> = {
        wildartId: wildart?.id || eintrag.wildartId,
        wildartName: wildartName.trim(),
        anzahl: parsedAnzahl,
        notizen: notizen.trim() || undefined,
        ortBeschreibung: ortBeschreibung.trim() || undefined,
        jagdart: jagdart.trim() || undefined,
      };

      await updateEntry(id, updates);
      refreshData();

      Alert.alert('Gespeichert', 'Der Eintrag wurde erfolgreich aktualisiert.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('[EditEntry] Fehler beim Speichern:', error);
      Alert.alert('Fehler', 'Der Eintrag konnte nicht gespeichert werden.');
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    halfWidth: {
      flex: 1,
    },
    // Geschlecht-Auswahl
    genderRow: {
      flexDirection: 'row',
      gap: 8,
    },
    genderOption: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: colors.background,
      alignItems: 'center',
    },
    genderOptionActive: {
      backgroundColor: colors.primary + '20',
    },
    genderText: {
      fontSize: 14,
      color: colors.textLight,
    },
    genderTextActive: {
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
    footerRow: {
      flexDirection: 'row',
      gap: 12,
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
    saveButton: {
      backgroundColor: colors.primary,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    footerButtonText: {
      fontSize: 15,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: colors.text,
    },
    saveButtonText: {
      color: '#fff',
    },
    typBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.primary + '20',
      marginBottom: 16,
    },
    typBadgeText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '600',
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
        <Text style={{ color: colors.text }}>Eintrag nicht gefunden</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Typ-Badge */}
        <View style={styles.typBadge}>
          <Text style={styles.typBadgeText}>
            {eintrag.typ === 'beobachtung' && '👁️ Beobachtung'}
            {eintrag.typ === 'abschuss' && '🎯 Abschuss'}
            {eintrag.typ === 'nachsuche' && '🐕 Nachsuche'}
            {eintrag.typ === 'revierereignis' && '📋 Revierereignis'}
          </Text>
        </View>

        {/* Basis-Daten */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grunddaten</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Wildart *</Text>
            <TextInput
              style={styles.input}
              value={wildartName}
              onChangeText={setWildartName}
              placeholder="z.B. Rehwild, Schwarzwild..."
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={[styles.inputGroup, styles.row]}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Anzahl *</Text>
              <TextInput
                style={styles.input}
                value={anzahl}
                onChangeText={setAnzahl}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor={colors.textLight}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Jagdart</Text>
              <TextInput
                style={styles.input}
                value={jagdart}
                onChangeText={setJagdart}
                placeholder="z.B. Ansitz, Pirsch..."
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          <View style={[styles.inputGroup, styles.inputGroupLast]}>
            <Text style={styles.label}>Ortsbeschreibung</Text>
            <TextInput
              style={styles.input}
              value={ortBeschreibung}
              onChangeText={setOrtBeschreibung}
              placeholder="z.B. Hochsitz am Waldrand..."
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        {/* Abschuss-Details (nur bei Abschüssen) */}
        {eintrag.typ === 'abschuss' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Abschuss-Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Geschlecht</Text>
              <View style={styles.genderRow}>
                {(['männlich', 'weiblich', 'unbekannt'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderOption, geschlecht === g && styles.genderOptionActive]}
                    onPress={() => setGeschlecht(g)}
                  >
                    <Text style={[styles.genderText, geschlecht === g && styles.genderTextActive]}>
                      {g === 'männlich' ? '♂ Männlich' : g === 'weiblich' ? '♀ Weiblich' : '? Unbekannt'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.inputGroup, styles.row]}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Altersklasse</Text>
                <TextInput
                  style={styles.input}
                  value={altersklasse}
                  onChangeText={setAltersklasse}
                  placeholder="z.B. Jährling, Überläufer..."
                  placeholderTextColor={colors.textLight}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Gewicht (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={gewicht}
                  onChangeText={setGewicht}
                  keyboardType="decimal-pad"
                  placeholder="aufgebrochen"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.row]}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Schussentfernung (m)</Text>
                <TextInput
                  style={styles.input}
                  value={schussentfernung}
                  onChangeText={setSchussentfernung}
                  keyboardType="number-pad"
                  placeholder="in Metern"
                  placeholderTextColor={colors.textLight}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Trefferlage</Text>
                <TextInput
                  style={styles.input}
                  value={trefferlage}
                  onChangeText={setTrefferlage}
                  placeholder="z.B. Blatt, Kammer..."
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.row, styles.inputGroupLast]}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Waffe</Text>
                <TextInput
                  style={styles.input}
                  value={waffe}
                  onChangeText={setWaffe}
                  placeholder="z.B. Blaser R8..."
                  placeholderTextColor={colors.textLight}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Kaliber</Text>
                <TextInput
                  style={styles.input}
                  value={kaliber}
                  onChangeText={setKaliber}
                  placeholder="z.B. .308 Win..."
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>
          </View>
        )}

        {/* Notizen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notizen</Text>
          <View style={styles.inputGroupLast}>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={notizen}
              onChangeText={setNotizen}
              placeholder="Zusätzliche Notizen..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer mit Buttons */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={[styles.footerButton, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.footerButtonText, styles.cancelButtonText]}>Abbrechen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerButton, styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.footerButtonText, styles.saveButtonText]}>Speichern</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EditEntryScreen;
