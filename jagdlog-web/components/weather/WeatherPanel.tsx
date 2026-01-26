'use client';

import React from 'react';
import { EnhancedWeather } from '@/lib/types/weather';
import WindIndicator from './WindIndicator';

interface WeatherPanelProps {
  weather: EnhancedWeather | null;
  onRefresh?: () => void;
}

export default function WeatherPanel({ weather, onRefresh }: WeatherPanelProps) {
  if (!weather) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <p className="text-gray-500">Lade Wetterdaten...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Wetter</h3>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            🔄 Aktualisieren
          </button>
        )}
      </div>

      {/* Temperature & Basics */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xl font-bold">{weather.temperature}°C</p>
          <p className="text-sm text-gray-600">Luftfeuchtigkeit: {weather.humidity}%</p>
          {weather.visibility && (
            <p className="text-sm text-gray-600">Sicht: {Math.round(weather.visibility / 1000)}km</p>
          )}
        </div>
        <div>
          <WindIndicator wind={weather.wind} />
        </div>
      </div>

      {/* Moon Phase */}
      <div className="border-t pt-3">
        <p className="text-sm font-semibold">🌙 Mondphase</p>
        <p className="text-xs text-gray-600">
          {weather.moonPhase} ({weather.moonIllumination}% beleuchtet)
        </p>
      </div>

      {/* Cloud Cover */}
      <div className="border-t pt-3">
        <p className="text-sm font-semibold">☁️ Bewölkung</p>
        {weather.cloudLayers.map((layer, idx) => (
          <p key={idx} className="text-xs text-gray-600">
            {layer.coverage} - {layer.cloudType}
          </p>
        ))}
      </div>

      {/* Data Quality */}
      <div className="border-t pt-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Quelle: {weather.source}</span>
          <span>Qualität: {Math.round(weather.dataQuality * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
