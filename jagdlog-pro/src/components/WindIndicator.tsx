/**
 * PHASE 4: WindIndicator / Compass Component
 * Dezenter Kompass mit Wind-Anzeige für Karten
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Svg, {
  Circle,
  Line,
  Polygon,
  Text as SvgText,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { WindVector } from '../types/weather';

interface WindIndicatorProps {
  wind: WindVector;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  style?: 'minimal' | 'classic' | 'modern' | 'tactical';
  opacity?: number; // 0.3 - 1.0
  size?: number; // Durchmesser in Pixel
  showWindData?: boolean;
  onPress?: () => void; // Tap = Karte nach Norden ausrichten
}

export const WindIndicator: React.FC<WindIndicatorProps> = ({
  wind,
  position = 'top-right',
  style = 'modern',
  opacity = 0.7,
  size = 80,
  showWindData = true,
  onPress,
}) => {
  const [rotation] = useState(new Animated.Value(0));

  // Position auf dem Screen
  const getPositionStyle = () => {
    const margin = 15;
    switch (position) {
      case 'top-left':
        return { top: margin, left: margin };
      case 'top-right':
        return { top: margin, right: margin };
      case 'bottom-left':
        return { bottom: margin + 50, left: margin };
      case 'bottom-right':
        return { bottom: margin + 50, right: margin };
    }
  };

  // Render je nach Stil
  const renderCompass = () => {
    switch (style) {
      case 'minimal':
        return renderMinimalCompass();
      case 'classic':
        return renderClassicCompass();
      case 'modern':
        return renderModernCompass();
      case 'tactical':
        return renderTacticalCompass();
      default:
        return renderModernCompass();
    }
  };

  // ===========================
  // MINIMAL STYLE
  // ===========================
  const renderMinimalCompass = () => {
    const center = size / 2;
    const arrowLength = size * 0.35;

    return (
      <Svg width={size} height={size}>
        {/* Outer Circle */}
        <Circle
          cx={center}
          cy={center}
          r={center - 2}
          fill="rgba(0, 0, 0, 0.3)"
          stroke="#FFFFFF"
          strokeWidth={1}
        />

        {/* Nord-Pfeil */}
        <G rotation={0} origin={`${center}, ${center}`}>
          <Polygon
            points={`${center},${center - arrowLength} ${center - 5},${center} ${center + 5},${center}`}
            fill="#FF4444"
          />
        </G>

        {/* Nord-Buchstabe */}
        <SvgText
          x={center}
          y={center - arrowLength - 8}
          fontSize={12}
          fontWeight="bold"
          fill="#FFFFFF"
          textAnchor="middle"
        >
          N
        </SvgText>

        {/* Wind-Richtungs-Pfeil */}
        <G rotation={wind.direction} origin={`${center}, ${center}`}>
          <Line
            x1={center}
            y1={center}
            x2={center}
            y2={center + arrowLength - 10}
            stroke="#00FF00"
            strokeWidth={2}
          />
          <Polygon
            points={`${center},${center + arrowLength} ${center - 4},${center + arrowLength - 8} ${center + 4},${center + arrowLength - 8}`}
            fill="#00FF00"
          />
        </G>
      </Svg>
    );
  };

  // ===========================
  // CLASSIC STYLE
  // ===========================
  const renderClassicCompass = () => {
    const center = size / 2;
    const outerRadius = center - 5;
    const innerRadius = outerRadius - 15;

    return (
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="compassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#2C3E50" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#34495E" stopOpacity="0.9" />
          </LinearGradient>
        </Defs>

        {/* Background Circle */}
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="url(#compassGrad)"
          stroke="#ECF0F1"
          strokeWidth={2}
        />

        {/* Inner Ring */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="#BDC3C7"
          strokeWidth={1}
          strokeDasharray="2,2"
        />

        {/* Cardinal Directions */}
        {['N', 'E', 'S', 'W'].map((dir, index) => {
          const angle = index * 90;
          const radians = ((angle - 90) * Math.PI) / 180;
          const x = center + Math.cos(radians) * (outerRadius - 10);
          const y = center + Math.sin(radians) * (outerRadius - 10);

          return (
            <SvgText
              key={dir}
              x={x}
              y={y + 4}
              fontSize={dir === 'N' ? 14 : 12}
              fontWeight={dir === 'N' ? 'bold' : 'normal'}
              fill={dir === 'N' ? '#E74C3C' : '#ECF0F1'}
              textAnchor="middle"
            >
              {dir}
            </SvgText>
          );
        })}

        {/* Tick Marks */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const radians = ((angle - 90) * Math.PI) / 180;
          const x1 = center + Math.cos(radians) * (outerRadius - 5);
          const y1 = center + Math.sin(radians) * (outerRadius - 5);
          const x2 =
            center + Math.cos(radians) * (outerRadius - (angle % 90 === 0 ? 12 : 8));
          const y2 =
            center + Math.sin(radians) * (outerRadius - (angle % 90 === 0 ? 12 : 8));

          return (
            <Line
              key={angle}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#BDC3C7"
              strokeWidth={angle % 90 === 0 ? 2 : 1}
            />
          );
        })}

        {/* Wind Direction Needle */}
        <G rotation={wind.direction} origin={`${center}, ${center}`}>
          {/* Needle */}
          <Polygon
            points={`${center},${center - innerRadius + 5} ${center - 3},${center + 5} ${center + 3},${center + 5}`}
            fill="#3498DB"
            stroke="#FFFFFF"
            strokeWidth={1}
          />
          {/* Tail */}
          <Polygon
            points={`${center - 3},${center + 5} ${center + 3},${center + 5} ${center},${center + innerRadius - 5}`}
            fill="#E74C3C"
            opacity={0.6}
          />
        </G>

        {/* Center Dot */}
        <Circle cx={center} cy={center} r={4} fill="#ECF0F1" />
      </Svg>
    );
  };

  // ===========================
  // MODERN STYLE
  // ===========================
  const renderModernCompass = () => {
    const center = size / 2;
    const radius = center - 8;

    return (
      <Svg width={size} height={size}>
        {/* Outer Glow */}
        <Circle
          cx={center}
          cy={center}
          r={radius + 3}
          fill="none"
          stroke="rgba(100, 200, 255, 0.3)"
          strokeWidth={6}
        />

        {/* Main Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="rgba(20, 20, 30, 0.85)"
          stroke="rgba(100, 200, 255, 0.8)"
          strokeWidth={2}
        />

        {/* Inner Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius - 12}
          fill="none"
          stroke="rgba(100, 200, 255, 0.3)"
          strokeWidth={1}
        />

        {/* Cardinal Points */}
        {[
          { dir: 'N', angle: 0, color: '#FF4444' },
          { dir: 'E', angle: 90, color: '#FFFFFF' },
          { dir: 'S', angle: 180, color: '#FFFFFF' },
          { dir: 'W', angle: 270, color: '#FFFFFF' },
        ].map(({ dir, angle, color }) => {
          const radians = ((angle - 90) * Math.PI) / 180;
          const x = center + Math.cos(radians) * (radius - 18);
          const y = center + Math.sin(radians) * (radius - 18);

          return (
            <SvgText
              key={dir}
              x={x}
              y={y + 5}
              fontSize={dir === 'N' ? 16 : 13}
              fontWeight="bold"
              fill={color}
              textAnchor="middle"
            >
              {dir}
            </SvgText>
          );
        })}

        {/* Degree Markers */}
        {Array.from({ length: 36 }, (_, i) => i * 10).map((angle) => {
          const radians = ((angle - 90) * Math.PI) / 180;
          const isCardinal = angle % 90 === 0;
          const isIntercardinal = angle % 45 === 0 && !isCardinal;

          const length = isCardinal ? 10 : isIntercardinal ? 7 : 4;
          const width = isCardinal ? 2 : 1;

          const x1 = center + Math.cos(radians) * (radius - 5);
          const y1 = center + Math.sin(radians) * (radius - 5);
          const x2 = center + Math.cos(radians) * (radius - 5 - length);
          const y2 = center + Math.sin(radians) * (radius - 5 - length);

          return (
            <Line
              key={angle}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(100, 200, 255, 0.5)"
              strokeWidth={width}
            />
          );
        })}

        {/* Wind Direction Arrow */}
        <G rotation={wind.direction} origin={`${center}, ${center}`}>
          {/* Arrow Shaft */}
          <Line
            x1={center}
            y1={center + 8}
            x2={center}
            y2={center - radius + 20}
            stroke="#00FF88"
            strokeWidth={3}
          />
          {/* Arrow Head */}
          <Polygon
            points={`${center},${center - radius + 18} ${center - 6},${center - radius + 28} ${center + 6},${center - radius + 28}`}
            fill="#00FF88"
          />
        </G>

        {/* Center Dot */}
        <Circle cx={center} cy={center} r={5} fill="rgba(100, 200, 255, 0.8)" />
        <Circle cx={center} cy={center} r={2} fill="#FFFFFF" />

        {/* Degree Display */}
        <SvgText
          x={center}
          y={center + radius - 5}
          fontSize={10}
          fill="rgba(255, 255, 255, 0.7)"
          textAnchor="middle"
        >
          {wind.direction}°
        </SvgText>
      </Svg>
    );
  };

  // ===========================
  // TACTICAL STYLE
  // ===========================
  const renderTacticalCompass = () => {
    const center = size / 2;
    const radius = center - 6;

    return (
      <Svg width={size} height={size}>
        {/* Outer Frame */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="rgba(0, 20, 0, 0.9)"
          stroke="#00FF00"
          strokeWidth={2}
        />

        {/* Cross Hairs */}
        <Line
          x1={center - radius}
          y1={center}
          x2={center + radius}
          y2={center}
          stroke="rgba(0, 255, 0, 0.3)"
          strokeWidth={1}
          strokeDasharray="3,3"
        />
        <Line
          x1={center}
          y1={center - radius}
          x2={center}
          y2={center + radius}
          stroke="rgba(0, 255, 0, 0.3)"
          strokeWidth={1}
          strokeDasharray="3,3"
        />

        {/* Mil Dots (Military Style) */}
        {[0, 90, 180, 270].map((angle) => {
          const radians = ((angle - 90) * Math.PI) / 180;
          const x = center + Math.cos(radians) * (radius - 10);
          const y = center + Math.sin(radians) * (radius - 10);

          return (
            <Circle key={angle} cx={x} cy={y} r={2} fill="#00FF00" />
          );
        })}

        {/* Tactical Grid */}
        {[-radius / 2, radius / 2].map((offset) => (
          <React.Fragment key={offset}>
            <Line
              x1={center + offset}
              y1={center - radius + 15}
              x2={center + offset}
              y2={center + radius - 15}
              stroke="rgba(0, 255, 0, 0.2)"
              strokeWidth={1}
            />
            <Line
              x1={center - radius + 15}
              y1={center + offset}
              x2={center + radius - 15}
              y2={center + offset}
              stroke="rgba(0, 255, 0, 0.2)"
              strokeWidth={1}
            />
          </React.Fragment>
        ))}

        {/* North Indicator */}
        <G rotation={0} origin={`${center}, ${center}`}>
          <Polygon
            points={`${center},${center - radius + 12} ${center - 4},${center - radius + 20} ${center + 4},${center - radius + 20}`}
            fill="#FF0000"
            stroke="#FFFFFF"
            strokeWidth={1}
          />
        </G>

        {/* Mils Text */}
        <SvgText
          x={center}
          y={center - radius + 8}
          fontSize={8}
          fill="#00FF00"
          fontFamily="monospace"
          textAnchor="middle"
        >
          000
        </SvgText>

        {/* Wind Direction */}
        <G rotation={wind.direction} origin={`${center}, ${center}`}>
          <Line
            x1={center}
            y1={center}
            x2={center}
            y2={center + radius - 15}
            stroke="#00FF00"
            strokeWidth={2}
          />
          <Polygon
            points={`${center},${center + radius - 13} ${center - 5},${center + radius - 20} ${center + 5},${center + radius - 20}`}
            fill="#00FF00"
          />
        </G>

        {/* Center Reticle */}
        <Circle
          cx={center}
          cy={center}
          r={6}
          fill="none"
          stroke="#00FF00"
          strokeWidth={1}
        />
        <Circle cx={center} cy={center} r={2} fill="#00FF00" />
      </Svg>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, getPositionStyle(), { opacity }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {renderCompass()}

      {/* Wind Data Display */}
      {showWindData && (
        <View style={styles.windData}>
          <Text style={styles.windSpeed}>
            {wind.speedKmh.toFixed(1)} km/h
          </Text>
          <Text style={styles.windBeaufort}>Bft {wind.speedBeaufort}</Text>
          <Text style={styles.windDirection}>{wind.directionCardinal}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 200,
  },
  windData: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 80,
  },
  windSpeed: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  windBeaufort: {
    color: '#CCCCCC',
    fontSize: 10,
  },
  windDirection: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
