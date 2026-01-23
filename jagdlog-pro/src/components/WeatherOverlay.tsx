/**
 * PHASE 4: WeatherOverlay Component
 * Wetter-Visualisierung auf der Karte mit Wind-Animation, Radar, Precipitation
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import Svg, { Circle, Line, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { EnhancedWeather, WeatherLayerConfig } from '../types/weather';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WeatherOverlayProps {
  weather: EnhancedWeather;
  config: WeatherLayerConfig;
  mapBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  visible: boolean;
  onToggleLayer?: (layerName: keyof WeatherLayerConfig['layers']) => void;
}

interface WindParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  opacity: number;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({
  weather,
  config,
  mapBounds,
  visible,
  onToggleLayer,
}) => {
  const [particles, setParticles] = useState<WindParticle[]>([]);
  const animationFrameRef = useRef<number>();
  const particleIdCounter = useRef(0);

  // Wind-Particles Animation
  useEffect(() => {
    if (!visible || !config.layers.windParticles) {
      return;
    }

    // Initialisiere Particles
    const initialParticles: WindParticle[] = [];
    const count = config.windParticles.particleCount;

    for (let i = 0; i < count; i++) {
      initialParticles.push(createParticle());
    }

    setParticles(initialParticles);

    // Animation Loop
    const animate = () => {
      setParticles((prevParticles) => {
        return prevParticles
          .map((p) => updateParticle(p, weather))
          .filter((p) => p.age < p.maxAge)
          .concat(
            // Neue Particles nachfüllen
            Array(Math.max(0, count - prevParticles.length))
              .fill(null)
              .map(() => createParticle())
          );
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [visible, config.layers.windParticles, weather, config.windParticles]);

  function createParticle(): WindParticle {
    const windRadians = (weather.wind.direction * Math.PI) / 180;
    const speed =
      (weather.wind.speed * config.windParticles.particleSpeed) / 10;

    return {
      id: particleIdCounter.current++,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      vx: Math.sin(windRadians) * speed,
      vy: -Math.cos(windRadians) * speed,
      age: 0,
      maxAge: Math.random() * 100 + 50,
      opacity: 1,
    };
  }

  function updateParticle(
    particle: WindParticle,
    weather: EnhancedWeather
  ): WindParticle {
    const newX = particle.x + particle.vx;
    const newY = particle.y + particle.vy;
    const newAge = particle.age + 1;

    // Fade out am Ende
    const ageRatio = newAge / particle.maxAge;
    const newOpacity = Math.max(0, 1 - ageRatio);

    // Wrap around screen
    let finalX = newX;
    let finalY = newY;

    if (newX < 0) finalX = SCREEN_WIDTH;
    if (newX > SCREEN_WIDTH) finalX = 0;
    if (newY < 0) finalY = SCREEN_HEIGHT;
    if (newY > SCREEN_HEIGHT) finalY = 0;

    return {
      ...particle,
      x: finalX,
      y: finalY,
      age: newAge,
      opacity: newOpacity,
    };
  }

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Wind Particles Layer */}
      {config.layers.windParticles && (
        <Svg
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          style={[
            styles.layer,
            { opacity: config.opacity.windParticles },
          ]}
        >
          {particles.map((particle) => (
            <Circle
              key={particle.id}
              cx={particle.x}
              cy={particle.y}
              r={config.windParticles.particleSize}
              fill={config.windParticles.color}
              opacity={particle.opacity}
            />
          ))}
        </Svg>
      )}

      {/* Cloud Radar Layer */}
      {config.layers.cloudRadar && weather.radar && (
        <View
          style={[
            styles.layer,
            { opacity: config.opacity.cloudRadar },
          ]}
        >
          {/* Hier würde Radar-Bild als Image gerendert */}
          <View style={styles.radarPlaceholder}>
            <Text style={styles.radarText}>
              Cloud Coverage: {weather.current.cloudCover}%
            </Text>
          </View>
        </View>
      )}

      {/* Precipitation Layer */}
      {config.layers.precipitation &&
        weather.precipitation.type !== 'none' && (
          <Svg
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            style={[
              styles.layer,
              { opacity: config.opacity.precipitation },
            ]}
          >
            <Defs>
              <RadialGradient
                id="precipGradient"
                cx="50%"
                cy="50%"
              >
                <Stop offset="0%" stopColor="#4A90E2" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#4A90E2" stopOpacity="0.1" />
              </RadialGradient>
            </Defs>
            <Circle
              cx={SCREEN_WIDTH / 2}
              cy={SCREEN_HEIGHT / 2}
              r={200}
              fill="url(#precipGradient)"
            />
          </Svg>
        )}

      {/* Scent Carry Arrow */}
      {config.layers.scentCarry && (
        <Svg
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          style={[
            styles.layer,
            { opacity: config.opacity.scentCarry },
          ]}
        >
          <ScentCarryArrow
            direction={weather.scentCarry.direction}
            quality={weather.scentCarry.quality}
            centerX={SCREEN_WIDTH / 2}
            centerY={SCREEN_HEIGHT / 2}
          />
        </Svg>
      )}

      {/* Weather Alerts Banner */}
      {config.layers.alerts && weather.alerts && weather.alerts.length > 0 && (
        <View style={styles.alertBanner} pointerEvents="auto">
          <Text style={styles.alertText}>
            ⚠️ {weather.alerts[0].headline}
          </Text>
        </View>
      )}

      {/* Temperature Overlay */}
      {config.layers.temperature && (
        <View
          style={[
            styles.temperatureOverlay,
            { opacity: config.opacity.temperature },
          ]}
          pointerEvents="auto"
        >
          <View style={styles.tempCard}>
            <Text style={styles.tempValue}>
              {Math.round(weather.current.temperature)}°C
            </Text>
            <Text style={styles.tempFeels}>
              Gefühlt {Math.round(weather.current.feelsLike)}°C
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

// Scent Carry Arrow Component
interface ScentCarryArrowProps {
  direction: number;
  quality: 'excellent' | 'good' | 'moderate' | 'poor' | 'very_poor';
  centerX: number;
  centerY: number;
}

const ScentCarryArrow: React.FC<ScentCarryArrowProps> = ({
  direction,
  quality,
  centerX,
  centerY,
}) => {
  const arrowLength = 80;
  const radians = (direction * Math.PI) / 180;

  const endX = centerX + Math.sin(radians) * arrowLength;
  const endY = centerY - Math.cos(radians) * arrowLength;

  // Arrow head
  const arrowHeadLength = 15;
  const arrowHeadAngle = Math.PI / 6;

  const leftX =
    endX -
    arrowHeadLength * Math.sin(radians - arrowHeadAngle);
  const leftY =
    endY +
    arrowHeadLength * Math.cos(radians - arrowHeadAngle);

  const rightX =
    endX -
    arrowHeadLength * Math.sin(radians + arrowHeadAngle);
  const rightY =
    endY +
    arrowHeadLength * Math.cos(radians + arrowHeadAngle);

  // Color based on quality
  const color =
    quality === 'excellent'
      ? '#00FF00'
      : quality === 'good'
        ? '#90EE90'
        : quality === 'moderate'
          ? '#FFFF00'
          : quality === 'poor'
            ? '#FFA500'
            : '#FF0000';

  return (
    <>
      {/* Main arrow line */}
      <Line
        x1={centerX}
        y1={centerY}
        x2={endX}
        y2={endY}
        stroke={color}
        strokeWidth={3}
        strokeOpacity={0.8}
      />
      {/* Arrow head */}
      <Path
        d={`M ${endX} ${endY} L ${leftX} ${leftY} L ${rightX} ${rightY} Z`}
        fill={color}
        fillOpacity={0.8}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  radarPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  alertBanner: {
    position: 'absolute',
    top: 60,
    left: 10,
    right: 10,
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  alertText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  temperatureOverlay: {
    position: 'absolute',
    top: 100,
    right: 10,
  },
  tempCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  tempValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tempFeels: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 4,
  },
});
