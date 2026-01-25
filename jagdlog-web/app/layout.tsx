import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'HNTR LEGEND PRO - Web Dashboard',
  description: 'Professionelle Jagdverwaltung mit KI-Shot-Analysis',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HNTR LEGEND Pro',
  },
  themeColor: '#2E7D32',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <nav className="bg-green-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">🎯 HNTR LEGEND PRO</h1>
            <div className="space-x-4">
              <a href="/dashboard" className="hover:underline">Dashboard</a>
              <a href="/map" className="hover:underline">Karte</a>
              <a href="/shot-analysis" className="hover:underline">Shot Analysis</a>
              <a href="/statistics" className="hover:underline">Statistiken</a>
              <a href="/crowdsourcing" className="hover:underline">Community-KI</a>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
