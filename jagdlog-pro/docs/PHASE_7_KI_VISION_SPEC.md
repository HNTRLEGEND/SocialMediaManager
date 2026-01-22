# PHASE 7: KI-VISION & WILDKAMERA-INTEGRATION
**HNTR LEGEND Pro - Wildlife Recognition & Automated Data Capture**

---

## 🎯 VISION STATEMENT

**"Jedes Foto wird zur wertvollen Jagddaten - automatisch erkannt, kategorisiert und zur KI-Verbesserung genutzt."**

Die App erkennt automatisch:
- 📸 **Fotos innerhalb Reviergrenzen** → Auto-Import in Galerie
- 🦌 **Wildart-Erkennung** → Deepfaune AI + Custom ML Model
- 👁️ **Sichtungen** → Auto-Eintrag erstellen
- 🎯 **Erlegtes Wild** → Auto-Abschuss-Dokumentation
- 🎥 **Wildkamera-Daten** → Bewegungsmuster-Analyse
- 📊 **Integration in AI-Recommendations** → Bessere Jagdempfehlungen

---

## 🔍 FEATURE BREAKDOWN

### 1. FOTO-GEOLOCATION & AUTO-IMPORT

#### 1.1 Hintergrund-Scan (Background Service)
```typescript
interface FotoScanner {
  // Automatischer Scan der Foto-Galerie
  scanInterval: 'täglich' | 'wöchentlich' | 'manuell';
  
  // Geo-Filter
  filterByLocation: {
    enabled: boolean;
    reviergrenzen: Polygon[];
    bufferRadius: number; // Meter außerhalb Grenze
  };
  
  // Zeit-Filter
  filterByDate: {
    enabled: boolean;
    von: Date;
    bis: Date;
  };
  
  // Automatische Aktionen
  autoActions: {
    importToGallery: boolean;
    analyzeWithAI: boolean;
    createNotification: boolean;
    suggestEntry: boolean;
  };
}

// React Native Background Task
import BackgroundFetch from 'react-native-background-fetch';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';

export async function scanPhotosInRevier(revierId: string): Promise<PhotoMatch[]> {
  // 1. Hole Revier-Grenzen
  const revier = await getRevier(revierId);
  const grenzen = revier.grenzen; // Polygon
  
  // 2. Scanne Foto-Bibliothek (mit Permission)
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') return [];
  
  // 3. Hole alle Fotos der letzten 30 Tage
  const assets = await MediaLibrary.getAssetsAsync({
    first: 1000,
    mediaType: 'photo',
    createdAfter: Date.now() - 30 * 24 * 60 * 60 * 1000,
    sortBy: ['creationTime'],
  });
  
  // 4. Prüfe GPS-Koordinaten jedes Fotos
  const matches: PhotoMatch[] = [];
  for (const asset of assets.assets) {
    if (asset.location) {
      const { latitude, longitude } = asset.location;
      
      // 5. Point-in-Polygon Test
      if (isPointInPolygon({ latitude, longitude }, grenzen)) {
        matches.push({
          assetId: asset.id,
          uri: asset.uri,
          location: { latitude, longitude },
          timestamp: new Date(asset.creationTime),
          analyzed: false,
        });
      }
    }
  }
  
  return matches;
}

// Point-in-Polygon Algorithmus (Ray Casting)
function isPointInPolygon(
  point: { latitude: number; longitude: number },
  polygon: Array<{ latitude: number; longitude: number }>
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude;
    const yi = polygon[i].longitude;
    const xj = polygon[j].latitude;
    const yj = polygon[j].longitude;
    
    const intersect =
      yi > point.longitude !== yj > point.longitude &&
      point.latitude < ((xj - xi) * (point.longitude - yi)) / (yj - yi) + xi;
    
    if (intersect) inside = !inside;
  }
  return inside;
}

interface PhotoMatch {
  assetId: string;
  uri: string;
  location: GPSKoordinaten;
  timestamp: Date;
  analyzed: boolean;
  aiResults?: WildlifeDetection;
}
```

