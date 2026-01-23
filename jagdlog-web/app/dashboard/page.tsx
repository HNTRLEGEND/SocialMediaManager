'use client'

import { useState, useEffect } from 'react'

interface Stats {
  totalHunts: number
  successfulRecoveries: number
  avgRecoveryTime: number
  crowdsourcingUploads: number
  shotAnalysisUsage: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalHunts: 1247,
    successfulRecoveries: 1089,
    avgRecoveryTime: 1.7,
    crowdsourcingUploads: 1248,
    shotAnalysisUsage: 876,
  })

  const successRate = ((stats.successfulRecoveries / stats.totalHunts) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-green-800">📊 Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Abschüsse gesamt"
          value={stats.totalHunts}
          icon="🎯"
          color="bg-blue-100"
        />
        <StatCard
          title="Erfolgreiche Nachsuchen"
          value={`${successRate}%`}
          icon="✅"
          color="bg-green-100"
        />
        <StatCard
          title="Ø Suchzeit"
          value={`${stats.avgRecoveryTime}h`}
          icon="⏱️"
          color="bg-yellow-100"
        />
        <StatCard
          title="Community-Uploads"
          value={stats.crowdsourcingUploads}
          icon="🤝"
          color="bg-purple-100"
        />
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">📋 Letzte Aktivitäten</h2>
        <div className="space-y-3">
          <Activity 
            type="shot_analysis"
            text="Shot Analysis durchgeführt: Blattschuss erkannt (95% Confidence)"
            time="vor 5 Minuten"
          />
          <Activity 
            type="recovery"
            text="Nachsuche erfolgreich: Rehbock nach 45 Minuten geborgen"
            time="vor 2 Stunden"
          />
          <Activity 
            type="upload"
            text="Training-Daten hochgeladen: 3 Blutbilder"
            time="vor 4 Stunden"
          />
          <Activity 
            type="prediction"
            text="Fundort-Prediction genutzt: Zone 1 bestätigt"
            time="vor 6 Stunden"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">⚡ Schnellaktionen</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction href="/shot-analysis" icon="🎯" label="Neue Shot Analysis" />
          <QuickAction href="/map" icon="🗺️" label="Karte öffnen" />
          <QuickAction href="/statistics" icon="📊" label="Statistiken" />
          <QuickAction href="/crowdsourcing" icon="📸" label="Daten hochladen" />
        </div>
      </div>

      {/* ML Training Progress */}
      <div className="card bg-gradient-to-r from-green-50 to-blue-50">
        <h2 className="text-2xl font-bold mb-4">🤖 ML-Training Fortschritt</h2>
        <div className="space-y-4">
          <ProgressBar label="Blutbilder" current={1248} target={5000} />
          <ProgressBar label="Haarbilder" current={687} target={3000} />
          <ProgressBar label="Wildpret-Fotos" current={423} target={2000} />
          <ProgressBar label="GPS-Tracks" current={876} target={5000} />
        </div>
        <p className="mt-4 text-sm text-gray-600">
          🎯 Noch <strong>8.766 Uploads</strong> bis zum ML-Training Start!
        </p>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: {
  title: string
  value: string | number
  icon: string
  color: string
}) {
  return (
    <div className={`card ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}

function Activity({ type, text, time }: {
  type: string
  text: string
  time: string
}) {
  const icons: Record<string, string> = {
    shot_analysis: '🎯',
    recovery: '✅',
    upload: '📤',
    prediction: '📍',
  }

  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
      <span className="text-2xl">{icons[type] || '📝'}</span>
      <div className="flex-1">
        <p className="text-sm">{text}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  )
}

function QuickAction({ href, icon, label }: {
  href: string
  icon: string
  label: string
}) {
  return (
    <a href={href} className="card text-center hover:shadow-lg transition-shadow">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm font-semibold">{label}</p>
    </a>
  )
}

function ProgressBar({ label, current, target }: {
  label: string
  current: number
  target: number
}) {
  const percentage = (current / target) * 100

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{current} / {target}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-600 h-2 rounded-full transition-all"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}
