# Dataset-Recherche: Anschuss-Erkennung & Nachsuche-Training
**Datum**: 22. Januar 2026  
**Ziel**: Trainingsdaten für KI-gestützte Anschuss-Diagnose & Fundort-Prediction

---

## 🎯 BENÖTIGTE DATEN

### 1. Anschusszeichen-Fotos
**Kategorien**:
- ✅ Blutspuren (Farbe, Menge, Verteilung)
  * Lungenblut (hellrot, schaumig)
  * Leberblut (dunkelrot, dickflüssig)
  * Pansenblut (grünlich, mit Mageninhalt)
  * Muskelblut (wässrig, hellrot)
  * Arterienblut (hellrot, spritzend)

- ✅ Haare & Grannen
  * Deckhaar (verschiedene Wildarten)
  * Grannen (helle Haare vom Bauch)
  * Winterhaar vs. Sommerhaar
  * Verschiedene Farben (Reh, Rot, Schwarz)

- ✅ Wildpret & Knochensplitter
  * Lungenstücke (rosa, schwammig)
  * Pansenfetzen (grün, unverdautes Futter)
  * Knochensplitter (weiß, bei Knochenschuss)
  * Leberstücke (dunkelrot, fest)

- ✅ Fährten & Bodensignaturen
  * Normale Fährte vs. Fluchtfährte
  * Schleifspuren (verletzter Lauf)
  * Weit auseinanderstehende Abdrücke (Flucht)
  * Blutfährte (Tropfen-Muster)

**Benötigte Menge**: 10,000+ annotierte Bilder pro Kategorie

---

## 📊 DATENQUELLEN - RECHERCHE-ERGEBNISSE

### A. Öffentliche Datasets

#### 1. **Wildlife Camera Datasets** (Basis für Wildart-Erkennung)
- **Kaggle - Wildlife Detection**
  * URL: kaggle.com/datasets (Wildlife, Deer, Wild Boar)
  * Inhalt: 50,000+ Wildkamera-Bilder
  * Relevanz: ⭐⭐⭐ (Wildart OK, aber KEINE Anschusszeichen)
  
- **LILA BC (Labeled Information Library of Alexandria: Biology and Conservation)**
  * URL: lila.science
  * Inhalt: 1M+ Wildlife-Bilder von Camera Traps
  * Relevanz: ⭐⭐ (Nur lebende Tiere, keine Jagd-Kontext)

- **iNaturalist**
  * URL: inaturalist.org
  * Inhalt: 100M+ Biodiversitäts-Bilder
  * Relevanz: ⭐ (Citizen Science, keine Anschusszeichen)

#### 2. **Forensic/Research Datasets** (Hoffnung auf Anschusszeichen)
- **Veterinärmedizinische Fakultäten**
  * LMU München - Lehrstuhl für Wildtierkunde
  * TiHo Hannover - Wildtier-Pathologie
  * FU Berlin - Institut für Tierpathologie
  * **Anfrage**: Anonymisierte Anschusszeichen-Fotos für Forschung
  * Relevanz: ⭐⭐⭐⭐⭐ (BESTE QUELLE - akademisch)

- **Jagdverbände & Forschungsprojekte**
  * DJV (Deutscher Jagdverband) - Wildtier-Informationssystem
  * ÖJV (Österreichischer Jagdverband)
  * Forschungsstelle für Jagdkunde und Wildschadensverhütung (Bonn)
  * **Anfrage**: Kooperation für ML-Forschung
  * Relevanz: ⭐⭐⭐⭐⭐ (IDEAL - praxisnah)

#### 3. **Forensic Wildlife Investigation** (International)
- **US Fish & Wildlife Forensics Lab**
  * URL: fws.gov/lab
  * Inhalt: Wildlife Crime Investigation Data
  * Relevanz: ⭐⭐ (Fokus auf Wilderei, nicht Jagd)

- **UK National Wildlife Crime Unit**
  * Inhalt: Forensic Wildlife Data
  * Relevanz: ⭐⭐ (Kriminalität-Fokus)

---

### B. Crowdsourcing & User-Generated Data