#### 1.2 Revier-Galerie
```typescript
interface RevierGalerie {
  revierId: string;
  fotos: GalerieFoto[];
  kategorien: FotoKategorie[];
  filter: {
    wildart?: string;
    datum?: DateRange;
    standort?: POI;
    autoImported?: boolean;
    analysiert?: boolean;
  };
  sortierung: 'datum' | 'wildart' | 'standort' | 'ki_score';
}

interface GalerieFoto {
  id: string;
  uri: string;
  thumbnail: string;
  gps: GPSKoordinaten;
  zeitpunkt: Date;
  kategorie: FotoKategorie;
  quelle: 'kamera' | 'galerie' | 'wildkamera';
  
  // KI-Analyse
  aiAnalyse: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    wildart?: string;
    confidence: number; // 0-100
    geschlecht?: 'männlich' | 'weiblich' | 'unbekannt';
    altersklasse?: string;
    anzahl: number;
    boundingBoxes: BoundingBox[];
    zusatzInfo: {
      gewichtSchaetzung?: number; // kg
      groesseSchaetzung?: number; // cm Schulterhöhe
      trophaeSchaetzung?: string; // z.B. "6-Ender"
      gesundheitszustand?: 'gesund' | 'verletzt' | 'krank';
    };
  };
  
  // Verknüpfung
  eintragId?: string; // Link zu Jagd-Eintrag
  wildkameraId?: string; // Link zu Wildkamera
}

type FotoKategorie = 
  | 'sichtung'          // Lebendes Wild
  | 'abschuss'          // Erlegtes Wild
  | 'trophae'           // Trophäen-Foto
  | 'revier'            // Revierimpression
  | 'infrastruktur'     // Hochsitz, Kirrung, etc.
  | 'wildschaden'       // Schaden
  | 'wildkamera'        // Von Wildkamera
  | 'sonstiges';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;       // Wildart
  confidence: number;  // 0-100
}
```

---

### 2. WILDART-ERKENNUNG (AI VISION)

#### 2.1 Multi-Model Approach

**Strategie:** Mehrere AI-Modelle kombinieren für höchste Genauigkeit

```typescript
interface WildlifeRecognitionService {
  // Haupt-Modell: Deepfaune API
  deepfauneAPI: {
    endpoint: 'https://api.deepfaune.cnrs.fr/predict';
    apiKey: string;
    coverage: 'Europa'; // Spezialisiert auf europäische Wildarten
    confidence: number; // Durchschnitt: 85-95%
    kosten: 'kostenlos bis 1000 Anfragen/Monat';
  };
  
  // Fallback: iNaturalist Vision API
  iNaturalistAPI: {
    endpoint: 'https://api.inaturalist.org/v1/computervision/score_image';
    coverage: 'weltweit';
    confidence: number; // Durchschnitt: 75-90%
    kosten: 'kostenlos';
  };
  
  // Custom Model: TensorFlow Lite (On-Device)
  customModel: {
    modelPath: 'assets/wildlife_detector_v1.tflite';
    labels: string[]; // Alle europäischen Wildarten
    training: 'Eigenes Training mit 50.000+ Jagd-Fotos';
    confidence: number; // Durchschnitt: 80-92%
    offline: true;
  };
  
  // Ensemble Learning
  ensemble: {
    method: 'weighted_voting' | 'confidence_threshold' | 'unanimous';
    weights: {
      deepfaune: 0.5;
      iNaturalist: 0.2;
      customModel: 0.3;
    };
  };
}

// API-Integration Deepfaune
export async function detectWildlifeDeepfaune(
  imageUri: string
): Promise<WildlifeDetection> {
  try {
    // 1. Konvertiere Bild zu Base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // 2. API Request
    const response = await axios.post(
      'https://api.deepfaune.cnrs.fr/predict',
      {
        image: base64,
        top_k: 5, // Top 5 Vorhersagen
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPFAUNE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    // 3. Parse Ergebnis
    const predictions = response.data.predictions;
    const topPrediction = predictions[0];
    
    return {
      wildart: mapDeepfauneToWildart(topPrediction.species),
      confidence: topPrediction.confidence * 100,
      alternativeVorhersagen: predictions.slice(1).map((p) => ({
        wildart: mapDeepfauneToWildart(p.species),
        confidence: p.confidence * 100,
      })),
      source: 'deepfaune',
    };
  } catch (error) {
    console.error('Deepfaune API Error:', error);
    return fallbackToCustomModel(imageUri);
  }
}

// Mapping Deepfaune → HNTR LEGEND Wildarten
function mapDeepfauneToWildart(species: string): string {
  const mapping: Record<string, string> = {
    'Capreolus capreolus': 'rehwild',
    'Cervus elaphus': 'rotwild',
    'Dama dama': 'damwild',
    'Sus scrofa': 'schwarzwild',
    'Vulpes vulpes': 'fuchs',
    'Meles meles': 'dachs',
    'Lepus europaeus': 'feldhase',
    'Corvus corone': 'rabenkraehe',
    // ... alle weiteren
  };
  return mapping[species] || species;
}

// On-Device TensorFlow Lite Model
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

let wildlifeModel: tf.GraphModel | null = null;

export async function loadWildlifeModel(): Promise<void> {
  if (wildlifeModel) return;
  
  const modelJSON = require('../../assets/ai/wildlife_detector/model.json');
  const modelWeights = require('../../assets/ai/wildlife_detector/weights.bin');
  
  wildlifeModel = await tf.loadGraphModel(
    bundleResourceIO(modelJSON, modelWeights)
  );
  
  console.log('Wildlife Detection Model loaded');
}

export async function detectWildlifeLocal(
  imageUri: string
): Promise<WildlifeDetection> {
  await loadWildlifeModel();
  
  // 1. Lade und preprocessing Bild
  const imageTensor = await loadImageTensor(imageUri);
  
  // 2. Vorhersage
  const predictions = wildlifeModel!.predict(imageTensor) as tf.Tensor;
  const scores = await predictions.data();
  
  // 3. Top-K Ergebnisse
  const topK = getTopKPredictions(scores, 5);
  
  return {
    wildart: WILDLIFE_LABELS[topK[0].index],
    confidence: topK[0].score * 100,
    alternativeVorhersagen: topK.slice(1).map((p) => ({
      wildart: WILDLIFE_LABELS[p.index],
      confidence: p.score * 100,
    })),
    source: 'custom_model',
  };
}

interface WildlifeDetection {
  wildart: string;
  confidence: number;
  geschlecht?: 'männlich' | 'weiblich' | 'unbekannt';
  altersklasse?: string;
  anzahl: number;
  boundingBoxes: BoundingBox[];
  alternativeVorhersagen: Array<{
    wildart: string;
    confidence: number;
  }>;
  source: 'deepfaune' | 'inaturalist' | 'custom_model' | 'ensemble';
  
  // Erweiterte Analyse
  zusatzInfo?: {
    gewichtSchaetzung?: number;
    groesseSchaetzung?: number;
    trophaeSchaetzung?: string;
    gesundheitszustand?: string;
  };
}
```

