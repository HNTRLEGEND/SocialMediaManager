/**
 * PHASE 5: AI Recommendation Integration for MapScreen
 * Diese Datei zeigt die Integration der AI-Funktionen in MapScreen.tsx
 * 
 * WICHTIG: Diese Imports und State müssen in MapScreen.tsx hinzugefügt werden
 */

// ===========================
// 1. NEUE IMPORTS HINZUFÜGEN
// ===========================

import { useQuery } from '@tanstack/react-query';
import { Recommendation, HeatmapPoint } from '../types/ai';
import { generateRecommendations, generateHeatmap } from '../services/recommendationEngine';
import { RecommendationPanel } from '../components/RecommendationPanel';
import { HeatmapOverlay } from '../components/HeatmapOverlay';

// ===========================
// 2. STATE HINZUFÜGEN (in MapScreen Component)
// ===========================

// AI Recommendations State
const [showRecommendations, setShowRecommendations] = useState(true);
const [selectedWildart, setSelectedWildart] = useState<string | undefined>(undefined);

// AI Recommendations Query
const { data: recommendations = [], isLoading: recommendationsLoading } = useQuery({
  queryKey: ['recommendations', aktivesRevier?.id, selectedWildart],
  queryFn: () =>
    aktivesRevier
      ? generateRecommendations(aktivesRevier.id, selectedWildart)
      : Promise.resolve([]),
  refetchInterval: 300000, // 5 Min
  enabled: aktivesRevier !== null && showRecommendations,
});

// Heatmap Query
const { data: heatmapData = [], isLoading: heatmapLoading } = useQuery({
  queryKey: ['heatmap', aktivesRevier?.id, selectedWildart],
  queryFn: () =>
    aktivesRevier
      ? generateHeatmap(aktivesRevier.id, selectedWildart)
      : Promise.resolve([]),
  refetchInterval: 600000, // 10 Min
  enabled: aktivesRevier !== null && isLayerActive('heatmap'),
});

// ===========================
// 3. LAYER HINZUFÜGEN
// ===========================

// In der layers State-Initialisierung hinzufügen:
const [layers, setLayers] = useState<MapLayer[]>([
  { id: 'abschuesse', name: 'Abschüsse', icon: '🎯', aktiv: true },
  { id: 'beobachtungen', name: 'Beobachtungen', icon: '👁️', aktiv: true },
  { id: 'pois', name: 'Einrichtungen', icon: '🏠', aktiv: true },
  { id: 'grenzen', name: 'Reviergrenzen', icon: '📍', aktiv: true },
  { id: 'zonen', name: 'Zonen', icon: '🟩', aktiv: false },
  { id: 'wetter', name: 'Wetter', icon: '🌤️', aktiv: true },
  { id: 'wind', name: 'Wind', icon: '💨', aktiv: true },
  { id: 'heatmap', name: 'Erfolgs-Heatmap', icon: '🔥', aktiv: true }, // NEU
  { id: 'ai_spots', name: 'AI Top-Spots', icon: '🎯', aktiv: true }, // NEU
]);

// ===========================
// 4. EVENT HANDLER
// ===========================

