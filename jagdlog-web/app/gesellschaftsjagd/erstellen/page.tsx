'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createGesellschaftsjagd } from '@/lib/services/gesellschaftsjagdService';
import { JagdTyp } from '@/lib/types/gesellschaftsjagd';

interface WizardData {
  revierId: string;
  name: string;
  beschreibung?: string;
  typ: JagdTyp;
  datum: Date;
  status: 'geplant' | 'aktiv' | 'abgeschlossen' | 'abgesagt';
}

export default function ErstellenPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<WizardData>({
    revierId: '', // Will be set when user is loaded
    name: '',
    beschreibung: '',
    typ: 'drueckjagd',
    datum: new Date(),
    status: 'geplant',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Update revierId when user loads
  useEffect(() => {
    if (user && !formData.revierId) {
      setFormData(prev => ({
        ...prev,
        revierId: user.revierId || '', // Empty string if not set, will need to be selected
      }));
    }
  }, [user, formData.revierId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Sie müssen angemeldet sein');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate revierId is set
      if (!formData.revierId) {
        setError('Bitte wählen Sie ein Revier aus');
        return;
      }
      
      await createGesellschaftsjagd(
        formData,
        user.id,      // ← Echter User!
        user.name
      );
      setSuccess(true);
      // Reset form
      setFormData({
        revierId: user.revierId || '',
        name: '',
        beschreibung: '',
        typ: 'drueckjagd',
        datum: new Date(),
        status: 'geplant',
      });
    } catch (err: any) {
      setError(err.message || 'Fehler beim Erstellen der Jagd');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof WizardData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Sie müssen angemeldet sein, um eine Gesellschaftsjagd zu erstellen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Gesellschaftsjagd erstellen</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          Angemeldet als: <strong>{user.name}</strong> ({user.email})
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">✓ Gesellschaftsjagd erfolgreich erstellt!</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">✗ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-md p-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name der Jagd *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            maxLength={100}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="z.B. Drückjagd Hauptrevier 2026"
          />
          <div className="text-xs text-gray-500 text-right mt-1">
            {formData.name.length}/100
          </div>
        </div>

        <div>
          <label htmlFor="beschreibung" className="block text-sm font-medium text-gray-700 mb-2">
            Beschreibung
          </label>
          <textarea
            id="beschreibung"
            value={formData.beschreibung}
            onChange={(e) => handleInputChange('beschreibung', e.target.value)}
            maxLength={500}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Beschreibung (max. 500 Zeichen)"
          />
          <div className="text-xs text-gray-500 text-right mt-1">
            {(formData.beschreibung || '').length}/500
          </div>
        </div>

        <div>
          <label htmlFor="typ" className="block text-sm font-medium text-gray-700 mb-2">
            Jagd-Typ *
          </label>
          <select
            id="typ"
            value={formData.typ}
            onChange={(e) => handleInputChange('typ', e.target.value as JagdTyp)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="drueckjagd">Drückjagd</option>
            <option value="treibjagd">Treibjagd</option>
            <option value="bewegungsjagd">Bewegungsjagd</option>
            <option value="ansitzjagd_gruppe">Gemeinschaftlicher Ansitz</option>
            <option value="riegeljagd">Riegeljagd</option>
            <option value="sonstiges">Sonstiges</option>
          </select>
        </div>

        <div>
          <label htmlFor="datum" className="block text-sm font-medium text-gray-700 mb-2">
            Datum *
          </label>
          <input
            type="date"
            id="datum"
            value={formData.datum.toISOString().split('T')[0]}
            onChange={(e) => handleInputChange('datum', new Date(e.target.value))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Erstellen...' : 'Gesellschaftsjagd erstellen'}
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  );
}
