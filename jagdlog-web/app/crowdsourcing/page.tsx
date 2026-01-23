'use client'

import { useState } from 'react'

export default function CrowdsourcingPage() {
  const [uploads, setUploads] = useState(1248)
  const [points, setPoints] = useState(124)
  const [badges, setBadges] = useState(['Community Contributor', 'Early Adopter'])

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-green-800">🤝 Community-KI trainieren</h1>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <h3 className="text-lg font-semibold mb-2">Deine Uploads</h3>
          <p className="text-4xl font-bold text-purple-700">{uploads}</p>
          <p className="text-sm text-gray-600 mt-2">von 15.000+ gesamt</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
          <h3 className="text-lg font-semibold mb-2">Punkte</h3>
          <p className="text-4xl font-bold text-yellow-700">{points}</p>
          <p className="text-sm text-gray-600 mt-2">Nächstes Reward bei 250</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <h3 className="text-lg font-semibold mb-2">Badges</h3>
          <p className="text-4xl font-bold text-blue-700">{badges.length}</p>
          <p className="text-sm text-gray-600 mt-2">Badges verdient</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">📸 Trainingsdaten hochladen</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Datentyp</label>
            <select className="w-full p-2 border rounded">
              <option>🩸 Blut/Schweiß</option>
              <option>🦌 Haare</option>
              <option>🥩 Wildpret/Gewebe</option>
              <option>👣 Fährte/Spur</option>
              <option>🎯 Nachsuche-Route</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Wildart</label>
            <select className="w-full p-2 border rounded">
              <option>🦌 Rehwild</option>
              <option>🦌 Rotwild</option>
              <option>🐗 Schwarzwild</option>
              <option>🦌 Damwild</option>
            </select>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
          <p className="text-6xl mb-4">📤</p>
          <p className="text-xl font-semibold mb-2">Dateien hierher ziehen</p>
          <p className="text-gray-600 mb-4">oder</p>
          <button className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-6 rounded">
            Dateien auswählen
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Max 10 MB pro Datei • JPG, PNG, HEIC
          </p>
        </div>

        <div className="mt-6 bg-green-50 border border-green-200 rounded p-4">
          <h3 className="font-semibold mb-2">✅ Qualitätskriterien:</h3>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• Gut beleuchtet (natürliches Licht bevorzugt)</li>
            <li>• Scharf (nicht verwackelt)</li>
            <li>• Nahaufnahme (Detail erkennbar)</li>
            <li>• Min. 800x600 Pixel</li>
          </ul>
          <p className="text-xs text-green-700 mt-2 font-semibold">
            💡 Hochwertige Fotos = Bessere KI = Mehr Punkte!
          </p>
        </div>
      </div>

      {/* Rewards */}
      <div className="card bg-gradient-to-r from-yellow-50 to-orange-50">
        <h2 className="text-2xl font-bold mb-4">🎁 Belohnungen</h2>
        <div className="space-y-3">
          <RewardItem
            uploads={10}
            reward="Shot Analysis Premium (1 Monat)"
            unlocked={true}
          />
          <RewardItem
            uploads={25}
            reward="Community-Contributor Badge"
            unlocked={false}
          />
          <RewardItem
            uploads={50}
            reward="Fundort-Prediction Premium (1 Monat)"
            unlocked={false}
          />
          <RewardItem
            uploads={100}
            reward="🏆 Lifetime Premium Access"
            unlocked={false}
          />
        </div>
      </div>

      {/* ML Training Progress */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">🤖 ML-Training Fortschritt</h2>
        <div className="space-y-4">
          <MLProgress label="Blutbilder" current={5248} target={5000} />
          <MLProgress label="Haarbilder" current={2687} target={3000} />
          <MLProgress label="Wildpret-Fotos" current={1423} target={2000} />
          <MLProgress label="GPS-Tracks" current={3876} target={5000} />
        </div>
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
          <p className="text-sm">
            <strong>🎯 Meilenstein erreicht!</strong> Blutbild-Training läuft! 
            Erste ML-Modelle werden in 2-3 Wochen verfügbar sein.
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">🏆 Top Contributors</h2>
        <div className="space-y-3">
          <LeaderboardItem rank={1} name="Jäger_M87" uploads={347} points={3470} />
          <LeaderboardItem rank={2} name="Förster_K" uploads={298} points={2980} />
          <LeaderboardItem rank={3} name="Wildmeister" uploads={267} points={2670} />
          <LeaderboardItem rank={4} name="Du" uploads={124} points={1240} highlight />
          <LeaderboardItem rank={5} name="RevierChef" uploads={156} points={1560} />
        </div>
      </div>
    </div>
  )
}

function RewardItem({ uploads, reward, unlocked }: {
  uploads: number
  reward: string
  unlocked: boolean
}) {
  return (
    <div className={`flex items-center justify-between p-4 rounded ${
      unlocked ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-50'
    }`}>
      <div className="flex items-center space-x-4">
        <div className={`text-2xl ${unlocked ? '' : 'opacity-50'}`}>
          {unlocked ? '✅' : '🔒'}
        </div>
        <div>
          <p className="font-semibold">{reward}</p>
          <p className="text-sm text-gray-600">{uploads} Uploads erforderlich</p>
        </div>
      </div>
      {unlocked && (
        <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded">
          UNLOCKED
        </span>
      )}
    </div>
  )
}

function MLProgress({ label, current, target }: {
  label: string
  current: number
  target: number
}) {
  const percentage = Math.min((current / target) * 100, 100)
  const isComplete = current >= target

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold">{label}</span>
        <span>{current.toLocaleString()} / {target.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all ${
            isComplete ? 'bg-green-600' : 'bg-blue-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isComplete && (
        <p className="text-xs text-green-600 font-semibold mt-1">
          ✅ Ziel erreicht! Training läuft...
        </p>
      )}
    </div>
  )
}

function LeaderboardItem({ rank, name, uploads, points, highlight }: {
  rank: number
  name: string
  uploads: number
  points: number
  highlight?: boolean
}) {
  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

  return (
    <div className={`flex items-center justify-between p-3 rounded ${
      highlight ? 'bg-yellow-100 border-2 border-yellow-500' : 'bg-gray-50'
    }`}>
      <div className="flex items-center space-x-4">
        <div className="text-2xl w-8 text-center">
          {medals[rank] || `#${rank}`}
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-gray-600">{uploads} Uploads • {points} Punkte</p>
        </div>
      </div>
      {highlight && (
        <span className="text-sm font-semibold text-yellow-700">DU</span>
      )}
    </div>
  )
}
