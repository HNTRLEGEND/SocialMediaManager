'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import { initDatabase, now } from '@/lib/database';
import { performSync } from '@/lib/sync';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [allReviere, setAllReviere] = useState<any[]>([]);
  const [selectedRevierId, setSelectedRevierId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalHunts: 0,
    successRate: 0,
    avgSearchTime: 0,
    communityUploads: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [mlProgress, setMlProgress] = useState({
    bloodImages: { current: 0, goal: 5000 },
    hairImages: { current: 0, goal: 3000 },
    tissuePhotos: { current: 0, goal: 2000 },
    gpsTracks: { current: 0, goal: 5000 },
  });

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadDashboardData(currentUser);
  }, [router, selectedRevierId]);

  const loadDashboardData = async (user: any) => {
    setLoading(true);
    try {
      const db = await initDatabase();

      // Load Reviere for dropdown
      const reviereResult = db.exec(
        `SELECT id, name FROM reviere WHERE user_id = ? AND geloescht_am IS NULL ORDER BY name`,
        [user.id]
      );
      if (reviereResult.length > 0 && reviereResult[0].values.length > 0) {
        const reviereList = reviereResult[0].values.map((row) => ({
          id: row[0] as string,
          name: row[1] as string,
        }));
        setAllReviere(reviereList);
      }

      // Stats aus Datenbank laden (mit Revier-Filter)
      const revierFilter = selectedRevierId ? ` AND revier_id = '${selectedRevierId}'` : '';
      
      const huntsResult = db.exec(
        `SELECT COUNT(*) FROM eintraege WHERE user_id = ? AND typ = 'hunt' AND geloescht_am IS NULL${revierFilter}`,
        [user.id]
      );
      const totalHunts = huntsResult[0]?.values[0]?.[0] || 0;

      const successResult = db.exec(
        `SELECT COUNT(*) FROM eintraege WHERE user_id = ? AND typ = 'harvest' AND geloescht_am IS NULL${revierFilter}`,
        [user.id]
      );
      const successful = successResult[0]?.values[0]?.[0] || 0;

      const analysisResult = db.exec(
        `SELECT COUNT(*) FROM shot_analysis sa
         JOIN eintraege e ON sa.eintrag_id = e.id
         WHERE e.user_id = ?`,
        [user.id]
      );
      const analysisCount = analysisResult[0]?.values[0]?.[0] || 0;

      const uploadsResult = db.exec(
        `SELECT COUNT(*) FROM training_uploads WHERE user_id = ?`,
        [user.id]
      );
      const uploads = uploadsResult[0]?.values[0]?.[0] || 0;

      const successRate = totalHunts > 0 ? (successful / totalHunts) * 100 : 0;

      setStats({
        totalHunts: Number(totalHunts),
        successRate: successRate,
        avgSearchTime: 1.7, // Mock - später aus tracking_data
        communityUploads: Number(uploads),
      });

      // Recent Activity laden (mit Revier-Filter)
      const activityResult = db.exec(
        `SELECT typ, wildart_name, zeitpunkt, ort_beschreibung, revier_id
         FROM eintraege
         WHERE user_id = ? AND geloescht_am IS NULL${revierFilter}
         ORDER BY zeitpunkt DESC
         LIMIT 5`,
        [user.id]
      );

      if (activityResult.length > 0 && activityResult[0].values.length > 0) {
        const activities = activityResult[0].values.map((row) => ({
          type: row[0],
          wildart: row[1],
          timestamp: row[2],
          location: row[3],
          revierId: row[4],
        }));
        setRecentActivity(activities);
      }

      // ML Progress aus allen Usern (Community-Daten)
      const bloodResult = db.exec(
        `SELECT COUNT(*) FROM training_uploads WHERE data_type = 'blood'`
      );
      const hairResult = db.exec(
        `SELECT COUNT(*) FROM training_uploads WHERE data_type = 'hair'`
      );
      const tissueResult = db.exec(
        `SELECT COUNT(*) FROM training_uploads WHERE data_type = 'tissue'`
      );
      const tracksResult = db.exec(
        `SELECT COUNT(*) FROM tracking_data`
      );

      setMlProgress({
        bloodImages: {
          current: Number(bloodResult[0]?.values[0]?.[0] || 1248),
          goal: 5000,
        },
        hairImages: {
          current: Number(hairResult[0]?.values[0]?.[0] || 687),
          goal: 3000,
        },
        tissuePhotos: {
          current: Number(tissueResult[0]?.values[0]?.[0] || 423),
          goal: 2000,
        },
        gpsTracks: {
          current: Number(tracksResult[0]?.values[0]?.[0] || 876),
          goal: 5000,
        },
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await performSync();
      console.log('Sync result:', result);
      if (result.success) {
        await loadDashboardData(user);
        alert(`✅ Sync erfolgreich!\n\nGepusht: ${result.pushed}\nGepullt: ${result.pulled}`);
      } else {
        alert(`⚠️ Sync teilweise fehlgeschlagen:\n\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('❌ Sync fehlgeschlagen');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-xl font-semibold">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">🏠 Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Willkommen zurück, {user?.name || user?.email}!
          </p>
        </div>
        
        <div className="flex gap-2 items-center">
          {/* Revier Filter */}
          <select
            value={selectedRevierId || ''}
            onChange={(e) => setSelectedRevierId(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            <option value="">🏞️ Alle Reviere</option>
            {allReviere.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {syncing ? '🔄 Sync läuft...' : '🔄 Jetzt synchronisieren'}
          </button>
          <button
            onClick={() => auth.logout() || router.push('/login')}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            🚪 Abmelden
          </button>
        </div>
      </div>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jagden gesamt</p>
              <p className="text-3xl font-bold text-green-800">{stats.totalHunts}</p>
            </div>
            <div className="text-4xl">🦌</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Erfolgsquote</p>
              <p className="text-3xl font-bold text-blue-800">
                {stats.successRate.toFixed(1)}%
              </p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ø Suchzeit</p>
              <p className="text-3xl font-bold text-purple-800">
                {stats.avgSearchTime.toFixed(1)}h
              </p>
            </div>
            <div className="text-4xl">⏱️</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uploads</p>
              <p className="text-3xl font-bold text-orange-800">{stats.communityUploads}</p>
            </div>
            <div className="text-4xl">📤</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">📋 Letzte Aktivitäten</h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100">
                  <div className="text-2xl">
                    {activity.type === 'shot_analysis' ? '🎯' :
                     activity.type === 'hunt' ? '🦌' :
                     activity.type === 'harvest' ? '✅' : '📍'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {activity.type === 'shot_analysis' ? 'Shot Analysis durchgeführt' :
                       activity.type === 'hunt' ? 'Jagd begonnen' :
                       activity.type === 'harvest' ? 'Wild erlegt' : 'Eintrag erstellt'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.wildart} • {activity.location || 'Keine Ortsbeschreibung'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p>Noch keine Aktivitäten</p>
                <p className="text-sm">Starte deine erste Shot Analysis!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">⚡ Schnellaktionen</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/shot-analysis')}
              className="p-6 bg-green-50 rounded-lg hover:bg-green-100 text-center transition"
            >
              <div className="text-4xl mb-2">🎯</div>
              <p className="font-semibold">Shot Analysis</p>
            </button>
            <button
              onClick={() => router.push('/map')}
              className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 text-center transition"
            >
              <div className="text-4xl mb-2">🗺️</div>
              <p className="font-semibold">Karte öffnen</p>
            </button>
            <button
              onClick={() => router.push('/statistics')}
              className="p-6 bg-purple-50 rounded-lg hover:bg-purple-100 text-center transition"
            >
              <div className="text-4xl mb-2">📊</div>
              <p className="font-semibold">Statistiken</p>
            </button>
            <button
              onClick={() => router.push('/crowdsourcing')}
              className="p-6 bg-orange-50 rounded-lg hover:bg-orange-100 text-center transition"
            >
              <div className="text-4xl mb-2">🤝</div>
              <p className="font-semibold">Daten uploaden</p>
            </button>
          </div>
        </div>
      </div>

      {/* ML Training Progress */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">🤖 ML-Training Fortschritt</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">🩸 Blut-Bilder</span>
              <span className="text-sm text-gray-600">
                {mlProgress.bloodImages.current} / {mlProgress.bloodImages.goal}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-red-600 h-3 rounded-full"
                style={{
                  width: `${Math.min((mlProgress.bloodImages.current / mlProgress.bloodImages.goal) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">🦌 Haar-Proben</span>
              <span className="text-sm text-gray-600">
                {mlProgress.hairImages.current} / {mlProgress.hairImages.goal}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-orange-600 h-3 rounded-full"
                style={{
                  width: `${(mlProgress.hairImages.current / mlProgress.hairImages.goal) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">🥩 Wildpret-Fotos</span>
              <span className="text-sm text-gray-600">
                {mlProgress.tissuePhotos.current} / {mlProgress.tissuePhotos.goal}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-pink-600 h-3 rounded-full"
                style={{
                  width: `${(mlProgress.tissuePhotos.current / mlProgress.tissuePhotos.goal) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">📍 GPS-Tracks</span>
              <span className="text-sm text-gray-600">
                {mlProgress.gpsTracks.current} / {mlProgress.gpsTracks.goal}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full"
                style={{
                  width: `${(mlProgress.gpsTracks.current / mlProgress.gpsTracks.goal) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
