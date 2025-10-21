# NODE 10: WEBHOOK TRIGGER

## Konfiguration in n8n:

**Node-Typ:** Webhook
**HTTP-Methode:** POST
**Pfad:** `lead-intake` (oder beliebig)
**Authentication:** None (oder API Key je nach Bedarf)

## Beschreibung:

Dieser Node empfängt eingehende Lead-Daten von:
- Webformularen
- CRM-Systemen
- Marketing-Automation-Tools
- Manuellen API-Calls

## Erwartetes Eingabeformat (JSON):

```json
{
  "Lead_ID": "LEAD_250001",
  "Firmenname": "Musterfirma GmbH",
  "fullName": "Max Mustermann",
  "Vorname": "Max",
  "Nachname": "Mustermann",
  "Email": "max@musterfirma.de",
  "Phone": "+49 123 456789",
  "Adresse": "Musterstraße 123, 12345 Musterstadt",
  "Website": "https://musterfirma.de",
  "Customer_Type": "Business",
  "Energieverbrauch_Jahr_kWh": 75000,
  "Energieverbrauch_Tag_kWh": 205,
  "Energieerzeugung_PV_Jahr_kWh": 45000,
  "Speicherkapazitaet_kWh": 20,
  "Wechselrichterleistung_kW": 30,
  "Batterietyp": "LiFePO4",
  "Anfrage_typ": "Neubau",
  "Projektziel": "Autarkie erhöhen",
  "Einsatzbereich": "Gewerbe",
  "Einsatzzweck": "Lastspitzen-Kappung",
  "Investitionsrahmen": "100-200k",
  "Kommentar": "Dringend - aktueller Vertrag läuft aus"
}
```

## Felder (ANPASSEN für andere Branchen):

Ersetze energie-spezifische Felder durch deine Branchenfelder:

**Beispiel Software:**
```json
{
  "Nutzeranzahl": 50,
  "Lizenzmodell": "Enterprise",
  "Tech_Stack": "React, Node.js"
}
```

**Beispiel Maschinenbau:**
```json
{
  "Produktionsvolumen_Jahr": 10000,
  "Maschinentyp": "CNC-Fräse",
  "Wartungsintervall_Monate": 6
}
```

**Beispiel Immobilien:**
```json
{
  "Quadratmeter": 150,
  "Zimmeranzahl": 5,
  "Baujahr": 2010
}
```

## Webhook-Response:

Der Webhook sollte eine Tracking-ID zurückgeben:
```json
{
  "status": "success",
  "message": "Lead erfolgreich empfangen",
  "tracking_id": "TRACK_20250121_001",
  "Lead_ID": "LEAD_250001"
}
```
