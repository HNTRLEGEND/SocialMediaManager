/**
 * Wildkamera Batch Processing Screen
 * 
 * Phase 7A: KI-Detection Batch-Verarbeitung
 * - Kamera Multi-Select
 * - Zusammenfassung (Fotos, Zeit, Speicher)
 * - Einstellungen (Confidence, GPU, Trophäen)
 * - Progress mit Echtzeit-Updates
 * - Pause/Resume/Cancel
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import WildlifeDetectionService from '../services/wildlifeDetectionService';
import type { DetectionOptions, BatchProcessingStatus } from '../types/ki-detection';
import { colors, spacing, typography } from '../theme';

// ============================================================================
// TYPES
// ============================================================================

type NavigationProp = NativeStackNavigationProp<any>;

interface Wildkamera {
  id: string;
  name: string;
  standort: string;
  unverarbeiteteFotos: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function WildkameraBatchProcessingScreen() {
  
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  
  const [selectedKameras, setSelectedKameras] = useState<string[]>([]);
  const [minConfidence, setMinConfidence] = useState(0.7);
  const [useGPU, setUseGPU] = useState(true);
  const [analyzeTrophäen, setAnalyzeTrophäen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // ==========================================================================
  // DATA FETCHING
  // ==========================================================================
  
  // Wildkameras
  const { data: kameras, isLoading: kamerasLoading } = useQuery({
    queryKey: ['wildkameras'],
    queryFn: async () => {
      // TODO: Implement actual API call
      return [
        {
          id: 'wk-1',
          name: 'Hochsitz Nord',
          standort: 'Nord-Abteilung',
          unverarbeiteteFotos: 127,
        },
        {
          id: 'wk-2',
          name: 'Kirrung Süd',
          standort: 'Süd-Abteilung',
          unverarbeiteteFotos: 89,
        },
        {
          id: 'wk-3',
          name: 'Wildacker West',
          standort: 'West-Abteilung',
          unverarbeiteteFotos: 243,
        },
        {
          id: 'wk-4',
          name: 'Suhle Ost',
          standort: 'Ost-Abteilung',
          unverarbeiteteFotos: 64,
        },
      ] as Wildkamera[];
    },
  });
  
  // Batch Status (only when processing)
  const { data: batchStatus } = useQuery({
    queryKey: ['batch-status'],
    queryFn: () => WildlifeDetectionService.getQueueStatus(),
    enabled: isProcessing,
    refetchInterval: isProcessing ? 1000 : false, // Refresh every 1s when processing
  });
  
  // ==========================================================================
  // COMPUTED
  // ==========================================================================
  
  const totalFotos = kameras
    ?.filter((k) => selectedKameras.includes(k.id))
    .reduce((sum, k) => sum + k.unverarbeiteteFotos, 0) || 0;
  
  const estimatedTimeMinutes = Math.ceil(totalFotos * 0.3 / 60); // ~300ms per photo
  const estimatedMemoryMB = Math.ceil(totalFotos * 0.5); // ~0.5MB per photo
  
  const canStart = selectedKameras.length > 0 && !isProcessing;
  
  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  
  const handleToggleKamera = (kameraId: string) => {
    if (selectedKameras.includes(kameraId)) {
      setSelectedKameras(selectedKameras.filter((id) => id !== kameraId));
    } else {
      setSelectedKameras([...selectedKameras, kameraId]);
    }
  };
  
  const handleSelectAll = () => {
    if (!kameras) return;
    
    if (selectedKameras.length === kameras.length) {
      setSelectedKameras([]);
    } else {
      setSelectedKameras(kameras.map((k) => k.id));
    }
  };
  
  const handleStartProcessing = async () => {
    if (!kameras) return;
    
    const selectedKameraData = kameras.filter((k) => selectedKameras.includes(k.id));
    
    Alert.alert(
      '🚀 Batch-Verarbeitung starten',
      `${totalFotos} Fotos von ${selectedKameraData.length} Kamera(s) werden verarbeitet.\n\n` +
      `Geschätzte Zeit: ~${estimatedTimeMinutes} Min\n` +
      `Speicher: ~${estimatedMemoryMB} MB\n\n` +
      'Fortfahren?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Starten',
          onPress: async () => {
            setIsProcessing(true);
            setIsPaused(false);
            
            try {
              const options: DetectionOptions = {
                minConfidence,
                useGPU,
                analyzeTrophäen,
              };
              
              // TODO: Implement actual batch processing
              // const items = selectedKameraData.flatMap(k => k.photos);
              // await WildlifeDetectionService.batchDetect(
              //   items,
              //   'revier-1',
              //   'user-1',
              //   options,
              //   (progress) => {
              //     // Progress callback handled by React Query
              //   }
              // );
              
              // Simulate processing
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              setIsProcessing(false);
              Alert.alert('✅ Fertig!', `${totalFotos} Fotos wurden erfolgreich verarbeitet.`);
              navigation.goBack();
            } catch (error) {
              setIsProcessing(false);
              Alert.alert('❌ Fehler', 'Verarbeitung fehlgeschlagen.');
              console.error('Batch processing error:', error);
            }
          },
        },
      ]
    );
  };
  
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    // TODO: Implement pause/resume logic
  };
  
  const handleCancel = () => {
    Alert.alert(
      '⚠️ Abbrechen',
      'Möchtest du die Verarbeitung wirklich abbrechen?',
      [
        { text: 'Nein', style: 'cancel' },
        {
          text: 'Ja, abbrechen',
          style: 'destructive',
          onPress: () => {
            setIsProcessing(false);
            setIsPaused(false);
            // TODO: Cancel batch processing
          },
        },
      ]
    );
  };
  
  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================
  
  const renderKameraItem = (kamera: Wildkamera) => {
    const isSelected = selectedKameras.includes(kamera.id);
    
    return (
      <TouchableOpacity
        key={kamera.id}
        style={[styles.kameraItem, isSelected && styles.kameraItemSelected]}
        onPress={() => handleToggleKamera(kamera.id)}
        disabled={isProcessing}
      >
        {/* Checkbox */}
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={20} color="#FFFFFF" />}
        </View>
        
        {/* Info */}
        <View style={styles.kameraInfo}>
          <Text style={styles.kameraName}>{kamera.name}</Text>
          <Text style={styles.kameraStandort}>{kamera.standort}</Text>
        </View>
        
        {/* Fotos Badge */}
        <View style={styles.fotosBadge}>
          <Ionicons name="images-outline" size={16} color={colors.primary} />
          <Text style={styles.fotosBadgeText}>{kamera.unverarbeiteteFotos}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderProgress = () => {
    if (!isProcessing || !batchStatus) return null;
    
    // TODO: Get actual progress from batchStatus
    const progress = 0.35; // Mock: 35%
    const currentImage = 45; // Mock
    const currentWildart = 'Rehwild'; // Mock
    const timeRemaining = 5; // Mock: 5 minutes
    
    return (
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>
          {isPaused ? '⏸️ Pausiert' : '🔄 Verarbeitung läuft...'}
        </Text>
        
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
        
        {/* Stats */}
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <Text style={styles.progressStatValue}>{currentImage}</Text>
            <Text style={styles.progressStatLabel}>von {totalFotos} Fotos</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressStatValue}>{currentWildart}</Text>
            <Text style={styles.progressStatLabel}>Aktuell</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressStatValue}>~{timeRemaining} Min</Text>
            <Text style={styles.progressStatLabel}>Verbleibend</Text>
          </View>
        </View>
        
        {/* Actions */}
        <View style={styles.progressActions}>
          <TouchableOpacity
            style={[styles.progressButton, styles.progressButtonPause]}
            onPress={handlePauseResume}
          >
            <Ionicons
              name={isPaused ? 'play' : 'pause'}
              size={20}
              color={colors.primary}
            />
            <Text style={styles.progressButtonText}>
              {isPaused ? 'Fortsetzen' : 'Pausieren'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.progressButton, styles.progressButtonCancel]}
            onPress={handleCancel}
          >
            <Ionicons name="stop" size={20} color={colors.error} />
            <Text style={[styles.progressButtonText, { color: colors.error }]}>
              Abbrechen
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // ==========================================================================
  // RENDER
  // ==========================================================================
  
  if (kamerasLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Lade Kameras...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={isProcessing}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Batch-Verarbeitung</Text>
        <View style={{ width: 28 }} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Processing Progress (if active) */}
        {renderProgress()}
        
        {!isProcessing && (
          <>
            {/* Kamera Selection */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📷 Kameras auswählen</Text>
                <TouchableOpacity onPress={handleSelectAll}>
                  <Text style={styles.sectionLink}>
                    {selectedKameras.length === kameras?.length ? 'Keine' : 'Alle'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.kamerasList}>
                {kameras?.map(renderKameraItem)}
              </View>
            </View>
            
            {/* Summary */}
            {selectedKameras.length > 0 && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>📊 Zusammenfassung</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Kameras:</Text>
                  <Text style={styles.summaryValue}>{selectedKameras.length}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Fotos:</Text>
                  <Text style={styles.summaryValue}>{totalFotos}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Geschätzte Zeit:</Text>
                  <Text style={styles.summaryValue}>~{estimatedTimeMinutes} Min</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Speicherbedarf:</Text>
                  <Text style={styles.summaryValue}>~{estimatedMemoryMB} MB</Text>
                </View>
              </View>
            )}
            
            {/* Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚙️ Einstellungen</Text>
              
              {/* Min Confidence */}
              <View style={styles.settingItem}>
                <View style={styles.settingHeader}>
                  <Text style={styles.settingLabel}>Min. Confidence</Text>
                  <Text style={styles.settingValue}>{Math.round(minConfidence * 100)}%</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0.5}
                  maximumValue={0.95}
                  step={0.05}
                  value={minConfidence}
                  onValueChange={setMinConfidence}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                />
                <Text style={styles.settingHint}>
                  Nur Detections mit ≥ {Math.round(minConfidence * 100)}% Sicherheit
                </Text>
              </View>
              
              {/* GPU */}
              <View style={styles.settingItem}>
                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingLabel}>GPU-Beschleunigung</Text>
                    <Text style={styles.settingHint}>
                      Schnellere Verarbeitung (benötigt mehr Akku)
                    </Text>
                  </View>
                  <Switch
                    value={useGPU}
                    onValueChange={setUseGPU}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>
              </View>
              
              {/* Trophäen */}
              <View style={styles.settingItem}>
                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingLabel}>Trophäen-Analyse</Text>
                    <Text style={styles.settingHint}>
                      Geweih/Waffen-Erkennung + CIC-Score
                    </Text>
                  </View>
                  <Switch
                    value={analyzeTrophäen}
                    onValueChange={setAnalyzeTrophäen}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
      
      {/* Start Button */}
      {!isProcessing && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.startButton, !canStart && styles.startButtonDisabled]}
            onPress={handleStartProcessing}
            disabled={!canStart}
          >
            <Ionicons
              name="play"
              size={24}
              color={canStart ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.startButtonText,
                !canStart && styles.startButtonTextDisabled,
              ]}
            >
              Verarbeitung starten
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  
  // Section
  section: {
    marginBottom: spacing.lg,
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
  
  // Kameras List
  kamerasList: {
    gap: spacing.sm,
  },
  
  kameraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  kameraItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  kameraInfo: {
    flex: 1,
  },
  
  kameraName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  
  kameraStandort: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  
  fotosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
  },
  
  fotosBadgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  
  // Summary Card
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  
  summaryTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  
  summaryLabel: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  
  summaryValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  
  // Settings
  settingItem: {
    marginBottom: spacing.lg,
  },
  
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  settingLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  
  settingValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  
  settingHint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  
  slider: {
    width: '100%',
    height: 40,
  },
  
  // Progress Card
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  
  progressTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  
  progressPercent: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  
  progressStat: {
    alignItems: 'center',
  },
  
  progressStatValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  
  progressStatLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  
  progressActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  progressButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 2,
  },
  
  progressButtonPause: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  
  progressButtonCancel: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  
  progressButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  
  // Footer
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  
  startButtonDisabled: {
    backgroundColor: colors.border,
  },
  
  startButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  
  startButtonTextDisabled: {
    color: colors.textSecondary,
  },
});
