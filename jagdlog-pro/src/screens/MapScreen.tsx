/**
 * HNTR LEGEND Pro - Map Screen
 * Interaktive Revierkarte mit POIs, Grenzen und Einträgen
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Callout } from 'react-native-maps';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Karten-Typen
type MapType = 'standard' | 'satellite' | 'hybrid' | 'terrain';
import { useTheme } from '../state/ThemeContext';
import { useApp } from '../state/AppContext';
import { getCurrentLocation } from '../services/locationService';
import { getPOIs, getEntries } from '../services/storageService';
import { GPSKoordinaten, MapFeature, JagdEintrag, POIKategorie } from '../types';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Karten-Layer
interface MapLayer {
  id: string;
  name: string;
  icon: string;
  aktiv: boolean;
}

// POI-Icons
const POI_ICONS: Record<POIKategorie, string> = {
  hochsitz: '🪵',
  kanzel: '🏠',
  leiter: '🪜',
  kirrung: '🌾',
  salzlecke: '🧂',
  wildacker: '🌿',
  suhle: '💧',
  luderplatz: '🦴',
  fuetterung: '🥕',
  wildkamera: '📷',
  treffpunkt: '📍',
  parken: '🅿️',
  zugang: '🚪',
  schranke: '🚧',
  gefahr: '⚠️',
  hinweis: '📌',
  sonstiges: '📎',
};

// Eintrags-Icons
const EINTRAG_ICONS = {
  beobachtung: '👁️',
  abschuss: '🎯',
  nachsuche: '🐕',
  revierereignis: '📋',
};

const DEFAULT_REGION: Region = {
  latitude: 51.5,
  longitude: 7.5,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const MapScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { aktivesRevier, lastUpdate } = useApp();
  const navigation = useNavigation<NavigationProp>();
  const mapRef = useRef<MapView>(null);

  // State
  const [mapType, setMapType] = useState<MapType>('standard');
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Daten
  const [pois, setPois] = useState<MapFeature[]>([]);
  const [eintraege, setEintraege] = useState<JagdEintrag[]>([]);

  // Layer-State
  const [layers, setLayers] = useState<MapLayer[]>([
    { id: 'abschuesse', name: 'Abschüsse', icon: '🎯', aktiv: true },
    { id: 'beobachtungen', name: 'Beobachtungen', icon: '👁️', aktiv: true },
    { id: 'pois', name: 'Einrichtungen', icon: '🏠', aktiv: true },
    { id: 'grenzen', name: 'Reviergrenzen', icon: '📍', aktiv: true },
    { id: 'zonen', name: 'Zonen', icon: '🟩', aktiv: false },
  ]);

  // Karten-Stile
  const MAP_STYLES: { id: MapType; name: string; icon: string }[] = [
    { id: 'standard', name: 'Standard', icon: '🗺️' },
    { id: 'satellite', name: 'Satellit', icon: '🛰️' },
    { id: 'hybrid', name: 'Hybrid', icon: '🌍' },
    { id: 'terrain', name: 'Gelände', icon: '⛰️' },
  ];

  // Daten laden
  const loadData = useCallback(async () => {
    if (!aktivesRevier) return;

    try {
      setIsLoading(true);

      // POIs laden
      const poiData = await getPOIs({
        revierId: aktivesRevier.id,
        typ: 'poi',
        nurAktive: true,
      });
      setPois(poiData);

      // Einträge mit GPS laden (letzte 50)
      const eintragData = await getEntries({
        revierId: aktivesRevier.id,
        nurAktive: true,
        limit: 50,
      });
      // Nur Einträge mit GPS-Koordinaten
      const mitGps = eintragData.filter((e) => e.gps);
      setEintraege(mitGps);

      // Zur ersten Position zoomen wenn vorhanden
      if (poiData.length > 0) {
        const firstPoi = poiData[0];
        try {
          const coords = JSON.parse(firstPoi.coordinates);
          setRegion({
            latitude: coords[1],
            longitude: coords[0],
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        } catch {
          // Ignore parse errors
        }
      } else if (mitGps.length > 0 && mitGps[0].gps) {
        setRegion({
          latitude: mitGps[0].gps.latitude,
          longitude: mitGps[0].gps.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.error('[Map] Fehler beim Laden:', error);
    } finally {
      setIsLoading(false);
    }
  }, [aktivesRevier]);

  // Beim Fokus neu laden
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData, lastUpdate])
  );

  // Zur eigenen Position navigieren
  const goToMyLocation = useCallback(async () => {
    try {
      const position = await getCurrentLocation();
      if (position && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: position.latitude,
          longitude: position.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      Alert.alert('GPS-Fehler', 'Aktuelle Position konnte nicht ermittelt werden.');
    }
  }, []);

  // Layer umschalten
  const toggleLayer = (layerId: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, aktiv: !l.aktiv } : l))
    );
  };

  // Layer-Check
  const isLayerActive = (layerId: string) => {
    return layers.find((l) => l.id === layerId)?.aktiv ?? false;
  };

  // POI-Koordinaten parsen
  const getPOICoords = (poi: MapFeature): { lat: number; lon: number } | null => {
    try {
      const coords = JSON.parse(poi.coordinates);
      return { lon: coords[0], lat: coords[1] };
    } catch {
      return null;
    }
  };

  // POI antippen
  const handlePOIPress = (poi: MapFeature) => {
    navigation.navigate('POIDetail', { id: poi.id });
  };

  // Eintrag antippen
  const handleEntryPress = (eintrag: JagdEintrag) => {
    navigation.navigate('EntryDetail', { id: eintrag.id });
  };

  // Neuen POI erstellen
  const handleAddPOI = async () => {
    // Aktuelle Position holen
    try {
      const position = await getCurrentLocation();
      navigation.navigate('NewPOI', {
        coordinates: position || undefined,
      });
    } catch {
      navigation.navigate('NewPOI', { coordinates: undefined });
    }
  };

  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    map: {
      flex: 1,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    // Floating Controls
    controls: {
      position: 'absolute',
      top: 16,
      right: 16,
      gap: 10,
    },
    controlButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    controlButtonText: {
      fontSize: 20,
    },
    // Map Style Picker
    mapStyleContainer: {
      position: 'absolute',
      top: 16,
      left: 16,
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    mapStyleButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 18,
    },
    mapStyleButtonActive: {
      backgroundColor: colors.primary,
    },
    mapStyleButtonText: {
      fontSize: 14,
      color: colors.textLight,
    },
    mapStyleButtonTextActive: {
      color: '#FFFFFF',
    },
    // Layer-Menü
    layerMenu: {
      position: 'absolute',
      top: 70,
      right: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      minWidth: 180,
    },
    layerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderRadius: 8,
    },
    layerItemActive: {
      backgroundColor: colors.primary + '20',
    },
    layerIcon: {
      fontSize: 16,
      marginRight: 10,
    },
    layerName: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    layerCheck: {
      fontSize: 16,
      color: colors.primary,
    },
    // Info-Banner
    infoBanner: {
      position: 'absolute',
      bottom: 80,
      left: 16,
      right: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    infoBannerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    infoBannerIcon: {
      fontSize: 18,
      marginRight: 10,
    },
    infoBannerText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    infoBannerStats: {
      flexDirection: 'row',
      gap: 12,
    },
    infoBannerStat: {
      alignItems: 'center',
    },
    infoBannerStatValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    infoBannerStatLabel: {
      fontSize: 10,
      color: colors.textLight,
    },
    // FAB
    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
    fabText: {
      fontSize: 24,
      color: '#FFFFFF',
    },
    // Callout
    calloutContainer: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 8,
      minWidth: 120,
    },
    calloutTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    calloutSubtitle: {
      fontSize: 12,
      color: colors.textLight,
      marginTop: 2,
    },
  });

  // Dark Mode Karten-Stil
  const darkMapStyle = isDark ? [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  ] : undefined;

  return (
    <View style={styles.container}>
      {/* Karte */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        mapType={mapType}
        initialRegion={region}
        region={region}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        showsScale
        customMapStyle={darkMapStyle}
        onRegionChangeComplete={setRegion}
      >
        {/* POI-Marker */}
        {isLayerActive('pois') &&
          pois.map((poi) => {
            const coords = getPOICoords(poi);
            if (!coords) return null;

            const icon = poi.poiKategorie ? POI_ICONS[poi.poiKategorie] : '📍';

            return (
              <Marker
                key={`poi-${poi.id}`}
                coordinate={{ latitude: coords.lat, longitude: coords.lon }}
                onPress={() => handlePOIPress(poi)}
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24 }}>{icon}</Text>
                </View>
                <Callout onPress={() => handlePOIPress(poi)}>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{poi.name}</Text>
                    <Text style={styles.calloutSubtitle}>Tippen für Details</Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}

        {/* Abschuss-Marker */}
        {isLayerActive('abschuesse') &&
          eintraege
            .filter((e) => e.typ === 'abschuss' && e.gps)
            .map((eintrag) => (
              <Marker
                key={`entry-${eintrag.id}`}
                coordinate={{
                  latitude: eintrag.gps!.latitude,
                  longitude: eintrag.gps!.longitude,
                }}
                onPress={() => handleEntryPress(eintrag)}
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20 }}>{EINTRAG_ICONS.abschuss}</Text>
                </View>
                <Callout onPress={() => handleEntryPress(eintrag)}>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{eintrag.wildartName}</Text>
                    <Text style={styles.calloutSubtitle}>Abschuss</Text>
                  </View>
                </Callout>
              </Marker>
            ))}

        {/* Beobachtungs-Marker */}
        {isLayerActive('beobachtungen') &&
          eintraege
            .filter((e) => e.typ === 'beobachtung' && e.gps)
            .map((eintrag) => (
              <Marker
                key={`entry-${eintrag.id}`}
                coordinate={{
                  latitude: eintrag.gps!.latitude,
                  longitude: eintrag.gps!.longitude,
                }}
                onPress={() => handleEntryPress(eintrag)}
                pinColor="#4299E1"
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 18 }}>{EINTRAG_ICONS.beobachtung}</Text>
                </View>
                <Callout onPress={() => handleEntryPress(eintrag)}>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{eintrag.wildartName}</Text>
                    <Text style={styles.calloutSubtitle}>{eintrag.anzahl}× beobachtet</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
      </MapView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Karten-Stil Auswahl */}
      <View style={styles.mapStyleContainer}>
        {MAP_STYLES.map((style) => (
          <TouchableOpacity
            key={style.id}
            style={[styles.mapStyleButton, mapType === style.id && styles.mapStyleButtonActive]}
            onPress={() => setMapType(style.id)}
          >
            <Text
              style={[
                styles.mapStyleButtonText,
                mapType === style.id && styles.mapStyleButtonTextActive,
              ]}
            >
              {style.icon}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Steuerungs-Buttons */}
      <View style={styles.controls}>
        {/* Layer-Button */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowLayerMenu(!showLayerMenu)}
        >
          <Text style={styles.controlButtonText}>📑</Text>
        </TouchableOpacity>

        {/* GPS-Button */}
        <TouchableOpacity style={styles.controlButton} onPress={goToMyLocation}>
          <Text style={styles.controlButtonText}>📍</Text>
        </TouchableOpacity>

        {/* Refresh-Button */}
        <TouchableOpacity style={styles.controlButton} onPress={loadData}>
          <Text style={styles.controlButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Layer-Menü */}
      {showLayerMenu && (
        <View style={styles.layerMenu}>
          {layers.map((layer) => (
            <TouchableOpacity
              key={layer.id}
              style={[styles.layerItem, layer.aktiv && styles.layerItemActive]}
              onPress={() => toggleLayer(layer.id)}
            >
              <Text style={styles.layerIcon}>{layer.icon}</Text>
              <Text style={styles.layerName}>{layer.name}</Text>
              {layer.aktiv && <Text style={styles.layerCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Info-Banner */}
      <View style={styles.infoBanner}>
        <View style={styles.infoBannerLeft}>
          <Text style={styles.infoBannerIcon}>🌲</Text>
          <Text style={styles.infoBannerText} numberOfLines={1}>
            {aktivesRevier ? aktivesRevier.name : 'Kein Revier'}
          </Text>
        </View>
        <View style={styles.infoBannerStats}>
          <View style={styles.infoBannerStat}>
            <Text style={styles.infoBannerStatValue}>{pois.length}</Text>
            <Text style={styles.infoBannerStatLabel}>POIs</Text>
          </View>
          <View style={styles.infoBannerStat}>
            <Text style={styles.infoBannerStatValue}>{eintraege.length}</Text>
            <Text style={styles.infoBannerStatLabel}>Einträge</Text>
          </View>
        </View>
      </View>

      {/* FAB für neuen POI */}
      <TouchableOpacity style={styles.fab} onPress={handleAddPOI}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MapScreen;
