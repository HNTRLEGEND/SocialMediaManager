/**
 * HNTR LEGEND Pro - Berechtigungs-Hilfsfunktionen
 * Prüft und fordert App-Berechtigungen an
 */

import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';

/**
 * Berechtigungs-Status
 */
export interface PermissionStatus {
  location: boolean;
  camera: boolean;
  mediaLibrary: boolean;
}

/**
 * Prüft alle benötigten Berechtigungen
 */
export const checkAllPermissions = async (): Promise<PermissionStatus> => {
  const [locationStatus, cameraStatus, mediaStatus] = await Promise.all([
    Location.getForegroundPermissionsAsync(),
    ImagePicker.getCameraPermissionsAsync(),
    ImagePicker.getMediaLibraryPermissionsAsync(),
  ]);

  return {
    location: locationStatus.granted,
    camera: cameraStatus.granted,
    mediaLibrary: mediaStatus.granted,
  };
};

/**
 * Fordert GPS-Berechtigung an
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
      Alert.alert(
        'GPS-Zugriff benötigt',
        'HNTR LEGEND Pro benötigt Zugriff auf deinen Standort, um Jagdeinträge mit GPS-Position zu erfassen.',
        [
          { text: 'Abbrechen', style: 'cancel' },
          { text: 'Einstellungen öffnen', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Permissions] Fehler bei Location-Berechtigung:', error);
    return false;
  }
};

/**
 * Fordert Kamera-Berechtigung an
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Kamera-Zugriff benötigt',
        'HNTR LEGEND Pro benötigt Zugriff auf die Kamera, um Fotos aufzunehmen.',
        [
          { text: 'Abbrechen', style: 'cancel' },
          { text: 'Einstellungen öffnen', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Permissions] Fehler bei Kamera-Berechtigung:', error);
    return false;
  }
};

/**
 * Fordert Mediathek-Berechtigung an
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Fotobibliothek-Zugriff benötigt',
        'HNTR LEGEND Pro benötigt Zugriff auf deine Fotos, um Bilder auszuwählen.',
        [
          { text: 'Abbrechen', style: 'cancel' },
          { text: 'Einstellungen öffnen', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Permissions] Fehler bei Mediathek-Berechtigung:', error);
    return false;
  }
};

/**
 * Fordert alle benötigten Berechtigungen beim App-Start an
 */
export const requestAllPermissions = async (): Promise<PermissionStatus> => {
  const results: PermissionStatus = {
    location: false,
    camera: false,
    mediaLibrary: false,
  };

  try {
    // Location
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    results.location = locationStatus === 'granted';

    // Camera
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    results.camera = cameraStatus === 'granted';

    // Media Library
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    results.mediaLibrary = mediaStatus === 'granted';
  } catch (error) {
    console.error('[Permissions] Fehler beim Anfordern:', error);
  }

  return results;
};
