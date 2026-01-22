/**
 * HNTR LEGEND Pro - NewEntry Screen
 * Erfassung von Beobachtungen und Abschüssen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../state/ThemeContext';
import { useApp } from '../state/AppContext';
import AutoCapturePanel from '../components/AutoCapturePanel';
import { saveEntry } from '../services/storageService';
import { WILDARTEN, sucheWildart, JAGDARTEN, GESCHLECHTER, WildartDefinition } from '../constants/wildarten';
import { checkSchonzeitWarning } from '../utils/schonzeitHelper';
import { GPSKoordinaten, Wetter, AbschussDetails, Sichtbarkeit } from '../types';

// Typ-Auswahl
type EintragModus = 'beobachtung' | 'abschuss';

const NewEntryScreen: React.FC = () => {
  const { colors } = useTheme();
  const { aktivesRevier, bundesland } = useApp();
  const navigation = useNavigation();

  // Modus: Beobachtung oder Abschuss
  const [modus, setModus] = useState<EintragModus>('beobachtung');

  // Basis-Felder
  const [wildartSuche, setWildartSuche] = useState('');
  const [ausgewaehlteWildart, setAusgewaehlteWildart] = useState<WildartDefinition | null>(null);
  const [wildartVorschlaege, setWildartVorschlaege] = useState<WildartDefinition[]>([]);
  const [anzahl, setAnzahl] = useState('1');
  const [jagdart, setJagdart] = useState<string>('Ansitz');
  const [notizen, setNotizen] = useState('');
  const [sichtbarkeit, setSichtbarkeit] = useState<Sichtbarkeit>('revier');

  // AutoCapture Daten
  const [gps, setGps] = useState<GPSKoordinaten | null>(null);
  const [wetter, setWetter] = useState<Wetter | null>(null);
  const [zeitpunkt, setZeitpunkt] = useState<string>(new Date().toISOString());

  // Abschuss-spezifische Felder
  const [geschlecht, setGeschlecht] = useState<'männlich' | 'weiblich' | 'unbekannt'>('unbekannt');
  const [altersklasse, setAltersklasse] = useState<string>('');
  const [gewicht, setGewicht] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  // Beobachtungs-spezifische Felder
  const [verhalten, setVerhalten] = useState<string>('');

  // Schonzeit-Warnung
  const [schonzeitWarnung, setSchonzeitWarnung] = useState<string | null>(null);

  // Lade-Status
  const [isSaving, setIsSaving] = useState(false);

  // Wildart-Suche
  useEffect(() => {
    if (wildartSuche.length >= 2) {
      const ergebnisse = sucheWildart(wildartSuche);
      setWildartVorschlaege(ergebnisse);
    } else {
      setWildartVorschlaege([]);
    }
  }, [wildartSuche]);

  // Schonzeit prüfen bei Wildart-Auswahl
  useEffect(() => {
    if (ausgewaehlteWildart && bundesland && modus === 'abschuss') {
      const warnung = checkSchonzeitWarning(bundesland, ausgewaehlteWildart.id, zeitpunkt);
      setSchonzeitWarnung(warnung);
    } else {
      setSchonzeitWarnung(null);
    }
  }, [ausgewaehlteWildart, bundesland, zeitpunkt, modus]);

  // Wildart auswählen
  const waehleWildart = (wildart: WildartDefinition) => {
    setAusgewaehlteWildart(wildart);
    setWildartSuche(wildart.name);
    setWildartVorschlaege([]);
    // Altersklasse zurücksetzen wenn Wildart wechselt
    if (wildart.altersklassen.length > 0) {
      setAltersklasse(wildart.altersklassen[0]);
    }
  };

  // AutoCapture Callback
  const onAutoCaptureUpdate = useCallback((data: {
    gps: GPSKoordinaten | null;
    wetter: Wetter | null;
    zeitpunkt: string;
  }) => {
    setGps(data.gps);
    setWetter(data.wetter);
    setZeitpunkt(data.zeitpunkt);
  }, []);

  // Speichern
  const speichern = async () => {
    // Validierung
    if (!ausgewaehlteWildart) {
      Alert.alert('Wildart fehlt', 'Bitte wähle eine Wildart aus.');
      return;
    }

    if (!aktivesRevier) {
      Alert.alert('Kein Revier', 'Bitte wähle zuerst ein Revier aus.');
      return;
    }

    setIsSaving(true);

    try {
      const basisDaten = {
        revierId: aktivesRevier.id,
        zeitpunkt,
        gps: gps || undefined,
        wildartId: ausgewaehlteWildart.id,
        wildartName: ausgewaehlteWildart.name,
        anzahl: parseInt(anzahl) || 1,
        jagdart,
        wetter: wetter || undefined,
        notizen: notizen.trim() || undefined,
        sichtbarkeit,
        fotoIds: [],
        geloeschtAm: null,
      };

      if (modus === 'abschuss') {
        // Abschuss speichern
        const abschussDetails: Partial<AbschussDetails> & Pick<AbschussDetails, 'geschlecht' | 'altersklasse'> = {
          geschlecht,
          altersklasse: altersklasse || 'Unbekannt',
          anzahlSchuesse: 1,
          nachsucheErforderlich: false,
        };

        if (gewicht.trim()) {
          abschussDetails.gewichtAufgebrochenKg = parseFloat(gewicht);
        }

        await saveEntry({
          ...basisDaten,
          typ: 'abschuss',
          abschussDetails: abschussDetails as AbschussDetails,
        } as any);
      } else {
        // Beobachtung speichern
        await saveEntry({
          ...basisDaten,
          typ: 'beobachtung',
          verhalten: verhalten || undefined,
        } as any);
      }

      Alert.alert(
        'Gespeichert',
        `${modus === 'abschuss' ? 'Abschuss' : 'Beobachtung'} wurde erfolgreich gespeichert.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('[NewEntry] Fehler beim Speichern:', error);
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
    scrollContent: {
      padding: 16,
      paddingBottom: 120,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textLight,
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    // Modus-Auswahl
    modusContainer: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 4,
    },
    modusButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 10,
    },
    modusButtonActive: {
      backgroundColor: colors.primary,
    },
    modusButtonText: {
      fontSize: 15,
      color: colors.textLight,
      fontWeight: '500',
    },
    modusButtonTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    // Input
    input: {
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
    },
    inputLabel: {
      fontSize: 13,
      color: colors.textLight,
      marginBottom: 6,
    },
    // Vorschläge
    suggestionsContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginTop: 4,
      maxHeight: 200,
    },
    suggestionItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    suggestionIcon: {
      fontSize: 18,
      marginRight: 10,
    },
    suggestionText: {
      fontSize: 15,
      color: colors.text,
    },
    // Warnung
    warningCard: {
      backgroundColor: '#FEF3C7',
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 8,
    },
    warningIcon: {
      fontSize: 18,
      marginRight: 8,
    },
    warningText: {
      flex: 1,
      fontSize: 13,
      color: '#92400E',
    },
    // Pills-Auswahl
    pillsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    pill: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.card,
    },
    pillActive: {
      backgroundColor: colors.primary,
    },
    pillText: {
      fontSize: 14,
      color: colors.textLight,
    },
    pillTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    // Details-Button
    detailsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      marginTop: 8,
    },
    detailsButtonText: {
      fontSize: 14,
      color: colors.primary,
      marginLeft: 6,
    },
    // Speichern-Button
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Modus-Auswahl */}
        <View style={styles.section}>
          <View style={styles.modusContainer}>
            <TouchableOpacity
              style={[styles.modusButton, modus === 'beobachtung' && styles.modusButtonActive]}
              onPress={() => setModus('beobachtung')}
            >
              <Text
                style={[styles.modusButtonText, modus === 'beobachtung' && styles.modusButtonTextActive]}
              >
                👁️ Beobachtung
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modusButton, modus === 'abschuss' && styles.modusButtonActive]}
              onPress={() => setModus('abschuss')}
            >
              <Text
                style={[styles.modusButtonText, modus === 'abschuss' && styles.modusButtonTextActive]}
              >
                🎯 Abschuss
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AutoCapture Panel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Automatisch erfasst</Text>
          <AutoCapturePanel onUpdate={onAutoCaptureUpdate} />
        </View>

        {/* Wildart */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Wildart *</Text>
          <TextInput
            style={styles.input}
            placeholder="Wildart eingeben..."
            placeholderTextColor={colors.textLight}
            value={wildartSuche}
            onChangeText={(text) => {
              setWildartSuche(text);
              if (ausgewaehlteWildart && text !== ausgewaehlteWildart.name) {
                setAusgewaehlteWildart(null);
              }
            }}
          />

          {/* Vorschläge */}
          {wildartVorschlaege.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {wildartVorschlaege.slice(0, 5).map((wildart) => (
                <TouchableOpacity
                  key={wildart.id}
                  style={styles.suggestionItem}
                  onPress={() => waehleWildart(wildart)}
                >
                  <Text style={styles.suggestionIcon}>{wildart.icon}</Text>
                  <Text style={styles.suggestionText}>{wildart.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Schonzeit-Warnung */}
          {schonzeitWarnung && (
            <View style={styles.warningCard}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningText}>{schonzeitWarnung}</Text>
            </View>
          )}
        </View>

        {/* Anzahl */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Anzahl</Text>
          <TextInput
            style={styles.input}
            value={anzahl}
            onChangeText={setAnzahl}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* Jagdart */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Jagdart</Text>
          <View style={styles.pillsRow}>
            {JAGDARTEN.slice(0, 6).map((art) => (
              <TouchableOpacity
                key={art}
                style={[styles.pill, jagdart === art && styles.pillActive]}
                onPress={() => setJagdart(art)}
              >
                <Text style={[styles.pillText, jagdart === art && styles.pillTextActive]}>{art}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Abschuss-Details */}
        {modus === 'abschuss' && (
          <>
            {/* Geschlecht */}
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Geschlecht</Text>
              <View style={styles.pillsRow}>
                {GESCHLECHTER.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.pill, geschlecht === g && styles.pillActive]}
                    onPress={() => setGeschlecht(g)}
                  >
                    <Text style={[styles.pillText, geschlecht === g && styles.pillTextActive]}>
                      {g === 'männlich' ? '♂️' : g === 'weiblich' ? '♀️' : '?'} {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Altersklasse */}
            {ausgewaehlteWildart && ausgewaehlteWildart.altersklassen.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.inputLabel}>Altersklasse</Text>
                <View style={styles.pillsRow}>
                  {ausgewaehlteWildart.altersklassen.map((klasse) => (
                    <TouchableOpacity
                      key={klasse}
                      style={[styles.pill, altersklasse === klasse && styles.pillActive]}
                      onPress={() => setAltersklasse(klasse)}
                    >
                      <Text style={[styles.pillText, altersklasse === klasse && styles.pillTextActive]}>
                        {klasse}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Gewicht */}
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Gewicht (aufgebrochen, kg)</Text>
              <TextInput
                style={styles.input}
                value={gewicht}
                onChangeText={setGewicht}
                keyboardType="decimal-pad"
                placeholder="z.B. 15.5"
                placeholderTextColor={colors.textLight}
              />
            </View>

            {/* Mehr Details */}
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => setShowDetails(!showDetails)}
            >
              <Text>{showDetails ? '▲' : '▼'}</Text>
              <Text style={styles.detailsButtonText}>
                {showDetails ? 'Weniger Details' : 'Mehr Details (Trophäe, Schuss, etc.)'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Beobachtungs-Details */}
        {modus === 'beobachtung' && (
          <View style={styles.section}>
            <Text style={styles.inputLabel}>Verhalten</Text>
            <TextInput
              style={styles.input}
              value={verhalten}
              onChangeText={setVerhalten}
              placeholder="z.B. äsend, ziehend, ruhend..."
              placeholderTextColor={colors.textLight}
            />
          </View>
        )}

        {/* Notizen */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Notizen</Text>
          <TextInput
            style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
            value={notizen}
            onChangeText={setNotizen}
            placeholder="Weitere Beobachtungen, Besonderheiten..."
            placeholderTextColor={colors.textLight}
            multiline
          />
        </View>

        {/* Speichern-Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={speichern}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Speichern...' : `${modus === 'abschuss' ? 'Abschuss' : 'Beobachtung'} speichern`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default NewEntryScreen;
