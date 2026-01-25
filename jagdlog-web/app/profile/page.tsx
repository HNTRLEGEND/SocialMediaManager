'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import { initDatabase, now } from '@/lib/database';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  const [stats, setStats] = useState({
    totalHunts: 0,
    successfulHunts: 0,
    analysisCount: 0,
    uploads: 0,
    memberSince: '',
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    setFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      bio: currentUser.bio || '',
    });
    loadProfile(currentUser);
  }, [router]);

  const loadProfile = async (user: any) => {
    setLoading(true);
    try {
      const db = await initDatabase();

      // Load stats
      const huntsResult = db.exec(
        `SELECT COUNT(*) FROM eintraege WHERE user_id = ? AND typ = 'hunt' AND geloescht_am IS NULL`,
        [user.id]
      );
      const totalHunts = Number(huntsResult[0]?.values[0]?.[0] || 0);

      const successResult = db.exec(
        `SELECT COUNT(*) FROM eintraege WHERE user_id = ? AND typ = 'harvest' AND geloescht_am IS NULL`,
        [user.id]
      );
      const successfulHunts = Number(successResult[0]?.values[0]?.[0] || 0);

      const analysisResult = db.exec(
        `SELECT COUNT(*) FROM shot_analysis sa JOIN eintraege e ON sa.eintrag_id = e.id WHERE e.user_id = ?`,
        [user.id]
      );
      const analysisCount = Number(analysisResult[0]?.values[0]?.[0] || 0);

      const uploadsResult = db.exec(
        `SELECT COUNT(*) FROM training_uploads WHERE user_id = ?`,
        [user.id]
      );
      const uploads = Number(uploadsResult[0]?.values[0]?.[0] || 0);

      // Get user creation date
      const userResult = db.exec(
        `SELECT erstellt_am FROM users WHERE id = ?`,
        [user.id]
      );
      const memberSince = userResult[0]?.values[0]?.[0] as string || now();

      setStats({
        totalHunts,
        successfulHunts,
        analysisCount,
        uploads,
        memberSince,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const db = await initDatabase();
      db.run(
        `UPDATE users SET name = ?, bio = ?, geaendert_am = ? WHERE id = ?`,
        [formData.name, formData.bio, now(), user.id]
      );

      // Update localStorage
      const updatedUser = { ...user, name: formData.name, bio: formData.bio };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      alert('✅ Profil aktualisiert!');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('❌ Fehler beim Speichern!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <p className="text-xl font-semibold">Lade Profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">👤 Profil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {(user?.name || user?.email)?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name || 'Unbekannt'}</h2>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-500">
                  Mitglied seit {new Date(stats.memberSince).toLocaleDateString('de-DE', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              {editing ? '❌ Abbrechen' : '✏️ Bearbeiten'}
            </button>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">E-Mail</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full p-3 border rounded bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">E-Mail kann nicht geändert werden</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Erzähle etwas über dich..."
                  className="w-full p-3 border rounded h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
              >
                💾 Speichern
              </button>
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-lg mb-2">📝 Bio</h3>
              <p className="text-gray-700">
                {formData.bio || 'Keine Bio vorhanden. Klicke auf "Bearbeiten" um eine hinzuzufügen.'}
              </p>
            </div>
          )}
        </div>

        {/* Stats Card */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">📊 Statistiken</h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded">
              <p className="text-sm text-gray-600">Jagden gesamt</p>
              <p className="text-2xl font-bold text-green-800">{stats.totalHunts}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">Erfolgreich</p>
              <p className="text-2xl font-bold text-blue-800">{stats.successfulHunts}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <p className="text-sm text-gray-600">Analysen</p>
              <p className="text-2xl font-bold text-purple-800">{stats.analysisCount}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded">
              <p className="text-sm text-gray-600">Uploads</p>
              <p className="text-2xl font-bold text-orange-800">{stats.uploads}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card mt-6">
        <h3 className="text-2xl font-bold mb-4">🏆 Erfolge</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded text-center ${stats.totalHunts >= 1 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-100'}`}>
            <div className="text-4xl mb-2">🦌</div>
            <p className="font-semibold">Erste Jagd</p>
            <p className="text-xs text-gray-600">{stats.totalHunts >= 1 ? 'Freigeschaltet' : 'Gesperrt'}</p>
          </div>
          <div className={`p-4 rounded text-center ${stats.totalHunts >= 10 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-100'}`}>
            <div className="text-4xl mb-2">🎯</div>
            <p className="font-semibold">Jäger</p>
            <p className="text-xs text-gray-600">{stats.totalHunts >= 10 ? 'Freigeschaltet' : `${stats.totalHunts}/10`}</p>
          </div>
          <div className={`p-4 rounded text-center ${stats.analysisCount >= 5 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-100'}`}>
            <div className="text-4xl mb-2">🔬</div>
            <p className="font-semibold">Analyst</p>
            <p className="text-xs text-gray-600">{stats.analysisCount >= 5 ? 'Freigeschaltet' : `${stats.analysisCount}/5`}</p>
          </div>
          <div className={`p-4 rounded text-center ${stats.uploads >= 10 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-100'}`}>
            <div className="text-4xl mb-2">🤝</div>
            <p className="font-semibold">Unterstützer</p>
            <p className="text-xs text-gray-600">{stats.uploads >= 10 ? 'Freigeschaltet' : `${stats.uploads}/10`}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card mt-6 bg-red-50 border-l-4 border-red-600">
        <h3 className="text-xl font-bold mb-4 text-red-800">⚠️ Gefahrenzone</h3>
        <div className="space-y-3">
          <button
            onClick={() => {
              if (confirm('🔄 Wirklich alle Daten zurücksetzen?')) {
                localStorage.clear();
                router.push('/login');
              }
            }}
            className="w-full py-3 border border-red-300 text-red-600 rounded hover:bg-red-100"
          >
            🔄 Daten zurücksetzen
          </button>
          <button
            onClick={() => {
              auth.logout();
              router.push('/login');
            }}
            className="w-full py-3 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🚪 Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}
