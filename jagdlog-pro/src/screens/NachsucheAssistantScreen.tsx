/**
 * Nachsuche Assistant Screen
 * 
 * GPS-gestützter Nachsuche-Assistent:
 * - Live GPS-Tracking
 * - Echtzeit-Distanzanzeige vom Anschuss
 * - Fundort-Heatmap (Live-Update)
 * - Pirschzeichen-Dokumentation
 * - Echtzeit-Empfehlungen
 * - Fundort-Markierung
 * - Erfolgs-Bewertung
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Polyline, Marker, Circle, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import trackingAssistantService from '../services/trackingAssistantService';
import type { NachsucheEmpfehlung, TrackingPunkt } from '../types/analytics';

// ============================================================================
// COMPONENT
// ============================================================================

export default function NachsucheAssistantScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { shot_analysis_id, empfehlung, user_id, revier_id } = route.params as {
    shot_analysis_id: string;
    empfehlung: NachsucheEmpfehlung;
    user_id: string;
    revier_id: string;
  };

  const mapRef = useRef<MapView>(null);

  // State
  const [nachsuche, setNachsuche] = useState<any>(null);
  const [status, setStatus] = useState<'Warten' | 'Laufend' | 'Abgeschlossen'>('Warten');
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [trackingPunkte, setTrackingPunkte] = useState<TrackingPunkt[]>([]);
  const [distanzVomAnschuss, setDistanzVomAnschuss] = useState<number>(0);
  const [autoTracking, setAutoTracking] = useState<boolean>(false);
  const [realtimeEmpfehlung, setRealtimeEmpfehlung] = useState<string>('');

  // Pirschzeichen-Dokumentation
  const [showPirschzeichenModal, setShowPirschzeichenModal] = useState<boolean>(false);
  const [pirschzeichenTyp, setPirschzeichenTyp] = useState<string>('');
  const [pirschzeichenBeschreibung, setPirschzeichenBeschreibung] = useState<string>('');

  // Wartezeit
  const [wartezeitAbgelaufen, setWartezeitAbgelaufen] = useState<boolean>(false);
  const [verbleibendeMinu ten, setVerbleibendeMinuten] = useState<number>(
    empfehlung.wartezeit_detail.optimal
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    initializeNachsuche();
    startLocationTracking();
    startWartezeitTimer();

    return () => {
      stopLocationTracking();
    };
  }, []);

  useEffect(() => {
    if (currentLocation && nachsuche) {
      updateRealtimeEmpfehlung();
    }
  }, [currentLocation]);

  // ============================================================================
  // FUNCTIONS
  // ============================================================================

  const initializeNachsuche = async () => {
    try {
      const result = await trackingAssistantService.starteNachsuche(user_id, revier_id, {
        shot_analysis_id,
        empfohlene_wartezeit: empfehlung.wartezeit_detail.optimal,
        empfohlene_strategie: empfehlung.strategie.typ,
        hund_empfohlen: empfehlung.hundeEmpfehlung.benötigt,
        hund_typ: empfehlung.hundeEmpfehlung.typ,
      });
      setNachsuche(result);
    } catch (e: any) {
      Alert.alert('Fehler', e.message);
    }
  };

  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Fehler', 'Standort-Berechtigung verweigert');
      return;
    }

    // Initial location
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setCurrentLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });

    // Watch location
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // 5 seconds
        distanceInterval: 5, // 5 meters
      },
      (location) => {
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // Calculate distance from Anschuss
        if (nachsuche) {
          const distance = calculateDistance(
            { latitude: nachsuche.startpunkt.latitude, longitude: nachsuche.startpunkt.longitude },
            { latitude: location.coords.latitude, longitude: location.coords.longitude }
          );
          setDistanzVomAnschuss(distance);
        }
      }
    );
  };

  const stopLocationTracking = async () => {
    // Location watcher is automatically stopped when component unmounts
  };

  const startWartezeitTimer = () => {
    const interval = setInterval(() => {
      setVerbleibendeMinuten((prev) => {
        if (prev <= 0) {
          setWartezeitAbgelaufen(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  };

  const handleStarteAktiveNachsuche = async () => {
    if (!wartezeitAbgelaufen) {
      Alert.alert(
        'Wartezeit nicht abgelaufen',
        `Noch ${verbleibendeMinuten} Minuten verbleibend. Trotzdem starten?`,
        [
          { text: 'Abbrechen', style: 'cancel' },
          {
            text: 'Ja, starten',
            onPress: async () => {
              await starteNachsuche();
            },
          },
        ]
      );
    } else {
      await starteNachsuche();
    }
  };

  const starteNachsuche = async () => {
    try {
      await trackingAssistantService.starteAktiveNachsuche(nachsuche.id, empfehlung.wartezeit);
      setStatus('Laufend');

      // Start auto-tracking
      setAutoTracking(true);
      await trackingAssistantService.startAutoTracking(nachsuche.id);

      Alert.alert('Nachsuche gestartet', 'GPS-Tracking ist aktiv. Viel Erfolg!');
    } catch (e: any) {
      Alert.alert('Fehler', e.message);
    }
  };

  const handleDokumentierePirschzeichen = async () => {
    if (!currentLocation) {
      Alert.alert('Fehler', 'Standort nicht verfügbar');
      return;
    }

    // Optional: Foto aufnehmen
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    let fotoUri: string | undefined;

    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        fotoUri = result.assets[0].uri;
      }
    }

    try {
      await trackingAssistantService.dokumentierePirschzeichen(nachsuche.id, currentLocation, {
        typ: pirschzeichenTyp,
        beschreibung: pirschzeichenBeschreibung,
        foto_uri: fotoUri,
      });

      // Add to tracking points
      const neuerPunkt: TrackingPunkt = {
        id: `${Date.now()}`,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        zeitpunkt: new Date(),
        notiz: pirschzeichenBeschreibung,
        foto_uri: fotoUri,
        pirschzeichen: pirschzeichenTyp,
      };
      setTrackingPunkte([...trackingPunkte, neuerPunkt]);

      // Reset form
      setPirschzeichenTyp('');
      setPirschzeichenBeschreibung('');
      setShowPirschzeichenModal(false);

      Alert.alert('Erfolg', 'Pirschzeichen dokumentiert');
    } catch (e: any) {
      Alert.alert('Fehler', e.message);
    }
  };

  const handleMarkiereFundort = async () => {
    if (!currentLocation) {
      Alert.alert('Fehler', 'Standort nicht verfügbar');
      return;
    }

    Alert.alert('Wild gefunden?', 'Ist das Wild verendet oder lebend?', [
      {
        text: 'Verendet',
        onPress: async () => {
          await markiereFundort('Verendet');
        },
      },
      {
        text: 'Lebend erlegt',
        onPress: async () => {
          await markiereFundort('Lebend_erlegt');
        },
      },
      { text: 'Abbrechen', style: 'cancel' },
    ]);
  };

  const markiereFundort = async (zustand: 'Verendet' | 'Lebend_erlegt') => {
    if (!currentLocation) return;

    try {
      await trackingAssistantService.markiereFundort(nachsuche.id, currentLocation, zustand);

      Alert.alert(
        'Fundort markiert',
        `Wild ${zustand}. Distanz vom Anschuss: ${Math.round(distanzVomAnschuss)}m`,
        [
          {
            text: 'Nachsuche abschließen',
            onPress: () => handleAbschliesseNachsuche(true, true),
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Fehler', e.message);
    }
  };

  const handleAbschliesseNachsuche = async (erfolgreich: boolean, wild_geborgen: boolean) => {
    try {
      await trackingAssistantService.abschliesseNachsuche(nachsuche.id, {
        gefunden: erfolgreich,
        fundort: currentLocation || undefined,
        zustand: wild_geborgen ? 'Verendet' : undefined,
        erfolgreich,
        wild_geborgen,
        notizen: '',
      });

      setStatus('Abgeschlossen');
      setAutoTracking(false);
      await trackingAssistantService.stopAutoTracking();

      Alert.alert('Nachsuche abgeschlossen', erfolgreich ? 'Waidmannsheil!' : 'Schade, Wild nicht gefunden.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Fehler', e.message);
    }
  };

  const updateRealtimeEmpfehlung = async () => {
    if (!nachsuche || !currentLocation) return;

    try {
      const empf = await trackingAssistantService.getRealtimeEmpfehlungen(
        nachsuche.id,
        currentLocation
      );
      setRealtimeEmpfehlung(empf.status_nachricht);
    } catch (e) {
      // Ignore
    }
  };

  const calculateDistance = (
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number => {
    const R = 6371000; // Earth radius in meters
    const lat1 = (point1.latitude * Math.PI) / 180;
    const lat2 = (point2.latitude * Math.PI) / 180;
    const deltaLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const deltaLng = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!nachsuche || !currentLocation) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initialisiere Nachsuche...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* MAP */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: nachsuche.startpunkt.latitude,
            longitude: nachsuche.startpunkt.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
          followsUserLocation
        >
          {/* Anschuss-Marker */}
          <Marker
            coordinate={nachsuche.startpunkt}
            title="Anschuss"
            description={`${new Date().toLocaleTimeString()}`}
            pinColor="red"
          />

          {/* Suchgebiet-Radius */}
          <Circle
            center={nachsuche.startpunkt}
            radius={empfehlung.suchgebiet.radius}
            fillColor="rgba(255, 0, 0, 0.1)"
            strokeColor="rgba(255, 0, 0, 0.5)"
            strokeWidth={2}
          />

          {/* Wahrscheinlichkeits-Zonen */}
          {empfehlung.suchgebiet.wahrscheinlichkeitsZonen.map((zone, idx) => (
            <Polygon
              key={idx}
              coordinates={zone.polygon}
              fillColor={
                zone.priorität === 1
                  ? 'rgba(231, 76, 60, 0.3)'
                  : zone.priorität === 2
                  ? 'rgba(241, 196, 15, 0.3)'
                  : 'rgba(52, 152, 219, 0.3)'
              }
              strokeColor={
                zone.priorität === 1
                  ? 'rgba(231, 76, 60, 0.8)'
                  : zone.priorität === 2
                  ? 'rgba(241, 196, 15, 0.8)'
                  : 'rgba(52, 152, 219, 0.8)'
              }
              strokeWidth={2}
            />
          ))}

          {/* GPS-Route (Tracking-Punkte) */}
          {trackingPunkte.length > 1 && (
            <Polyline
              coordinates={trackingPunkte.map((p) => ({
                latitude: p.latitude,
                longitude: p.longitude,
              }))}
              strokeColor="#3498db"
              strokeWidth={3}
            />
          )}

          {/* Tracking-Punkte Markers */}
          {trackingPunkte.map((punkt, idx) => (
            <Marker
              key={punkt.id}
              coordinate={{ latitude: punkt.latitude, longitude: punkt.longitude }}
              title={punkt.pirschzeichen || 'Tracking-Punkt'}
              description={punkt.notiz}
              pinColor="blue"
            />
          ))}
        </MapView>

        {/* Distanz-Overlay */}
        <View style={styles.distanzOverlay}>
          <Text style={styles.distanzLabel}>Distanz vom Anschuss:</Text>
          <Text style={styles.distanzValue}>{Math.round(distanzVomAnschuss)}m</Text>
        </View>

        {/* Wartezeit-Overlay */}
        {status === 'Warten' && (
          <View style={styles.wartezeitOverlay}>
            <Text style={styles.wartezeitLabel}>Verbleibende Wartezeit:</Text>
            <Text style={styles.wartezeitValue}>
              {Math.floor(verbleibendeMinuten / 60)}h {verbleibendeMinuten % 60}min
            </Text>
            {wartezeitAbgelaufen && (
              <Text style={styles.wartezeitAbgelaufen}>✓ Wartezeit abgelaufen</Text>
            )}
          </View>
        )}
      </View>

      {/* INFO & ACTIONS */}
      <ScrollView style={styles.infoContainer}>
        {/* Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text
            style={[
              styles.statusValue,
              {
                color:
                  status === 'Warten' ? '#f39c12' : status === 'Laufend' ? '#27ae60' : '#95a5a6',
              },
            ]}
          >
            {status === 'Warten' ? '⏱️ Wartezeit' : status === 'Laufend' ? '🔍 Laufend' : '✓ Abgeschlossen'}
          </Text>
        </View>

        {/* Echtzeit-Empfehlung */}
        {status === 'Laufend' && realtimeEmpfehlung && (
          <View style={styles.empfehlungCard}>
            <Text style={styles.empfehlungText}>{realtimeEmpfehlung}</Text>
          </View>
        )}

        {/* Actions */}
        {status === 'Warten' && (
          <TouchableOpacity style={styles.startButton} onPress={handleStarteAktiveNachsuche}>
            <Text style={styles.startButtonText}>🔍 Nachsuche starten</Text>
          </TouchableOpacity>
        )}

        {status === 'Laufend' && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowPirschzeichenModal(!showPirschzeichenModal)}
            >
              <Text style={styles.actionButtonText}>📝 Pirschzeichen dokumentieren</Text>
            </TouchableOpacity>

            {showPirschzeichenModal && (
              <View style={styles.pirschzeichenModal}>
                <Text style={styles.modalLabel}>Pirschzeichen-Typ:</Text>
                <TextInput
                  style={styles.input}
                  value={pirschzeichenTyp}
                  onChangeText={setPirschzeichenTyp}
                  placeholder="z.B. Blut, Haare, Fährte"
                />

                <Text style={styles.modalLabel}>Beschreibung:</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={pirschzeichenBeschreibung}
                  onChangeText={setPirschzeichenBeschreibung}
                  placeholder="Details..."
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleDokumentierePirschzeichen}
                >
                  <Text style={styles.saveButtonText}>💾 Speichern (+ Foto)</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.fundortButton} onPress={handleMarkiereFundort}>
              <Text style={styles.fundortButtonText}>🎯 Wild gefunden - Fundort markieren</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.abbrechenButton}
              onPress={() => handleAbschliesseNachsuche(false, false)}
            >
              <Text style={styles.abbrechenButtonText}>Nachsuche abbrechen (erfolglos)</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  mapContainer: {
    height: '50%',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  distanzOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  distanzLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  distanzValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
  },
  wartezeitOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(243, 156, 18, 0.95)',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  wartezeitLabel: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 4,
  },
  wartezeitValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  wartezeitAbgelaufen: {
    fontSize: 12,
    color: '#27ae60',
    marginTop: 4,
    fontWeight: '600',
  },
  infoContainer: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  empfehlungCard: {
    backgroundColor: '#d1ecf1',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  empfehlungText: {
    fontSize: 14,
    color: '#0c5460',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#27ae60',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  actionButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pirschzeichenModal: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#3498db',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 6,
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fundortButton: {
    backgroundColor: '#e74c3c',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  fundortButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  abbrechenButton: {
    backgroundColor: '#95a5a6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  abbrechenButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