#### 2.2 Geschlechts- & Größenbestimmung

```typescript
interface GeschlechtErkennung {
  // Morphologische Merkmale
  merkmale: {
    rehwild: {
      maennlich: ['Gehörn vorhanden', 'Pinsel (Schwanz)', 'Körperbau kräftiger'];
      weiblich: ['Kein Gehörn', 'Spiegel herzförmig', 'Schlanker Körperbau'];
    };
    rotwild: {
      maennlich: ['Geweih vorhanden', 'Stärkerer Hals', 'Brunftschrei (Audio)'];
      weiblich: ['Kein Geweih', 'Schmaler Kopf'];
    };
    schwarzwild: {
      maennlich: ['Keilerwaffen sichtbar', 'Breiterer Kopf', 'Pinselhaare'];
      weiblich: ['Zitzen sichtbar', 'Schmalerer Kopf'];
    };
  };
  
  // Computer Vision Features
  cvFeatures: {
    headShape: number[];      // Kopfform-Vektor
    bodyProportions: number[]; // Körperproportionen
    antlerDetection: boolean;  // Gehörn/Geweih erkannt
    udderDetection: boolean;   // Zitzen erkannt
  };
  
  // Confidence
  confidence: number;
}

interface GroessenSchaetzung {
  // Referenz-Objekte im Bild
  referenzen: {
    bekannteObjekte: Array<{
      typ: 'baum' | 'zaun' | 'hochsitz' | 'person';
      geschaetzteGroesse: number; // cm
      boundingBox: BoundingBox;
    }>;
  };
  
  // Schätzung basierend auf Wildart
  schaetzung: {
    schulterhoehe: number;      // cm
    gewicht: number;            // kg
    trophaeMetrik?: number;     // CIC-Punkte Schätzung
    unsicherheit: number;       // ± cm/kg
  };
  
  // Vergleich mit Durchschnitt
  vergleich: {
    wildartDurchschnitt: number;
    relativeGroesse: 'klein' | 'mittel' | 'groß' | 'kapital';
  };
}
```

---

### 3. AUTO-EINTRAG GENERIERUNG

#### 3.1 Sichtung Auto-Erstellen

