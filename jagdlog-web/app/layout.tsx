import './globals.css'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'
import PWAInstaller from '@/components/PWAInstaller'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'JagdLog - Professionelle Jagdverwaltung',
  description: 'Professionelle Jagdverwaltung mit KI-Shot-Analysis, Revierkarten und Offline-Support',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'JagdLog',
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
        <ServiceWorkerRegister />
        <Navigation />
        <main className="container mx-auto p-4 pt-20 md:pt-28 pb-32 md:pb-8">
          {children}
        </main>
        <PWAInstaller />
      </body>
    </html>
  )
}
