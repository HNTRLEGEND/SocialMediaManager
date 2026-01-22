/**
 * HNTR LEGEND Pro - Media Service
 * Foto-Aufnahme, Auswahl und Verwaltung
 */

import * as ImagePicker from 'expo-image-picker';
import { Paths, Directory, File } from 'expo-file-system';
import { Platform, Alert } from 'react-native';
import { saveMedia, getMedia } from './storageService';
import { generateUUID } from '../data/db';
import { Medium } from '../types';

// Bildqualität und Größe
const IMAGE_QUALITY = 0.8;
const MAX_IMAGE_WIDTH = 1920;
const MAX_IMAGE_HEIGHT = 1920;

/**
 * Prüft und fordert Kamera-Berechtigungen an
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Kamera-Berechtigung',
      'HNTR LEGEND Pro benötigt Zugriff auf die Kamera, um Fotos aufzunehmen.',
      [{ text: 'OK' }]
    );
    return false;
  }
  return true;
};

/**
 * Prüft und fordert Mediathek-Berechtigungen an
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Mediathek-Berechtigung',
      'HNTR LEGEND Pro benötigt Zugriff auf deine Fotos, um Bilder auswählen zu können.',
      [{ text: 'OK' }]
    );
    return false;
  }
  return true;
};

/**
 * Foto mit der Kamera aufnehmen
 */
export const takeFoto = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return null;

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: IMAGE_QUALITY,
      exif: true, // EXIF-Daten für GPS und Zeitstempel
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets[0];
  } catch (error) {
    console.error('[MediaService] Fehler beim Aufnehmen:', error);
    return null;
  }
};

/**
 * Foto aus der Mediathek auswählen
 */
export const pickFoto = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) return null;

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: IMAGE_QUALITY,
      exif: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets[0];
  } catch (error) {
    console.error('[MediaService] Fehler beim Auswählen:', error);
    return null;
  }
};

/**
 * Mehrere Fotos aus der Mediathek auswählen
 */
export const pickMultipleFotos = async (maxCount: number = 5): Promise<ImagePicker.ImagePickerAsset[]> => {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) return [];

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: maxCount,
      quality: IMAGE_QUALITY,
      exif: true,
    });

    if (result.canceled || !result.assets) {
      return [];
    }

    return result.assets;
  } catch (error) {
    console.error('[MediaService] Fehler beim Mehrfachauswählen:', error);
    return [];
  }
};

/**
 * Speichert ein Foto lokal und erstellt einen Medien-Eintrag
 */
export const saveFotoForEntry = async (
  eintragId: string | null,
  asset: ImagePicker.ImagePickerAsset
): Promise<string | null> => {
  try {
    // Zielverzeichnis erstellen falls nicht vorhanden
    const mediaDir = new Directory(Paths.document, 'media');
    if (!mediaDir.exists) {
      await mediaDir.create();
    }

    // Eindeutigen Dateinamen generieren
    const fileExtension = asset.uri.split('.').pop() || 'jpg';
    const fileName = `foto_${generateUUID()}.${fileExtension}`;

    // Quelldatei und Zieldatei
    const sourceFile = new File(asset.uri);
    const destFile = new File(mediaDir, fileName);

    // Datei kopieren
    await sourceFile.copy(destFile);

    // EXIF-Daten extrahieren
    const exifData = asset.exif || {};

    // In Datenbank speichern
    const mediaId = await saveMedia(eintragId, destFile.uri, {
      dateiname: fileName,
      mimeType: asset.mimeType || 'image/jpeg',
      breite: asset.width,
      hoehe: asset.height,
      aufnahmeZeitpunkt: exifData.DateTimeOriginal
        ? new Date(exifData.DateTimeOriginal).toISOString()
        : undefined,
      aufnahmeGps:
        exifData.GPSLatitude && exifData.GPSLongitude
          ? {
              latitude: exifData.GPSLatitude,
              longitude: exifData.GPSLongitude,
            }
          : undefined,
    });

    return mediaId;
  } catch (error) {
    console.error('[MediaService] Fehler beim Speichern:', error);
    return null;
  }
};

/**
 * Mehrere Fotos für einen Eintrag speichern
 */
export const saveFotosForEntry = async (
  eintragId: string | null,
  assets: ImagePicker.ImagePickerAsset[]
): Promise<string[]> => {
  const mediaIds: string[] = [];

  for (const asset of assets) {
    const mediaId = await saveFotoForEntry(eintragId, asset);
    if (mediaId) {
      mediaIds.push(mediaId);
    }
  }

  return mediaIds;
};

/**
 * Lädt alle Medien für einen Eintrag
 */
export const loadMediaForEntry = async (eintragId: string): Promise<Medium[]> => {
  return getMedia(eintragId);
};

/**
 * Löscht ein Medium (Datei und DB-Eintrag)
 */
export const deleteMedium = async (medium: Medium): Promise<boolean> => {
  try {
    // Lokale Datei löschen
    if (medium.lokaleUri) {
      const file = new File(medium.lokaleUri);
      if (file.exists) {
        await file.delete();
      }
    }

    // Thumbnail löschen falls vorhanden
    if (medium.thumbnailUri) {
      const thumb = new File(medium.thumbnailUri);
      if (thumb.exists) {
        await thumb.delete();
      }
    }

    // TODO: DB-Eintrag löschen (benötigt deleteMedia-Funktion in storageService)

    return true;
  } catch (error) {
    console.error('[MediaService] Fehler beim Löschen:', error);
    return false;
  }
};

/**
 * Erstellt ein Thumbnail für ein Bild
 * (Vereinfachte Version - vollständig würde Image Manipulator benötigen)
 */
export const createThumbnail = async (
  sourceUri: string,
  targetWidth: number = 300
): Promise<string | null> => {
  // Für volle Thumbnail-Generierung würde expo-image-manipulator benötigt
  // Hier als Platzhalter die Original-URI zurückgeben
  return sourceUri;
};

/**
 * Berechnet die Dateigröße eines Mediums
 */
export const getFileSize = async (uri: string): Promise<number | null> => {
  try {
    const file = new File(uri);
    if (file.exists) {
      return file.size ?? null;
    }
    return null;
  } catch (error) {
    console.error('[MediaService] Fehler beim Lesen der Dateigröße:', error);
    return null;
  }
};

/**
 * Formatiert eine Dateigröße für die Anzeige
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Zeigt einen Dialog zur Foto-Auswahl (Kamera oder Mediathek)
 */
export const showFotoPickerDialog = (): Promise<'camera' | 'library' | null> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Foto hinzufügen',
      'Wie möchtest du ein Foto hinzufügen?',
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
          onPress: () => resolve(null),
        },
        {
          text: 'Aus Galerie',
          onPress: () => resolve('library'),
        },
        {
          text: 'Kamera',
          onPress: () => resolve('camera'),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
};

/**
 * Zeigt den Foto-Picker-Dialog und gibt das ausgewählte Asset zurück
 */
export const pickOrTakeFoto = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  const choice = await showFotoPickerDialog();

  if (choice === 'camera') {
    return takeFoto();
  } else if (choice === 'library') {
    return pickFoto();
  }

  return null;
};
