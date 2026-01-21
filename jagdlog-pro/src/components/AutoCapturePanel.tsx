import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { getCurrentLocation } from '../services/locationService';
import { getCurrentWeather } from '../services/weatherService';

interface AutoCapturePanelProps {
  onChange: (data: AutoCaptureData) => void;
}

export interface AutoCaptureData {
  gps: { lat: number; lon: number };
  temperatur: { real: number; gefuehlt: number };
  wind: { richtung: string; staerke: number };
  datum: Date;
}

export function AutoCapturePanel({ onChange }: AutoCapturePanelProps) {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [datum, setDatum] = useState(new Date());
  const [gps, setGps] = useState({ lat: 0, lon: 0 });
  const [temperatur, setTemperatur] = useState({ real: 0, gefuehlt: 0 });
  const [wind, setWind] = useState({ richtung: 'N', staerke: 0 });

  useEffect(() => {
    let isMounted = true;
    async function capture() {
      const location = await getCurrentLocation();
      if (location && isMounted) {
        setGps({ lat: location.latitude, lon: location.longitude });
        const weather = await getCurrentWeather(location.latitude, location.longitude);
        if (weather && isMounted) {
          setTemperatur({ real: weather.temp, gefuehlt: weather.feels_like });
          setWind({
            richtung: `${weather.wind_deg}°`,
            staerke: weather.wind_speed,
          });
        }
      }
    }

    capture();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    onChange({ gps, temperatur, wind, datum });
  }, [gps, temperatur, wind, datum, onChange]);

  const formattedDate = useMemo(() => datum.toLocaleString('de-DE'), [datum]);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Auto-Erfassung</Text>
        <Pressable onPress={() => setIsEditing((prev) => !prev)}>
          <Text style={{ color: colors.primary }}>✏️ Manuell anpassen</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>Zeitstempel</Text>
        {isEditing ? (
          <TextInput
            value={formattedDate}
            onChangeText={(value) => setDatum(new Date(value))}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          />
        ) : (
          <Text style={{ color: colors.text }}>{formattedDate}</Text>
        )}
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>GPS</Text>
        {isEditing ? (
          <View style={styles.inlineInputs}>
            <TextInput
              value={String(gps.lat)}
              onChangeText={(value) => setGps((prev) => ({ ...prev, lat: Number(value) }))}
              keyboardType="numeric"
              style={[styles.input, styles.inline, { borderColor: colors.border, color: colors.text }]}
            />
            <TextInput
              value={String(gps.lon)}
              onChangeText={(value) => setGps((prev) => ({ ...prev, lon: Number(value) }))}
              keyboardType="numeric"
              style={[styles.input, styles.inline, { borderColor: colors.border, color: colors.text }]}
            />
          </View>
        ) : (
          <Text style={{ color: colors.text }}>{gps.lat.toFixed(4)}, {gps.lon.toFixed(4)}</Text>
        )}
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>Temperatur</Text>
        {isEditing ? (
          <View style={styles.inlineInputs}>
            <TextInput
              value={String(temperatur.real)}
              onChangeText={(value) => setTemperatur((prev) => ({ ...prev, real: Number(value) }))}
              keyboardType="numeric"
              style={[styles.input, styles.inline, { borderColor: colors.border, color: colors.text }]}
            />
            <TextInput
              value={String(temperatur.gefuehlt)}
              onChangeText={(value) => setTemperatur((prev) => ({ ...prev, gefuehlt: Number(value) }))}
              keyboardType="numeric"
              style={[styles.input, styles.inline, { borderColor: colors.border, color: colors.text }]}
            />
          </View>
        ) : (
          <Text style={{ color: colors.text }}>
            {temperatur.real}°C / gefühlt {temperatur.gefuehlt}°C
          </Text>
        )}
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>Wind</Text>
        {isEditing ? (
          <View style={styles.inlineInputs}>
            <TextInput
              value={wind.richtung}
              onChangeText={(value) => setWind((prev) => ({ ...prev, richtung: value }))}
              style={[styles.input, styles.inline, { borderColor: colors.border, color: colors.text }]}
            />
            <TextInput
              value={String(wind.staerke)}
              onChangeText={(value) => setWind((prev) => ({ ...prev, staerke: Number(value) }))}
              keyboardType="numeric"
              style={[styles.input, styles.inline, { borderColor: colors.border, color: colors.text }]}
            />
          </View>
        ) : (
          <Text style={{ color: colors.text }}>
            {wind.richtung} / {wind.staerke} m/s
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  inlineInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  inline: {
    flex: 1,
  },
});
