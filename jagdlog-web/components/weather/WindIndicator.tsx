'use client';

import React from 'react';
import { WindVector } from '@/lib/types/weather';

interface WindIndicatorProps {
  wind: WindVector;
}

export default function WindIndicator({ wind }: WindIndicatorProps) {
  const getWindColor = (speedBft: number) => {
    if (speedBft <= 1) return '#4CAF50'; // Schwach
    if (speedBft <= 3) return '#8BC34A'; // Leicht
    if (speedBft <= 5) return '#FFC107'; // Mäßig
    if (speedBft <= 7) return '#FF9800'; // Frisch
    return '#F44336'; // Stark
  };

  const windColor = getWindColor(wind.speedBft);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-64">
      {/* Windrose */}
      <div className="relative w-32 h-32 mx-auto mb-4 border-2 border-gray-300 rounded-full">
        {/* Cardinal Directions */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs font-bold">N</div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs font-bold">E</div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs font-bold">S</div>
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-xs font-bold">W</div>
        
        {/* Wind Arrow */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            transform: `translate(-50%, -50%) rotate(${wind.directionDegrees}deg)`,
          }}
        >
          <div 
            className="w-0 h-0 border-l-8 border-r-8 border-t-16"
            style={{
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: windColor,
              borderTopWidth: '40px',
            }}
          />
        </div>
      </div>

      {/* Details */}
      <div className="text-center">
        <p className="text-lg font-bold" style={{ color: windColor }}>
          {wind.directionCardinal} {wind.directionDegrees}°
        </p>
        <p className="text-sm mt-1" style={{ color: windColor }}>
          {wind.speedBft} Bft ({wind.speedMps.toFixed(1)} m/s)
        </p>
        {wind.gustsMps && (
          <p className="text-xs mt-1 text-orange-600">
            Böen: {wind.gustsMps.toFixed(1)} m/s
          </p>
        )}
      </div>

      {/* Quality Bar */}
      <div className="mt-3 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all"
          style={{ 
            width: `${wind.confidence * 100}%`,
            backgroundColor: windColor,
          }}
        />
      </div>
    </div>
  );
}
