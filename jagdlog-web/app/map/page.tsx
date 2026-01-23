'use client'

export default function MapPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-green-800">🗺️ Karte</h1>

      {/* Map Container */}
      <div className="card p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-green-100 to-green-200 h-[600px] flex items-center justify-center relative">
          {/* Mock Map */}
          <div className="text-center">
            <p className="text-6xl mb-4">🗺️</p>
            <p className="text-xl font-semibold mb-2">Interactive Karte</p>
            <p className="text-gray-600">Leaflet/OpenStreetMap Integration</p>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white p-4 rounded shadow-lg">
            <h3 className="font-bold mb-2">Legende</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                <span>Anschuss-Punkt</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span>Fundort</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                <span>Tracking-Punkt</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
                <span>Wildkamera</span>
              </div>
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <button className="bg-white p-3 rounded shadow hover:bg-gray-100">
              🎯 Anschuss markieren
            </button>
            <button className="bg-white p-3 rounded shadow hover:bg-gray-100">
              📍 Fundort markieren
            </button>
            <button className="bg-white p-3 rounded shadow hover:bg-gray-100">
              📷 Wildkamera hinzufügen
            </button>
          </div>
        </div>
      </div>

      {/* Recent Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">📍 Letzte Anschüsse</h2>
          <div className="space-y-3">
            <LocationItem
              name="Rehbock - Hochsitz 3"
              date="23.01.2026 08:15"
              coords="48.1234, 11.5678"
              status="Geborgen"
            />
            <LocationItem
              name="Wildsau - Drückjagd Ost"
              date="22.01.2026 16:30"
              coords="48.1456, 11.5789"
              status="Geborgen"
            />
            <LocationItem
              name="Rehgeiß - Kanzel West"
              date="21.01.2026 07:45"
              coords="48.1567, 11.5890"
              status="Geborgen"
            />
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">📷 Wildkameras</h2>
          <div className="space-y-3">
            <CameraItem
              name="Wildkamera 1 - Kirrung"
              lastActivity="vor 2 Stunden"
              detections="23 Sichtungen heute"
            />
            <CameraItem
              name="Wildkamera 2 - Wechsel"
              lastActivity="vor 5 Stunden"
              detections="14 Sichtungen heute"
            />
            <CameraItem
              name="Wildkamera 3 - Suhle"
              lastActivity="vor 8 Stunden"
              detections="8 Sichtungen heute"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function LocationItem({ name, date, coords, status }: {
  name: string
  date: string
  coords: string
  status: string
}) {
  return (
    <div className="p-3 bg-gray-50 rounded flex items-start justify-between">
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-gray-600">{date}</p>
        <p className="text-xs text-gray-500">{coords}</p>
      </div>
      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
        {status}
      </span>
    </div>
  )
}

function CameraItem({ name, lastActivity, detections }: {
  name: string
  lastActivity: string
  detections: string
}) {
  return (
    <div className="p-3 bg-gray-50 rounded">
      <p className="font-semibold">{name}</p>
      <p className="text-sm text-gray-600">{lastActivity}</p>
      <p className="text-xs text-purple-600 font-semibold">{detections}</p>
    </div>
  )
}
