'use client';

import React from 'react';
import { Recommendation } from '@/lib/types/ai';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onFeedback?: (helpful: boolean) => void;
}

export default function RecommendationCard({ recommendation, onFeedback }: RecommendationCardProps) {
  const getPriorityColor = (prioritaet: string) => {
    switch (prioritaet) {
      case 'sehr_hoch': return 'bg-red-600';
      case 'hoch': return 'bg-orange-500';
      case 'mittel': return 'bg-yellow-500';
      case 'niedrig': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (typ: string) => {
    switch (typ) {
      case 'best_spot': return '🎯';
      case 'best_time': return '⏰';
      case 'wildlife_prediction': return '🦌';
      case 'weather_opportunity': return '🌤️';
      default: return '📍';
    }
  };

  const getTypeLabel = (typ: string) => {
    switch (typ) {
      case 'best_spot': return 'Bester Standort';
      case 'best_time': return 'Beste Zeit';
      case 'wildlife_prediction': return 'Wild-Prognose';
      case 'weather_opportunity': return 'Wetter-Chance';
      default: return 'Empfehlung';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border-l-4" 
         style={{ borderLeftColor: getPriorityColor(recommendation.prioritaet).replace('bg-', '#') }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getTypeIcon(recommendation.typ)}</span>
          <div>
            <h3 className="font-bold text-lg">{recommendation.titel}</h3>
            <p className="text-xs text-gray-500">{getTypeLabel(recommendation.typ)}</p>
          </div>
        </div>
        
        {/* Score Badge */}
        <div className="flex flex-col items-end gap-1">
          <div className={`${getPriorityColor(recommendation.prioritaet)} text-white px-3 py-1 rounded-full text-sm font-bold`}>
            {recommendation.score}
          </div>
          <div className="text-xs text-gray-500">
            {recommendation.confidence}% sicher
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-3">{recommendation.beschreibung}</p>

      {/* Success Probability */}
      {recommendation.erfolgswahrscheinlichkeit !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Erfolgswahrscheinlichkeit</span>
            <span className="font-semibold">{recommendation.erfolgswahrscheinlichkeit}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-600 transition-all"
              style={{ width: `${recommendation.erfolgswahrscheinlichkeit}%` }}
            />
          </div>
        </div>
      )}

      {/* Time Window */}
      {recommendation.empfohleneZeit && (
        <div className="mb-3 p-2 bg-blue-50 rounded">
          <p className="text-sm font-semibold text-blue-900">
            ⏰ Empfohlene Zeit: {recommendation.empfohleneZeit.von} - {recommendation.empfohleneZeit.bis}
          </p>
        </div>
      )}

      {/* Wildlife Predictions */}
      {recommendation.erwarteteWildarten && recommendation.erwarteteWildarten.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-semibold text-gray-700 mb-1">Erwartete Wildarten:</p>
          <div className="space-y-1">
            {recommendation.erwarteteWildarten.map((w, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{w.wildart}</span>
                <span className="text-gray-600">{w.wahrscheinlichkeit}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reasons */}
      {recommendation.gruende.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-semibold text-gray-700 mb-1">Gründe:</p>
          <ul className="list-disc list-inside space-y-1">
            {recommendation.gruende.map((grund, idx) => (
              <li key={idx} className="text-sm text-gray-600">{grund}</li>
            ))}
          </ul>
        </div>
      )}

      {/* GPS Coordinates */}
      {recommendation.gps && (
        <div className="mb-3 p-2 bg-gray-50 rounded">
          <p className="text-xs text-gray-600">
            📍 Position: {recommendation.gps.latitude.toFixed(5)}, {recommendation.gps.longitude.toFixed(5)}
          </p>
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pt-2 border-t">
        <span>Basierend auf {recommendation.basedOnEvents} Ereignissen</span>
        <span>
          {new Date(recommendation.generatedAt).toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>

      {/* Confidence Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Vertrauenswert</span>
          <span className="font-semibold">{recommendation.confidence}%</span>
        </div>
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${
              recommendation.confidence > 70 ? 'bg-green-500' :
              recommendation.confidence > 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${recommendation.confidence}%` }}
          />
        </div>
      </div>

      {/* Feedback Buttons */}
      {onFeedback && (
        <div className="flex gap-2">
          <button
            onClick={() => onFeedback(true)}
            className="flex-1 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-semibold transition-colors"
          >
            👍 Hilfreich
          </button>
          <button
            onClick={() => onFeedback(false)}
            className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-semibold transition-colors"
          >
            👎 Nicht hilfreich
          </button>
        </div>
      )}
    </div>
  );
}