```typescript
interface AutoSichtungGenerator {
  // Trigger: Foto mit Wild erkannt
  async onWildDetected(
    foto: GalerieFoto,
    detection: WildlifeDetection
  ): Promise<JagdEintrag | null> {
    // 1. Prüfe ob bereits Eintrag existiert
    const existing = await findExistingEntry(foto.gps, foto.zeitpunkt);
    if (existing) {
      // Foto an bestehenden Eintrag anhängen
      await attachPhotoToEntry(existing.id, foto);
      return existing;
    }
    
    // 2. Erstelle neuen Eintrag (nur wenn Confidence > 75%)
    if (detection.confidence < 75) {
      // Zu unsicher → User-Bestätigung erforderlich
      await createSuggestion(foto, detection);
      return null;
    }
    
    // 3. Auto-Eintrag erstellen
    const eintrag: Partial<JagdEintrag> = {
      typ: 'beobachtung',
      wildart_id: detection.wildart,
      wildart_name: WILDARTEN[detection.wildart].name,
      anzahl: detection.anzahl,
      geschlecht: detection.geschlecht || 'unbekannt',
      altersklasse: detection.altersklasse,
      
      // GPS & Zeit
      gps: foto.location,
      zeitpunkt: foto.timestamp,
      
      // Wetter auto-fetch
      wetter: await getWeatherForTimestamp(foto.location, foto.timestamp),
      
      // POI auto-detect
      poi_id: await findNearestPOI(foto.location),
      
      // Media
      medien: [
        {
          typ: 'foto',
          uri: foto.uri,
          thumbnail: foto.thumbnail,
        },
      ],
      
      // Metadaten
      notizen: `📸 Automatisch erstellt aus Foto-Analyse (KI-Confidence: ${detection.confidence.toFixed(1)}%)`,
      auto_created: true,
      ai_data: detection,
    };
    
    const created = await createEntry(eintrag);
    
    // 4. Notification
    await showNotification({
      title: '✅ Sichtung automatisch erfasst',
      body: `${eintrag.anzahl}x ${eintrag.wildart_name} erkannt`,
      data: { eintragId: created.id },
    });
    
    return created;
  }
}

// Vorschlags-System für unsichere Erkennungen
interface EintragVorschlag {
  id: string;
  foto: GalerieFoto;
  detection: WildlifeDetection;
  vorgeschlagenerEintrag: Partial<JagdEintrag>;
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
  
  // User Actions
  actions: {
    accept: () => Promise<JagdEintrag>;
    reject: () => Promise<void>;
    modify: (changes: Partial<JagdEintrag>) => Promise<JagdEintrag>;
  };
}
```

#### 3.2 Abschuss Auto-Dokumentation

```typescript
interface AutoAbschussGenerator {
  // Erkennung: Totes/Erlegtes Wild
  async onErlgtesWildDetected(
    foto: GalerieFoto,
    detection: WildlifeDetection
  ): Promise<JagdEintrag | null> {
    // 1. Erkenne "tot" vs. "lebend"
    const isDead = await classifyDeadOrAlive(foto.uri);
    if (!isDead.confidence > 80) {
      // Unsicher → User fragen
      return await createAbschussVorschlag(foto, detection);
    }
    
    // 2. Extrahiere Details aus Foto
    const details = await extractAbschussDetails(foto.uri);
    
    // 3. Erstelle Abschuss-Eintrag
    const eintrag: Partial<JagdEintrag> = {
      typ: 'abschuss',
      wildart_id: detection.wildart,
      wildart_name: WILDARTEN[detection.wildart].name,
      anzahl: 1, // Abschuss = immer 1
      geschlecht: detection.geschlecht || 'unbekannt',
      altersklasse: detection.altersklasse,
      
      // Gewicht & Größe
      gewicht: detection.zusatzInfo?.gewichtSchaetzung,
      groesse: detection.zusatzInfo?.groesseSchaetzung,
      
      // Trophäe
      trophae: WILDARTEN[detection.wildart].hatTrophae ? {
        vorhanden: true,
        typ: WILDARTEN[detection.wildart].trophaeTyp,
        cic_punkte: detection.zusatzInfo?.trophaeSchaetzung,
        // Fotos werden später hinzugefügt
      } : null,
      
      // GPS & Zeit
      gps: foto.location,
      zeitpunkt: foto.timestamp,
      
      // Wetter
      wetter: await getWeatherForTimestamp(foto.location, foto.timestamp),
      
      // POI
      poi_id: await findNearestPOI(foto.location),
      
      // Media
      medien: [
        {
          typ: 'foto',
          uri: foto.uri,
          thumbnail: foto.thumbnail,
          kategorie: 'strecke', // Strecken-Foto
        },
      ],
      
      // Metadaten
      notizen: `🤖 Automatisch dokumentiert (KI-Analyse)
