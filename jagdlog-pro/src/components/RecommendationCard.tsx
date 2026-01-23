/**
 * PHASE 5: AI Recommendation Card Component
 * Zeigt eine einzelne Jagd-Empfehlung
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Recommendation } from '../types/ai';

const { width } = Dimensions.get('window');

interface RecommendationCardProps {
  recommendation: Recommendation;
  onPress: () => void;
  onFeedback?: (feedback: 'helpful' | 'not_helpful') => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onPress,
  onFeedback,
}) => {
  const getPriorityColor = () => {
    switch (recommendation.prioritaet) {
      case 'sehr_hoch':
        return '#FF6B6B';
      case 'hoch':
        return '#FFA500';
      case 'mittel':
        return '#4ECDC4';
      case 'niedrig':
        return '#95E1D3';
      default:
        return '#CCCCCC';
    }
  };

  const getTypeIcon = () => {
    switch (recommendation.typ) {
      case 'best_spot':
        return '📍';
      case 'best_time':
        return '⏰';
      case 'wildlife_prediction':
        return '🦌';
      case 'weather_opportunity':
        return '🌤️';
      default:
        return '💡';
    }
  };

  const formatScore = (score: number) => {
    return Math.round(score);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeIcon}>{getTypeIcon()}</Text>
          <View>
            <Text style={styles.title}>{recommendation.titel}</Text>
            <Text style={styles.subtitle}>
              Erfolgswahrscheinlichkeit: {formatScore(recommendation.erfolgswahrscheinlichkeit)}%
            </Text>
          </View>
        </View>

        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
          <Text style={styles.priorityText}>{formatScore(recommendation.score)}</Text>
        </View>
      </View>

      {/* Beschreibung */}
      <Text style={styles.description}>{recommendation.beschreibung}</Text>

      {/* Gründe */}
      {recommendation.gruende && recommendation.gruende.length > 0 && (
        <View style={styles.reasonsContainer}>
          {recommendation.gruende.slice(0, 3).map((grund, index) => (
            <View key={index} style={styles.reasonItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.reasonText}>{grund}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Confidence */}
      <View style={styles.confidenceContainer}>
        <Text style={styles.confidenceLabel}>Vertrauenswürdigkeit:</Text>
        <View style={styles.confidenceBar}>
          <View
            style={[
              styles.confidenceFill,
              { width: `${recommendation.confidence}%` },
            ]}
          />
        </View>
        <Text style={styles.confidenceValue}>{formatScore(recommendation.confidence)}%</Text>
      </View>

      {/* Meta Info */}
      <View style={styles.metaContainer}>
        <Text style={styles.metaText}>
          Basiert auf {recommendation.basiertAuf.historischeEvents} vergangenen Jagden
        </Text>
        {recommendation.wildart && (
          <Text style={styles.wildartBadge}>{recommendation.wildart}</Text>
        )}
      </View>

      {/* Feedback (optional) */}
      {onFeedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackLabel}>War diese Empfehlung hilfreich?</Text>
          <View style={styles.feedbackButtons}>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => onFeedback('helpful')}
            >
              <Text style={styles.feedbackButtonText}>👍 Ja</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => onFeedback('not_helpful')}
            >
              <Text style={styles.feedbackButtonText}>👎 Nein</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: width - 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  typeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  priorityBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 15,
    color: '#34495E',
    lineHeight: 22,
    marginBottom: 12,
  },
  reasonsContainer: {
    marginBottom: 12,
  },
  reasonItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    color: '#3498DB',
    marginRight: 8,
    fontWeight: '700',
  },
  reasonText: {
    fontSize: 14,
    color: '#34495E',
    flex: 1,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  confidenceLabel: {
    fontSize: 13,
    color: '#7F8C8D',
    marginRight: 8,
    width: 120,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#3498DB',
  },
  confidenceValue: {
    fontSize: 13,
    color: '#7F8C8D',
    marginLeft: 8,
    width: 40,
    textAlign: 'right',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  metaText: {
    fontSize: 12,
    color: '#95A5A6',
    flex: 1,
  },
  wildartBadge: {
    backgroundColor: '#27AE60',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  feedbackContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  feedbackLabel: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButton: {
    flex: 1,
    backgroundColor: '#ECF0F1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  feedbackButtonText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
});
