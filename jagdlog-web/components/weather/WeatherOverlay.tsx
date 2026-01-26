'use client';

import React, { useEffect, useState } from 'react';
import { EnhancedWeather, WeatherLayerConfig } from '@/lib/types/weather';

interface WeatherOverlayProps {
  weather: EnhancedWeather | null;
  config: WeatherLayerConfig;
  visible: boolean;
}

export default function WeatherOverlay({ weather, config, visible }: WeatherOverlayProps) {
  const [particles, setParticles] = useState<Array<{ id: string; x: number; y: number }>>([]);

  useEffect(() => {
    if (!config.wind.enabled || !weather) return;

    // Generate wind particles
    const newParticles = Array.from({ length: config.wind.particleCount }, (_, i) => ({
      id: `particle-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));

    setParticles(newParticles);
  }, [config.wind.enabled, config.wind.particleCount, weather]);

  if (!visible || !weather) return null;

  const windAngle = weather.wind.directionDegrees;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Wind Particles */}
      {config.wind.enabled && particles.map(particle => (
        <div
          key={particle.id}
          className="absolute text-green-600 animate-wind-drift"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: config.wind.opacity,
            fontSize: '20px',
            transform: `rotate(${windAngle}deg)`,
          }}
        >
          ➜
        </div>
      ))}

      {/* Scent Carry Info */}
      {config.scentCarry.enabled && weather.scentCarry && (
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg max-w-xs">
          <p className="text-sm font-bold text-gray-800">🌬️ Duftverlauf</p>
          <p className="text-xs text-gray-600 mt-1">{weather.scentCarry.explanation}</p>
          <p className="text-xs text-gray-500 mt-1">Qualität: {weather.scentCarry.quality}</p>
        </div>
      )}

      {/* Precipitation Warnings */}
      {config.precipitation.showWarnings && weather.precipitation.warnings?.map((warning, idx) => (
        <div 
          key={idx}
          className="absolute top-4 left-4 right-4 bg-red-600 text-white p-2 rounded-lg shadow-lg"
        >
          <p className="text-xs font-bold">{warning.type.toUpperCase()}: {warning.message}</p>
        </div>
      ))}
    </div>
  );
}