Wildart: ${detection.wildart} (${detection.confidence.toFixed(1)}% sicher)
Geschlecht: ${detection.geschlecht} 
${details.notizen}`,
      auto_created: true,
      ai_data: detection,
      
      // Wildmarke vorschlagen
      wildmarke_vorschlag: await getNextAvailableWildmarke(revierId, detection.wildart),
    };
    
    const created = await createEntry(eintrag);
    
    // 4. Notification mit Action
    await showNotification({
      title: '🎯 Abschuss automatisch dokumentiert',
      body: `${eintrag.wildart_name} erkannt - Bitte Details prüfen`,
      actions: [
        { id: 'review', title: 'Überprüfen' },
        { id: 'complete', title: 'Wildmarke zuweisen' },
      ],
      data: { eintragId: created.id },
    });
    
    return created;
  }
}

// Klassifikation: Tot oder Lebend
async function classifyDeadOrAlive(imageUri: string): Promise<{
  isDead: boolean;
  confidence: number;
}> {
  // Computer Vision Features:
  // - Position/Lage des Tieres
  // - Augen (offen/geschlossen)
  // - Blut sichtbar
  // - Umgebung (Wald vs. Streckplatz)
  // - Menschliche Hände im Bild
  
  const features = await extractDeadAliveFeatures(imageUri);
  
  // Simple Heuristik (kann durch ML verbessert werden)
  let score = 0;
  if (features.liegtAufSeite) score += 30;
  if (features.blutSichtbar) score += 40;
  if (features.menschenImBild) score += 20;
  if (features.streckplatzUmgebung) score += 10;
  
  return {
    isDead: score > 50,
    confidence: score,
  };
}
```

---

### 4. WILDKAMERA-INTEGRATION

#### 4.1 Wildkamera-Verbindung

```typescript
interface WildkameraVerwaltung {
  kameras: Wildkamera[];
  
  // Verbindungstypen
  connectionTypes: {
    wifi: 'Direktverbindung (WiFi)';
    bluetooth: 'Bluetooth (nahe Reichweite)';
    cellular: 'Mobilfunk (Cloud)';
    sd_card: 'SD-Karte Import';
    cloud_sync: 'Cloud-Synchronisation';
  };
  
  // Unterstützte Marken
  supportedBrands: [
    'ICUSERVER',       // ICUserver Cloud-Wildkameras (Priority)
    'Zeiss',           // Zeiss Secacam (Premium)
    'Spypoint',
    'Browning',
    'Bushnell',
    'Wildkamera24',
    'Seissiger',
    'Dörr',
    'Reconyx',
    'Cuddeback',
    'Moultrie',
    // ... weitere
  ];
}

interface Wildkamera {
  id: string;
  name: string;
  marke: string;
  modell: string;
  
  // Standort
  gps: GPSKoordinaten;
  poi_id?: string; // Verknüpfung zu POI
  ausrichtung: number; // Grad (0-360)
  sichtfeld: {
    winkel: number;       // Grad
    reichweite: number;   // Meter
  };
  
  // Verbindung
  verbindung: {
    typ: 'wifi' | 'bluetooth' | 'cellular' | 'sd_card' | 'cloud';
    status: 'connected' | 'disconnected' | 'error';
    letzteVerbindung?: Date;
    batterie: number; // Prozent
    speicher: {
      gesamt: number; // MB
      belegt: number;
      frei: number;
    };
  };
  
  // Einstellungen
  einstellungen: {
    aufloesungFoto: '12MP' | '16MP' | '20MP' | '24MP';
    aufloesungVideo: '720p' | '1080p' | '4K';
    ausloeserEmpfindlichkeit: 'niedrig' | 'mittel' | 'hoch';
    intervallModus: boolean;
    intervall: number; // Sekunden
    nachtmodus: 'IR' | 'white_LED' | 'black_LED';
  };
  
  // Statistiken
  statistik: {
    totalFotos: number;
    totalVideos: number;
    letzterAusloeser: Date;
    haeufigsteWildart: string;
    aktivsteZeit: string; // "06:00-08:00"
  };
}

// Auto-Import von Wildkamera
export async function importFromWildkamera(
  kameraId: string
): Promise<ImportResult> {
  const kamera = await getWildkamera(kameraId);
  
  // 1. Verbinde mit Kamera
  const connection = await connectToWildkamera(kamera);
  if (!connection.success) {
    throw new Error('Verbindung fehlgeschlagen');
  }
  
  // 2. Hole neue Fotos/Videos
  const neueMedian = await fetchNewMedia(connection);
  
  // 3. Verarbeite jedes Medium
  const results: ProcessedMedia[] = [];
  for (const medium of neueMedian) {
    // Download
    const localUri = await downloadMedium(medium);
    
    // KI-Analyse
    const detection = await detectWildlifeEnsemble(localUri);
    
    // Erstelle Galerie-Foto
    const foto: GalerieFoto = {
      id: generateId(),
      uri: localUri,
      thumbnail: await generateThumbnail(localUri),
      gps: kamera.gps,
      zeitpunkt: medium.timestamp,
      kategorie: 'wildkamera',
      quelle: 'wildkamera',
      aiAnalyse: {
        status: 'completed',
        ...detection,
      },
      wildkameraId: kameraId,
    };
    
    await saveToGallery(foto);
    
    // Auto-Eintrag erstellen (falls Wild erkannt)
    if (detection.confidence > 75) {
      const eintrag = await onWildDetected(foto, detection);
      results.push({
        foto,
        eintrag,
        detection,
      });
    }
  }
  
  // 4. Update Statistiken
  await updateWildkameraStats(kameraId, results);
  
  return {
    totalImported: neueMedian.length,
    wildDetected: results.length,
    results,
  };
}
```

