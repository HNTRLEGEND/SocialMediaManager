export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="text-center py-20">
        <h1 className="text-6xl font-bold text-green-800 mb-4">
          🎯 HNTR LEGEND PRO
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Weltweit erste Jagd-App mit KI-Shot-Analysis
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 max-w-6xl mx-auto">
          <FeatureCard
            icon="🎯"
            title="Shot Analysis"
            description="KI-gestützte Trefferlage-Diagnose mit 12 Hit-Zone-Klassifikationen"
            href="/shot-analysis"
          />
          <FeatureCard
            icon="📍"
            title="Fundort-Prediction"
            description="ML-Heatmap zeigt wahrscheinlichste Bereiche für erfolgreiche Nachsuche"
            href="/map"
          />
          <FeatureCard
            icon="📊"
            title="Statistiken"
            description="Detaillierte Analytics zu Nachsuchen, Erfolgsquoten und Wildaktivität"
            href="/statistics"
          />
          <FeatureCard
            icon="🤝"
            title="Community-KI"
            description="Trainiere die KI mit deinen Daten und verdiene Premium-Features"
            href="/crowdsourcing"
          />
        </div>

        <div className="mt-12">
          <a href="/dashboard" className="btn-primary text-xl px-8 py-4">
            🚀 Dashboard öffnen
          </a>
        </div>

        <div className="mt-16 text-gray-500">
          <p>Version 2.8.0 • 73.826+ Zeilen Code • 50.000+ aktive Jäger</p>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description, href }: {
  icon: string
  title: string
  description: string
  href: string
}) {
  return (
    <a href={href} className="card hover:shadow-xl transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-green-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </a>
  )
}
