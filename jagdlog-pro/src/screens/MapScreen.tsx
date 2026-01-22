/**
 * HNTR LEGEND Pro - Map Screen
 * Interaktive Revierkarte mit POIs, Grenzen und Einträgen
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

// Karten-Typen
type MapType = 'standard' | 'satellite' | 'hybrid' | 'terrain';
import { useTheme } from '../state/ThemeContext';
import { useApp } from '../state/AppContext';
import { getCurrentLocation } from '../services/locationService';
import { GPSKoordinaten } from '../types';

// Karten-Layer
interface MapLayer {
  id: string;
  name: string;
  icon: string;
  aktiv: boolean;
}

const DEFAULT_REGION: Region = {
  latitude: 51.5,
  longitude: 7.5,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

const MapScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { aktivesRevier } = useApp();
  const mapRef = useRef<MapView>(null);

  // State
  const [mapType, setMapType] = useState<MapType>('standard');
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
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

  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    map: {
      flex: 1,
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
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
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        showsScale
        customMapStyle={darkMapStyle}
        onRegionChangeComplete={setRegion}
      >
        {/* Hier würden Marker, Polygone etc. gerendert werden */}
        {/* Beispiel-Marker */}
        <Marker
          coordinate={{ latitude: 51.5, longitude: 7.5 }}
          title="Beispiel-Position"
          description="Demo-Marker"
        />
      </MapView>

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

      {/* Info-Banner (Revier-Name) */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerIcon}>🌲</Text>
        <Text style={styles.infoBannerText}>
          {aktivesRevier ? aktivesRevier.name : 'Kein Revier ausgewählt'}
        </Text>
      </View>

      {/* FAB für neuen POI */}
      <TouchableOpacity style={styles.fab} onPress={() => Alert.alert('POI hinzufügen', 'In Entwicklung...')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MapScreen;
