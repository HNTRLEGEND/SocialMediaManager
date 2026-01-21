import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '@react-navigation/native';
import { getCurrentLocation } from '../services/locationService';

export function MapScreen() {
  const { colors } = useTheme();
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    getCurrentLocation().then((location) => {
      if (location) {
        setPosition({ latitude: location.latitude, longitude: location.longitude });
      }
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Revierkarte</Text>
      <View style={styles.mapWrapper}>
        {position ? (
          <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude: position.latitude,
              longitude: position.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker coordinate={position} title="Aktuelle Position" />
          </MapView>
        ) : (
          <Text style={{ color: colors.textLight }}>Position wird geladen...</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  mapWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