#### 4.2 Bewegungsmuster-Analyse

```typescript
interface WildbewegungsAnalyse {
  // Wildkamera-Daten auswerten
  async analyzeMovementPatterns(
    kameraId: string,
    zeitraum: { von: Date; bis: Date }
  ): Promise<BewegungsMuster> {
    // 1. Hole alle Wildkamera-Aufnahmen
    const aufnahmen = await getWildkameraMedia(kameraId, zeitraum);
    
    // 2. Gruppiere nach Wildart
    const byWildart = groupBy(aufnahmen, 'wildart');
    
    // 3. Analysiere jede Wildart
    const muster: Record<string, WildartBewegung> = {};
    
    for (const [wildart, detections] of Object.entries(byWildart)) {
      muster[wildart] = {
        // Zeitliche Muster
        zeitlicheMuster: analyzeTimePatterns(detections),
        
        // Häufigkeit
        frequenz: {
          totalSichtungen: detections.length,
          durchschnittProTag: detections.length / daysBetween(zeitraum.von, zeitraum.bis),
          spitzenzeiten: findPeakTimes(detections),
        },
        
        // Bewegungsrichtung
        bewegungsrichtung: inferDirection(detections, kamera.ausrichtung),
        
        // Gruppengröße
        gruppengroesse: {
          durchschnitt: average(detections.map((d) => d.anzahl)),
          minimum: Math.min(...detections.map((d) => d.anzahl)),
          maximum: Math.max(...detections.map((d) => d.anzahl)),
        },
        
        // Wetter-Korrelation
        wetterKorrelation: correlateWithWeather(detections),
        
        // Mondphasen-Korrelation
        mondphasenKorrelation: correlateWithMoonPhase(detections),
      };
    }
    
    return {
      kameraId,
      zeitraum,
      muster,
      zusammenfassung: generateSummary(muster),
    };
  }
}

interface WildartBewegung {
  zeitlicheMuster: {
    morgengrauen: number; // Sichtungen
    vormittag: number;
    mittag: number;
    nachmittag: number;
    abenddaemmerung: number;
    nacht: number;
  };
  
  frequenz: {
    totalSichtungen: number;
    durchschnittProTag: number;
    spitzenzeiten: Array<{
      zeitfenster: string;
      sichtungen: number;
    }>;
  };
  
  bewegungsrichtung: {
    richtung: 'links_nach_rechts' | 'rechts_nach_links' | 'auf_kamera_zu' | 'von_kamera_weg';
    confidence: number;
  };
  
  gruppengroesse: {
    durchschnitt: number;
    minimum: number;
    maximum: number;
  };
  
  wetterKorrelation: {
    beiWind: number;      // Sichtungen bei Wind
    beiRegen: number;
    beiSchnee: number;
    korrelationsKoeffizient: number;
  };
  
  mondphasenKorrelation: {
    neumond: number;
    zunehmend: number;
    vollmond: number;
    abnehmend: number;
  };
}
```

