/**
 * HNTR LEGEND Pro - Location Service
 * GPS-Erfassung mit Expo Location
 */

import * as Location from 'expo-location';
import { GPSKoordinaten } from '../types';

// Cache für die letzte bekannte Position
let letztePosition: GPSKoordinaten | null = null;
let letzterTimestamp: number = 0;
const CACHE_DAUER_MS = 30000; // 30 Sekunden

/**
 * Prüft und fordert Location-Berechtigung an
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
      console.log('[Location] Berechtigung nicht erteilt');
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Location] Fehler bei Berechtigungsprüfung:', error);
    return false;
  }
};

/**
 * Holt die aktuelle GPS-Position
 * @param genauigkeit 'hoch' für Balanced, 'niedrig' für Low Power
 * @returns GPS-Koordinaten oder null bei Fehler
 */
export const getCurrentLocation = async (
  genauigkeit: 'hoch' | 'niedrig' = 'hoch'
): Promise<GPSKoordinaten | null> => {
  try {
    // Prüfe Berechtigung
    const hatBerechtigung = await checkLocationPermission();
    if (!hatBerechtigung) {
      // Fallback auf letzte bekannte Position
      return letztePosition;
    }

    // Prüfe ob Cache noch gültig
    const jetztMs = Date.now();
    if (letztePosition && jetztMs - letzterTimestamp < CACHE_DAUER_MS) {
      console.log('[Location] Verwende gecachte Position');
      return letztePosition;
    }

    // GPS abrufen
    const locationOptions: Location.LocationOptions = {
      accuracy:
        genauigkeit === 'hoch'
          ? Location.Accuracy.Balanced
          : Location.Accuracy.Low,
      timeInterval: 5000,
      distanceInterval: 10,
    };

    console.log('[Location] Rufe GPS-Position ab...');
    const location = await Location.getCurrentPositionAsync(locationOptions);

    const koordinaten: GPSKoordinaten = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy ?? undefined,
      altitude: location.coords.altitude ?? undefined,
    };

    // Cache aktualisieren
    letztePosition = koordinaten;
    letzterTimestamp = jetztMs;

    console.log('[Location] Position erhalten:', koordinaten.latitude, koordinaten.longitude);
    return koordinaten;
  } catch (error) {
    console.error('[Location] Fehler beim Abrufen der Position:', error);
    // Fallback auf letzte bekannte Position
    return letztePosition;
  }
};

/**
 * Gibt die letzte bekannte Position zurück (sofort, ohne API-Aufruf)
 */
export const getLastKnownLocation = (): GPSKoordinaten | null => {
  return letztePosition;
};

/**
 * Startet kontinuierliches Tracking (für Track-Aufzeichnung)
 */
export const startLocationTracking = async (
  onLocationUpdate: (position: GPSKoordinaten) => void
): Promise<Location.LocationSubscription | null> => {
  try {
    const hatBerechtigung = await checkLocationPermission();
    if (!hatBerechtigung) {
      return null;
    }

    console.log('[Location] Starte Tracking...');

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Alle 5 Sekunden
        distanceInterval: 10, // oder alle 10 Meter
      },
      (location) => {
        const koordinaten: GPSKoordinaten = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy ?? undefined,
          altitude: location.coords.altitude ?? undefined,
        };

        // Cache aktualisieren
        letztePosition = koordinaten;
        letzterTimestamp = Date.now();

        onLocationUpdate(koordinaten);
      }
    );

    return subscription;
  } catch (error) {
    console.error('[Location] Fehler beim Starten des Trackings:', error);
    return null;
  }
};

/**
 * Stoppt das Tracking
 */
export const stopLocationTracking = (subscription: Location.LocationSubscription): void => {
  console.log('[Location] Stoppe Tracking');
  subscription.remove();
};

/**
 * Prüft ob GPS aktiviert ist
 */
export const isLocationServicesEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    return enabled;
  } catch (error) {
    console.error('[Location] Fehler bei Service-Prüfung:', error);
    return false;
  }
};
