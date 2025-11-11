# 📦 Karton-Kostenrechner

Eine webbasierte Anwendung zur Berechnung und Visualisierung der Kostenunterschiede zwischen **RSC-Kartons (FEFCO 0201)** und **Wrap-Around-Kartons (FEFCO 0409)**.

## 🎯 Funktionen

- **Präzise Flächenberechnungen** basierend auf FEFCO-Standards
- **Kostenvergleich** inklusive Material- und Klebekosten
- **Klebstoff-Optionen**: Klebeband vs. Hotmelt-Schmelzklebstoff
- **Interaktive Visualisierungen** mit Diagrammen und Grafiken
- **Produktionsvolumen-Hochrechnung** (1.000 bis 1.000.000 Stück)
- **Export-Funktionen**: Excel, CSV und Markdown-Reports
- **Deutsche Benutzeroberfläche**

## 🚀 Installation

### Voraussetzungen

- Python 3.8 oder höher
- pip (Python Package Manager)

### Schritt 1: Repository klonen oder Dateien herunterladen

```bash
cd carton_cost_calculator
```

### Schritt 2: Virtuelle Umgebung erstellen (empfohlen)

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### Schritt 3: Abhängigkeiten installieren

```bash
pip install -r requirements.txt
```

## 💻 Anwendung starten

```bash
streamlit run app.py
```

Die Anwendung öffnet sich automatisch in Ihrem Standard-Webbrowser unter `http://localhost:8501`

## 📋 Verwendung

### Eingabeparameter

#### 1. Kartonabmessungen
- **Länge** (mm): Innenmaß des Kartons
- **Breite** (mm): Innenmaß des Kartons
- **Höhe** (mm): Höhe des Kartons

#### 2. Material-Spezifikationen
- **Wellpappe-Typ**:
  - B-Welle (2.5mm) - für leichte Produkte
  - C-Welle (3.5mm) - Standardwahl (80% aller Kartons)
  - E-Welle (1.5mm) - für kleine, leichte Artikel
  - BC-Welle (6.0mm) - für schwere Produkte

#### 3. Kostenparameter
- **RSC Preis/1000**: Preis für 1.000 RSC-Kartons (€)
- **WA Preis/1000**: Preis für 1.000 Wrap-Around-Zuschnitte (€)

#### 4. RSC Klebekosten (Klebeband)
- **Preis pro Rolle**: Kosten für eine Klebebandrolle (€)
- **Meter pro Rolle**: Länge einer Rolle (typisch 66m)
- **Verschlussmuster**:
  - H-Muster (empfohlen für Lasten >10kg)
  - Einfach

#### 5. Wrap-Around Klebekosten (Hotmelt)
- **Preis pro kg**: Kosten für Hotmelt-Klebstoff (€/kg)
- **Raupenbreite**:
  - 1.5mm (0.50 g/m) - sparsam
  - 3mm (2.0 g/m) - Standard
  - 5mm (6.67 g/m) - hohe Festigkeit

#### 6. Produktionsvolumen
- Wählen Sie zwischen 1.000, 10.000, 100.000 oder 1.000.000 Stück

### Ausgaben

Die Anwendung bietet vier Hauptbereiche:

#### 📊 Kostenvergleich
- Übersichtlicher Vergleich aller Kosten
- Direkte Gegenüberstellung von RSC und Wrap-Around
- Einsparungsberechnung in Euro und Prozent
- Detaillierte Vergleichstabelle
- Hochrechnung für verschiedene Produktionsvolumina

#### 📐 Technische Details
- Präzise Zuschnittmaße für beide Kartontypen
- Berechnungsformeln mit Ihren Werten
- Klebedetails und Nahtstrecken
- Material-Effizienz-Kennzahlen
- Logistik-Vorteile

#### 📈 Visualisierung
- Kostenaufschlüsselung als gestapeltes Balkendiagramm
- Kumulierte Ersparnis-Kurve
- Flächenvergleich
- Kostenverteilung als Kreisdiagramme

#### 💾 Export
- Excel-Export mit mehreren Arbeitsblättern
- CSV-Export der Vergleichstabelle
- Markdown-Report mit Zusammenfassung
- Alle Dateien benannt nach Ihren Abmessungen

## 🔬 Berechnungsmethodik

### RSC-Karton (FEFCO 0201)

Der Regular Slotted Container ist der weltweit häufigste Kartontyp mit über 80% Marktanteil.

**Zuschnittsberechnung:**