// Wenn User auf Empfehlung klickt → Karte zur Position bewegen
const handleRecommendationPress = useCallback((recommendation: Recommendation) => {
  if (recommendation.position && mapRef.current) {
    mapRef.current.animateToRegion({
      latitude: recommendation.position.latitude,
      longitude: recommendation.position.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 500);
  }
}, []);

// Feedback sammeln für ML-Verbesserung
const handleRecommendationFeedback = useCallback(
  async (recommendationId: string, feedback: 'helpful' | 'not_helpful') => {
    try {
      // TODO: Speichere Feedback in Datenbank
      console.log('Feedback:', recommendationId, feedback);
      
      // Implementierung später:
      // await saveRecommendationFeedback({
      //   recommendationId,
      //   revierId: aktivesRevier?.id,
      //   helpful: feedback === 'helpful',
      //   timestamp: new Date(),
      // });
    } catch (error) {
      console.error('Fehler beim Speichern des Feedbacks:', error);
    }
  },
  [aktivesRevier]
);

// ===========================
// 5. RENDER-KOMPONENTEN (in JSX einfügen)
// ===========================

// In MapView einfügen (nach WeatherOverlay):

{/* Heatmap Overlay */}
{heatmapData.length > 0 && isLayerActive('heatmap') && (
  <HeatmapOverlay
    heatmapData={heatmapData}
    visible={true}
    opacity={0.6}
    mapBounds={{
      north: region.latitude + region.latitudeDelta / 2,
      south: region.latitude - region.latitudeDelta / 2,
      east: region.longitude + region.longitudeDelta / 2,
      west: region.longitude - region.longitudeDelta / 2,
    }}
    mapWidth={Dimensions.get('window').width}
    mapHeight={Dimensions.get('window').height}
  />
)}

{/* AI Top-Spot Marker */}
{isLayerActive('ai_spots') &&
  recommendations
    .filter((r) => r.typ === 'best_spot' && r.position)
    .slice(0, 5)
    .map((rec) => (
      <Marker
        key={`ai-spot-${rec.id}`}
        coordinate={{
          latitude: rec.position!.latitude,
          longitude: rec.position!.longitude,
        }}
        anchor={{ x: 0.5, y: 0.5 }}
        onPress={() => handleRecommendationPress(rec)}
      >
        <View style={styles.aiSpotMarker}>
          <Text style={styles.aiSpotIcon}>🎯</Text>
          <View style={styles.aiSpotBadge}>
            <Text style={styles.aiSpotScore}>{Math.round(rec.score)}</Text>
          </View>
        </View>
        <Callout>
          <View style={styles.callout}>
            <Text style={styles.calloutTitle}>{rec.titel}</Text>
            <Text style={styles.calloutText}>{rec.beschreibung}</Text>
          </View>
        </Callout>
      </Marker>
    ))}

// Vor dem schließenden </View> Tag von MapScreen einfügen:

{/* AI Recommendation Panel */}
{recommendations.length > 0 && (
  <RecommendationPanel
    recommendations={recommendations}
    visible={showRecommendations}
    onRecommendationPress={handleRecommendationPress}
    onFeedback={handleRecommendationFeedback}
    onClose={() => setShowRecommendations(false)}
  />
)}

// ===========================
// 6. STYLES HINZUFÜGEN
// ===========================

const styles = StyleSheet.create({
  // ... existing styles ...

  // AI Marker Styles
  aiSpotMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSpotIcon: {
    fontSize: 32,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  aiSpotBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  aiSpotScore: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

// ===========================
// FERTIG! 🎉
// ===========================

/**
 * ZUSAMMENFASSUNG DER INTEGRATION:
 * 
 * 1. ✅ Imports hinzugefügt (AI-Types, Services, Components)
 * 2. ✅ State für Recommendations & Heatmap
 * 3. ✅ React Query Hooks für automatisches Refetching
 * 4. ✅ Layer für Heatmap & AI-Spots
 * 5. ✅ Event Handler für User-Interaktion
 * 6. ✅ Render-Komponenten (Heatmap, Marker, Panel)
 * 7. ✅ Styles für AI-Marker
 * 
 * FEATURES:
 * - 🎯 AI-powered Best Spot Recommendations
 * - 🔥 Success Heatmap Overlay
 * - ⏰ Best Time Recommendations
 * - 🦌 Wildlife Predictions
 * - 🌤️ Weather Opportunity Alerts
 * - 👍 User Feedback Loop
 * - 📊 Multi-factor Scoring (7 factors)
 * - 🔄 Auto-refresh every 5 minutes
 * 
 * API USAGE:
 * - generateRecommendations(revierId, wildart?) → Top 3 recommendations
 * - generateHeatmap(revierId, wildart?) → Hotspot visualization
 * 
 * NEXT STEPS:
 * 1. npm install (Abhängigkeiten installieren)
 * 2. Auf Gerät testen
 * 3. Feedback-Persistierung implementieren
 * 4. Model-Training mit echten Daten
 */
