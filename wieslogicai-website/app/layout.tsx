import type { Metadata } from 'next'
import { Inter, Poppins, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Tenify.AI | 10X Your Business with AI Automation',
  description: 'Automate your business with AI Voice Agents, Service Agents, and Personal Assistants. 500+ hours saved for growing companies. Book your free AI consultation today.',
  keywords: ['AI Automation', 'AI Voice Agents', 'Business Process Automation', 'AI Service Agents', 'AI Personal Assistants'],
  authors: [{ name: 'Tenify.AI' }],
  openGraph: {
    title: 'Tenify.AI - AI Automation That 10X\'s Your Business',
    description: 'Stop wasting time. Let AI handle it. 24/7 AI Agents for Voice, Service & Personal Assistance.',
    url: 'https://tenify.ai',
    siteName: 'Tenify.AI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tenify.AI - AI Automation Platform',
      },
    ],
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tenify.AI | 10X Your Business with AI',
    description: '500+ hours saved. 10X ROI. 24/7 AI Agents.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className="scroll-smooth">
      <head>
        <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable} font-sans antialiased bg-primary-950 text-white`}>
        {children}
        {/* ElevenLabs Voice Agent Widget - Fixed Bottom Right */}
        <div
          dangerouslySetInnerHTML={{
            __html: '<elevenlabs-convai agent-id="agent_2201k8k6de02ega9kr3bhvz7f4b2"></elevenlabs-convai>'
          }}
        />
      </body>
    </html>
  )
}
