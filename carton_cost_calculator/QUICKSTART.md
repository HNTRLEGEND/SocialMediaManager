# 🚀 Schnellstart-Anleitung

## In 3 Schritten zur Anwendung

### 1️⃣ Installation

```bash
cd carton_cost_calculator
pip install -r requirements.txt
```

### 2️⃣ Starten

```bash
streamlit run app.py
```

### 3️⃣ Verwenden

Die Anwendung öffnet sich automatisch im Browser unter `http://localhost:8501`

## 📝 Erste Schritte

1. **Kartonabmessungen eingeben** (links in der Sidebar)
   - Länge: z.B. 400 mm
   - Breite: z.B. 300 mm
   - Höhe: z.B. 200 mm

2. **Material auswählen**
   - C-Welle (3.5mm) ist Standard

3. **Preise eingeben**
   - RSC Preis/1000: z.B. 610 €
   - Wrap-Around Preis/1000: z.B. 555 €

4. **Ergebnisse ansehen**
   - Tab "Kostenvergleich" für Übersicht
   - Tab "Visualisierung" für Diagramme
   - Tab "Export" zum Speichern

## 💡 Beispielwerte

Für einen schnellen Test verwenden Sie:
- Abmessungen: 400 × 300 × 200 mm
- Material: C-Welle (3.5mm)
- RSC Preis: 610 €/1000
- Wrap-Around Preis: 555 €/1000
- Klebeband: 2.50 €/Rolle (66m)
- Hotmelt: 3.00 €/kg, 3mm Raupe
- Volumen: 100.000 Stück

**Erwartetes Ergebnis:** ~10% Ersparnis mit Wrap-Around

## 🆘 Probleme?

```bash
# Python-Version prüfen (mind. 3.8)
python --version

# Anderen Port verwenden
streamlit run app.py --server.port 8502

# Abhängigkeiten neu installieren
pip install -r requirements.txt --upgrade
```

Mehr Details im [README.md](README.md)