#### 1. **Jagd-Foren & Communities** (Existierende Bilder)
- **Wild und Hund Forum** (wildundhund.de/forum)
  * Thema: "Anschuss-Bericht", "Nachsuche"
  * Potenzial: 5,000+ Bilder (Nutzer teilen oft Fotos)
  * **Strategie**: Community-Anfrage, Kooperation

- **Jagd1.de Forum**
  * Ähnlich: Viele Erfahrungsberichte mit Fotos
  * Potenzial: 3,000+ Bilder

- **Jagdforen.de**
  * Deutsche Jäger-Community
  * Potenzial: 2,000+ Bilder

- **Reddit r/Hunting, r/Deer**
  * International, oft mit Fotos
  * Potenzial: 10,000+ Bilder (aber weniger Anschusszeichen)

#### 2. **In-App Crowdsourcing** (HNTR LEGEND PRO - EIGENE DATENBANK)
**Strategie**: User-Contributed Training Data

**Implementation**:
```typescript
interface UserContributedTrainingData {
  id: string;
  user_id: string;
  
  // Typ
  typ: 'Anschusszeichen' | 'Wildpret' | 'Fährte' | 'Fundort';
  
  // Bild
  bild_uri: string;
  aufnahme_datum: Date;
  
  // Annotationen (User)
  wildart: WildArt;
  blutfarbe?: string;
  blutmenge?: string;
  haare_typ?: string;
  wildpret_typ?: string;
  trefferlage?: TrefferArt;
  
  // Outcome (wichtig für Fundort-Training)
  gefunden?: boolean;
  fundort_entfernung?: number;      // Meter vom Anschuss
  fluchtrichtung?: number;           // 0-360°
  wartezeit?: number;                // Minuten
  
  // Qualität
  verifiziert: boolean;              // Von Experten geprüft
  quality_score: number;             // 0-100
  
  // ML-Training
  verwendet_für_training: boolean;
  model_version?: string;
  
  // Privacy
  anonymisiert: boolean;
  öffentlich: boolean;               // Nutzer erlaubt Training-Nutzung
  
  created_at: Date;
}
```

**Gamification** (User motivieren):
- 🏆 **Punkte**: +100 pro hochgeladenem Foto (verifiziert)
- 🥇 **Badges**: "Datensammler", "KI-Trainer" (50/100/500 Fotos)
- 📊 **Statistik**: "Deine Fotos haben X Modell-Updates ermöglicht"
- 🎁 **Belohnung**: 1 Monat Premium gratis (nach 20 verifizierten Fotos)

**Rechtliches**:
- ✅ User muss explizit zustimmen (Checkbox)
- ✅ Anonymisierung: GPS-Koordinaten unscharf (±500m)
- ✅ Kein Wild-Diebstahl: Nur eigene Jagden
- ✅ DSGVO-konform: Widerruf jederzeit

**Erwartung**: 5,000+ Bilder im ersten Jahr (bei 10,000 Usern)

---

### C. Kommerzielle Datenbanken

#### 1. **Getty Images / Alamy**
- Stock-Fotos: Jagd, Wildtiere
- Kosten: €€€ (teuer, aber hochwertig)
- Relevanz: ⭐⭐ (Staged, nicht authentisch)

#### 2. **Spezialisierte Jagd-Fotografie**
- **Blaser Group, Swarovski Optik**
  * Marketing-Fotos (oft mit Anschuss-Szenen)
  * **Anfrage**: Lizenz für ML-Training
  * Relevanz: ⭐⭐⭐

---

## 🎓 AKADEMISCHE KOOPERATIONEN

### Universitäten & Forschungseinrichtungen

#### 1. **Deutschland**
- **LMU München** - Lehrstuhl für Wildtierkunde und Wildtierökologie
  * Prof. Dr. Köhnemann
  * Fokus: Schalenwild, Schwarzwild-Forschung
  * **Potenzial**: Pathologie-Fotos (Sektionen)

- **TiHo Hannover** - Stiftung Tierärztliche Hochschule
  * Institut für Terrestrische und Aquatische Wildtierforschung
  * **Potenzial**: Wildtier-Pathologie Datenbank