```
Bogenlänge = 2L + 2B + 4t + 25mm + 20mm
- L = Länge (innen)
- B = Breite (innen)
- t = Materialstärke
- 25mm = Klebelasche für Herstellernaht
- 20mm = Verschnittzuschlag

Bogenbreite = B + 2H + 4t + 20mm
- H = Höhe
- 4t = Kompensation für Materialstärke an Faltkanten
- 20mm = Verschnittzuschlag

Fläche = Bogenlänge × Bogenbreite
```

**Klebstoffverbrauch:**

Klebeband (H-Muster):
```
Bandlänge = (L + 2B + 150mm) × 2
- Obere und untere Verschlussklappen
- 150mm Überstand für sichere Verklebung
```

Hotmelt (Alternative):
```
Nahtstrecke = H + 2(B + B)
- Herstellernaht entlang der Höhe
- Klappenverschluss oben und unten
Verbrauch = Nahtstrecke × g/m (je nach Raupenbreite)
```

### Wrap-Around-Karton (FEFCO 0409)

Five Panel Folder mit 10% Materialersparnis und 40% besserer Paletten-Effizienz.

**Zuschnittsberechnung:**

```
Bogenlänge = 2L + 2B + 75mm
- Keine vorgeklebte Herstellernaht
- 75mm Standardüberlappung der 5. Platte

Bogenbreite = B + 2H
- Engere Anpassung an Produktmaße
- Keine zusätzlichen Toleranzen nötig

Fläche = Bogenlänge × Bogenbreite
```

**Klebstoffverbrauch:**

Hotmelt (3 Klebestellen):
```
Nahtstrecke = H + 2(L + B)
- Längsnaht der 5. Platte (H)
- Beide Enden versiegelt (2 × Umfang)
Verbrauch = Nahtstrecke × g/m
```

### Kostenkalkulation

```
Materialkosten/Box = Preis/1000 ÷ 1000

RSC Gesamtkosten = Materialkosten + Tape-Kosten
WA Gesamtkosten = Materialkosten + Hotmelt-Kosten

Ersparnis = RSC Gesamtkosten - WA Gesamtkosten
Ersparnis % = (Ersparnis / RSC Gesamtkosten) × 100
```

## 📊 Typische Einsparungen

### Materialeffizienz
- **Flächenersparnis**: 3-15% (typisch 10%)
- **Wegfall Herstellerlasche**: 20-25mm pro Karton
- **Keine Vorklebung**: 7% Herstellungskostenersparnis

### Logistik-Vorteile
- **Paletten-Effizienz**: 20-60% mehr Zuschnitte pro Palette (typisch 40%)
- **Transportkosten**: 10-30% niedriger für Rohkartonage
- **Lagerraum**: 50% weniger Platz beim Verpackungsbetrieb
- **Magazin-Kapazität**: ≈ 2× mehr Zuschnitte pro Füllung

### Produktionsvorteile
- **Simultane Produkteinlage**: Ein Prozessschritt eingespart
- **Geschwindigkeit**: Bis zu 42+ Kartons/Minute
- **Seltener Nachfüllen**: Doppelte Magazin-Kapazität

### Ökologische Vorteile
- **CO₂-Fußabdruck**: Geringer durch Materialeinsparung und Transport-Effizienz
- **Recycling**: 96.5% Recyclingrate für Wellpappe
- **Nachhaltigkeit**: Bis zu 88% recycelter Content möglich

## 🎓 FEFCO-Standards

Die Berechnungen basieren auf den offiziellen Standards der **FEFCO** (Fédération Européenne des Fabricants de Carton Ondulé):

- **FEFCO 0201**: Regular Slotted Container (RSC)
  - Kategorie 02XX = Schlitzkartons
  - Vorgeklebte Herstellernaht
  - Vier gleichlange Klappen (je B/2)
  - Ideal für Top-Load Beladung

- **FEFCO 0409**: Five Panel Wrap-Around
  - Kategorie 04XX = Faltschachteln
  - Komplett flacher Zuschnitt
  - Fünf Paneele ohne Vorklebung
  - Optimal für automatisierte Hochleistungslinien

### Qualitätsstandards

**McKee-Formel für Stapeldruckfestigkeit:**
```
BCT = 5.87 × ECT × √(Materialstärke × Umfang)
```

**Übliche ECT-Bewertungen:**
- 32 ECT: Bis 29 kg (häufigster Standard)
- 44 ECT: Bis 43 kg
- 51 ECT: Bis 54 kg

## 💡 Anwendungsbeispiele

