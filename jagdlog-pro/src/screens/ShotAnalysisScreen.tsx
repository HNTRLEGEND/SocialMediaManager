/**
 * Shot Analysis Screen
 * 
 * Dokumentiert Anschuss und erstellt automatische Diagnose:
 * - Schuss-Details (Entfernung, Zeitpunkt, Richtung)
 * - Pirschzeichen (Blut, Haare, Wildpret, Fährte)
 * - Wild-Reaktion
 * - KI-Foto-Analyse
 * - Automatische Trefferlage-Diagnose
 * - Nachsuche-Empfehlung mit Wartezeit
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import shotAnalysisService from '../services/shotAnalysisService';
import type {
  Anschusszeichen,
  WildReaktion,
  Schussplatzierung,
} from '../types/analytics';

// ============================================================================
// COMPONENT
// ============================================================================

export default function ShotAnalysisScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { jagd_id, revier_id, wildart, user_id } = route.params as any;

  // Form State
  const [entfernung, setEntfernung] = useState<string>('');
  const [schussRichtung, setSchussRichtung] = useState<string>('');
  const [schussZiel, setSchussZiel] = useState<string>('Blatt');
  const [getroffen, setGetroffen] = useState<boolean>(true);

  // Reaktion
  const [reaktionTyp, setReaktionTyp] = useState<string>('Flucht');
  const [reaktionRichtung, setReaktionRichtung] = useState<string>('');
  const [reaktionGeschwindigkeit, setReaktionGeschwindigkeit] = useState<string>('Mittel');
  const [lautäußerung, setLautäußerung] = useState<string>('Keine');

  // Blut
  const [blutVorhanden, setBlutVorhanden] = useState<boolean>(false);
  const [blutFarbe, setBlutFarbe] = useState<string>('');
  const [blutMenge, setBlutMenge] = useState<string>('');
  const [blutVerteilung, setBlutVerteilung] = useState<string>('');
  const [blutHöhe, setBlutHöhe] = useState<string>('');

  // Schweiß-Details
  const [lungenblut, setLungenblut] = useState<boolean>(false);
  const [lebertreffer, setLebertreffer] = useState<boolean>(false);
  const [nierenschuss, setNierenschuss] = useState<boolean>(false);
  const [pansenschuss, setPansenschuss] = useState<boolean>(false);
  const [knochenschuss, setKnochenschuss] = useState<boolean>(false);

  // Haare
  const [haareVorhanden, setHaareVorhanden] = useState<boolean>(false);
  const [haareTyp, setHaareTyp] = useState<string>('');
  const [haareFarbe, setHaareFarbe] = useState<string>('');
  const [haareMenge, setHaareMenge] = useState<string>('');

  // Wildpret
  const [wildpretVorhanden, setWildpretVorhanden] = useState<boolean>(false);
  const [wildpretTyp, setWildpretTyp] = useState<string>('');

  // Fährte
  const [fährteGesehen, setFährteGesehen] = useState<boolean>(false);
  const [fährteGeschwindigkeit, setFährteGeschwindigkeit] = useState<string>('');

  // Foto
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  // Location
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Loading
  const [loading, setLoading] = useState<boolean>(false);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  React.useEffect(() => {
    getCurrentLocation();
  }, []);

  // ============================================================================
  // FUNCTIONS
  // ============================================================================

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Fehler', 'Standort-Berechtigung verweigert');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  };

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Fehler', 'Kamera-Berechtigung verweigert');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setFotoUri(result.assets[0].uri);
      // Optional: KI-Analyse starten
      await analysiereAnschussFoto(result.assets[0].uri);
    }
  };

  const analysiereAnschussFoto = async (uri: string) => {
    try {
      const kiAnalyse = await shotAnalysisService.analysiereAnschussFoto(uri);

      // Auto-fill based on KI
      if (kiAnalyse.erkannte_merkmale.blutfarbe) {
        setBlutFarbe(kiAnalyse.erkannte_merkmale.blutfarbe);
        setBlutVorhanden(true);
      }
      if (kiAnalyse.erkannte_merkmale.blutmenge) {
        setBlutMenge(kiAnalyse.erkannte_merkmale.blutmenge);
      }
      if (kiAnalyse.erkannte_merkmale.haare_erkannt) {
        setHaareVorhanden(true);
      }
      if (kiAnalyse.erkannte_merkmale.wildpret_erkannt) {
        setWildpretVorhanden(true);
      }

      Alert.alert('KI-Analyse', `Erkennungsrate: ${Math.round(kiAnalyse.confidence)}%`);
    } catch (e) {
      console.error('KI-Analyse fehlgeschlagen:', e);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!entfernung) {
      Alert.alert('Fehler', 'Bitte Entfernung eingeben');
      return;
    }
    if (!location) {
      Alert.alert('Fehler', 'Standort konnte nicht ermittelt werden');
      return;
    }

    setLoading(true);

    try {
      // Build Anschusszeichen object
      const anschusszeichen: Anschusszeichen = {
        blut: {
          vorhanden: blutVorhanden,
          farbe: blutFarbe || undefined,
          menge: blutMenge as any,
          verteilung: blutVerteilung as any,
          höhe: blutHöhe as any,
        },
        schweiß: {
          lungenblut,
          lebertreffer,
          nierenschuss,
          pansenschuss,
          knochenschuss,
        },
        haare: {
          vorhanden: haareVorhanden,
          typ: haareTyp as any,
          farbe: haareFarbe || undefined,
          menge: haareMenge as any,
        },
        wildpret: {
          vorhanden: wildpretVorhanden,
          typ: wildpretTyp as any,
        },
        fährte: {
          gesehen: fährteGesehen,
          geschwindigkeit: fährteGeschwindigkeit as any,
          auffälligkeiten: [],
        },
      };

      const reaktion: WildReaktion = {
        typ: reaktionTyp as any,
        richtung: reaktionRichtung ? parseInt(reaktionRichtung) : undefined,
        geschwindigkeit: reaktionGeschwindigkeit as any,
        lautäußerung: lautäußerung as any,
        verhalten: [],
      };

      const schussplatzierung: Schussplatzierung = {
        ziel: schussZiel as any,
        getroffen,
        confidence: getroffen ? 90 : 0,
      };

      // KI-Analyse (falls Foto vorhanden)
      let kiAnalyse;
      if (fotoUri) {
        kiAnalyse = await shotAnalysisService.analysiereAnschussFoto(fotoUri);
      }

      // Dokumentiere Anschuss
      const result = await shotAnalysisService.dokumentiereAnschuss(user_id, revier_id, {
        jagd_id,
        wildart,
        geschätzteEntfernung: parseInt(entfernung),
        schussZeitpunkt: new Date(),
        schussRichtung: schussRichtung ? parseInt(schussRichtung) : undefined,
        location,
        schussplatzierung,
        reaktion,
        anschusszeichen,
        kiAnalyse,
      });

      setLoading(false);

      // Zeige Ergebnis
      navigation.navigate('ShotAnalysisResult', {
        anschuss: result,
      });
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Fehler', e.message);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Anschuss-Dokumentation</Text>

      {/* SCHUSS-DETAILS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Schuss-Details</Text>

        <Text style={styles.label}>Geschätzte Entfernung (m) *</Text>
        <TextInput
          style={styles.input}
          value={entfernung}
          onChangeText={setEntfernung}
          keyboardType="numeric"
          placeholder="z.B. 80"
        />

        <Text style={styles.label}>Schussrichtung (Grad)</Text>
        <TextInput
          style={styles.input}
          value={schussRichtung}
          onChangeText={setSchussRichtung}
          keyboardType="numeric"
          placeholder="0-360°"
        />

        <Text style={styles.label}>Schussplatzierung Ziel</Text>
        <Picker
          selectedValue={schussZiel}
          onValueChange={(value) => setSchussZiel(value)}
          style={styles.picker}
        >
          <Picker.Item label="Blatt (Lunge/Herz)" value="Blatt" />
          <Picker.Item label="Träger (Wirbelsäule)" value="Träger" />
          <Picker.Item label="Kammer (Brustkorb)" value="Kammer" />
          <Picker.Item label="Lauf (Vorderlauf/Hinterlauf)" value="Lauf" />
          <Picker.Item label="Keule (Hinterkeule)" value="Keule" />
          <Picker.Item label="Haupt (Kopf)" value="Haupt" />
          <Picker.Item label="Hals" value="Hals" />
        </Picker>

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setGetroffen(!getroffen)}
          >
            <Text style={styles.checkboxText}>{getroffen ? '☑' : '☐'} Getroffen</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* WILD-REAKTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wild-Reaktion</Text>

        <Text style={styles.label}>Reaktionstyp *</Text>
        <Picker
          selectedValue={reaktionTyp}
          onValueChange={(value) => setReaktionTyp(value)}
          style={styles.picker}
        >
          <Picker.Item label="Zusammenbruch" value="Zusammenbruch" />
          <Picker.Item label="Flucht" value="Flucht" />
          <Picker.Item label="Zeichnen (reagiert)" value="Zeichnen" />
          <Picker.Item label="Keine Reaktion" value="Keine_Reaktion" />
        </Picker>

        <Text style={styles.label}>Fluchtrichtung (Grad)</Text>
        <TextInput
          style={styles.input}
          value={reaktionRichtung}
          onChangeText={setReaktionRichtung}
          keyboardType="numeric"
          placeholder="0-360°"
        />

        <Text style={styles.label}>Geschwindigkeit</Text>
        <Picker
          selectedValue={reaktionGeschwindigkeit}
          onValueChange={(value) => setReaktionGeschwindigkeit(value)}
          style={styles.picker}
        >
          <Picker.Item label="Langsam (Schritt)" value="Langsam" />
          <Picker.Item label="Mittel (Trab)" value="Mittel" />
          <Picker.Item label="Schnell (Hochflüchtig)" value="Schnell" />
        </Picker>

        <Text style={styles.label}>Lautäußerung</Text>
        <Picker
          selectedValue={lautäußerung}
          onValueChange={(value) => setLautäußerung(value)}
          style={styles.picker}
        >
          <Picker.Item label="Keine" value="Keine" />
          <Picker.Item label="Schreien" value="Schreien" />
          <Picker.Item label="Klagen" value="Klagen" />
        </Picker>
      </View>

      {/* PIRSCHZEICHEN: BLUT */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pirschzeichen: Blut / Schweiß</Text>

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setBlutVorhanden(!blutVorhanden)}
          >
            <Text style={styles.checkboxText}>{blutVorhanden ? '☑' : '☐'} Blut vorhanden</Text>
          </TouchableOpacity>
        </View>

        {blutVorhanden && (
          <>
            <Text style={styles.label}>Blutfarbe</Text>
            <Picker
              selectedValue={blutFarbe}
              onValueChange={(value) => setBlutFarbe(value)}
              style={styles.picker}
            >
              <Picker.Item label="Bitte wählen" value="" />
              <Picker.Item label="Hellrot (Lungenblut)" value="Hellrot" />
              <Picker.Item label="Dunkelrot (Leberblut)" value="Dunkelrot" />
              <Picker.Item label="Bräunlich (Pansen)" value="Bräunlich" />
              <Picker.Item label="Schaumig (Lunge)" value="Schaumig" />
            </Picker>

            <Text style={styles.label}>Blutmenge</Text>
            <Picker
              selectedValue={blutMenge}
              onValueChange={(value) => setBlutMenge(value)}
              style={styles.picker}
            >
              <Picker.Item label="Bitte wählen" value="" />
              <Picker.Item label="Wenig (einzelne Tropfen)" value="Wenig" />
              <Picker.Item label="Mittel (Fährte)" value="Mittel" />
              <Picker.Item label="Viel (Lache)" value="Viel" />
            </Picker>

            <Text style={styles.label}>Verteilung</Text>
            <Picker
              selectedValue={blutVerteilung}
              onValueChange={(value) => setBlutVerteilung(value)}
              style={styles.picker}
            >
              <Picker.Item label="Bitte wählen" value="" />
              <Picker.Item label="Tropfen" value="Tropfen" />
              <Picker.Item label="Spritzer" value="Spritzer" />
              <Picker.Item label="Fährte" value="Fährte" />
              <Picker.Item label="Lache" value="Lache" />
            </Picker>

            <Text style={styles.label}>Höhe</Text>
            <Picker
              selectedValue={blutHöhe}
              onValueChange={(value) => setBlutHöhe(value)}
              style={styles.picker}
            >
              <Picker.Item label="Bitte wählen" value="" />
              <Picker.Item label="Bodennah (Lauf/Keule)" value="Bodennah" />
              <Picker.Item label="Kniehoch (Blatt)" value="Kniehoch" />
              <Picker.Item label="Brusthoch (Austritt)" value="Brusthoch" />
            </Picker>

            <Text style={styles.label}>Schweiß-Art (Mehrfachauswahl)</Text>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setLungenblut(!lungenblut)}
            >
              <Text style={styles.checkboxText}>
                {lungenblut ? '☑' : '☐'} Lungenblut (hellrot, schaumig)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setLebertreffer(!lebertreffer)}
            >
              <Text style={styles.checkboxText}>
                {lebertreffer ? '☑' : '☐'} Lebertreffer (dunkelrot, dickflüssig)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setNierenschuss(!nierenschuss)}
            >
              <Text style={styles.checkboxText}>
                {nierenschuss ? '☑' : '☐'} Nierenschuss (blutig, Urin)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setPansenschuss(!pansenschuss)}
            >
              <Text style={styles.checkboxText}>
                {pansenschuss ? '☑' : '☐'} Pansenschuss (grünlich, Mageninhalt)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setKnochenschuss(!knochenschuss)}
            >
              <Text style={styles.checkboxText}>
                {knochenschuss ? '☑' : '☐'} Knochenschuss (mit Splittern)
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* PIRSCHZEICHEN: HAARE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pirschzeichen: Haare</Text>

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setHaareVorhanden(!haareVorhanden)}
          >
            <Text style={styles.checkboxText}>{haareVorhanden ? '☑' : '☐'} Haare vorhanden</Text>
          </TouchableOpacity>
        </View>

        {haareVorhanden && (
          <>
            <Text style={styles.label}>Haartyp</Text>
            <Picker
              selectedValue={haareTyp}
              onValueChange={(value) => setHaareTyp(value)}
              style={styles.picker}
            >
              <Picker.Item label="Bitte wählen" value="" />
              <Picker.Item label="Grannen (Stichhaar)" value="Grannen" />
              <Picker.Item label="Deckhaar" value="Deckhaar" />
              <Picker.Item label="Winterhaar" value="Winterhaar" />
              <Picker.Item label="Sommerhaar" value="Sommerhaar" />
            </Picker>

            <Text style={styles.label}>Farbe</Text>
            <TextInput
              style={styles.input}
              value={haareFarbe}
              onChangeText={setHaareFarbe}
              placeholder="z.B. Braun, Grau, Schwarz"
            />

            <Text style={styles.label}>Menge</Text>
            <Picker
              selectedValue={haareMenge}
              onValueChange={(value) => setHaareMenge(value)}
              style={styles.picker}
            >
              <Picker.Item label="Bitte wählen" value="" />
              <Picker.Item label="Wenig" value="Wenig" />
              <Picker.Item label="Mittel" value="Mittel" />
              <Picker.Item label="Viel" value="Viel" />
            </Picker>
          </>
        )}
      </View>

      {/* PIRSCHZEICHEN: WILDPRET */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pirschzeichen: Wildpret / Gewebe</Text>

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setWildpretVorhanden(!wildpretVorhanden)}
          >
            <Text style={styles.checkboxText}>
              {wildpretVorhanden ? '☑' : '☐'} Wildpret vorhanden
            </Text>
          </TouchableOpacity>
        </View>

        {wildpretVorhanden && (
          <>
            <Text style={styles.label}>Typ</Text>
            <Picker
              selectedValue={wildpretTyp}
              onValueChange={(value) => setWildpretTyp(value)}
              style={styles.picker}
            >
              <Picker.Item label="Bitte wählen" value="" />
              <Picker.Item label="Lungenstücke" value="Lungenstücke" />
              <Picker.Item label="Pansenfetzen" value="Pansenfetzen" />
              <Picker.Item label="Knochensplitter" value="Knochensplitter" />
            </Picker>
          </>
        )}
      </View>

      {/* PIRSCHZEICHEN: FÄHRTE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pirschzeichen: Fährte</Text>

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setFährteGesehen(!fährteGesehen)}
          >
            <Text style={styles.checkboxText}>{fährteGesehen ? '☑' : '☐'} Fährte gesehen</Text>
          </TouchableOpacity>
        </View>

        {fährteGesehen && (
          <>
            <Text style={styles.label}>Geschwindigkeit</Text>
            <Picker
              selectedValue={fährteGeschwindigkeit}
              onValueChange={(value) => setFährteGeschwindigkeit(value)}
              style={styles.picker}
            >
              <Picker.Item label="Bitte wählen" value="" />
              <Picker.Item label="Schritt (langsam)" value="Schritt" />
              <Picker.Item label="Trab (mittel)" value="Trab" />
              <Picker.Item label="Flucht (schnell)" value="Flucht" />
            </Picker>
          </>
        )}
      </View>

      {/* FOTO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Foto (KI-Analyse)</Text>

        <TouchableOpacity style={styles.photoButton} onPress={takePicture}>
          <Text style={styles.photoButtonText}>📷 Foto aufnehmen</Text>
        </TouchableOpacity>

        {fotoUri && (
          <Image source={{ uri: fotoUri }} style={styles.previewImage} />
        )}
      </View>

      {/* SUBMIT */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Wird analysiert...' : 'Anschuss dokumentieren & Diagnose erstellen'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 6,
    fontSize: 16,
    color: '#2c3e50',
  },
  picker: {
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    marginTop: 4,
  },
  checkboxRow: {
    marginTop: 8,
  },
  checkbox: {
    paddingVertical: 8,
  },
  checkboxText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  photoButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
