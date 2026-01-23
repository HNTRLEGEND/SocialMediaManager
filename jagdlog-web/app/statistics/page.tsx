'use client'

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-green-800">📊 Statistiken</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <h3 className="text-lg font-semibold mb-2">Erfolgsquote</h3>
          <p className="text-4xl font-bold text-green-700">87.3%</p>
          <p className="text-sm text-gray-600 mt-2">+12% vs. letztes Jahr</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <h3 className="text-lg font-semibold mb-2">Ø Suchzeit</h3>
          <p className="text-4xl font-bold text-blue-700">1.7h</p>
          <p className="text-sm text-gray-600 mt-2">-45% vs. letztes Jahr</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <h3 className="text-lg font-semibold mb-2">Shot Analysis</h3>
          <p className="text-4xl font-bold text-purple-700">876</p>
          <p className="text-sm text-gray-600 mt-2">Analysen durchgeführt</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">📈 Nachsuche-Erfolg nach Monat</h2>
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
            <p className="text-gray-500">Linien-Chart (Recharts)</p>
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold mb-4">🎯 Trefferlagen-Verteilung</h2>
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
            <p className="text-gray-500">Tortendiagramm (Recharts)</p>
          </div>
        </div>
      </div>

      {/* Hit Zone Table */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">🎯 Erfolgsquote nach Trefferlage</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Trefferlage</th>
                <th className="p-3 text-left">Anzahl</th>
                <th className="p-3 text-left">Erfolgsquote</th>
                <th className="p-3 text-left">Ø Suchzeit</th>
                <th className="p-3 text-left">Trend</th>
              </tr>
            </thead>
            <tbody>
              <HitZoneRow
                zone="Blattschuss"
                count={342}
                successRate={95}
                avgTime="0.8h"
                trend="+3%"
              />
              <HitZoneRow
                zone="Lebertreffer"
                count={156}
                successRate={88}
                avgTime="2.1h"
                trend="+5%"
              />
              <HitZoneRow
                zone="Keulenschuss"
                count={98}
                successRate={82}
                avgTime="2.5h"
                trend="-2%"
              />
              <HitZoneRow
                zone="Pansenschuss"
                count={45}
                successRate={52}
                avgTime="6.2h"
                trend="+8%"
              />
              <HitZoneRow
                zone="Laufschuss"
                count={67}
                successRate={45}
                avgTime="8.5h"
                trend="+12%"
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Wildlife Activity */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">🦌 Wildaktivität nach Tageszeit</h2>
        <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
          <p className="text-gray-500">Heatmap-Chart (24h Aktivität)</p>
        </div>
      </div>
    </div>
  )
}

function HitZoneRow({ zone, count, successRate, avgTime, trend }: {
  zone: string
  count: number
  successRate: number
  avgTime: string
  trend: string
}) {
  const trendColor = trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
  
  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="p-3 font-semibold">{zone}</td>
      <td className="p-3">{count}</td>
      <td className="p-3">
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${successRate}%` }}
            />
          </div>
          <span className="font-semibold">{successRate}%</span>
        </div>
      </td>
      <td className="p-3">{avgTime}</td>
      <td className={`p-3 font-semibold ${trendColor}`}>{trend}</td>
    </tr>
  )
}
