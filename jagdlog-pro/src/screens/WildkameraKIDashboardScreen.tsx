/**
 * Wildkamera KI-Dashboard Screen
 * 
 * Phase 7A: KI-Detection Overview
 * - Statistiken (Heute, Woche, Monat)
 * - Verarbeitungs-Queue Status
 * - Letzte Detections
 * - Quick Actions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import WildlifeDetectionService from '../services/wildlifeDetectionService';
import type { KIDetectionResult } from '../types/ki-detection';
import { colors, spacing, typography } from '../theme';

// ============================================================================
// TYPES
// ============================================================================

type NavigationProp = NativeStackNavigationProp<any>;

interface DashboardStats {
  today: {
    fotosVerarbeitet: number;
    fotosInQueue: number;
    totalDetections: number;
    accuracy: number;
  };
  week: {
    fotosVerarbeitet: number;
    totalDetections: number;
    topWildart: string;
    trophäen: number;
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function WildkameraKIDashboardScreen() {
  
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');
  
  // ==========================================================================
  // DATA FETCHING
  // ==========================================================================
  
  // Dashboard Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['ki-dashboard-stats', timeframe],
    queryFn: async () => {
      // TODO: Implement actual API call
      return {
        today: {
          fotosVerarbeitet: 847,
          fotosInQueue: 23,
          totalDetections: 1249,
          accuracy: 94.2,
        },
        week: {
          fotosVerarbeitet: 3421,
          totalDetections: 5893,
          topWildart: 'Rehwild',
          trophäen: 12,
        },
      } as DashboardStats;
    },
    refetchInterval: 10000, // Refresh every 10s
  });
  
  // Queue Status
  const { data: queueStatus } = useQuery({
    queryKey: ['ki-queue-status'],
    queryFn: () => WildlifeDetectionService.getQueueStatus(),
    refetchInterval: 3000, // Refresh every 3s
  });
  
  // Latest Detections
  const { data: latestDetections, isLoading: detectionsLoading } = useQuery({
    queryKey: ['ki-latest-detections'],
    queryFn: async () => {
      // TODO: Implement actual API call
      return [
        {
          id: '1',
          wildart: 'Rehwild',
          anzahl: 3,
          confidence: 92,
          standort: 'Hochsitz Nord',
          zeitpunkt: new Date(Date.now() - 15 * 60 * 1000),
          thumbnail: null,
        },
        {
          id: '2',
          wildart: 'Schwarzwild',
          anzahl: 1,
          confidence: 87,
          standort: 'Kirrung Süd',
          zeitpunkt: new Date(Date.now() - 83 * 60 * 1000),
          thumbnail: null,
        },
        {
          id: '3',
          wildart: 'Fuchs',
          anzahl: 1,
          confidence: 78,
          standort: 'Wildacker West',
          zeitpunkt: new Date(Date.now() - 165 * 60 * 1000),
          thumbnail: null,
        },
      ];
    },
    refetchInterval: 5000, // Refresh every 5s
  });
  
  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['ki-dashboard-stats'] });
    await queryClient.invalidateQueries({ queryKey: ['ki-latest-detections'] });
    setRefreshing(false);
  };
  
  const handleViewAllDetections = () => {
    navigation.navigate('WildkameraDetectionList');
  };
  
  const handleStartBatchProcessing = () => {
    navigation.navigate('WildkameraBatchProcessing');
  };
  
  const handleViewDetection = (detectionId: string) => {
    navigation.navigate('WildkameraDetectionReview', { detectionId });
  };
  
  const handleSettings = () => {
    navigation.navigate('WildkameraKISettings');
  };
  
  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================
  
  const renderStatCard = (
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    value: string | number,
    subtitle?: string,
    color: string = colors.primary
  ) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={32} color={color} />
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
  
  const renderQueueStatus = () => {
    if (!queueStatus) return null;
    
    const { queueLength, isProcessing } = queueStatus;
    
    if (queueLength === 0 && !isProcessing) {
      return (
        <View style={styles.queueStatusCard}>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          <Text style={styles.queueStatusText}>
            Alle Fotos verarbeitet
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.queueStatusCard}>
        <ActivityIndicator size="small" color={colors.primary} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.queueStatusTitle}>
            {queueLength} Fotos in Warteschlange
          </Text>
          {isProcessing && (
            <Text style={styles.queueStatusSubtitle}>
              Verarbeitung läuft...
            </Text>
          )}
        </View>
      </View>
    );
  };
  
  const renderDetectionItem = (detection: any) => {
    const timeAgo = getTimeAgo(detection.zeitpunkt);
    const wildartIcon = getWildartIcon(detection.wildart);
    
    return (
      <TouchableOpacity
        key={detection.id}
        style={styles.detectionItem}
        onPress={() => handleViewDetection(detection.id)}
      >
        {/* Thumbnail or Icon */}
        <View style={styles.detectionThumbnail}>
          {detection.thumbnail ? (
            <Image source={{ uri: detection.thumbnail }} style={styles.thumbnailImage} />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Text style={styles.wildartIcon}>{wildartIcon}</Text>
            </View>
          )}
        </View>
        
        {/* Info */}
        <View style={styles.detectionInfo}>
          <View style={styles.detectionHeader}>
            <Text style={styles.detectionWildart}>
              {detection.anzahl}× {detection.wildart}
            </Text>
            <Text style={styles.detectionConfidence}>
              {detection.confidence}%
            </Text>
          </View>
          
          <View style={styles.detectionDetails}>
            <View style={styles.detectionDetailRow}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.detectionDetailText}>{detection.standort}</Text>
            </View>
            <View style={styles.detectionDetailRow}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.detectionDetailText}>{timeAgo}</Text>
            </View>
          </View>
        </View>
        
        {/* Arrow */}
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };
  
  // ==========================================================================
  // RENDER
  // ==========================================================================
  
  if (statsLoading || detectionsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Lade Dashboard...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Wildkamera KI</Text>
          <Text style={styles.headerSubtitle}>Dashboard</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettings}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Timeframe Selector */}
        <View style={styles.timeframeSelector}>
          {(['today', 'week', 'month'] as const).map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[
                styles.timeframeButton,
                timeframe === tf && styles.timeframeButtonActive,
              ]}
              onPress={() => setTimeframe(tf)}
            >
              <Text
                style={[
                  styles.timeframeButtonText,
                  timeframe === tf && styles.timeframeButtonTextActive,
                ]}
              >
                {tf === 'today' ? 'Heute' : tf === 'week' ? '7 Tage' : '30 Tage'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          {renderStatCard(
            'images-outline',
            'Fotos',
            stats?.today.fotosVerarbeitet || 0,
            'verarbeitet',
            colors.primary
          )}
          {renderStatCard(
            'eye-outline',
            'Detections',
            stats?.today.totalDetections || 0,
            'erkannt',
            colors.success
          )}
          {renderStatCard(
            'speedometer-outline',
            'Accuracy',
            `${stats?.today.accuracy || 0}%`,
            'Genauigkeit',
            colors.warning
          )}
        </View>
        
        {/* Queue Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 Verarbeitung</Text>
          {renderQueueStatus()}
          
          {stats && stats.today.fotosVerarbeitet > 0 && (
            <View style={styles.processedInfo}>
              <Text style={styles.processedInfoText}>
                ✅ {stats.today.fotosVerarbeitet} Fotos heute verarbeitet
              </Text>
              {stats.today.fotosInQueue > 0 && (
                <Text style={styles.processedInfoSubtext}>
                  ⏳ {stats.today.fotosInQueue} in Warteschlange
                </Text>
              )}
            </View>
          )}
        </View>
        
        {/* Latest Detections */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📷 Letzte Detections</Text>
            <TouchableOpacity onPress={handleViewAllDetections}>
              <Text style={styles.sectionLink}>Alle anzeigen</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.detectionsList}>
            {latestDetections && latestDetections.length > 0 ? (
              latestDetections.map(renderDetectionItem)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>
                  Keine Detections vorhanden
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Starte eine Verarbeitung, um Wild zu erkennen
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Aktionen</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStartBatchProcessing}
          >
            <View style={styles.actionButtonIcon}>
              <Ionicons name="layers-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>
                Batch-Verarbeitung starten
              </Text>
              <Text style={styles.actionButtonSubtitle}>
                Mehrere Fotos auf einmal analysieren
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleViewAllDetections}
          >
            <View style={styles.actionButtonIcon}>
              <Ionicons name="list-outline" size={24} color={colors.success} />
            </View>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>
                Alle Detections anzeigen
              </Text>
              <Text style={styles.actionButtonSubtitle}>
                Vollständige Liste mit Filtern
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Gerade eben';
  if (diffMins < 60) return `Vor ${diffMins} Min`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Vor ${diffHours}h ${diffMins % 60}m`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `Vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
}

