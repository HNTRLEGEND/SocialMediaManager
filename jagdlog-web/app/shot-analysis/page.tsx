'use client'

import { useState } from 'react'

export default function ShotAnalysisPage() {
  const [step, setStep] = useState<'input' | 'result'>('input')
  const [analysis, setAnalysis] = useState({
    hitZone: 'Blattschuss',
    confidence: 95,
    waitTime: { min: 15, optimal: 30, max: 60 },
    dogRequired: 'Optional',
    successProbability: 95,
  })

  const handleAnalyze = () => {
    setStep('result')
  }

  if (step === 'result') {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-green-800">🎯 Shot Analysis Ergebnis</h1>

        {/* Diagnosis */}
        <div className="card bg-green-50 border-2 border-green-500">
          <h2 className="text-2xl font-bold mb-4">Diagnose</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-green-800">{analysis.hitZone}</p>
              <p className="text-gray-600 mt-2">Herz/Lunge getroffen - optimale Trefferlage</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{analysis.confidence}%</div>
              <div className="text-sm text-gray-600">Confidence</div>
            </div>
          </div>
        </div>

        {/* Wait Time */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">⏱️ Wartezeit-Empfehlung</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded">
              <div className="text-2xl font-bold">{analysis.waitTime.min} Min</div>
              <div className="text-sm text-gray-600">Minimum</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded border-2 border-green-500">
              <div className="text-2xl font-bold">{analysis.waitTime.optimal} Min</div>
              <div className="text-sm text-gray-600">Optimal</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded">
              <div className="text-2xl font-bold">{analysis.waitTime.max} Min</div>
              <div className="text-sm text-gray-600">Maximum</div>
            </div>
          </div>
        </div>

        {/* Dog Recommendation */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">🐕 Hunde-Empfehlung</h2>
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-lg font-semibold">{analysis.dogRequired}</p>
            <p className="text-gray-600 mt-2">
              Bei Blattschuss kann auf Schweißhund verzichtet werden. 
              Wild sollte innerhalb des Suchkreises liegen.
            </p>
          </div>
        </div>

        {/* Recovery Probability Map */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">📍 Fundort-Vorhersage</h2>
          <div className="bg-gray-200 h-96 rounded flex items-center justify-center">
            <div className="text-center">
              <p className="text-6xl mb-4">🗺️</p>
              <p className="text-gray-600">Karten-Ansicht mit Wahrscheinlichkeits-Zonen</p>
              <a href="/map" className="btn-primary mt-4 inline-block">
                Zur Karte
              </a>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span className="text-sm">Zone 1: 60% (20-50m)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
              <span className="text-sm">Zone 2: 25% (50-100m)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm">Zone 3: 15% (100-200m)</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button onClick={() => setStep('input')} className="btn-primary">
            ← Neue Analyse
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            🚀 Nachsuche starten
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-green-800">🎯 Shot Analysis</h1>

      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Schussdetails</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Entfernung (Meter)</label>
            <input type="number" className="w-full p-2 border rounded" placeholder="80" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Schussrichtung (°)</label>
            <input type="number" className="w-full p-2 border rounded" placeholder="45" />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Wildreaktion</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Reaktionstyp</label>
            <select className="w-full p-2 border rounded">
              <option>Zusammenbruch</option>
              <option>Flucht</option>
              <option>Zeichnen</option>
              <option>Keine Reaktion</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Fluchtrichtung (°)</label>
              <input type="number" className="w-full p-2 border rounded" placeholder="90" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Geschwindigkeit</label>
              <select className="w-full p-2 border rounded">
                <option>Langsam</option>
                <option>Mittel</option>
                <option>Schnell</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold mb-4">🩸 Blut/Schweiß</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Farbe</label>
            <select className="w-full p-2 border rounded">
              <option>Hellrot (Lungenblut)</option>
              <option>Dunkelrot (Lebertreffer)</option>
              <option>Bräunlich (Pansenschuss)</option>
              <option>Schaumig (Lungenblut)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Menge</label>
            <select className="w-full p-2 border rounded">
              <option>Wenig</option>
              <option>Mittel</option>
              <option>Viel</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Verteilung</label>
            <select className="w-full p-2 border rounded">
              <option>Tropfen</option>
              <option>Spritzer</option>
              <option>Fährte</option>
              <option>Lache</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Höhe</label>
            <select className="w-full p-2 border rounded">
              <option>Bodennah</option>
              <option>Kniehoch</option>
              <option>Brusthoch</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold mb-4">📸 Foto-Upload (Optional)</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-4xl mb-2">📷</p>
          <p className="text-gray-600 mb-4">Foto von Anschusszeichen hochladen</p>
          <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Datei auswählen
          </button>
          <p className="text-xs text-gray-500 mt-2">
            KI-Analyse erkennt automatisch Blutfarbe, Haare und Wildpret
          </p>
        </div>
      </div>

      <button onClick={handleAnalyze} className="btn-primary w-full text-xl py-4">
        🚀 Analyse starten
      </button>
    </div>
  )
}
