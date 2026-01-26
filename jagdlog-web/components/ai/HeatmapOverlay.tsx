'use client';

import React from 'react';
import { HeatmapPoint } from '@/lib/types/ai';

interface HeatmapOverlayProps {
  heatmapData: HeatmapPoint[];
  visible: boolean;
  opacity?: number;
}

export default function HeatmapOverlay({ heatmapData, visible, opacity = 0.6 }: HeatmapOverlayProps) {
  if (!visible || heatmapData.length === 0) return null;

  const getColor = (intensity: number): string => {
    // 5-step color gradient: Blue → Green → Yellow → Orange → Red
    if (intensity >= 80) return 'rgba(239, 68, 68, '; // Red - very high
    if (intensity >= 60) return 'rgba(249, 115, 22, '; // Orange - high
    if (intensity >= 40) return 'rgba(234, 179, 8, '; // Yellow - medium
    if (intensity >= 20) return 'rgba(34, 197, 94, '; // Green - low
    return 'rgba(59, 130, 246, '; // Blue - very low
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-[400]">
      {/* SVG for heatmap circles */}
      <svg className="w-full h-full">
        <defs>
          {heatmapData.map((point, idx) => (
            <radialGradient
              key={`gradient-${idx}`}
              id={`heatmap-gradient-${idx}`}
              cx="50%"
              cy="50%"
            >
              <stop 
                offset="0%" 
                style={{ 
                  stopColor: getColor(point.intensity).slice(0, -2) + '))',
                  stopOpacity: opacity 
                }} 
              />
              <stop 
                offset="70%" 
                style={{ 
                  stopColor: getColor(point.intensity).slice(0, -2) + '))',
                  stopOpacity: opacity * 0.5 
                }} 
              />
              <stop 
                offset="100%" 
                style={{ 
                  stopColor: getColor(point.intensity).slice(0, -2) + '))',
                  stopOpacity: 0 
                }} 
              />
            </radialGradient>
          ))}
        </defs>

        {heatmapData.map((point, idx) => {
          // For demonstration - in production, convert GPS to screen coordinates
          // This is a placeholder that would need actual map projection
          const x = (point.gps.longitude + 180) * (typeof window !== 'undefined' ? window.innerWidth / 360 : 1920 / 360);
          const y = (90 - point.gps.latitude) * (typeof window !== 'undefined' ? window.innerHeight / 180 : 1080 / 180);
          const radius = Math.min(200, point.radius / 5); // Scale down for screen

          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r={radius}
              fill={`url(#heatmap-gradient-${idx})`}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg pointer-events-auto">
        <p className="text-xs font-bold text-gray-800 mb-2">Erfolgs-Heatmap</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-600"></div>
            <span className="text-xs text-gray-700">Sehr hoch (80-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-xs text-gray-700">Hoch (60-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-700">Mittel (40-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-700">Niedrig (20-40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-700">Sehr niedrig (0-20%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