function getWildartIcon(wildart: string): string {
  const icons: Record<string, string> = {
    'Rehwild': '🦌',
    'Rotwild': '🦌',
    'Damwild': '🦌',
    'Schwarzwild': '🐗',
    'Fuchs': '🦊',
    'Dachs': '🦡',
    'Waschbär': '🦝',
    'Wolf': '🐺',
    'Luchs': '🐆',
  };
  
  return icons[wildart] || '🐾';
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
  
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  
  settingsButton: {
    padding: spacing.sm,
  },
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  
  // Timeframe Selector
  timeframeSelector: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  
  timeframeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.surface,
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
  
  // Stats Grid
  statsGrid: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    gap: spacing.md,
  },
  
  statContent: {
    flex: 1,
  },
  
  statValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  
  statTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginTop: 2,
  },
  
  statSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  
  // Section
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  
  sectionLink: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  
  // Queue Status
  queueStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  queueStatusText: {
    marginLeft: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.success,
    fontWeight: typography.weights.medium,
  },
  
  queueStatusTitle: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  
  queueStatusSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  
  processedInfo: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.successLight,
    borderRadius: 8,
  },
  
  processedInfoText: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    fontWeight: typography.weights.medium,
  },
  
  processedInfoSubtext: {
    fontSize: typography.sizes.xs,
    color: colors.success,
    marginTop: 4,
  },
  
  // Detections List
  detectionsList: {
    gap: spacing.sm,
  },
  
  detectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  detectionThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  wildartIcon: {
    fontSize: 32,
  },
  
  detectionInfo: {
    flex: 1,
  },
  
  detectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  
  detectionWildart: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  
  detectionConfidence: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.success,
  },
  
  detectionDetails: {
    gap: 4,
  },
  
  detectionDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  detectionDetailText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl * 2,
  },
  
  emptyStateText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  
  emptyStateSubtext: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Action Buttons
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  
  actionButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  
  actionButtonContent: {
    flex: 1,
  },
  
  actionButtonTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  
  actionButtonSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