### Beispiel 1: Standard E-Commerce-Karton

**Eingabe:**
- Abmessungen: 400mm × 300mm × 200mm
- Material: C-Welle (3.5mm)
- RSC Preis: 610 €/1000
- WA Preis: 555 €/1000
- Volumen: 100.000 Stück

**Ergebnis:**
- RSC Kosten: 0.6208 €/Box
- WA Kosten: 0.5586 €/Box
- **Ersparnis: 6.220 € bei 100.000 Stück (10%)**

### Beispiel 2: Großserienproduktion

**Eingabe:**
- Abmessungen: 600mm × 400mm × 250mm
- Material: C-Welle (3.5mm)
- Volumen: 1.000.000 Stück

**Ergebnis:**
- Typische Ersparnis: **62.000+ € pro Million Kartons**
- Zusätzlich: 37% weniger LKW-Ladungen für Rohware

## 🔧 Erweiterte Optionen

### Hotmelt vs. Klebeband

Die Anwendung berechnet automatisch beide Varianten für RSC:

**Hotmelt-Vorteile:**
- 50-75% günstigere Materialkosten
- Höhere Strukturfestigkeit (90% Faserausriss)
- Professionelleres Erscheinungsbild
- Höhere Verarbeitungsgeschwindigkeit
- Keine Rollenwechsel

**Klebeband-Vorteile:**
- Geringere Investitionskosten (keine Hotmelt-Anlage)
- Einfacher für manuelle Verpackung
- Leichter zu öffnen für Endverbraucher

### Optimierungsstrategien

**Hotmelt-Optimierung:**
- Punktauftragung statt durchgehender Raupe: bis zu 50% Einsparung
- Korrekte Temperaturkontrolle: verhindert Verschwendung
- Richtige Düsengröße: vermeidet Verstopfung
- Optimierter Kompressionsdruck: minimaler Klebstoff bei ausreichender Haftung

Studien zeigen: Unternehmen verwenden oft 70% mehr Klebstoff als nötig!

## 🌍 Einsatzszenarien

### Ideal für Wrap-Around:
- ✅ Lange, schmale oder flache Produkte
- ✅ Automatisierte Hochleistungslinien (42+ Kartons/min)
- ✅ Hohe Produktionsvolumina (>10.000/Tag)
- ✅ Platzmangel im Lager
- ✅ Optimierung von Transport- und Lagerkosten
- ✅ Enganliegende Verpackung gewünscht

### Ideal für RSC:
- ✅ Manuelle oder semi-automatische Verpackung
- ✅ Variable Produktgrößen
- ✅ Geringe Stückzahlen
- ✅ Top-Load Beladung
- ✅ Bestehende RSC-Infrastruktur

## 🐛 Fehlerbehebung

### Die Anwendung startet nicht

```bash
# Python-Version prüfen (mind. 3.8 erforderlich)
python --version

# Virtuelle Umgebung aktiviert?
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Abhängigkeiten neu installieren
pip install -r requirements.txt --upgrade
```

### Port bereits belegt

```bash
# Anderen Port verwenden
streamlit run app.py --server.port 8502
```

### Excel-Export funktioniert nicht

```bash
# Zusätzliche Abhängigkeiten installieren
pip install openpyxl xlsxwriter --upgrade
```

## 📚 Weitere Ressourcen

- [FEFCO Internationale Verpackungscodes](https://www.fefco.org/)
- [FEFCO Prüfmethoden](https://www.fefco.org/fefco-test-methods)
- [Wellpappen-Industrie Verband (VDW)](https://www.wellpappen-industrie.de/)
- [Corrugated Packaging Alliance](https://www.corrugated.org/)

## 🤝 Support und Feedback

Bei Fragen oder Problemen:
1. Überprüfen Sie die [Fehlerbehebung](#-fehlerbehebung)
2. Erstellen Sie ein Issue im Repository
3. Kontaktieren Sie Ihren Verpackungsspezialisten

## 📄 Lizenz

Diese Anwendung wurde für interne Kalkulationszwecke entwickelt.

## 🔄 Updates und Wartung

### Version 1.0.0 (2025)
- Initiale Version
- RSC und Wrap-Around Berechnungen nach FEFCO-Standards
- Klebstoff-Kostenvergleich (Tape vs. Hotmelt)
- Export-Funktionen (Excel, CSV, Markdown)
- Deutsche Benutzeroberfläche
- Interaktive Visualisierungen

---

**Erstellt mit ❤️ für optimale Verpackungslösungen**
