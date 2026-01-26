'use client';

import { useState, useEffect } from 'react';
import type { Teilnehmer, TeilnehmerRolle } from '@/lib/types/gesellschaftsjagd';
import { 
  TEILNEHMER_ROLLEN, 
  getRolleLabel, 
  getRolleIcon 
} from '@/lib/types/gesellschaftsjagd';
import {
  getTeilnehmer,
  addTeilnehmer,
  updateTeilnehmer,
  deleteTeilnehmer,
} from '@/lib/services/gesellschaftsjagdService';

interface TeilnehmerManagerProps {
  jagdId: string;
}

export default function TeilnehmerManager({ jagdId }: TeilnehmerManagerProps) {
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterRolle, setFilterRolle] = useState<TeilnehmerRolle | 'all'>('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telefon: '',
    rolle: 'jaeger' as TeilnehmerRolle,
    notizen: '',
  });

  useEffect(() => {
    loadTeilnehmer();
  }, [jagdId]);

  const loadTeilnehmer = async () => {
    setLoading(true);
    try {
      const data = await getTeilnehmer(jagdId);
      setTeilnehmer(data);
    } catch (error) {
      console.error('Error loading teilnehmer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateTeilnehmer(editingId, formData);
      } else {
        await addTeilnehmer({
          jagd_id: jagdId,
          ...formData,
          anwesend: false,
        });
      }
      
      resetForm();
      loadTeilnehmer();
    } catch (error) {
      console.error('Error saving teilnehmer:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleEdit = (t: Teilnehmer) => {
    setFormData({
      name: t.name,
      email: t.email || '',
      telefon: t.telefon || '',
      rolle: t.rolle,
      notizen: t.notizen || '',
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Teilnehmer wirklich löschen?')) return;
    
    try {
      await deleteTeilnehmer(id);
      loadTeilnehmer();
    } catch (error) {
      console.error('Error deleting teilnehmer:', error);
      alert('Fehler beim Löschen');
    }
  };

  const handleToggleAnwesend = async (t: Teilnehmer) => {
    try {
      await updateTeilnehmer(t.id, { anwesend: !t.anwesend });
      loadTeilnehmer();
    } catch (error) {
      console.error('Error updating anwesend:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      telefon: '',
      rolle: 'jaeger',
      notizen: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredTeilnehmer = filterRolle === 'all' 
    ? teilnehmer 
    : teilnehmer.filter(t => t.rolle === filterRolle);

  const rollenCounts = TEILNEHMER_ROLLEN.reduce((acc, rolle) => {
    acc[rolle] = teilnehmer.filter(t => t.rolle === rolle).length;
    return acc;
  }, {} as Record<TeilnehmerRolle, number>);

  if (loading) {
    return <div className="text-center py-8">Lade Teilnehmer...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Teilnehmer ({teilnehmer.length})</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          {showForm ? 'Abbrechen' : '+ Teilnehmer hinzufügen'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border space-y-3">
          <h4 className="font-semibold">
            {editingId ? 'Teilnehmer bearbeiten' : 'Neuer Teilnehmer'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rolle</label>
              <select
                value={formData.rolle}
                onChange={(e) => setFormData({ ...formData, rolle: e.target.value as TeilnehmerRolle })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {TEILNEHMER_ROLLEN.map((rolle) => (
                  <option key={rolle} value={rolle}>
                    {getRolleIcon(rolle)} {getRolleLabel(rolle)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">E-Mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Telefon</label>
              <input
                type="tel"
                value={formData.telefon}
                onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notizen</label>
            <textarea
              value={formData.notizen}
              onChange={(e) => setFormData({ ...formData, notizen: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              {editingId ? 'Aktualisieren' : 'Hinzufügen'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterRolle('all')}
          className={`px-3 py-1 rounded-lg text-sm transition ${
            filterRolle === 'all'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Alle ({teilnehmer.length})
        </button>
        {TEILNEHMER_ROLLEN.map((rolle) => (
          <button
            key={rolle}
            onClick={() => setFilterRolle(rolle)}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              filterRolle === rolle
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {getRolleIcon(rolle)} {getRolleLabel(rolle)} ({rollenCounts[rolle] || 0})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Anwesend</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Rolle</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Kontakt</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Notizen</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeilnehmer.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Keine Teilnehmer gefunden
                </td>
              </tr>
            ) : (
              filteredTeilnehmer.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleAnwesend(t)}
                      className={`w-6 h-6 rounded flex items-center justify-center transition ${
                        t.anwesend
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                      }`}
                      title={t.anwesend ? 'Anwesend' : 'Nicht anwesend'}
                    >
                      {t.anwesend && '✓'}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1">
                      {getRolleIcon(t.rolle)} {getRolleLabel(t.rolle)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {t.email && <div>{t.email}</div>}
                    {t.telefon && <div>{t.telefon}</div>}
                    {!t.email && !t.telefon && <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {t.notizen || '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(t)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm"
                      >
                        Löschen
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