- **Forschungsstelle für Jagdkunde und Wildschadensverhütung (Bonn)**
  * Bundesbehörde
  * **Potenzial**: Langzeitstudien mit Fotomaterial

#### 2. **Österreich & Schweiz**
- **Universität für Bodenkultur Wien (BOKU)**
  * Institut für Wildbiologie und Jagdwirtschaft
  * **Potenzial**: Europäische Wildarten

- **FiBL Schweiz** (Forschungsinstitut für biologischen Landbau)
  * Wild-Management Forschung

---

## 🔬 SYNTHETIC DATA GENERATION

**Problem**: Echte Anschusszeichen-Fotos sind rar und schwer zu bekommen

**Lösung**: Generative AI für synthetische Trainingsdaten

### Strategie
1. **Diffusion Models** (Stable Diffusion, DALL-E)
   - Prompt: "Deer blood trail on forest floor, hunting tracking, forensic photo"
   - Generiere: 10,000 Variationen
   - **Vorsicht**: Unrealistisch, nur als Ergänzung

2. **Data Augmentation** (echte Fotos erweitern)
   - Rotation, Flip, Crop, Color Jitter
   - Blur, Noise (realistische Kamera-Bedingungen)
   - Aus 1 Foto → 20 Varianten

3. **3D Simulation** (für Fundort-Prediction)
   - Terrain-Modelle (Unity/Unreal Engine)
   - Simuliere Fluchtverhalten basierend auf Trefferlage
   - Generiere Heatmaps für Wahrscheinlichkeits-Zonen

---

## 📋 DATASET-ANFORDERUNGEN (Minimum Viable)

### Phase 1: MVP (3 Monate)
**Ziel**: Basic Anschuss-Diagnose (5 Hauptklassen)

| Kategorie | Klassen | Bilder/Klasse | Gesamt |
|-----------|---------|---------------|--------|
| Blutfarbe | Hellrot, Dunkelrot, Schaumig, Grünlich, Bräunlich | 1,000 | 5,000 |
| Blutmenge | Wenig, Mittel, Viel | 1,500 | 4,500 |
| Haare | Ja/Nein + Typ (4 Wildarten) | 800 | 3,200 |
| Wildpret | Lunge, Pansen, Knochen, Keins | 600 | 2,400 |
| **GESAMT** | | | **15,100** |

**Quellen**:
- User-Crowdsourcing: 3,000
- Jagd-Foren (Anfrage): 5,000
- Veterinär-Unis (Anfrage): 5,000
- Synthetic/Augmentation: 2,100

### Phase 2: Production (6-12 Monate)
**Ziel**: Advanced Diagnose (12 Trefferlagen) + Fundort-Prediction

| Kategorie | Klassen | Bilder/Klasse | Gesamt |
|-----------|---------|---------------|--------|
| Trefferlage | Blatt, Leber, Pansen, Lauf, Keule, Träger, etc. (12) | 1,500 | 18,000 |
| Fundort-Korrelation | Anschuss + GPS Fundort (Cases) | N/A | 5,000 |
| **GESAMT** | | | **23,000+** |

**Quellen**:
- User-Crowdsourcing (wachsend): 10,000
- DJV-Kooperation: 8,000
- Research Projects: 5,000

---

## 🚀 AKTIONSPLAN

### Sofort (Woche 1-2)
1. ✅ **Anfrage an Veterinär-Fakultäten**
   - LMU München, TiHo Hannover, FU Berlin
   - Template-Email: Forschungskooperation ML

2. ✅ **Anfrage an DJV/ÖJV**
   - Deutscher Jagdverband
   - Wildtier-Informationssystem Daten

3. ✅ **Community-Posting in Foren**
   - Wild und Hund, Jagd1.de, Jagdforen.de
   - "HNTR LEGEND sucht Anschusszeichen-Fotos für KI"

### Kurz-Term (Woche 3-8)
4. ✅ **User-Crowdsourcing implementieren**
   - UserContributedTrainingData Tabelle
   - Upload-Screen in App
   - Gamification (Punkte, Badges)

