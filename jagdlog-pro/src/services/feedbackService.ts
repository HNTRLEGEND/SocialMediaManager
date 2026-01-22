/**
 * PHASE 5: AI Feedback & Analytics Service
 * Sammelt User-Feedback und verbessert Recommendations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecommendationFeedback, RecommendationAnalytics } from '../types/ai';

const FEEDBACK_STORAGE_KEY = 'ai_recommendation_feedback';
const ANALYTICS_STORAGE_KEY = 'ai_recommendation_analytics';

// ===========================
// FEEDBACK STORAGE
// ===========================

/**
 * Speichert User-Feedback zu einer Empfehlung
 */
export async function saveRecommendationFeedback(
  feedback: Omit<RecommendationFeedback, 'id' | 'timestamp'>
): Promise<void> {
  try {
    const feedbackEntry: RecommendationFeedback = {
      ...feedback,
      id: generateFeedbackId(),
      timestamp: new Date(),
    };

    // Lade bestehende Feedbacks
    const existing = await loadAllFeedback();
    existing.push(feedbackEntry);

    // Speichere aktualisierte Liste
    await AsyncStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(existing));

    // Update Analytics
    await updateAnalytics(feedbackEntry);

    console.log('Feedback gespeichert:', feedbackEntry.id);
  } catch (error) {
    console.error('Fehler beim Speichern des Feedbacks:', error);
    throw error;
  }
}

/**
 * Lädt alle gespeicherten Feedbacks
 */
export async function loadAllFeedback(): Promise<RecommendationFeedback[]> {
  try {
    const data = await AsyncStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!data) return [];

    const feedbacks = JSON.parse(data, (key, value) => {
      if (key === 'timestamp') return new Date(value);
      return value;
    });

    return feedbacks;
  } catch (error) {
    console.error('Fehler beim Laden der Feedbacks:', error);
    return [];
  }
}

/**
 * Lädt Feedback für eine spezifische Recommendation
 */
export async function getFeedbackForRecommendation(
  recommendationId: string
): Promise<RecommendationFeedback[]> {
  const allFeedback = await loadAllFeedback();
  return allFeedback.filter((f) => f.recommendationId === recommendationId);
}

/**
 * Lädt Feedback für ein Revier
 */
export async function getFeedbackForRevier(
  revierId: string
): Promise<RecommendationFeedback[]> {
  const allFeedback = await loadAllFeedback();
  return allFeedback.filter((f) => f.revierId === revierId);
}

// ===========================
// ANALYTICS
// ===========================

/**
 * Update Analytics mit neuem Feedback
 */
async function updateAnalytics(feedback: RecommendationFeedback): Promise<void> {
  try {
    let analytics = await loadAnalytics();

    // Gesamt-Stats
    analytics.totalRecommendations++;
    if (feedback.umgesetzt) {
      analytics.totalFeedback++;
      if (feedback.erfolgreich) {
        analytics.successfulRecommendations++;
      }
    }

    // Success Rate
    analytics.successRate =
      analytics.totalFeedback > 0
        ? (analytics.successfulRecommendations / analytics.totalFeedback) * 100
        : 0;

    // Average Rating
    if (feedback.rating) {
      const totalRating = analytics.averageRating * (analytics.totalFeedback - 1);
      analytics.averageRating = (totalRating + feedback.rating) / analytics.totalFeedback;
    }

    // Per Type
    const typ = feedback.recommendationType;
    if (!analytics.perType[typ]) {
      analytics.perType[typ] = {
        total: 0,
        umgesetzt: 0,
        erfolgreich: 0,
        successRate: 0,
      };
    }

    analytics.perType[typ].total++;
    if (feedback.umgesetzt) {
      analytics.perType[typ].umgesetzt++;
      if (feedback.erfolgreich) {
        analytics.perType[typ].erfolgreich++;
      }
    }
    analytics.perType[typ].successRate =
      analytics.perType[typ].umgesetzt > 0
        ? (analytics.perType[typ].erfolgreich / analytics.perType[typ].umgesetzt) * 100
        : 0;

    // Speichern
    await saveAnalytics(analytics);
  } catch (error) {
    console.error('Fehler beim Update der Analytics:', error);
  }
}

/**
 * Lädt Analytics
 */
export async function loadAnalytics(): Promise<RecommendationAnalytics> {
  try {
    const data = await AsyncStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!data) {
      return createEmptyAnalytics();
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('Fehler beim Laden der Analytics:', error);
    return createEmptyAnalytics();
  }
}

