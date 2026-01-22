/**
 * Wildkamera Detection Review Screen
 * 
 * Phase 7A: KI-Detection Review & Correction
 * - Foto mit Bounding Boxes
 * - KI-Ergebnisse (Wildart, Anzahl, Confidence)
 * - Pro-Objekt Details (Geschlecht, Alter, Trophäe)
 * - Korrektur-Workflow (Feedback)
 * - Swipe Navigation
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
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

import WildlifeDetectionService from '../services/wildlifeDetectionService';
import type {
  KIDetectionResult,
  DetectedIndividuum,
  DetectionFeedback,
} from '../types/ki-detection';
import { colors, spacing, typography } from '../theme';

// ============================================================================
// TYPES
// ============================================================================

type RouteParams = {
  detectionId: string;
};

type NavigationProp = NativeStackNavigationProp<any>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 400;

// ============================================================================
// COMPONENT
// ============================================================================

export default function WildkameraDetectionReviewScreen() {
  
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  
  const { detectionId } = route.params;
  
  const [selectedObjectIndex, setSelectedObjectIndex] = useState(0);
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [feedbackData, setFeedbackData] = useState<Partial<DetectionFeedback>>({});
  
  // ==========================================================================
  // DATA FETCHING
  // ==========================================================================
  
  // Detection Data
  const { data: detection, isLoading } = useQuery({
    queryKey: ['ki-detection', detectionId],
    queryFn: async () => {
      // TODO: Implement actual API call
      return {
        id: detectionId,
        revierId: 'rev-1',
        wildkameraMediaId: 'media-1',
        imageUri: 'https://example.com/wildkamera/photo.jpg',
        imageWidth: 1920,
        imageHeight: 1080,
        verarbeitungsstatus: 'completed',
        objekte: [
          {
            objektIndex: 0,
            wildart: { hauptKlasse: 'Rehwild', confidence: 0.92 },
            geschlecht: { geschlecht: 'Weiblich', confidence: 0.78 },
            altersklasse: { altersklasse: 'Mittel', confidence: 0.65 },
            boundingBox: { x: 0.35, y: 0.25, width: 0.25, height: 0.45 },
            isTrophäe: false,
          },
          {
            objektIndex: 1,
            wildart: { hauptKlasse: 'Rehwild', confidence: 0.88 },
            geschlecht: { geschlecht: 'Männlich', confidence: 0.82 },
            altersklasse: { altersklasse: 'Jung', confidence: 0.71 },
            boundingBox: { x: 0.65, y: 0.35, width: 0.22, height: 0.40 },
            isTrophäe: false,
          },
        ],
        metadata: {
          modelName: 'YOLO_v8_Nano',
          modelVersion: '1.0.0',
          deviceTyp: 'iPhone 15 Pro',
          inferenceTimeMs: 125,
        },
        verarbeitetAm: new Date(),
      } as any;
    },
  });
  
  // Submit Feedback Mutation
  const feedbackMutation = useMutation({
    mutationFn: async (feedback: DetectionFeedback) => {
      const objekt = detection?.objekte[selectedObjectIndex];
      if (!objekt) throw new Error('Objekt nicht gefunden');
      
      await WildlifeDetectionService.submitFeedback(
        `detection-${detectionId}-obj-${selectedObjectIndex}`,
        'user-1', // TODO: Get from auth context
        feedback
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ki-detection', detectionId] });
      setFeedbackMode(false);
      setFeedbackData({});
      Alert.alert('✅ Danke!', 'Dein Feedback hilft die KI zu verbessern.');
    },
    onError: (error) => {
      Alert.alert('❌ Fehler', 'Feedback konnte nicht gespeichert werden.');
      console.error('Feedback error:', error);
    },
  });
  
  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  
  const handlePreviousObject = () => {
    if (!detection) return;
    if (selectedObjectIndex > 0) {
      setSelectedObjectIndex(selectedObjectIndex - 1);
      setFeedbackMode(false);
    }
  };
  
  const handleNextObject = () => {
    if (!detection) return;
    if (selectedObjectIndex < detection.objekte.length - 1) {
      setSelectedObjectIndex(selectedObjectIndex + 1);
      setFeedbackMode(false);
    }
  };
  
  const handleCorrectFeedback = () => {
    feedbackMutation.mutate({
      istKorrekt: true,
      bemerkungen: '',
      bildQualität: 'gut',
    } as DetectionFeedback);
  };
  
  const handleIncorrectFeedback = () => {
    setFeedbackMode(true);
  };
  
  const handleSubmitCorrection = () => {
    feedbackMutation.mutate({
      istKorrekt: false,
      korrekturWildart: feedbackData.korrekturWildart,
      korrekturGeschlecht: feedbackData.korrekturGeschlecht,
      korrekturAltersklasse: feedbackData.korrekturAltersklasse,
      bemerkungen: feedbackData.bemerkungen || '',
      bildQualität: feedbackData.bildQualität || 'mittel',
    } as DetectionFeedback);
  };
  
  const handleCancelFeedback = () => {
    setFeedbackMode(false);
    setFeedbackData({});
  };
  
  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================
  
  const renderBoundingBoxes = () => {
    if (!detection) return null;
    
    const imageWidth = SCREEN_WIDTH;
    const imageHeight = IMAGE_HEIGHT;
    
    return (
      <Svg
        width={imageWidth}
        height={imageHeight}
        style={StyleSheet.absoluteFill}
      >
        {detection.objekte.map((obj, index) => {
          const bbox = obj.boundingBox;
          const x = bbox.x * imageWidth;
          const y = bbox.y * imageHeight;
          const width = bbox.width * imageWidth;
          const height = bbox.height * imageHeight;
          
          const isSelected = index === selectedObjectIndex;
          const color = isSelected ? colors.primary : colors.success;
          const strokeWidth = isSelected ? 3 : 2;
          
          return (
            <React.Fragment key={index}>
              {/* Bounding Box */}
              <Rect
                x={x}
                y={y}
                width={width}
                height={height}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              
              {/* Label */}
              <Rect
                x={x}
                y={y - 24}
                width={width}
                height={24}
                fill={color}
                opacity={0.8}
              />
              <SvgText
                x={x + 4}
                y={y - 6}
                fontSize={12}
                fontWeight="bold"
                fill="#FFFFFF"
              >
                {obj.wildart.hauptKlasse} ({Math.round(obj.wildart.confidence * 100)}%)
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    );
  };
  
  const renderObjectDetails = (objekt: DetectedIndividuum) => {
    return (
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>🔍 KI-Analyse</Text>
        
        {/* Wildart */}
        <View style={styles.detailRow}>
          <View style={styles.detailLabel}>
            <Text style={styles.detailLabelText}>Wildart</Text>
          </View>
          <View style={styles.detailValue}>
            <Text style={styles.detailValueText}>
              {objekt.wildart.hauptKlasse}
            </Text>
            <Text style={styles.detailConfidence}>
              {Math.round(objekt.wildart.confidence * 100)}%
            </Text>
          </View>
        </View>
        
        {/* Geschlecht */}
        {objekt.geschlecht && (
          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Text style={styles.detailLabelText}>Geschlecht</Text>
            </View>
            <View style={styles.detailValue}>
              <Text style={styles.detailValueText}>
                {objekt.geschlecht.geschlecht}
              </Text>
              <Text style={styles.detailConfidence}>
                {Math.round(objekt.geschlecht.confidence * 100)}%
              </Text>
            </View>
          </View>
        )}
        
        {/* Altersklasse */}
        {objekt.altersklasse && (
          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Text style={styles.detailLabelText}>Altersklasse</Text>
            </View>
            <View style={styles.detailValue}>
              <Text style={styles.detailValueText}>
                {objekt.altersklasse.altersklasse}
              </Text>
              <Text style={styles.detailConfidence}>
                {Math.round(objekt.altersklasse.confidence * 100)}%
              </Text>
            </View>
          </View>
        )}
        
        {/* Trophäe */}
        {objekt.isTrophäe && objekt.trophäenInfo && (
          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Text style={styles.detailLabelText}>Trophäe</Text>
            </View>
            <View style={styles.detailValue}>
              <Text style={[styles.detailValueText, { color: colors.warning }]}>
                ⭐ Kandidat
              </Text>
              {objekt.trophäenInfo.geweih?.geschätzteCIC && (
                <Text style={styles.detailConfidence}>
                  ~{objekt.trophäenInfo.geweih.geschätzteCIC} CIC
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };
  
  const renderFeedbackForm = () => {
    return (
      <View style={styles.feedbackForm}>
        <Text style={styles.feedbackTitle}>📝 Korrektur</Text>
        <Text style={styles.feedbackSubtitle}>
          Bitte korrigiere die falschen Angaben:
        </Text>
        
        {/* Wildart Correction */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Wildart</Text>
          <TextInput
            style={styles.formInput}
            placeholder="z.B. Schwarzwild"
            value={feedbackData.korrekturWildart}
            onChangeText={(text) =>
              setFeedbackData({ ...feedbackData, korrekturWildart: text })
            }
          />
        </View>
        
        {/* Geschlecht Correction */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Geschlecht</Text>
          <View style={styles.buttonGroup}>
            {['Männlich', 'Weiblich', 'Unbekannt'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.buttonGroupItem,
                  feedbackData.korrekturGeschlecht === g && styles.buttonGroupItemActive,
                ]}
                onPress={() =>
                  setFeedbackData({ ...feedbackData, korrekturGeschlecht: g as any })
                }
              >
                <Text
                  style={[
                    styles.buttonGroupText,
                    feedbackData.korrekturGeschlecht === g && styles.buttonGroupTextActive,
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Altersklasse Correction */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Altersklasse</Text>
          <View style={styles.buttonGroup}>
            {['Jung', 'Mittel', 'Alt'].map((a) => (
              <TouchableOpacity
                key={a}
                style={[
                  styles.buttonGroupItem,
                  feedbackData.korrekturAltersklasse === a && styles.buttonGroupItemActive,
                ]}
                onPress={() =>
                  setFeedbackData({ ...feedbackData, korrekturAltersklasse: a as any })
                }
              >
                <Text
                  style={[
                    styles.buttonGroupText,
                    feedbackData.korrekturAltersklasse === a && styles.buttonGroupTextActive,
                  ]}
                >
                  {a}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Bemerkungen */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Bemerkungen (optional)</Text>
          <TextInput
            style={[styles.formInput, styles.formTextArea]}
            placeholder="Zusätzliche Hinweise..."
            multiline
            numberOfLines={3}
            value={feedbackData.bemerkungen}
            onChangeText={(text) =>
              setFeedbackData({ ...feedbackData, bemerkungen: text })
            }
          />
        </View>
        
        {/* Actions */}
        <View style={styles.feedbackActions}>
          <TouchableOpacity
            style={[styles.feedbackButton, styles.feedbackButtonCancel]}
            onPress={handleCancelFeedback}
          >
            <Text style={styles.feedbackButtonTextCancel}>Abbrechen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.feedbackButton, styles.feedbackButtonSubmit]}
            onPress={handleSubmitCorrection}
            disabled={feedbackMutation.isPending}
          >
            {feedbackMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.feedbackButtonTextSubmit}>Senden</Text>
            )}
          </TouchableOpacity>
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
        <Text style={styles.loadingText}>Lade Detection...</Text>
      </View>
    );
  }
  
  if (!detection) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>Detection nicht gefunden</Text>
      </View>
    );
  }
  
  const currentObject = detection.objekte[selectedObjectIndex];
  
  return (
    <View style={styles.container}>
      {/* Image with Bounding Boxes */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: detection.imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
        {renderBoundingBoxes()}
        
        {/* Navigation Overlay */}
        {detection.objekte.length > 1 && (
          <View style={styles.imageNavigation}>
            <TouchableOpacity
              style={[
                styles.navButton,
                selectedObjectIndex === 0 && styles.navButtonDisabled,
              ]}
              onPress={handlePreviousObject}
              disabled={selectedObjectIndex === 0}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.navIndicator}>
              <Text style={styles.navIndicatorText}>
                {selectedObjectIndex + 1} / {detection.objekte.length}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.navButton,
                selectedObjectIndex === detection.objekte.length - 1 && styles.navButtonDisabled,
              ]}
              onPress={handleNextObject}
              disabled={selectedObjectIndex === detection.objekte.length - 1}
            >
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Object Details */}
        {renderObjectDetails(currentObject)}
        
        {/* Feedback Section */}
        {feedbackMode ? (
          renderFeedbackForm()
        ) : (
          <View style={styles.feedbackPrompt}>
            <Text style={styles.feedbackPromptTitle}>
              Ist diese Erkennung korrekt?
            </Text>
            <View style={styles.feedbackPromptButtons}>
              <TouchableOpacity
                style={[styles.feedbackPromptButton, styles.feedbackPromptButtonNo]}
                onPress={handleIncorrectFeedback}
              >
                <Ionicons name="close-circle" size={24} color={colors.error} />
                <Text style={styles.feedbackPromptButtonText}>Nein</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.feedbackPromptButton, styles.feedbackPromptButtonYes]}
                onPress={handleCorrectFeedback}
                disabled={feedbackMutation.isPending}
              >
                {feedbackMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.success} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                    <Text style={styles.feedbackPromptButtonText}>Ja</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Metadata */}
        <View style={styles.metadataCard}>
          <Text style={styles.metadataTitle}>ℹ️ Metadaten</Text>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Modell:</Text>
            <Text style={styles.metadataValue}>
              {detection.metadata.modelName} v{detection.metadata.modelVersion}
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Gerät:</Text>
            <Text style={styles.metadataValue}>{detection.metadata.deviceTyp}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Verarbeitung:</Text>
            <Text style={styles.metadataValue}>
              {detection.metadata.inferenceTimeMs}ms
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Zeitpunkt:</Text>
            <Text style={styles.metadataValue}>
              {detection.verarbeitetAm?.toLocaleString('de-DE')}
            </Text>
          </View>
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
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  
  errorText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.lg,
    color: colors.error,
    textAlign: 'center',
  },
  
  // Image Container
  imageContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: '#000000',
    position: 'relative',
  },
  
  image: {
    width: '100%',
    height: '100%',
  },
  
  imageNavigation: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  navButtonDisabled: {
    opacity: 0.3,
  },
  
  navIndicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  
  navIndicatorText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
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
  
  // Details Card
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  
  detailsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  detailLabel: {
    flex: 1,
  },
  
  detailLabelText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  detailValueText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  
  detailConfidence: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.success,
  },
  
  // Feedback Prompt
  feedbackPrompt: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  
  feedbackPromptTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  
  feedbackPromptButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  feedbackPromptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 2,
  },
  
  feedbackPromptButtonYes: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  
  feedbackPromptButtonNo: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  
  feedbackPromptButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  
  // Feedback Form
  feedbackForm: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  
  feedbackTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  
  feedbackSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  
  formGroup: {
    marginBottom: spacing.md,
  },
  
  formLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  
  formInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text,
    backgroundColor: colors.background,
  },
  
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  
  buttonGroupItem: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  
  buttonGroupItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  buttonGroupText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  
  buttonGroupTextActive: {
    color: '#FFFFFF',
  },
  
  feedbackActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  
  feedbackButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  feedbackButtonCancel: {
    backgroundColor: colors.border,
  },
  
  feedbackButtonSubmit: {
    backgroundColor: colors.primary,
  },
  
  feedbackButtonTextCancel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  
  feedbackButtonTextSubmit: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  
  // Metadata Card
  metadataCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
  },
  
  metadataTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  
  metadataLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  
  metadataValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
});
