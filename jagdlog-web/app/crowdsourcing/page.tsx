'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import { initDatabase, now } from '@/lib/database';
import { queueSync } from '@/lib/sync';

export default function CrowdsourcingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [userStats, setUserStats] = useState({
    uploads: 0,
    points: 0,
    rank: 0,
    badges: [] as string[],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState('blood');
  const [description, setDescription] = useState('');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
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
    loadData(currentUser);
  }, [router]);

  const loadData = async (user: any) => {
    setLoading(true);
    try {
      const db = await initDatabase();

      // User Stats
      const uploadsResult = db.exec(
        `SELECT COUNT(*) FROM training_uploads WHERE user_id = ?`,
        [user.id]
      );
      const uploads = Number(uploadsResult[0]?.values[0]?.[0] || 0);

      const pointsResult = db.exec(
        `SELECT SUM(points_earned) FROM training_uploads WHERE user_id = ?`,
        [user.id]
      );
      const points = Number(pointsResult[0]?.values[0]?.[0] || 0);

      // Calculate badges
      const badges: string[] = [];
      if (uploads >= 1) badges.push('🌱 Erste Schritte');
      if (uploads >= 10) badges.push('📸 Fotograf');
      if (uploads >= 50) badges.push('🏆 Experte');
      if (uploads >= 100) badges.push('⭐ Legende');
      if (points >= 500) badges.push('💎 Premium');

      setUserStats({
        uploads,
        points,
        rank: 0, // Wird nach Leaderboard berechnet
        badges,
      });

      // Leaderboard
      const leaderboardResult = db.exec(
        `SELECT 
          u.name,
          u.email,
          COUNT(tu.id) as uploads,
          SUM(tu.points_earned) as points
         FROM users u
         LEFT JOIN training_uploads tu ON tu.user_id = u.id
         GROUP BY u.id
         ORDER BY points DESC
         LIMIT 10`
      );

      if (leaderboardResult.length > 0 && leaderboardResult[0].values.length > 0) {
        const leaders = leaderboardResult[0].values.map((row, idx) => ({
          rank: idx + 1,
          name: row[0] || row[1]?.split('@')[0] || 'Anonym',
          uploads: Number(row[2]),
          points: Number(row[3]),
        }));
        setLeaderboard(leaders);

        // Update user rank
        const userRank = leaders.findIndex((l) => l.name === (user.name || user.email?.split('@')[0]));
        if (userRank !== -1) {
          setUserStats((prev) => ({ ...prev, rank: userRank + 1 }));
        }
      } else {
        // Mock leaderboard
        setLeaderboard([
          { rank: 1, name: 'MaxMustermann', uploads: 127, points: 1850 },
          { rank: 2, name: 'JaegerPro', uploads: 98, points: 1420 },
          { rank: 3, name: 'WildHunter', uploads: 76, points: 1180 },
          { rank: 4, name: 'ForestKing', uploads: 54, points: 890 },
          { rank: 5, name: user.name || user.email?.split('@')[0], uploads, points },
        ]);
        setUserStats((prev) => ({ ...prev, rank: 5 }));
      }

      // ML Progress
      const bloodResult = db.exec(`SELECT COUNT(*) FROM training_uploads WHERE data_type = 'blood'`);
      const hairResult = db.exec(`SELECT COUNT(*) FROM training_uploads WHERE data_type = 'hair'`);
      const tissueResult = db.exec(`SELECT COUNT(*) FROM training_uploads WHERE data_type = 'tissue'`);
      const tracksResult = db.exec(`SELECT COUNT(*) FROM tracking_data`);

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
      console.error('Error loading crowdsourcing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('❌ Bitte nur JPG/PNG Bilder hochladen!');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('❌ Datei zu groß! Maximal 10MB erlaubt.');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const event = {
        target: { files: [file] },
      } as any;
      handleFileSelect(event);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      alert('❌ Bitte Datei auswählen!');
      return;
    }

    setUploading(true);

    try {
      const db = await initDatabase();

      // Points calculation
      const pointsMap: Record<string, number> = {
        blood: 10,
        hair: 15,
        tissue: 20,
        gps_track: 25,
      };
      const points = pointsMap[dataType] || 10;

      // Save to database (without actual file upload for now)
      const id = crypto.randomUUID();
      const timestamp = now();

      db.run(
        `INSERT INTO training_uploads (
          id, user_id, data_type, file_path, description,
          points_earned, uploaded_at, verified
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          user.id,
          dataType,
          `uploads/${user.id}/${selectedFile.name}`, // Mock file path
          description,
          points,
          timestamp,
          0, // Not verified yet
        ]
      );

      // Queue sync
      await queueSync('training_uploads', id, 'INSERT');

      // Reload data
      await loadData(user);

      // Reset form
      setSelectedFile(null);
      setDescription('');
      
      alert(`✅ Upload erfolgreich!\n\n+${points} Punkte\n\nDatei: ${selectedFile.name}\nTyp: ${dataType}\n\nDanke für deinen Beitrag! 🙏`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Upload fehlgeschlagen!');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🤝</div>
          <p className="text-xl font-semibold">Lade Crowdsourcing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">🤝 Crowdsourcing</h1>
      <p className="text-gray-600 mb-8">
        Hilf mit, das KI-Modell zu verbessern und verdiene Punkte!
      </p>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uploads</p>
              <p className="text-3xl font-bold text-green-800">{userStats.uploads}</p>
            </div>
            <div className="text-4xl">📤</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Punkte</p>
              <p className="text-3xl font-bold text-blue-800">{userStats.points}</p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rang</p>
              <p className="text-3xl font-bold text-purple-800">
                #{userStats.rank || '-'}
              </p>
            </div>
            <div className="text-4xl">🏆</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Badges</p>
              <p className="text-3xl font-bold text-orange-800">{userStats.badges.length}</p>
            </div>
            <div className="text-4xl">🎖️</div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {userStats.badges.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">🎖️ Deine Badges</h2>
          <div className="flex flex-wrap gap-3">
            {userStats.badges.map((badge, idx) => (
              <div
                key={idx}
                className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-full border-2 border-yellow-400 font-semibold"
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upload Form */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">📤 Daten hochladen</h2>
          
          <div className="space-y-4">
            {/* Data Type Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Datentyp</label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="blood">🩸 Blut-Bild (+10 Punkte)</option>
                <option value="hair">🦌 Haar-Probe (+15 Punkte)</option>
                <option value="tissue">🥩 Wildpret-Foto (+20 Punkte)</option>
                <option value="gps_track">📍 GPS-Track (+25 Punkte)</option>
              </select>
            </div>

            {/* File Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer"
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              {selectedFile ? (
                <div>
                  <div className="text-5xl mb-2">📁</div>
                  <p className="font-semibold text-lg">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="mt-2 text-sm text-red-600 hover:underline"
                  >
                    ❌ Entfernen
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-5xl mb-2">📤</div>
                  <p className="font-semibold">Datei hier ablegen</p>
                  <p className="text-sm text-gray-500">oder klicken zum Auswählen</p>
                  <p className="text-xs text-gray-400 mt-2">JPG, PNG • Max. 10MB</p>
                </div>
              )}
            </div>
            <input
              id="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Beschreibung (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="z.B. Rehbock, Blatt-Schuss, 80m Entfernung..."
                className="w-full p-3 border rounded h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? '🔄 Uploade...' : '📤 Jetzt hochladen'}
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">🏆 Bestenliste</h2>
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center justify-between p-3 rounded ${
                  entry.rank === 1
                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400'
                    : entry.rank === 2
                    ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400'
                    : entry.rank === 3
                    ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </div>
                  <div>
                    <p className="font-semibold">{entry.name}</p>
                    <p className="text-sm text-gray-600">{entry.uploads} Uploads</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">⭐ {entry.points}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ML Progress */}
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
                className="bg-red-600 h-3 rounded-full transition-all"
                style={{
                  width: `${(mlProgress.bloodImages.current / mlProgress.bloodImages.goal) * 100}%`,
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
                className="bg-orange-600 h-3 rounded-full transition-all"
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
                className="bg-pink-600 h-3 rounded-full transition-all"
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
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{
                  width: `${(mlProgress.gpsTracks.current / mlProgress.gpsTracks.goal) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="card bg-blue-50 border-l-4 border-blue-600 mt-6">
        <div className="flex items-start gap-3">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="font-bold text-lg mb-1">Warum Daten teilen?</h3>
            <p className="text-gray-700 mb-2">
              Deine hochgeladenen Daten helfen, das KI-Modell zu trainieren und die
              Shot-Analysis präziser zu machen. Je mehr Daten, desto besser die
              Vorhersagen für alle Jäger!
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Alle Uploads sind anonym und DSGVO-konform</li>
              <li>Verdiene Punkte und Badges</li>
              <li>Bessere KI = präzisere Nachsuchen</li>
              <li>Community-Beitrag zum Tierschutz</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
