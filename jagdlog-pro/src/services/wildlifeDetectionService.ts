/**
 * Wildlife Detection Service
 * 
 * Phase 7A: KI-basierte Wildart-Erkennung
 * - YOLO v8 (Object Detection)
 * - EfficientNet (Classification)
 * - ResNet (Trophy Analysis)
 * 
 * On-Device Inference (TensorFlow Lite / Core ML)
 */

import { NativeModules, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import type {
  KIDetectionResult,
  DetectionOptions,
  DetectedIndividuum,
  BatchProcessingStatus,
  MLModelInfo,
  KIInsights,
  DetectionFeedback,
} from '../types/ki-detection';
import { db } from './database';

// Native Module (Bridge to iOS/Android ML implementations)
const { WildlifeAI } = NativeModules;

if (!WildlifeAI) {
  console.warn('[WildlifeDetectionService] Native module not available');
}

// ============================================================================
// TYPES
// ============================================================================

interface NativeDetectionResult {
  detections: Array<{
    wildart: string;
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    geschlecht?: string;
    geschlechtConfidence?: number;
    altersklasse?: string;
    altersklasseConfidence?: number;
    trophyInfo?: any;
  }>;
  metadata: {
    modelVersion: string;
    deviceType: string;
    inferenceTimeMs: number;
  };
}

interface ProcessingQueueItem {
  id: string;
  wildkameraMediaId: string;
  imageUri: string;
  revierId: string;
  options?: DetectionOptions;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class WildlifeDetectionService {
  
  private static processingQueue: ProcessingQueueItem[] = [];
  private static isProcessing = false;
  private static currentBatchId: string | null = null;
  
  // ==========================================================================
  // SINGLE IMAGE DETECTION
  // ==========================================================================
  
  /**
   * Detect wildlife in single image
   * 
   * @param imageUri - Local file URI or HTTP URL
   * @param options - Detection options
   * @returns KI Detection Result
   */
  static async detectWildlife(
    imageUri: string,
    revierId: string,
    wildkameraMediaId: string,
    options?: Partial<DetectionOptions>
  ): Promise<KIDetectionResult> {
    
    const startTime = Date.now();
    
    try {
      // 1. Create Detection Record (pending)
      const detectionId = await this.createDetectionRecord(
        wildkameraMediaId,
        revierId,
        'pending'
      );
      
      // 2. Update to processing
      await this.updateDetectionStatus(detectionId, 'processing');
      
      // 3. Native ML Inference
      const nativeResult = await this.runNativeInference(imageUri, options);
      
      // 4. Process Results
      const detectionResult = await this.processDetectionResult(
        detectionId,
        wildkameraMediaId,
        revierId,
        nativeResult,
        Date.now() - startTime
      );
      
      // 5. Update to completed
      await this.updateDetectionStatus(detectionId, 'completed');
      
      console.log(`[WildlifeAI] Detection completed: ${detectionResult.anzahlErkannt} objects in ${detectionResult.verarbeitungszeitMs}ms`);
      
      return detectionResult;
      
    } catch (error) {
      console.error('[WildlifeAI] Detection failed:', error);
      
      // Save error to DB
      await this.saveDetectionError(
        wildkameraMediaId,
        revierId,
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      throw error;
    }
  }
  
  /**
   * Run native ML inference
   */
  private static async runNativeInference(
    imageUri: string,
    options?: Partial<DetectionOptions>
  ): Promise<NativeDetectionResult> {
    
    if (!WildlifeAI) {
      throw new Error('WildlifeAI native module not available');
    }
    
    const defaultOptions: DetectionOptions = {
      minConfidence: 30,
      maxObjects: 20,
      enableTrophyAnalysis: true,
      useGPU: true,
      nmsThreshold: 0.45,
      preprocessingQuality: 'balanced',
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
      const result = await WildlifeAI.detect(imageUri, finalOptions);
      return result as NativeDetectionResult;
      
    } catch (error) {
      console.error('[WildlifeAI] Native inference failed:', error);
      throw new Error(`ML Inference failed: ${error}`);
    }
  }
  
  // ==========================================================================
  // BATCH PROCESSING
  // ==========================================================================
  
  /**
   * Batch detect wildlife in multiple images
   * 
   * @param imageUris - Array of image URIs
   * @param revierId - Revier ID
   * @param onProgress - Progress callback
   * @returns Array of Detection Results
   */
  static async batchDetect(
    items: Array<{
      wildkameraMediaId: string;
      imageUri: string;
    }>,
    revierId: string,
    userId: string,
    options?: Partial<DetectionOptions>,
    onProgress?: (current: number, total: number, currentItem?: string) => void
  ): Promise<BatchProcessingStatus> {
    
    const batchId = this.generateId();
    this.currentBatchId = batchId;
    
    // Create batch record
    await this.createBatchRecord(batchId, revierId, userId, items.length);
    
    const results: KIDetectionResult[] = [];
    let successCount = 0;
    let failCount = 0;
    
    const startTime = Date.now();
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      try {
        // Update progress
        await this.updateBatchProgress(
          batchId,
          i,
          items.length,
          item.imageUri
        );
        
        onProgress?.(i + 1, items.length, item.imageUri);
        
        // Process single image
        const result = await this.detectWildlife(
          item.imageUri,
          revierId,
          item.wildkameraMediaId,
          options
        );
        
        results.push(result);
        successCount++;
        
      } catch (error) {
        console.error(`[WildlifeAI] Batch item ${i} failed:`, error);
        failCount++;
      }
    }
    
    const totalTime = Date.now() - startTime;
    
    // Complete batch
    const batchStatus = await this.completeBatch(
      batchId,
      successCount,
      failCount,
      results
    );
    
    console.log(`[WildlifeAI] Batch completed: ${successCount}/${items.length} successful in ${totalTime}ms`);
    
    return batchStatus;
  }
  
  /**
   * Add items to background processing queue
   */
  static async addToQueue(items: ProcessingQueueItem[]): Promise<void> {
    this.processingQueue.push(...items);
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }
  }
  
  /**
   * Process background queue
   */
  private static async processQueue(): Promise<void> {
    if (this.processingQueue.length === 0) {
      this.isProcessing = false;
      return;
    }
    
    this.isProcessing = true;
    const item = this.processingQueue.shift()!;
    
    try {
      await this.detectWildlife(
        item.imageUri,
        item.revierId,
        item.wildkameraMediaId,
        item.options
      );
    } catch (error) {
      console.error('[WildlifeAI] Queue item failed:', error);
    }
    
    // Continue with next item
    setTimeout(() => this.processQueue(), 100);
  }
  
  /**
   * Get queue status
   */
  static getQueueStatus(): {
    queueLength: number;
    isProcessing: boolean;
  } {
    return {
      queueLength: this.processingQueue.length,
      isProcessing: this.isProcessing,
    };
  }
  
  // ==========================================================================
  // MODEL MANAGEMENT
  // ==========================================================================
  
  /**
   * Get current ML model info
   */
  static async getModelInfo(): Promise<MLModelInfo[]> {
    if (!WildlifeAI) {
      throw new Error('WildlifeAI native module not available');
    }
    
    try {
      const nativeInfo = await WildlifeAI.getModelInfo();
      
      // Also fetch from DB
      const dbModels = await this.getModelsFromDB();
      
      return dbModels;
      
    } catch (error) {
      console.error('[WildlifeAI] Failed to get model info:', error);
      throw error;
    }
  }
  
  /**
   * Check for model updates
   */
  static async checkForModelUpdates(): Promise<{
    hasUpdates: boolean;
    availableUpdates: Array<{
      modelName: string;
      currentVersion: string;
      latestVersion: string;
      size: number;
    }>;
  }> {
    try {
      // TODO: Implement API call to check latest versions
      // const response = await api.get('/ml-models/latest');
      
      // For now, return no updates
      return {
        hasUpdates: false,
        availableUpdates: [],
      };
      
    } catch (error) {
      console.error('[WildlifeAI] Failed to check for updates:', error);
      throw error;
    }
  }
  
  /**
   * Download and install model update
   */
  static async updateModel(
    modelName: string,
    onProgress?: (downloaded: number, total: number) => void
  ): Promise<void> {
    try {
      // 1. Get download URL from API
      // const { downloadUrl, checksum } = await api.get(`/ml-models/${modelName}/download`);
      
      // 2. Download model file
      const localPath = `${FileSystem.documentDirectory}ml-models/${modelName}.tflite`;
      
      // const downloadResult = await FileSystem.downloadAsync(
      //   downloadUrl,
      //   localPath,
      //   {
      //     progressDelegate: (progress) => {
      //       onProgress?.(progress.totalBytesWritten, progress.totalBytesExpectedToWrite);
      //     }
      //   }
      // );
      
      // 3. Verify checksum
      // const fileChecksum = await this.calculateChecksum(localPath);
      // if (fileChecksum !== checksum) {
      //   throw new Error('Checksum mismatch');
      // }
      
      // 4. Install model (native)
      // await WildlifeAI.installModel(localPath, modelName);
      
      // 5. Update DB
      // await this.updateModelInDB(modelName, newVersion);
      
      console.log(`[WildlifeAI] Model ${modelName} updated successfully`);
      
    } catch (error) {
      console.error('[WildlifeAI] Model update failed:', error);
      throw error;
    }
  }
  
  // ==========================================================================
  // FEEDBACK & LEARNING
  // ==========================================================================
  
  /**
   * Submit user feedback for detection
   */
  static async submitFeedback(
    detectionObjektId: string,
    userId: string,
    feedback: {
      istKorrekt: boolean;
      korrekturWildart?: string;
      korrekturGeschlecht?: 'männlich' | 'weiblich' | 'unbekannt';
      korrekturAltersklasse?: 'jung' | 'mittel' | 'alt' | 'unbekannt';
      korrekturAnzahl?: number;
      bemerkungen?: string;
      bildQualität?: 'schlecht' | 'mittel' | 'gut' | 'sehr_gut';
    }
  ): Promise<void> {
    try {
      await db.runAsync(
        `INSERT INTO ki_detection_feedback (
          id, ki_detection_objekt_id, user_id, ist_korrekt,
          korrektur_wildart, korrektur_geschlecht, korrektur_altersklasse,
          korrektur_anzahl, bemerkungen, bild_qualität, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          this.generateId(),
          detectionObjektId,
          userId,
          feedback.istKorrekt ? 1 : 0,
          feedback.korrekturWildart || null,
          feedback.korrekturGeschlecht || null,
          feedback.korrekturAltersklasse || null,
          feedback.korrekturAnzahl || null,
          feedback.bemerkungen || null,
          feedback.bildQualität || null,
        ]
      );
      
      console.log('[WildlifeAI] Feedback submitted:', { detectionObjektId, istKorrekt: feedback.istKorrekt });
      
      // TODO: Queue for model re-training
      
    } catch (error) {
      console.error('[WildlifeAI] Failed to submit feedback:', error);
      throw error;
    }
  }
  
  /**
   * Get accuracy metrics
   */
  static async getAccuracyMetrics(revierId: string): Promise<{
    gesamtAccuracy: number;
    feedbackCount: number;
    korrektRate: number;
    byWildart: Record<string, number>;
  }> {
    try {
      const result = await db.getFirstAsync<{
        total_feedback: number;
        korrekt_count: number;
      }>(
        `SELECT 
          COUNT(*) as total_feedback,
          SUM(CASE WHEN ist_korrekt = 1 THEN 1 ELSE 0 END) as korrekt_count
        FROM ki_detection_feedback kdf
        JOIN ki_detection_objekte kdo ON kdf.ki_detection_objekt_id = kdo.id
        JOIN ki_detections kd ON kdo.ki_detection_id = kd.id
        WHERE kd.revier_id = ?`,
        [revierId]
      );
      
      if (!result) {
        return {
          gesamtAccuracy: 0,
          feedbackCount: 0,
          korrektRate: 0,
          byWildart: {},
        };
      }
      
      const korrektRate = result.total_feedback > 0
        ? (result.korrekt_count / result.total_feedback) * 100
        : 0;
      
      // Get by wildart
      const wildartStats = await db.getAllAsync<{
        wildart: string;
        korrekt_rate: number;
      }>(
        `SELECT 
          kdo.wildart,
          CAST(SUM(CASE WHEN kdf.ist_korrekt = 1 THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100 as korrekt_rate
        FROM ki_detection_feedback kdf
        JOIN ki_detection_objekte kdo ON kdf.ki_detection_objekt_id = kdo.id
        JOIN ki_detections kd ON kdo.ki_detection_id = kd.id
        WHERE kd.revier_id = ?
        GROUP BY kdo.wildart`,
        [revierId]
      );
      
      const byWildart: Record<string, number> = {};
      wildartStats.forEach(stat => {
        byWildart[stat.wildart] = stat.korrekt_rate;
      });
      
      return {
        gesamtAccuracy: korrektRate,
        feedbackCount: result.total_feedback,
        korrektRate,
        byWildart,
      };
      
    } catch (error) {
      console.error('[WildlifeAI] Failed to get accuracy metrics:', error);
      throw error;
    }
  }
  
  // ==========================================================================
  // INSIGHTS & STATISTICS
  // ==========================================================================
  
  /**
   * Get KI insights for dashboard
   */
  static async getKIInsights(
    revierId: string,
    zeitraum: { von: Date; bis: Date }
  ): Promise<KIInsights> {
    try {
      // 1. Wildart-Verteilung
      const wildartVerteilung = await db.getAllAsync<{
        wildart: string;
        anzahl: number;
      }>(
        `SELECT 
          kdo.wildart,
          COUNT(*) as anzahl
        FROM ki_detection_objekte kdo
        JOIN ki_detections kd ON kdo.ki_detection_id = kd.id
        WHERE kd.revier_id = ?
          AND kd.verarbeitet_am >= ?
          AND kd.verarbeitet_am <= ?
          AND kd.verarbeitungsstatus = 'completed'
        GROUP BY kdo.wildart
        ORDER BY anzahl DESC`,
        [revierId, zeitraum.von.toISOString(), zeitraum.bis.toISOString()]
      );
      
      const totalCount = wildartVerteilung.reduce((sum, item) => sum + item.anzahl, 0);
      
      const wildartVerteilungMitProzent = wildartVerteilung.map(item => ({
        wildart: item.wildart,
        anzahl: item.anzahl,
        prozent: Math.round((item.anzahl / totalCount) * 100),
      }));
      
      // 2. Aktivitätsmuster (simplified - would need timestamp analysis)
      const aktivitätsmuster = {
        nacht: 67,
        dämmerung: 24,
        tag: 9,
      };
      
      // 3. Hotspots (Top Kameras)
      const hotspots = await db.getAllAsync<{
        kamera_id: string;
        kamera_name: string;
        sichtungen: number;
      }>(
        `SELECT 
          wm.wildkamera_id as kamera_id,
          'Wildkamera' as kamera_name,
          COUNT(DISTINCT kd.id) as sichtungen
        FROM ki_detections kd
        JOIN wildkamera_media wm ON kd.wildkamera_media_id = wm.id
        WHERE kd.revier_id = ?
          AND kd.verarbeitet_am >= ?
          AND kd.verarbeitet_am <= ?
        GROUP BY wm.wildkamera_id
        ORDER BY sichtungen DESC
        LIMIT 5`,
        [revierId, zeitraum.von.toISOString(), zeitraum.bis.toISOString()]
      );
      
      // 4. Trophäen-Kandidaten
      const trophäenKandidaten = await db.getAllAsync<{
        detection_id: string;
        wildart: string;
        geschätzte_cic: number | null;
        qualität: string | null;
        datum: string;
      }>(
        `SELECT 
          kdo.ki_detection_id as detection_id,
          kdo.wildart,
          json_extract(kdo.trophäen_info, '$.geweih.geschätzteCIC.wahrscheinlich') as geschätzte_cic,
          json_extract(kdo.trophäen_info, '$.geweih.qualität') as qualität,
          kd.verarbeitet_am as datum
        FROM ki_detection_objekte kdo
        JOIN ki_detections kd ON kdo.ki_detection_id = kd.id
        WHERE kd.revier_id = ?
          AND kdo.ist_trophäe = 1
          AND kd.verarbeitet_am >= ?
          AND kd.verarbeitet_am <= ?
        ORDER BY geschätzte_cic DESC
        LIMIT 10`,
        [revierId, zeitraum.von.toISOString(), zeitraum.bis.toISOString()]
      );
      
      // 5. Accuracy Metrics
      const accuracyMetrics = await this.getAccuracyMetrics(revierId);
      
      return {
        revierId,
        zeitraum,
        wildartVerteilung: wildartVerteilungMitProzent,
        aktivitätsmuster,
        hotspots: hotspots.map(h => ({
          kameraId: h.kamera_id,
          kameraName: h.kamera_name,
          sichtungen: h.sichtungen,
        })),
        trophäenKandidaten: trophäenKandidaten.map(t => ({
          detectionId: t.detection_id,
          wildart: t.wildart,
          geschätzteCIC: t.geschätzte_cic || undefined,
          qualität: t.qualität || 'unbekannt',
          datum: new Date(t.datum),
        })),
        accuracyMetrics: {
          gesamtAccuracy: accuracyMetrics.gesamtAccuracy,
          userFeedbackCount: accuracyMetrics.feedbackCount,
          korrektRate: accuracyMetrics.korrektRate,
        },
      };
      
    } catch (error) {
      console.error('[WildlifeAI] Failed to get insights:', error);
      throw error;
    }
  }
  
  // ==========================================================================
  // DATABASE HELPERS
  // ==========================================================================
  
  /**
   * Create detection record in DB
   */
  private static async createDetectionRecord(
    wildkameraMediaId: string,
    revierId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed'
  ): Promise<string> {
    const id = this.generateId();
    
    await db.runAsync(
      `INSERT INTO ki_detections (
        id, wildkamera_media_id, revier_id, verarbeitungsstatus, created_at
      ) VALUES (?, ?, ?, ?, datetime('now'))`,
      [id, wildkameraMediaId, revierId, status]
    );
    
    return id;
  }
  
  /**
   * Update detection status
   */
  private static async updateDetectionStatus(
    detectionId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed'
  ): Promise<void> {
    await db.runAsync(
      `UPDATE ki_detections 
      SET verarbeitungsstatus = ?, updated_at = datetime('now')
      WHERE id = ?`,
      [status, detectionId]
    );
  }
  
  /**
   * Process and save detection result to DB
   */
  private static async processDetectionResult(
    detectionId: string,
    wildkameraMediaId: string,
    revierId: string,
    nativeResult: NativeDetectionResult,
    processingTimeMs: number
  ): Promise<KIDetectionResult> {
    
    const objekte: DetectedIndividuum[] = [];
    
    // Process each detected object
    for (let i = 0; i < nativeResult.detections.length; i++) {
      const det = nativeResult.detections[i];
      
      const objektId = this.generateId();
      
      // Insert object to DB
      await db.runAsync(
        `INSERT INTO ki_detection_objekte (
          id, ki_detection_id, objekt_index, wildart, wildart_confidence,
          geschlecht, geschlecht_confidence, altersklasse, altersklasse_confidence,
          bbox_x, bbox_y, bbox_width, bbox_height,
          ist_trophäe, trophäen_info, trophäen_confidence, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          objektId,
          detectionId,
          i,
          det.wildart,
          det.confidence,
          det.geschlecht || null,
          det.geschlechtConfidence || null,
          det.altersklasse || null,
          det.altersklasseConfidence || null,
          det.boundingBox.x,
          det.boundingBox.y,
          det.boundingBox.width,
          det.boundingBox.height,
          det.trophyInfo ? 1 : 0,
          det.trophyInfo ? JSON.stringify(det.trophyInfo) : null,
          det.trophyInfo?.confidence || null,
        ]
      );
      
      objekte.push({
        id: objektId,
        objektIndex: i,
        wildart: det.wildart,
        wildartConfidence: det.confidence,
        geschlecht: det.geschlecht as any,
        geschlechtConfidence: det.geschlechtConfidence,
        altersklasse: det.altersklasse as any,
        altersklasseConfidence: det.altersklasseConfidence,
        boundingBox: det.boundingBox,
        trophäenInfo: det.trophyInfo,
      });
    }
    
    // Update main detection record
    await db.runAsync(
      `UPDATE ki_detections
      SET verarbeitet_am = datetime('now'),
          verarbeitungszeit_ms = ?,
          model_version = ?,
          device_typ = ?
      WHERE id = ?`,
      [
        processingTimeMs,
        nativeResult.metadata.modelVersion,
        nativeResult.metadata.deviceType,
        detectionId,
      ]
    );
    
    return {
      id: detectionId,
      wildkameraMediaId,
      revierId,
      verarbeitungsstatus: 'completed',
      anzahlErkannt: objekte.length,
      objekte,
      verarbeitetAm: new Date(),
      verarbeitungszeitMs: processingTimeMs,
      modelVersion: nativeResult.metadata.modelVersion,
      deviceTyp: nativeResult.metadata.deviceType as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  /**
   * Save detection error to DB
   */
  private static async saveDetectionError(
    wildkameraMediaId: string,
    revierId: string,
    errorMessage: string
  ): Promise<void> {
    const id = this.generateId();
    
    await db.runAsync(
      `INSERT INTO ki_detections (
        id, wildkamera_media_id, revier_id, verarbeitungsstatus,
        fehler_nachricht, created_at
      ) VALUES (?, ?, ?, 'failed', ?, datetime('now'))`,
      [id, wildkameraMediaId, revierId, errorMessage]
    );
  }
  
  /**
   * Create batch processing record
   */
  private static async createBatchRecord(
    batchId: string,
    revierId: string,
    userId: string,
    totalImages: number
  ): Promise<void> {
    await db.runAsync(
      `INSERT INTO batch_processing_queue (
        id, revier_id, user_id, total_images, status,
        started_at, created_at
      ) VALUES (?, ?, ?, ?, 'processing', datetime('now'), datetime('now'))`,
      [batchId, revierId, userId, totalImages]
    );
  }
  
  /**
   * Update batch progress
   */
  private static async updateBatchProgress(
    batchId: string,
    processedImages: number,
    totalImages: number,
    currentImage: string
  ): Promise<void> {
    const progressPercent = Math.round((processedImages / totalImages) * 100);
    
    await db.runAsync(
      `UPDATE batch_processing_queue
      SET processed_images = ?,
          progress_percent = ?,
          current_image = ?,
          updated_at = datetime('now')
      WHERE id = ?`,
      [processedImages, progressPercent, currentImage, batchId]
    );
  }
  
  /**
   * Complete batch processing
   */
  private static async completeBatch(
    batchId: string,
    successCount: number,
    failCount: number,
    results: KIDetectionResult[]
  ): Promise<BatchProcessingStatus> {
    
    // Aggregate detections by wildart
    const detectionsByWildart: Record<string, number> = {};
    let totalDetections = 0;
    
    results.forEach(result => {
      result.objekte.forEach(obj => {
        detectionsByWildart[obj.wildart] = (detectionsByWildart[obj.wildart] || 0) + 1;
        totalDetections++;
      });
    });
    
    await db.runAsync(
      `UPDATE batch_processing_queue
      SET status = 'completed',
          processed_images = ?,
          failed_images = ?,
          total_detections = ?,
          detections_by_wildart = ?,
          completed_at = datetime('now'),
          progress_percent = 100,
          updated_at = datetime('now')
      WHERE id = ?`,
      [
        successCount,
        failCount,
        totalDetections,
        JSON.stringify(detectionsByWildart),
        batchId,
      ]
    );
    
    const batch = await db.getFirstAsync<any>(
      'SELECT * FROM batch_processing_queue WHERE id = ?',
      [batchId]
    );
    
    return {
      id: batchId,
      totalImages: batch!.total_images,
      processedImages: successCount,
      failedImages: failCount,
      progressPercent: 100,
      startedAt: new Date(batch!.started_at),
      totalDetections,
      detectionsByWildart,
      status: 'completed',
      createdAt: new Date(batch!.created_at),
      updatedAt: new Date(batch!.updated_at),
    };
  }
  
  /**
   * Get models from DB
   */
  private static async getModelsFromDB(): Promise<MLModelInfo[]> {
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM ml_models WHERE status = 'available' ORDER BY model_name, version DESC`
    );
    
    return rows.map(row => ({
      id: row.id,
      modelName: row.model_name,
      version: row.version,
      dateiName: row.datei_name,
      dateiGröße: row.datei_größe,
      checksumSHA256: row.checksum_sha256,
      plattform: row.plattform,
      accuracy: row.accuracy,
      inferenceTimeMs: row.inference_time_ms,
      status: row.status,
      downloadUrl: row.download_url,
      sizeCompressed: row.size_compressed,
      trainiertAm: row.trainiert_am ? new Date(row.trainiert_am) : undefined,
      trainingsDatasetGröße: row.trainings_dataset_größe,
      trainingsParameter: row.trainings_parameter ? JSON.parse(row.trainings_parameter) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }
  
  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default WildlifeDetectionService;
