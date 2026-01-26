'use client';

import React, { useState } from 'react';
import { Recommendation } from '@/lib/types/ai';
import RecommendationCard from './RecommendationCard';

interface AIRecommendationsPanelProps {
  recommendations: Recommendation[];
  loading?: boolean;
  onRefresh?: () => void;
  onFeedback?: (recommendationId: string, helpful: boolean) => void;
}

export default function AIRecommendationsPanel({ 
  recommendations, 
  loading = false,
  onRefresh,
  onFeedback 
}: AIRecommendationsPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[500] bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-lg font-semibold flex items-center gap-2 transition-colors"
      >
        🤖 AI Empfehlungen ({recommendations.length})
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[500] bg-white shadow-2xl rounded-t-2xl max-h-[60vh] overflow-hidden">
      {/* Drag Handle */}
      <div className="flex items-center justify-center py-2 bg-gray-100 cursor-pointer"
           onClick={() => setIsOpen(false)}>
        <div className="w-12 h-1 bg-gray-400 rounded-full"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <div>
            <h2 className="font-bold text-lg">AI Jagd-Empfehlungen</h2>
            <p className="text-xs text-gray-500">
              {recommendations.length} Empfehlungen basierend auf KI-Analyse
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors disabled:opacity-50"
            >
              {loading ? '⏳' : '🔄'} Aktualisieren
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[calc(60vh-120px)] p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-4xl mb-2">🤖</div>
              <p className="text-gray-600">AI analysiert Jagddaten...</p>
            </div>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-xl font-semibold text-gray-800 mb-2">Keine Empfehlungen verfügbar</p>
              <p className="text-gray-600 max-w-md">
                Füge mehr Jagdeinträge hinzu, damit die KI bessere Empfehlungen generieren kann.
                Mindestens 10 Einträge werden benötigt.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Navigation dots */}
            {recommendations.length > 1 && (
              <div className="flex justify-center gap-2 mb-4">
                {recommendations.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex ? 'bg-blue-600 w-6' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Current recommendation */}
            <RecommendationCard
              recommendation={recommendations[currentIndex]}
              onFeedback={onFeedback ? (helpful) => onFeedback(recommendations[currentIndex].id, helpful) : undefined}
            />

            {/* Navigation buttons */}
            {recommendations.length > 1 && (
              <div className="flex justify-between gap-2 mt-4">
                <button
                  onClick={() => setCurrentIndex((currentIndex - 1 + recommendations.length) % recommendations.length)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors"
                >
                  ← Vorherige
                </button>
                <button
                  onClick={() => setCurrentIndex((currentIndex + 1) % recommendations.length)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors"
                >
                  Nächste →
                </button>
              </div>
            )}

            {/* All recommendations (collapsed view) */}
            {recommendations.length > 1 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Alle Empfehlungen ({recommendations.length})
                </p>
                <div className="space-y-2">
                  {recommendations.map((rec, idx) => (
                    <button
                      key={rec.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        idx === currentIndex 
                          ? 'bg-blue-100 border-2 border-blue-600' 
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {rec.typ === 'best_spot' ? '🎯' :
                             rec.typ === 'best_time' ? '⏰' :
                             rec.typ === 'wildlife_prediction' ? '🦌' : '🌤️'}
                          </span>
                          <div>
                            <p className="font-semibold text-sm">{rec.titel}</p>
                            <p className="text-xs text-gray-600">{rec.wildart || 'Allgemein'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 rounded text-xs font-bold text-white ${
                            rec.prioritaet === 'sehr_hoch' ? 'bg-red-600' :
                            rec.prioritaet === 'hoch' ? 'bg-orange-500' :
                            rec.prioritaet === 'mittel' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}>
                            {rec.score}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