---

### 5. INTEGRATION IN AI-RECOMMENDATIONS (Phase 5 Enhancement)

#### 5.1 Wildkamera-Daten in Training-Pipeline

```typescript
// Erweiterung: trainingDataService.ts

export async function collectTrainingDataEnhanced(
  revierId: string
): Promise<HuntingEvent[]> {
  // Bisherige Daten (Abschüsse + Beobachtungen)
  const manualEvents = await collectTrainingData(revierId);
  
  // NEU: Wildkamera-Sichtungen hinzufügen
  const wildkameraEvents = await collectWildkameraData(revierId);
  
  // Kombinieren
  return [...manualEvents, ...wildkameraEvents];
}

async function collectWildkameraData(
  revierId: string
): Promise<HuntingEvent[]> {
  // 1. Hole alle Wildkameras im Revier
  const kameras = await getWildkamerasForRevier(revierId);
  
  // 2. Hole Aufnahmen der letzten 365 Tage
  const events: HuntingEvent[] = [];
  
  for (const kamera of kameras) {
    const aufnahmen = await getWildkameraMedia(kamera.id, {
      von: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      bis: new Date(),
    });
    
    // 3. Konvertiere zu HuntingEvents
    for (const aufnahme of aufnahmen) {
      if (!aufnahme.aiAnalyse || aufnahme.aiAnalyse.confidence < 60) {
        continue; // Zu unsicher
      }
      
      events.push({
        typ: 'beobachtung', // Wildkamera = immer Beobachtung
        wildart: aufnahme.aiAnalyse.wildart,
        anzahl: aufnahme.aiAnalyse.anzahl,
        geschlecht: aufnahme.aiAnalyse.geschlecht || 'unbekannt',
        altersklasse: aufnahme.aiAnalyse.altersklasse,
        
        gps: kamera.gps,
        zeitpunkt: aufnahme.zeitpunkt,
        
        // Wetter (falls verfügbar)
        wetterDaten: await getHistoricalWeather(kamera.gps, aufnahme.zeitpunkt),
        
        tageszeit: calculateDaytime(aufnahme.zeitpunkt),
        wochentag: aufnahme.zeitpunkt.getDay(),
        jahreszeit: calculateSeason(aufnahme.zeitpunkt),
        
        poiId: kamera.poi_id,
        distanzZumPoi: 0, // Kamera IST am POI
        
        erfolgreich: false, // Nur Sichtung, kein Abschuss
        
        // Metadaten
        quelle: 'wildkamera',
        wildkameraId: kamera.id,
        kiConfidence: aufnahme.aiAnalyse.confidence,
      });
    }
  }
  
  return events;
}
```

#### 5.2 Erweiterte Recommendations mit Wildkamera-Insights

```typescript
// Erweiterung: recommendationEngine.ts

async function generateBestSpotRecommendationsEnhanced(
  trainingData: HuntingEvent[],
  weather: EnhancedWeather,
  wildart: string | undefined,
  config: AIRecommendationConfig
): Promise<Recommendation[]> {
  // ... bisherige Logik ...
  
  // NEU: Wildkamera-Insights hinzufügen
  const wildkameraInsights = await getWildkameraInsights(trainingData);
  
  for (const hotspot of hotspots) {
    // Prüfe ob Wildkamera in der Nähe
    const nearbyKameras = findNearbyWildkameras(hotspot.position, 500); // 500m Radius
    
    if (nearbyKameras.length > 0) {
      // Hole letzte Aktivität
      const recentActivity = await getRecentWildkameraActivity(
        nearbyKameras.map((k) => k.id),
        wildart,
        7 // letzte 7 Tage
      );
      
      if (recentActivity.sichtungen > 0) {
        // Boost Score wenn Wildkamera kürzlich Wild gesehen hat
        spotScore.gesamtScore += 15;
        spotScore.scores.wildkameraAktivitaet = recentActivity.sichtungen * 5;
        
        gruende.push(
          `🎥 Wildkamera: ${recentActivity.sichtungen}x ${wildart} in letzten 7 Tagen gesichtet`
        );
        gruende.push(
          `⏰ Letzte Sichtung: ${formatRelativeTime(recentActivity.letzteZeit)}`
        );
      }
    }
  }
  
  // ... weiter ...
}

interface WildkameraInsights {
  kameraId: string;
  position: GPSKoordinaten;
  letzteAktivitaet: {
    wildart: string;
    zeitpunkt: Date;
    anzahl: number;
  }[];
  aktivitaetsLevel: 'hoch' | 'mittel' | 'niedrig';
  empfohleneJagdzeit: string;
}
```