5. ✅ **Data Augmentation Pipeline**
   - Python Script: Augmentiere vorhandene Bilder (20x)
   - Tools: Albumentations, imgaug

### Mittel-Term (Monat 3-6)
6. ✅ **Synthetic Data Generation**
   - Stable Diffusion fine-tuning
   - 3D Simulation für Fundort-Prediction

7. ✅ **Kontinuierliches Training**
   - User-Fotos → Auto-Annotation (ML-assisted)
   - Experten-Review → Verifizierung
   - Model-Updates alle 2 Wochen

---

## 📧 EMAIL-TEMPLATES (Anfragen)

### Template 1: Veterinär-Fakultäten
```
Betreff: Forschungskooperation - ML-gestützte Anschuss-Diagnose

Sehr geehrte Damen und Herren,

wir entwickeln HNTR LEGEND, eine KI-gestützte Jagd-App zur Optimierung 
von Nachsuchen nach Anschuss. Ziel ist es, Jägern durch automatische 
Trefferlage-Diagnose (basierend auf Pirschzeichen-Fotos) bessere 
Empfehlungen für erfolgreiche Nachsuchen zu geben.

Für das Training unseres ML-Models benötigen wir annotierte Bilder von:
- Anschusszeichen (Blut, Haare, Wildpret)
- Pathologische Aufnahmen (Trefferzonen, Gewebetypen)

Würden Sie eine Forschungskooperation in Betracht ziehen? 
Wir würden alle Daten anonymisiert verarbeiten und ausschließlich 
für nicht-kommerzielle Forschung nutzen.

Gerne würden wir Ihre Arbeit in unserer App als "Wissenschaftlicher 
Partner" sichtbar machen.

Mit freundlichen Grüßen,
[Name]
HNTR LEGEND Team
```

### Template 2: DJV (Deutscher Jagdverband)
```
Betreff: Kooperation - Digitalisierung der Nachsuche

Sehr geehrter Herr [Name],

als Mitglieder des DJV möchten wir die Jagdpraxis durch KI-Technologie 
verbessern. Unser Projekt HNTR LEGEND fokussiert sich auf:

1. Automatische Trefferlage-Diagnose (Foto → KI → Empfehlung)
2. GPS-gestützte Fundort-Vorhersage
3. Optimierte Nachsuche-Strategien

Um unser ML-Model zu trainieren, würden wir gerne auf das 
Wildtier-Informationssystem des DJV zugreifen (anonymisiert).

Ziel: Bergungsquote von verantwortungsbewusst beschossenem Wild erhöhen.

Wir würden die Kooperation gerne öffentlich machen und den DJV als 
offiziellen Partner nennen.

Können wir einen Termin vereinbaren?

Waidmannsheil,
[Name]
```

### Template 3: Jagd-Foren
```
Titel: HNTR LEGEND sucht Anschusszeichen-Fotos für KI-Training

Hallo Jägerschaft,

wir entwickeln eine KI, die Jägern bei der Nachsuche hilft. 
Die App soll automatisch aus einem Foto der Pirschzeichen 
(Blut, Haare, etc.) die Trefferlage bestimmen und eine 
Nachsuche-Strategie empfehlen.

**Wir brauchen eure Hilfe!**

Habt ihr Fotos von:
- Anschusszeichen (Blut, Haare, Wildpret)
- Erfolgreichen/erfolglosen Nachsuchen
- GPS-Tracks (Anschuss → Fundort)

**Was ihr bekommt:**
- Lifetime Premium (gratis)
- Name in der App als "KI-Trainer"
- Besseres Tool für alle Jäger

Datenschutz: Alle Fotos werden anonymisiert (GPS unscharf).

Interesse? PM an mich oder Email: [email]

Waidmannsheil!
```

---

## 🎯 FUNDORT-PREDICTION (Zusatz-Feature)

**Ziel**: Basierend auf Trefferlage + Fluchtrichtung → Wahrscheinlichste Fundorte vorhersagen

### ML-Ansatz: Survival Analysis + Geospatial Modeling

