/**
 * Wildkamera KI Insights Screen
 * 
 * Phase 7A: KI-Analytics & Dashboards
 * - Zeitraum-Filter (7/30/90 Tage)
 * - Wildart-Verteilung (Balkendiagramm)
 * - Aktivitätsmuster (Heatmap 0-24h)
 * - Hotspots (Top 5 Kameras)
 * - Trophäen-Kandidaten (Galerie)
 * - Accuracy Metrics
 * - PDF/CSV Export
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import WildlifeDetectionService from '../services/wildlifeDetectionService';
import type { KIInsights } from '../types/ki-detection';
import { colors, spacing, typography } from '../theme';

// ============================================================================
// TYPES
// ============================================================================

type NavigationProp = NativeStackNavigationProp<any>;
type Zeitraum = '7' | '30' | '90';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// COMPONENT
// ============================================================================

export default function WildkameraKIInsightsScreen() {
  
  const navigation = useNavigation<NavigationProp>();
  
  const [zeitraum, setZeitraum] = useState<Zeitraum>('30');
  
  // ==========================================================================
  // DATA FETCHING
  // ==========================================================================
  
  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ['ki-insights', zeitraum],
    queryFn: async () => {
      // TODO: Use actual revierId
      return await WildlifeDetectionService.getKIInsights('revier-1', zeitraum);
    },
  });
  
  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  
  const handleExportPDF = () => {
    Alert.alert('📄 PDF Export', 'PDF-Export wird vorbereitet...');
    // TODO: Implement PDF export
  };
  
  const handleExportCSV = () => {
    Alert.alert('📊 CSV Export', 'CSV-Export wird vorbereitet...');
    // TODO: Implement CSV export
  };
  
  const handleViewTrophäe = (trophäeId: string) => {
    navigation.navigate('WildkameraDetectionReview', {
      detectionId: trophäeId,
    });
  };
  
  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================
  
  const renderWildartChart = () => {
    if (!insights?.wildartVerteilung) return null;
    
    const maxCount = Math.max(...insights.wildartVerteilung.map((w) => w.anzahl));
    
    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>🦌 Wildart-Verteilung</Text>
        <View style={styles.chart}>
          {insights.wildartVerteilung.slice(0, 10).map((item) => {
            const percentage = (item.anzahl / maxCount) * 100;
            
            return (
              <View key={item.wildart} style={styles.chartRow}>
                {/* Label */}
                <Text style={styles.chartLabel}>{item.wildart}</Text>
                
                {/* Bar */}
                <View style={styles.chartBarContainer}>
                  <View
                    style={[
                      styles.chartBar,
                      { width: `${percentage}%` },
                    ]}
                  />
                </View>
                
                {/* Value */}
                <Text style={styles.chartValue}>
                  {item.anzahl} ({Math.round(item.prozent)}%)
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };
  
  const renderAktivitätsmuster = () => {
    if (!insights?.aktivitätsmuster) return null;
    
    const { nacht, dämmerung, tag } = insights.aktivitätsmuster;
    const total = nacht + dämmerung + tag;
    
    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>🌙 Aktivitätsmuster</Text>
        
        {/* Heatmap */}
        <View style={styles.heatmap}>
          {/* Night */}
          <View style={[styles.heatmapBar, { flex: nacht / total }]}>
            <View style={[styles.heatmapFill, { backgroundColor: '#2C3E50' }]} />
          </View>
          
          {/* Dämmerung */}
          <View style={[styles.heatmapBar, { flex: dämmerung / total }]}>
            <View style={[styles.heatmapFill, { backgroundColor: '#E67E22' }]} />
          </View>
          
          {/* Tag */}
          <View style={[styles.heatmapBar, { flex: tag / total }]}>
            <View style={[styles.heatmapFill, { backgroundColor: '#F39C12' }]} />
          </View>
        </View>
        
        {/* Legend */}
        <View style={styles.heatmapLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#2C3E50' }]} />
            <Text style={styles.legendText}>
              Nacht ({Math.round((nacht / total) * 100)}%)
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#E67E22' }]} />
            <Text style={styles.legendText}>
              Dämmerung ({Math.round((dämmerung / total) * 100)}%)
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F39C12' }]} />
            <Text style={styles.legendText}>
              Tag ({Math.round((tag / total) * 100)}%)
            </Text>
          </View>
        </View>
      </View>
    );
  };
  
  const renderHotspots = () => {
    if (!insights?.hotspots) return null;
    
    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>📍 Top Kameras</Text>
        <View style={styles.hotspotsList}>
          {insights.hotspots.slice(0, 5).map((hotspot, index) => (
            <View key={hotspot.kameraId} style={styles.hotspotItem}>
              {/* Rank */}
              <View style={styles.hotspotRank}>
                <Text style={styles.hotspotRankText}>#{index + 1}</Text>
              </View>
              
              {/* Info */}
              <View style={styles.hotspotInfo}>
                <Text style={styles.hotspotName}>{hotspot.kameraName}</Text>
                <Text style={styles.hotspotStandort}>{hotspot.standort}</Text>
              </View>
              
              {/* Count */}
              <View style={styles.hotspotCount}>
                <Text style={styles.hotspotCountValue}>{hotspot.sichtungen}</Text>
                <Text style={styles.hotspotCountLabel}>Sichtungen</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  const renderTrophäenKandidaten = () => {
    if (!insights?.trophäenKandidaten || insights.trophäenKandidaten.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>⭐ Trophäen-Kandidaten</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trophäenGallery}
        >
          {insights.trophäenKandidaten.map((trophäe) => (
            <TouchableOpacity
              key={trophäe.detectionId}
              style={styles.trophäeCard}
              onPress={() => handleViewTrophäe(trophäe.detectionId)}
            >
              {/* Image */}
              {trophäe.thumbnail ? (
                <Image
                  source={{ uri: trophäe.thumbnail }}
                  style={styles.trophäeImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.trophäeImagePlaceholder}>
                  <Text style={styles.trophäeIcon}>🦌</Text>
                </View>
              )}
              
              {/* Info Overlay */}
              <View style={styles.trophäeInfo}>
                <Text style={styles.trophäeWildart}>{trophäe.wildart}</Text>
                {trophäe.geschätzteCIC && (
                  <Text style={styles.trophäeCIC}>
                    ~{Math.round(trophäe.geschätzteCIC)} CIC
                  </Text>
                )}
              </View>
              
              {/* Quality Badge */}
              {trophäe.qualität && (
                <View style={styles.trophäeBadge}>
                  <Text style={styles.trophäeBadgeText}>
                    {trophäe.qualität.toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  const renderAccuracyMetrics = () => {
    if (!insights?.accuracyMetrics) return null;
    
    const { gesamtAccuracy, korrektRate, feedbackCount } = insights.accuracyMetrics;
    
    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>🎯 KI-Genauigkeit</Text>
        
        <View style={styles.metricsGrid}>
          {/* Overall Accuracy */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="analytics-outline" size={32} color={colors.primary} />
              <Text style={styles.metricValue}>
                {Math.round(gesamtAccuracy * 100)}%
              </Text>
            </View>
            <Text style={styles.metricLabel}>Gesamt-Accuracy</Text>
          </View>
          
          {/* Correct Rate */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="checkmark-circle-outline" size={32} color={colors.success} />
              <Text style={styles.metricValue}>
                {Math.round(korrektRate * 100)}%
              </Text>
            </View>
            <Text style={styles.metricLabel}>Korrekt-Rate</Text>
          </View>
          
          {/* Feedback Count */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="chatbubbles-outline" size={32} color={colors.warning} />
              <Text style={styles.metricValue}>{feedbackCount}</Text>
            </View>
            <Text style={styles.metricLabel}>Feedback</Text>
          </View>
        </View>
      </View>
    );
  };
  
  // ==========================================================================
  // RENDER
  // ==========================================================================
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Lade Insights...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>KI-Insights</Text>
        <TouchableOpacity onPress={handleExportPDF}>
          <Ionicons name="download-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Zeitraum Selector */}
      <View style={styles.timeframeSelector}>
        {(['7', '30', '90'] as Zeitraum[]).map((z) => (
          <TouchableOpacity
            key={z}
            style={[
              styles.timeframeButton,
              zeitraum === z && styles.timeframeButtonActive,
            ]}
            onPress={() => setZeitraum(z)}
          >
            <Text
              style={[
                styles.timeframeButtonText,
                zeitraum === z && styles.timeframeButtonTextActive,
              ]}
            >
              {z} Tage
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Wildart Chart */}
        {renderWildartChart()}
        
        {/* Aktivitätsmuster */}
        {renderAktivitätsmuster()}
        
        {/* Hotspots */}
        {renderHotspots()}
        
        {/* Trophäen */}
        {renderTrophäenKandidaten()}
        
        {/* Accuracy */}
        {renderAccuracyMetrics()}
        
        {/* Export Actions */}
        <View style={styles.exportActions}>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportPDF}
          >
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            <Text style={styles.exportButtonText}>PDF Export</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportCSV}
          >
            <Ionicons name="grid-outline" size={20} color={colors.success} />
            <Text style={styles.exportButtonText}>CSV Export</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: colors.background,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  
  // Timeframe Selector
  timeframeSelector: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  
  timeframeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  
  timeframeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  timeframeButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  
  timeframeButtonTextActive: {
    color: '#FFFFFF',
  },
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  
  // Chart Card
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  
  chartTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  
  // Wildart Chart
  chart: {
    gap: spacing.sm,
  },
  
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  chartLabel: {
    width: 100,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  
  chartBarContainer: {
    flex: 1,
    height: 24,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  chartBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  
  chartValue: {
    width: 80,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
    textAlign: 'right',
  },
  
  // Heatmap
  heatmap: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  
  heatmapBar: {
    height: '100%',
  },
  
  heatmapFill: {
    width: '100%',
    height: '100%',
  },
  
  heatmapLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  
  legendText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  
  // Hotspots
  hotspotsList: {
    gap: spacing.sm,
  },
  
  hotspotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  
  hotspotRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  
  hotspotRankText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  
  hotspotInfo: {
    flex: 1,
  },
  
  hotspotName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  
  hotspotStandort: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  
  hotspotCount: {
    alignItems: 'flex-end',
  },
  
  hotspotCountValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  
  hotspotCountLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  
  // Trophäen
  trophäenGallery: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  
  trophäeCard: {
    width: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.background,
    position: 'relative',
  },
  
  trophäeImage: {
    width: '100%',
    height: 180,
  },
  
  trophäeImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  trophäeIcon: {
    fontSize: 64,
  },
  
  trophäeInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  
  trophäeWildart: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  
  trophäeCIC: {
    fontSize: typography.sizes.xs,
    color: '#FFFFFF',
    marginTop: 2,
  },
  
  trophäeBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  
  trophäeBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  
  // Metrics
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  metricCard: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  metricHeader: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  
  metricValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  
  metricLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Export Actions
  exportActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  exportButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
});
