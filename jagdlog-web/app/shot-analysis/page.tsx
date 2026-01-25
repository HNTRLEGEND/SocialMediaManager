'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/api';

export default function ShotAnalysisPage() {
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form data
  const [distance, setDistance] = useState('');
  const [direction, setDirection] = useState('');
  const [wildReaction, setWildReaction] = useState('');
  const [bloodColor, setBloodColor] = useState('');
  const [bloodAmount, setBloodAmount] = useState('');
  const [bloodDistribution, setBloodDistribution] = useState('');
  const [bloodHeight, setBloodHeight] = useState('');

  // Result data
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleAnalyze = async () => {
    if (!bloodColor || !bloodAmount || !wildReaction) {
      alert('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/shot-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distance: parseFloat(distance) || 0,
          direction,
          wildReaction,
          bloodColor,
          bloodAmount,
          bloodDistribution,
          bloodHeight,
          revierId: user?.revierId,
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setStep('result');
      } else {
        alert('Fehler bei der Analyse');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Verbindungsfehler');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('input');
    setDistance('');
    setDirection('');
    setWildReaction('');
    setBloodColor('');
    setBloodAmount('');
    setBloodDistribution('');
    setBloodHeight('');
    setResult(null);
  };

  if (step === 'input') {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">🎯 KI-Shot-Analysis</h1>
        <p className="text-gray-600 mb-8">Professionelle Trefferlage-Diagnose</p>

        <div className="card space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4">📍 Schussdetails</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Entfernung (m)</label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Schussrichtung</label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Bitte wählen</option>
                  <option value="frontal">Frontal</option>
                  <option value="seitlich">Seitlich</option>
                  <option value="schräg">Schräg</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">🦌 Wildreaktion *</h3>
            <select
              value={wildReaction}
              onChange={(e) => setWildReaction(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Bitte wählen</option>
              <option value="zusammengebrochen">Sofort zusammengebrochen</option>
              <option value="kurz-geflüchtet">Kurz geflüchtet</option>
              <option value="weit-geflüchtet">Weit geflüchtet</option>
            </select>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">🩸 Blut/Schweiß *</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Farbe *</label>
                <select
                  value={bloodColor}
                  onChange={(e) => setBloodColor(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Bitte wählen</option>
                  <option value="hell-rot">Hell-rot (Lungenblut)</option>
                  <option value="dunkel-rot">Dunkel-rot (Leberblut)</option>
                  <option value="wässrig">Wässrig (Pansen)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Menge *</label>
                <select
                  value={bloodAmount}
                  onChange={(e) => setBloodAmount(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Bitte wählen</option>
                  <option value="viel">Viel</option>
                  <option value="mittel">Mittel</option>
                  <option value="wenig">Wenig</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? '🔄 Analysiere...' : '🎯 Jetzt analysieren'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">📊 Analyse-Ergebnis</h1>
      
      <div className="space-y-6">
        <div className="card bg-green-50 border-l-4 border-green-600">
          <h3 className="text-2xl font-bold text-green-800 mb-2">{result.hitZone}</h3>
          <p className="text-lg">Konfidenz: {(result.confidence * 100).toFixed(1)}%</p>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-4">⏱️ Wartezeit</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded">
              <p className="text-2xl font-bold">{result.waitTimeMin} min</p>
              <p className="text-sm">Minimum</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded border-2 border-green-500">
              <p className="text-2xl font-bold">{result.waitTimeOptimal} min</p>
              <p className="text-sm">Optimal</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded">
              <p className="text-2xl font-bold">{result.waitTimeMax} min</p>
              <p className="text-sm">Maximum</p>
            </div>
          </div>
        </div>

        <button onClick={resetForm} className="btn-primary w-full">
          🔄 Neue Analyse
        </button>
      </div>
    </div>
  );
}
