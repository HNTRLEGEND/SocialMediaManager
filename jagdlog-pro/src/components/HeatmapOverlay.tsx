/**
 * PHASE 5: Heatmap Overlay Component
 * Visualisiert Erfolgs-Hotspots auf der Karte
 */

import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { HeatmapPoint } from '../types/ai';

interface HeatmapOverlayProps {
  heatmapData: HeatmapPoint[];
  visible: boolean;
  opacity?: number;
  mapBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  mapWidth: number;
  mapHeight: number;
}

export const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({
  heatmapData,
  visible,
  opacity = 0.6,
  mapBounds,
  mapWidth,
  mapHeight,
}) => {
  if (!visible || heatmapData.length === 0) {
    return null;
  }

  /**
   * Konvertiert GPS zu Screen-Koordinaten
   */
  const convertToScreenCoords = (lat: number, lon: number) => {
    const x =
      ((lon - mapBounds.west) / (mapBounds.east - mapBounds.west)) * mapWidth;
    const y =
      ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) *
      mapHeight;
    return { x, y };
  };

  /**
   * Berechne Farbe basierend auf Intensität
   */
  const getHeatColor = (intensity: number): string => {
    if (intensity >= 80) return '#FF0000'; // Rot - Sehr hoch
    if (intensity >= 60) return '#FF6600'; // Orange - Hoch
    if (intensity >= 40) return '#FFCC00'; // Gelb - Mittel
    if (intensity >= 20) return '#00FF00'; // Grün - Niedrig
    return '#0088FF'; // Blau - Sehr niedrig
  };

  /**
   * Memoized Heatmap Points
   */
  const renderedPoints = useMemo(() => {
    return heatmapData.map((point, index) => {
      const { x, y } = convertToScreenCoords(point.latitude, point.longitude);

      // Radius basierend auf Erfolgsrate
      const radius = Math.max(20, (point.intensity / 100) * 60);

      // Farbe basierend auf Intensität
      const color = getHeatColor(point.intensity);

      return (
        <React.Fragment key={`heatmap-${index}`}>
          <Defs>
            <RadialGradient
              id={`gradient-${index}`}
              cx="50%"
              cy="50%"
              rx="50%"
              ry="50%"
              fx="50%"
              fy="50%"
            >
              <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <Stop offset="50%" stopColor={color} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={color} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle
            cx={x}
            cy={y}
            r={radius}
            fill={`url(#gradient-${index})`}
            opacity={opacity}
          />
        </React.Fragment>
      );
    });
  }, [heatmapData, mapBounds, mapWidth, mapHeight, opacity]);

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: mapWidth,
        height: mapHeight,
        pointerEvents: 'none',
      }}
    >
      <Svg width={mapWidth} height={mapHeight}>
        {renderedPoints}
      </Svg>
    </View>
  );
};