---

## 🏗️ IMPLEMENTIERUNGS-STRATEGIE

### **Option A: Schrittweise Integration (EMPFOHLEN)**

**Phase 7A: Foto-Import & Galerie** (2-3 Wochen)
1. Background Photo Scanner
2. Point-in-Polygon GPS-Filter
3. Revier-Galerie UI
4. Foto-Kategorisierung

**Phase 7B: Wildart-Erkennung** (3-4 Wochen)
1. Deepfaune API Integration
2. iNaturalist Fallback
3. Custom TensorFlow Lite Model
4. Ensemble Learning
5. Geschlechts- & Größenbestimmung

**Phase 7C: Auto-Eintrag System** (2-3 Wochen)
1. Sichtung Auto-Generierung
2. Abschuss Auto-Dokumentation
3. Vorschlags-System (User-Review)
4. Wildmarken-Zuordnung

**Phase 7D: Wildkamera-Integration** (4-5 Wochen)
1. Wildkamera-Verwaltung UI
2. Multi-Brand Connectivity (WiFi, BT, Cellular, SD)
3. Auto-Import Pipeline
4. Bewegungsmuster-Analyse
5. Integration in AI-Recommendations

**Total: 11-15 Wochen (3-4 Monate)**

---

### **Option B: MVP First Approach**

**Phase 7 MVP** (6-8 Wochen):
- Nur Deepfaune API (kein Custom Model)
- Nur Foto-Import (keine Wildkameras)
- Nur Vorschläge (kein Auto-Eintrag)
- Manuelle Bestätigung erforderlich

**Später ausbauen:**
- Custom Model Training
- Wildkamera-Support
- Full-Auto Modus

---

## 🎯 MEINE EMPFEHLUNG

### **Status Quo Analyse:**

✅ **Phase 4:** Weather Intelligence - FERTIG
✅ **Phase 5:** AI Recommendations - FERTIG
🔄 **Phase 6:** Gesellschaftsjagd - GEPLANT

### **Integration in bestehende Phasen:**

Die KI-Vision Features können **PARALLEL** entwickelt werden:

1. **Phase 5 Enhancement** (JETZT):
   - `trainingDataService.ts` erweitern für Wildkamera-Daten
   - `recommendationEngine.ts` um Wildkamera-Insights ergänzen
   - **Aufwand:** 1-2 Wochen
   - **Benefit:** Sofortige Verbesserung der AI-Recommendations

2. **Phase 7 (nach Phase 6)**:
   - Vollständige KI-Vision Implementation
   - Deepfaune Integration
   - Wildkamera-Support
   - **Aufwand:** 3-4 Monate
   - **Benefit:** Revolutionäre User Experience

---

## 📝 FAZIT & NÄCHSTE SCHRITTE

### Was ist bereits implementiert?
- ✅ Foto-Upload zu Einträgen (Phase 1-3)
- ✅ GPS-Erfassung (Phase 1-3)
- ✅ AI-Training-Pipeline (Phase 5)
- ✅ Recommendation Engine (Phase 5)

### Was muss noch gemacht werden?
- ⏳ Foto-Scanner (Background Service)
- ⏳ Wildart-Erkennung (Deepfaune API)
- ⏳ Auto-Eintrag System
- ⏳ Wildkamera-Integration
- ⏳ Bewegungsmuster-Analyse

### Empfehlung:
**STRATEGIE: Hybrid Approach**

1. **SOFORT (Phase 5 Enhancement):**
   - Wildkamera-Datenstrukturen in DB erstellen
   - `trainingDataService` erweitern
   - Mock-Daten für Testing

2. **NACH PHASE 6 (Phase 7):**
   - Vollständige KI-Vision Implementation
   - Deepfaune Integration
   - Production-Ready

**Zeitplan:**
- Phase 5 Enhancement: 1-2 Wochen
- Phase 6 (Gesellschaftsjagd): 8-10 Wochen
- Phase 7 (KI-Vision): 12-16 Wochen
- **Total bis KI-Vision live: 5-6 Monate**

---

**Soll ich mit Phase 5 Enhancement beginnen (Wildkamera-Datenstrukturen) oder erst Phase 6 planen?**
