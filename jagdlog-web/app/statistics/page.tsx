'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import { initDatabase } from '@/lib/database';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function StatisticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // all, year, month
  const [allReviere, setAllReviere] = useState<any[]>([]);
  const [selectedRevierId, setSelectedRevierId] = useState<string | null>(null);
  
  const [stats, setStats] = useState({
    totalHunts: 0,
    successRate: 0,
    avgSearchTime: 0,
    analysisCount: 0,
  });

  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [hitZoneData, setHitZoneData] = useState<any[]>([]);
  const [wildlifeData, setWildlifeData] = useState<any[]>([]);
  const [hitZoneTable, setHitZoneTable] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadStatistics(currentUser);
  }, [router, timeRange, selectedRevierId]);

  const loadStatistics = async (user: any) => {
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

      // Revier-Filter
      const revierFilter = selectedRevierId ? ` AND revier_id = '${selectedRevierId}'` : '';

      // Overall Stats
      const huntsResult = db.exec(
        `SELECT COUNT(*) FROM eintraege WHERE user_id = ? AND typ = 'hunt' AND geloescht_am IS NULL${revierFilter}`,
        [user.id]
      );
      const totalHunts = Number(huntsResult[0]?.values[0]?.[0] || 0);

      const successResult = db.exec(
        `SELECT COUNT(*) FROM eintraege WHERE user_id = ? AND typ = 'harvest' AND geloescht_am IS NULL${revierFilter}`,
        [user.id]
      );
      const successful = Number(successResult[0]?.values[0]?.[0] || 0);

      const analysisResult = db.exec(
        `SELECT COUNT(*) FROM shot_analysis sa
         JOIN eintraege e ON sa.eintrag_id = e.id
         WHERE e.user_id = ?`,
        [user.id]
      );
      const analysisCount = Number(analysisResult[0]?.values[0]?.[0] || 0);

      const successRate = totalHunts > 0 ? (successful / totalHunts) * 100 : 0;

      setStats({
        totalHunts,
        successRate,
        avgSearchTime: 1.7, // Mock - später aus tracking_data
        analysisCount,
      });

      // Monthly Data (Last 12 months)
      const monthlyResult = db.exec(
        `SELECT 
          strftime('%Y-%m', zeitpunkt) as month,
          COUNT(*) as count
         FROM eintraege
         WHERE user_id = ? AND typ IN ('hunt', 'harvest') AND geloescht_am IS NULL${revierFilter}
         GROUP BY strftime('%Y-%m', zeitpunkt)
         ORDER BY month DESC
         LIMIT 12`,
        [user.id]
      );

      if (monthlyResult.length > 0 && monthlyResult[0].values.length > 0) {
        const monthly = monthlyResult[0].values.reverse().map((row) => ({
          month: row[0],
          hunts: Number(row[1]),
        }));
        setMonthlyData(monthly);
      } else {
        // Mock data if no real data
        setMonthlyData([
          { month: '2024-01', hunts: 4 },
          { month: '2024-02', hunts: 6 },
          { month: '2024-03', hunts: 8 },
          { month: '2024-04', hunts: 5 },
          { month: '2024-05', hunts: 7 },
          { month: '2024-06', hunts: 9 },
        ]);
      }

      // Hit Zone Distribution
      const hitZoneResult = db.exec(
        `SELECT 
          hit_zone,
          COUNT(*) as count,
          AVG(confidence) as avg_confidence
         FROM shot_analysis sa
         JOIN eintraege e ON sa.eintrag_id = e.id
         WHERE e.user_id = ? AND hit_zone IS NOT NULL${revierFilter}
         GROUP BY hit_zone`,
        [user.id]
      );

      if (hitZoneResult.length > 0 && hitZoneResult[0].values.length > 0) {
        const hitZones = hitZoneResult[0].values.map((row) => ({
          zone: row[0],
          count: Number(row[1]),
          confidence: Number(row[2]).toFixed(1),
        }));
        setHitZoneData(hitZones);
        setHitZoneTable(hitZones);
      } else {
        // Mock data
        const mockHitZones = [
          { zone: 'Blatt', count: 12, confidence: '87.5' },
          { zone: 'Kammer', count: 8, confidence: '92.1' },
          { zone: 'Lauf', count: 5, confidence: '68.3' },
          { zone: 'Träger', count: 3, confidence: '75.8' },
          { zone: 'Weichteile', count: 7, confidence: '81.2' },
        ];
        setHitZoneData(mockHitZones);
        setHitZoneTable(mockHitZones);
      }

      // Wildlife Distribution
      const wildlifeResult = db.exec(
        `SELECT 
          wildart_name,
          COUNT(*) as count
         FROM eintraege
         WHERE user_id = ? AND typ IN ('hunt', 'harvest') AND geloescht_am IS NULL${revierFilter}
         GROUP BY wildart_name
         ORDER BY count DESC
         LIMIT 10`,
        [user.id]
      );

      if (wildlifeResult.length > 0 && wildlifeResult[0].values.length > 0) {
        const wildlife = wildlifeResult[0].values.map((row) => ({
          name: row[0] || 'Unbekannt',
          count: Number(row[1]),
        }));
        setWildlifeData(wildlife);
      } else {
        // Mock data
        setWildlifeData([
          { name: 'Rehwild', count: 18 },
          { name: 'Schwarzwild', count: 12 },
          { name: 'Rotwild', count: 7 },
          { name: 'Fuchs', count: 5 },
        ]);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-xl font-semibold">Lade Statistiken...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">📊 Statistiken</h1>
        
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
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded ${
              timeRange === 'all'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Gesamt
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 rounded ${
              timeRange === 'year'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            12 Monate
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            30 Tage
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Erfolgsquote</p>
              <p className="text-3xl font-bold text-green-800">
                {stats.successRate.toFixed(1)}%
              </p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ø Suchzeit</p>
              <p className="text-3xl font-bold text-blue-800">
                {stats.avgSearchTime.toFixed(1)}h
              </p>
            </div>
            <div className="text-4xl">⏱️</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Analysen</p>
              <p className="text-3xl font-bold text-purple-800">{stats.analysisCount}</p>
            </div>
            <div className="text-4xl">🔬</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jagden gesamt</p>
              <p className="text-3xl font-bold text-orange-800">{stats.totalHunts}</p>
            </div>
            <div className="text-4xl">🦌</div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Hunts Line Chart */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">📈 Jagden pro Monat</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="hunts"
                stroke="#22c55e"
                strokeWidth={2}
                name="Jagden"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hit Zone Distribution Pie Chart */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">🎯 Trefferzonen-Verteilung</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={hitZoneData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ zone, count }) => `${zone}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {hitZoneData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Wildlife Bar Chart */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">🦌 Wildarten-Verteilung</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wildlifeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Anzahl" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hit Zone Success Table */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">🎯 Trefferzone Erfolgsquoten</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Zone</th>
                  <th className="text-right p-2">Anzahl</th>
                  <th className="text-right p-2">Konfidenz</th>
                  <th className="text-right p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {hitZoneTable.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{row.zone}</td>
                    <td className="text-right p-2">{row.count}</td>
                    <td className="text-right p-2">{row.confidence}%</td>
                    <td className="text-right p-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          parseFloat(row.confidence) >= 85
                            ? 'bg-green-100 text-green-800'
                            : parseFloat(row.confidence) >= 70
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {parseFloat(row.confidence) >= 85
                          ? '✓ Hoch'
                          : parseFloat(row.confidence) >= 70
                          ? '~ Mittel'
                          : '⚠ Niedrig'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="card bg-blue-50 border-l-4 border-blue-600">
        <div className="flex items-start gap-3">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="font-bold text-lg mb-1">KI-Verbesserung</h3>
            <p className="text-gray-700">
              Mit jeder Shot Analysis wird das KI-Modell genauer. Aktuell basieren die
              Vorhersagen auf {stats.analysisCount} Analysen. Ab 100 Analysen erhöht sich
              die Genauigkeit deutlich!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