**Input Features**:
1. **Trefferlage** (Hauptdiagnose)
   - Blattschuss → 50-200m
   - Lebertreffer → 500-2000m
   - Pansenschuss → 1000-5000m

2. **Pirschzeichen-Intensität**
   - Viel Blut → Kürzere Flucht
   - Wenig Blut → Längere Flucht

3. **Wild-Reaktion**
   - Zusammenbruch → 0-50m
   - Hochflüchtig → 100-500m
   - Langsame Flucht → 200-1000m

4. **Terrain**
   - Wald (Deckung) → Wild bleibt länger flüchtig
   - Feld (offen) → Wild sucht Deckung
   - Hang (bergab) → Weitere Flucht
   - Wasser → Wild sucht oft Wasser

5. **Wetter**
   - Regen → Schweiß wird weggespült (schwerer zu folgen)
   - Wind → Richtungsänderung möglich
   - Temperatur → Verhitzen (kürzere Flucht)

6. **Tageszeit**
   - Tag → Wild flieht zu Deckung
   - Nacht → Wild bleibt oft in Nähe

**Output**: Wahrscheinlichkeits-Heatmap
```typescript
interface FundortPrediction {
  wahrscheinlichkeitsZonen: Array<{
    polygon: GeoPoint[];             // Bereich auf Karte
    wahrscheinlichkeit: number;      // 0-100%
    priorität: 1 | 2 | 3 | 4 | 5;   // Suchreihenfolge
    geschätzte_entfernung: {
      min: number;                   // Meter
      max: number;
      durchschnitt: number;
    };
    terrain_typ: string;             // "Dickung", "Feld", "Gewässer"
    begründung: string;              // "Lebertreffer flieht oft zu Wasser"
  }>;
  
  empfohlene_suchRoute: GeoPoint[];  // GPS-Route für optimale Suche
  
  geschätzte_suchDauer: number;      // Minuten
  benötigte_helfer: number;          // Anzahl Personen
}
```

**Training Data** (von Usern):
```sql
-- Jeder erfolgreiche/erfolglose Nachsuche-Fall wird Training-Data
SELECT 
  shot_analysis.hauptdiagnose,
  shot_analysis.blut_menge,
  shot_analysis.reaktion_typ,
  nachsuche_tracking.fluchtrichtung,
  nachsuche_tracking.entfernung_vom_anschuss,
  nachsuche_tracking.fundort_lat,
  nachsuche_tracking.fundort_lng,
  nachsuche_tracking.gefunden,
  nachsuche_tracking.dauer_minuten
FROM shot_analysis
JOIN nachsuche_tracking ON shot_analysis.id = nachsuche_tracking.shot_analysis_id
WHERE nachsuche_tracking.gefunden = 1;
```

**ML-Algorithmus**: Random Forest Regression + Geospatial Clustering
- Input: 20+ Features
- Output: Entfernung (m) + Richtungsabweichung (°)
- Accuracy Target: 70%+ (Wild innerhalb vorhergesagter Zone)

---

## ✅ SUCCESS METRICS

**Dataset Goals**:
- ✅ MVP (3 Monate): 15,000+ Bilder (Basis-Diagnose)
- ✅ Production (12 Monate): 50,000+ Bilder (Advanced Diagnose)
- ✅ Fundort-Fälle: 5,000+ (für Prediction-Training)

**Model Performance**:
- ✅ Blutfarbe-Klassifikation: 90%+ Accuracy
- ✅ Trefferlage-Diagnose: 85%+ Accuracy (Top-1), 95%+ (Top-3)
- ✅ Fundort-Prediction: 70%+ (Wild in vorhergesagter Zone)

**User Engagement**:
- ✅ 30%+ User laden Fotos hoch (Crowdsourcing)
- ✅ 5,000+ verifizierte Training-Bilder (Jahr 1)

---

**Status**: Recherche Complete ✅  
**Next**: TypeScript Types + Database (inkl. UserContributedTrainingData)
**Priority**: Crowdsourcing-Implementation (kritisch für Datenbeschaffung)