/**
 * Speichert Analytics
 */
async function saveAnalytics(analytics: RecommendationAnalytics): Promise<void> {
  await AsyncStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analytics));
}

/**
 * Erstellt leeres Analytics-Objekt
 */
function createEmptyAnalytics(): RecommendationAnalytics {
  return {
    totalRecommendations: 0,
    totalFeedback: 0,
    successfulRecommendations: 0,
    successRate: 0,
    averageRating: 0,
    perType: {
      best_spot: { total: 0, umgesetzt: 0, erfolgreich: 0, successRate: 0 },
      best_time: { total: 0, umgesetzt: 0, erfolgreich: 0, successRate: 0 },
      wildlife_prediction: { total: 0, umgesetzt: 0, erfolgreich: 0, successRate: 0 },
      weather_opportunity: { total: 0, umgesetzt: 0, erfolgreich: 0, successRate: 0 },
    },
  };
}

// ===========================
// RECOMMENDATION IMPROVEMENT
// ===========================

/**
 * Berechnet Gewichtungs-Anpassungen basierend auf Feedback
 */
export async function calculateWeightAdjustments(
  revierId: string
): Promise<Record<string, number>> {
  const feedbacks = await getFeedbackForRevier(revierId);

  if (feedbacks.length < 10) {
    // Zu wenig Daten für Anpassungen
    return {};
  }

  // Analysiere welche Faktoren bei erfolgreichen Recommendations wichtig waren
  const adjustments: Record<string, number> = {
    historischerErfolg: 0,
    aktuelleWetterbedingungen: 0,
    tageszeit: 0,
    wildartAffinitaet: 0,
    mondphase: 0,
    saisonaleEignung: 0,
    letzterErfolg: 0,
  };

  // Erfolgreiche vs. nicht erfolgreiche Recommendations vergleichen
  const successful = feedbacks.filter((f) => f.erfolgreich);
  const unsuccessful = feedbacks.filter((f) => f.umgesetzt && !f.erfolgreich);

  // TODO: Implementiere Feature-Analyse
  // Für jetzt: Keine Anpassungen
  console.log(`Analyzing ${feedbacks.length} feedbacks for weight adjustments`);

  return adjustments;
}

/**
 * Gibt Best Practices basierend auf Feedback zurück
 */
export async function getBestPractices(
  revierId: string
): Promise<{
  bestTime: string;
  bestWeather: string;
  bestSpots: Array<{ latitude: number; longitude: number; successRate: number }>;
}> {
  const feedbacks = await getFeedbackForRevier(revierId);

  const successfulFeedbacks = feedbacks.filter((f) => f.erfolgreich);

  // Analysiere Muster
  const timePattern: Record<string, number> = {};
  const weatherPattern: Record<string, number> = {};

  successfulFeedbacks.forEach((f) => {
    // TODO: Extrahiere Zeit und Wetter aus tatsaechlichesErgebnis
  });

  return {
    bestTime: 'Morgengrauen', // Placeholder
    bestWeather: 'Leichter Wind, bedeckt', // Placeholder
    bestSpots: [],
  };
}

// ===========================
// ANALYTICS EXPORT
// ===========================

/**
 * Exportiert Analytics als JSON
 */
export async function exportAnalytics(): Promise<string> {
  const analytics = await loadAnalytics();
  const feedbacks = await loadAllFeedback();

  const exportData = {
    analytics,
    feedbacks,
    exportDate: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Löscht alle Feedbacks (für Testing)
 */
export async function clearAllFeedback(): Promise<void> {
  await AsyncStorage.removeItem(FEEDBACK_STORAGE_KEY);
  await AsyncStorage.removeItem(ANALYTICS_STORAGE_KEY);
  console.log('All feedback cleared');
}

// ===========================
// HELPER FUNCTIONS
// ===========================

function generateFeedbackId(): string {
  return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Berechnet Confidence Score basierend auf bisherigem Feedback
 */
export function calculateConfidenceFromFeedback(
  recommendationType: string,
  analytics: RecommendationAnalytics
): number {
  const typeStats = analytics.perType[recommendationType];

  if (!typeStats || typeStats.umgesetzt < 5) {
    return 50; // Default bei zu wenig Daten
  }

  // Confidence steigt mit Erfolgsrate und Anzahl
  const baseConfidence = typeStats.successRate;
  const dataBonus = Math.min(20, typeStats.umgesetzt * 2); // Max +20%

  return Math.min(100, baseConfidence + dataBonus);
}
