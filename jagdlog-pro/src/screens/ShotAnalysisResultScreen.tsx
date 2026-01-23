/**
 * Shot Analysis Result Screen
 * 
 * Zeigt Anschuss-Diagnose & Nachsuche-Empfehlung:
 * - KI-Trefferlage-Diagnose mit Wahrscheinlichkeit
 * - Alternative Diagnosen
 * - Wartezeit-Empfehlung (Matrix-basiert)
 * - Hunde-Empfehlung
 * - Suchgebiet mit Fundort-Heatmap
 * - Rechtliche Pflichten
 * - Nachsuche starten
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Circle, Marker, Polygon } from 'react-native-maps';
import type { AnschussErkennung } from '../types/analytics';

// ============================================================================
// COMPONENT
// ============================================================================

export default function ShotAnalysisResultScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { anschuss } = route.params as { anschuss: AnschussErkennung };

  const diagnose = anschuss.trefferlageDiagnose;
  const empfehlung = anschuss.nachsucheEmpfehlung;

  // ============================================================================
  // FUNCTIONS
  // ============================================================================

  const getColorForWahrscheinlichkeit = (prozent: number) => {
    if (prozent >= 80) return '#27ae60'; // Grün
    if (prozent >= 60) return '#f39c12'; // Orange
    return '#e74c3c'; // Rot
  };

  const getTrefferlageBeschreibung = (trefferlage: string) => {
    const beschreibungen: Record<string, string> = {
      Blattschuss:
        'Optimale Trefferlage - Herz/Lunge getroffen. Wild verendet meist innerhalb 50-200m.',
      Trägerschuss: 'Wirbelsäule getroffen - Wild sofort verendet (meist am Anschuss).',
      Kammerschuss: 'Brustkorb/Herz getroffen - Wild verendet schnell.',
      Lebertreffer:
        'Leber getroffen - Wild verendet verzögert. LANGE WARTEZEIT ZWINGEND!',
      Nierenschuss: 'Nieren getroffen - mittelschwer. Wartezeit empfohlen.',
      Pansenschuss:
        'Pansen (Magen) getroffen - WAIDWUND! SEHR LANGE WARTEZEIT ZWINGEND! Schweißhund erforderlich.',
      Waidwundschuss:
        'Eingeweide getroffen - Wild kann weit flüchten. Lange Wartezeit, Hund empfohlen.',
      Keulenschuss: 'Hinterkeule getroffen - Wild kann flüchten. Wartezeit empfohlen.',
      Laufschuss:
        'Lauf (Bein) getroffen - Wild kann sehr weit flüchten. Sofortnachsuche mit Hund oft besser.',
      Hauptschuss: 'Kopf getroffen - Wild sofort verendet.',
      Fehlschuss: 'Vermutlich kein tödlicher Treffer - dennoch Nachsuche erforderlich.',
      Streifschuss:
        'Nur gestreift - unsicher ob tödlich. Vorsichtige Nachsuche empfohlen.',
    };

    return beschreibungen[trefferlage] || 'Unbekannte Trefferlage';
  };

  const handleStarteNachsuche = () => {
    navigation.navigate('NachsucheAssistant', {
      shot_analysis_id: anschuss.id,
      empfehlung,
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Anschuss-Diagnose</Text>

      {/* HAUPTDIAGNOSE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>KI-Diagnose</Text>

        <View style={styles.diagnoseCard}>
          <View style={styles.diagnoseHeader}>
            <Text style={styles.diagnoseName}>{diagnose.hauptdiagnose}</Text>
            <View
              style={[
                styles.confidenceBadge,
                {
                  backgroundColor: getColorForWahrscheinlichkeit(
                    diagnose.wahrscheinlichkeit
                  ),
                },
              ]}
            >
              <Text style={styles.confidenceText}>
                {Math.round(diagnose.wahrscheinlichkeit)}%
              </Text>
            </View>
          </View>

          <Text style={styles.diagnoseBeschreibung}>
            {getTrefferlageBeschreibung(diagnose.hauptdiagnose)}
          </Text>

          <View style={styles.begründungBox}>
            <Text style={styles.begründungTitle}>Begründung:</Text>
            {diagnose.begründung.map((text, idx) => (
              <Text key={idx} style={styles.begründungText}>
                • {text}
              </Text>
            ))}
          </View>
        </View>

        {/* ALTERNATIVE DIAGNOSEN */}
        {diagnose.alternativDiagnosen.length > 0 && (
          <View style={styles.alternativeBox}>
            <Text style={styles.alternativeTitle}>Alternative Diagnosen:</Text>
            {diagnose.alternativDiagnosen.map((alt, idx) => (
              <View key={idx} style={styles.alternativeItem}>
                <Text style={styles.alternativeName}>{alt.art}</Text>
                <Text style={styles.alternativePercent}>
                  {Math.round(alt.wahrscheinlichkeit)}%
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* WARTEZEIT */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏱️ Wartezeit-Empfehlung</Text>

        <View style={styles.wartezeitCard}>
          <View style={styles.wartezeitRow}>
            <Text style={styles.wartezeitLabel}>Minimum:</Text>
            <Text style={styles.wartezeitValue}>
              {empfehlung.wartezeit_detail.min} Minuten
            </Text>
          </View>
          <View style={styles.wartezeitRow}>
            <Text style={styles.wartezeitLabel}>Optimal:</Text>
            <Text style={[styles.wartezeitValue, styles.wartezeitOptimal]}>
              {empfehlung.wartezeit_detail.optimal} Minuten (
              {Math.round(empfehlung.wartezeit_detail.optimal / 60)} Stunden)
            </Text>
          </View>
          <View style={styles.wartezeitRow}>
            <Text style={styles.wartezeitLabel}>Maximum:</Text>
            <Text style={styles.wartezeitValue}>
              {empfehlung.wartezeit_detail.max} Minuten
            </Text>
          </View>

          <View style={styles.wartezeitBegründung}>
            <Text style={styles.wartezeitBegründungText}>
              {empfehlung.wartezeit_detail.begründung}
            </Text>
          </View>
        </View>
      </View>

      {/* HUNDE-EMPFEHLUNG */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🐕 Hunde-Empfehlung</Text>

        <View
          style={[
            styles.hundeCard,
            {
              backgroundColor: empfehlung.hundeEmpfehlung.benötigt
                ? '#fff3cd'
                : '#d1ecf1',
            },
          ]}
        >
          <View style={styles.hundeHeader}>
            <Text style={styles.hundeStatus}>
              {empfehlung.hundeEmpfehlung.benötigt ? '⚠️ Hund erforderlich' : '✓ Hund optional'}
            </Text>
            {empfehlung.hundeEmpfehlung.typ && (
              <Text style={styles.hundeTyp}>Typ: {empfehlung.hundeEmpfehlung.typ}</Text>
            )}
          </View>

          <Text style={styles.hundeBegründung}>
            {empfehlung.hundeEmpfehlung.begründung}
          </Text>

          <Text style={styles.hundeDringlichkeit}>
            Dringlichkeit: {empfehlung.hundeEmpfehlung.dringlichkeit}
          </Text>
        </View>
      </View>

      {/* SUCHGEBIET & FUNDORT-HEATMAP */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Suchgebiet & Fundort-Prediction</Text>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: empfehlung.suchgebiet.startpunkt.latitude,
              longitude: empfehlung.suchgebiet.startpunkt.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {/* Anschuss-Marker */}
            <Marker
              coordinate={empfehlung.suchgebiet.startpunkt}
              title="Anschuss"
              pinColor="red"
            />

            {/* Suchgebiet-Radius */}
            <Circle
              center={empfehlung.suchgebiet.startpunkt}
              radius={empfehlung.suchgebiet.radius}
              fillColor="rgba(255, 0, 0, 0.1)"
              strokeColor="rgba(255, 0, 0, 0.5)"
              strokeWidth={2}
            />

            {/* Wahrscheinlichkeits-Zonen (Heatmap) */}
            {empfehlung.suchgebiet.wahrscheinlichkeitsZonen.map((zone, idx) => (
              <Polygon
                key={idx}
                coordinates={zone.polygon}
                fillColor={
                  zone.priorität === 1
                    ? 'rgba(231, 76, 60, 0.3)' // Rot (höchste Priorität)
                    : zone.priorität === 2
                    ? 'rgba(241, 196, 15, 0.3)' // Gelb
                    : 'rgba(52, 152, 219, 0.3)' // Blau
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
          </MapView>
        </View>

        {/* Zonen-Legende */}
        <View style={styles.zonenLegende}>
          <Text style={styles.legendeTitle}>Fundort-Wahrscheinlichkeit:</Text>
          {empfehlung.suchgebiet.wahrscheinlichkeitsZonen.map((zone, idx) => (
            <View key={idx} style={styles.legendeItem}>
              <View
                style={[
                  styles.legendeColor,
                  {
                    backgroundColor:
                      zone.priorität === 1
                        ? '#e74c3c'
                        : zone.priorität === 2
                        ? '#f1c40f'
                        : '#3498db',
                  },
                ]}
              />
              <Text style={styles.legendeText}>
                Zone {zone.priorität}: {zone.wahrscheinlichkeit}% ({zone.terrain_typ},{' '}
                {zone.geschätzte_entfernung.durchschnitt}m)
              </Text>
            </View>
          ))}
          <Text style={styles.legendeHinweis}>
            💡 Rote Zone = höchste Fundwahrscheinlichkeit (Priorität 1)
          </Text>
        </View>

        {/* Suchradius-Ausdehnung */}
        <View style={styles.ausdehnungBox}>
          <Text style={styles.ausdehnungTitle}>Suchradius-Entwicklung:</Text>
          <Text style={styles.ausdehnungText}>
            Sofort: {Math.round(empfehlung.suchgebiet.ausdehnung.nach_0h)}m
          </Text>
          <Text style={styles.ausdehnungText}>
            Nach 1h: {Math.round(empfehlung.suchgebiet.ausdehnung.nach_1h)}m
          </Text>
          <Text style={styles.ausdehnungText}>
            Nach 3h: {Math.round(empfehlung.suchgebiet.ausdehnung.nach_3h)}m
          </Text>
          <Text style={styles.ausdehnungText}>
            Nach 6h: {Math.round(empfehlung.suchgebiet.ausdehnung.nach_6h)}m
          </Text>
        </View>
      </View>

      {/* STRATEGIE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Nachsuche-Strategie</Text>

        <View style={styles.strategieCard}>
          <Text style={styles.strategieTyp}>Typ: {empfehlung.strategie.typ}</Text>
          <Text style={styles.strategieBeschreibung}>
            {empfehlung.strategie.beschreibung}
          </Text>

          <Text style={styles.schritteTitle}>Schritte:</Text>
          {empfehlung.strategie.schritte.map((schritt, idx) => (
            <Text key={idx} style={styles.schrittText}>
              {idx + 1}. {schritt}
            </Text>
          ))}
        </View>
      </View>

      {/* RECHTLICHE PFLICHTEN */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚖️ Rechtliche Pflichten</Text>

        <View style={styles.rechtlicheBox}>
          <View style={styles.rechtlicheRow}>
            <Text style={styles.rechtlicheLabel}>Nachsuchepflicht:</Text>
            <Text
              style={[
                styles.rechtlicheValue,
                { color: empfehlung.rechtlichePflicht.nachsuchePflicht ? '#e74c3c' : '#27ae60' },
              ]}
            >
              {empfehlung.rechtlichePflicht.nachsuchePflicht ? 'JA' : 'NEIN'}
            </Text>
          </View>
          <View style={styles.rechtlicheRow}>
            <Text style={styles.rechtlicheLabel}>Meldefrist:</Text>
            <Text style={styles.rechtlicheValue}>
              {empfehlung.rechtlichePflicht.meldefrist} Stunden
            </Text>
          </View>
          <View style={styles.rechtlicheRow}>
            <Text style={styles.rechtlicheLabel}>Jagdgenossenschaft informieren:</Text>
            <Text style={styles.rechtlicheValue}>
              {empfehlung.rechtlichePflicht.jagdgenossenschaft ? 'JA' : 'NEIN'}
            </Text>
          </View>
          <View style={styles.rechtlicheRow}>
            <Text style={styles.rechtlicheLabel}>Nachbarrevier informieren:</Text>
            <Text style={styles.rechtlicheValue}>
              {empfehlung.rechtlichePflicht.nachbarrevier ? 'JA (falls überwechselt)' : 'NEIN'}
            </Text>
          </View>
        </View>
      </View>

      {/* PROGNOSE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Prognose</Text>

        <View style={styles.prognoseCard}>
          <View style={styles.prognoseRow}>
            <Text style={styles.prognoseLabel}>Bergung-Wahrscheinlichkeit:</Text>
            <Text
              style={[
                styles.prognoseValue,
                {
                  color:
                    empfehlung.prognose.bergungWahrscheinlichkeit >= 70
                      ? '#27ae60'
                      : empfehlung.prognose.bergungWahrscheinlichkeit >= 50
                      ? '#f39c12'
                      : '#e74c3c',
                },
              ]}
            >
              {Math.round(empfehlung.prognose.bergungWahrscheinlichkeit)}%
            </Text>
          </View>
          <View style={styles.prognoseRow}>
            <Text style={styles.prognoseLabel}>Erwartete Zeit bis Auffinden:</Text>
            <Text style={styles.prognoseValue}>
              ~{empfehlung.prognose.zeitbisAuffinden} Stunden
            </Text>
          </View>
          <View style={styles.prognoseRow}>
            <Text style={styles.prognoseLabel}>Erwarteter Zustand:</Text>
            <Text style={styles.prognoseValue}>{empfehlung.prognose.zustand}</Text>
          </View>
        </View>
      </View>

      {/* ACTION BUTTON */}
      <TouchableOpacity style={styles.startButton} onPress={handleStarteNachsuche}>
        <Text style={styles.startButtonText}>🔍 Nachsuche jetzt starten</Text>
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
  diagnoseCard: {
    backgroundColor: '#ecf0f1',
    padding: 16,
    borderRadius: 8,
  },
  diagnoseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  diagnoseName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  diagnoseBeschreibung: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
    lineHeight: 20,
  },
  begründungBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  begründungTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
  },
  begründungText: {
    fontSize: 13,
    color: '#2c3e50',
    marginBottom: 4,
    lineHeight: 18,
  },
  alternativeBox: {
    marginTop: 16,
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 8,
  },
  alternativeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  alternativeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  alternativeName: {
    fontSize: 14,
    color: '#2c3e50',
  },
  alternativePercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#95a5a6',
  },
  wartezeitCard: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
  },
  wartezeitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffeaa7',
  },
  wartezeitLabel: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '500',
  },
  wartezeitValue: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '600',
  },
  wartezeitOptimal: {
    fontSize: 16,
    color: '#d68910',
    fontWeight: '700',
  },
  wartezeitBegründung: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  wartezeitBegründungText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
  hundeCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#f39c12',
  },
  hundeHeader: {
    marginBottom: 12,
  },
  hundeStatus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 4,
  },
  hundeTyp: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#7f8c8d',
  },
  hundeBegründung: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 8,
  },
  hundeDringlichkeit: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e67e22',
  },
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  map: {
    flex: 1,
  },
  zonenLegende: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  legendeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
  },
  legendeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendeColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendeText: {
    fontSize: 12,
    color: '#2c3e50',
    flex: 1,
  },
  legendeHinweis: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#7f8c8d',
    marginTop: 8,
  },
  ausdehnungBox: {
    backgroundColor: '#d1ecf1',
    padding: 12,
    borderRadius: 8,
  },
  ausdehnungTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0c5460',
    marginBottom: 8,
  },
  ausdehnungText: {
    fontSize: 13,
    color: '#0c5460',
    marginBottom: 4,
  },
  strategieCard: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 8,
  },
  strategieTyp: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 8,
  },
  strategieBeschreibung: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 12,
  },
  schritteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b5e20',
    marginBottom: 8,
  },
  schrittText: {
    fontSize: 13,
    color: '#2c3e50',
    marginBottom: 4,
    lineHeight: 18,
  },
  rechtlicheBox: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 8,
  },
  rechtlicheRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffe0b2',
  },
  rechtlicheLabel: {
    fontSize: 14,
    color: '#e65100',
    fontWeight: '500',
    flex: 1,
  },
  rechtlicheValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  prognoseCard: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
  },
  prognoseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#bbdefb',
  },
  prognoseLabel: {
    fontSize: 14,
    color: '#01579b',
    fontWeight: '500',
    flex: 1,
  },
  prognoseValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  startButton: {
    backgroundColor: '#27ae60',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
