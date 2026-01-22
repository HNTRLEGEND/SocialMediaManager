/**
 * HNTR LEGEND Pro - Wetter Service
 * Wetterdaten via OpenWeatherMap API (optional)
 */

import { Wetter } from '../types';
import { windGradZuRichtung } from '../utils/geoHelpers';

// OpenWeatherMap API Key (sollte später in Umgebungsvariablen)
// Für Demo-Modus: Simulierte Wetterdaten
const API_KEY = ''; // Hier API Key eintragen wenn verfügbar
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Cache für Wetterdaten
let letzterWetterCache: Wetter | null = null;
let letzterCacheTimestamp: number = 0;
const CACHE_DAUER_MS = 600000; // 10 Minuten

// Mondphasen-Berechnung
const berechneMondphase = (datum: Date): string => {
  // Vereinfachte Mondphasenberechnung
  const lunareZyklusTage = 29.53059;
  const bekanntesNeumond = new Date('2024-01-11'); // Bekanntes Neumondatum

  const diffMs = datum.getTime() - bekanntesNeumond.getTime();
  const diffTage = diffMs / (1000 * 60 * 60 * 24);
  const mondAlter = ((diffTage % lunareZyklusTage) + lunareZyklusTage) % lunareZyklusTage;

  if (mondAlter < 1.85) return 'Neumond';
  if (mondAlter < 7.38) return 'Zunehmender Halbmond';
  if (mondAlter < 9.23) return 'Erstes Viertel';
  if (mondAlter < 14.77) return 'Zunehmender Mond';
  if (mondAlter < 16.61) return 'Vollmond';
  if (mondAlter < 22.15) return 'Abnehmender Mond';
  if (mondAlter < 24.00) return 'Letztes Viertel';
  return 'Abnehmender Halbmond';
};

/**
 * Holt aktuelle Wetterdaten für eine Position
 * Fallback auf Demo-Daten wenn keine API verfügbar
 */
export const getCurrentWeather = async (
  lat: number,
  lon: number
): Promise<Wetter | null> => {
  const jetzt = new Date();
  const jetztMs = Date.now();

  // Prüfe Cache
  if (letzterWetterCache && jetztMs - letzterCacheTimestamp < CACHE_DAUER_MS) {
    console.log('[Wetter] Verwende gecachte Wetterdaten');
    return {
      ...letzterWetterCache,
      quelle: 'cache',
    };
  }

  // Wenn API Key vorhanden, echte Daten abrufen
  if (API_KEY) {
    try {
      console.log('[Wetter] Rufe API ab...');
      const url = `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=de`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const wetter: Wetter = {
        temperatur: Math.round(data.main.temp),
        gefuehlteTemperatur: Math.round(data.main.feels_like),
        windGeschwindigkeit: data.wind?.speed,
        windRichtungGrad: data.wind?.deg,
        windRichtung: data.wind?.deg ? windGradZuRichtung(data.wind.deg) : undefined,
        luftfeuchtigkeit: data.main?.humidity,
        bewölkung: data.weather?.[0]?.description,
        niederschlag: data.rain?.['1h'] ? `${data.rain['1h']} mm/h` : undefined,
        mondphase: berechneMondphase(jetzt),
        erfasstAm: jetzt.toISOString(),
        quelle: 'api',
      };

      // Cache aktualisieren
      letzterWetterCache = wetter;
      letzterCacheTimestamp = jetztMs;

      return wetter;
    } catch (error) {
      console.warn('[Wetter] API-Fehler, verwende Demo-Daten:', error);
    }
  }

  // Demo-Modus: Simulierte Wetterdaten basierend auf Jahreszeit
  const monat = jetzt.getMonth();
  let basisTemp: number;
  let beschreibung: string;

  // Typische Temperaturen je Jahreszeit (für Deutschland)
  if (monat >= 11 || monat <= 1) {
    // Winter
    basisTemp = Math.floor(Math.random() * 10) - 5; // -5 bis 5°C
    beschreibung = ['Bedeckt', 'Leichter Schneefall', 'Nebelig', 'Klar'][Math.floor(Math.random() * 4)];
  } else if (monat >= 2 && monat <= 4) {
    // Frühling
    basisTemp = Math.floor(Math.random() * 15) + 5; // 5 bis 20°C
    beschreibung = ['Teilweise bewölkt', 'Sonnig', 'Leicht bewölkt', 'Regnerisch'][Math.floor(Math.random() * 4)];
  } else if (monat >= 5 && monat <= 7) {
    // Sommer
    basisTemp = Math.floor(Math.random() * 15) + 18; // 18 bis 33°C
    beschreibung = ['Sonnig', 'Heiter', 'Gewitter möglich', 'Warm und schwül'][Math.floor(Math.random() * 4)];
  } else {
    // Herbst
    basisTemp = Math.floor(Math.random() * 15) + 5; // 5 bis 20°C
    beschreibung = ['Nebelig', 'Bedeckt', 'Regnerisch', 'Herbstlich klar'][Math.floor(Math.random() * 4)];
  }

  // Windrichtung zufällig
  const windGrad = Math.floor(Math.random() * 360);

  const demoWetter: Wetter = {
    temperatur: basisTemp,
    gefuehlteTemperatur: basisTemp - 2,
    windGeschwindigkeit: Math.floor(Math.random() * 20) + 2, // 2-22 km/h
    windRichtungGrad: windGrad,
    windRichtung: windGradZuRichtung(windGrad),
    luftfeuchtigkeit: Math.floor(Math.random() * 40) + 50, // 50-90%
    bewölkung: beschreibung,
    mondphase: berechneMondphase(jetzt),
    erfasstAm: jetzt.toISOString(),
    quelle: 'manuell', // Demo-Daten als manuell markieren
  };

  // Cache aktualisieren
  letzterWetterCache = demoWetter;
  letzterCacheTimestamp = jetztMs;

  console.log('[Wetter] Demo-Wetterdaten generiert:', demoWetter.temperatur + '°C', demoWetter.bewölkung);

  return demoWetter;
};

/**
 * Gibt die letzten gecachten Wetterdaten zurück
 */
export const getLastWeather = (): Wetter | null => {
  return letzterWetterCache;
};

/**
 * Erstellt manuelles Wetter-Objekt
 */
export const createManualWeather = (
  temperatur: number,
  options?: {
    windRichtung?: string;
    windGeschwindigkeit?: number;
    bewölkung?: string;
  }
): Wetter => {
  const jetzt = new Date();

  return {
    temperatur,
    windRichtung: options?.windRichtung,
    windGeschwindigkeit: options?.windGeschwindigkeit,
    bewölkung: options?.bewölkung,
    mondphase: berechneMondphase(jetzt),
    erfasstAm: jetzt.toISOString(),
    quelle: 'manuell',
  };
};

/**
 * Formatiert Wetter für die Anzeige
 */
export const formatWeatherDisplay = (wetter: Wetter): string => {
  const teile: string[] = [];

  teile.push(`${wetter.temperatur}°C`);

  if (wetter.bewölkung) {
    teile.push(wetter.bewölkung);
  }

  if (wetter.windRichtung && wetter.windGeschwindigkeit) {
    teile.push(`Wind: ${wetter.windRichtung} ${wetter.windGeschwindigkeit} m/s`);
  }

  if (wetter.mondphase) {
    teile.push(`Mond: ${wetter.mondphase}`);
  }

  return teile.join(' | ');
};
