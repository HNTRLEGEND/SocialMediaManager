// RootLayout: Basiskonfiguration für Fonts, Theme und Clerk Provider.
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-poppins' });

export const metadata: Metadata = {
  metadataBase: new URL('https://wies.ai'),
  title: {
    default: 'WIES.AI – Intelligente Automatisierung für den Mittelstand',
    template: '%s | WIES.AI'
  },
  description:
    'WIES.AI automatisiert Prozesse, orchestriert Voice Agents und liefert Echtzeit-Kennzahlen für mittelständische Unternehmen.',
  keywords: [
    'KI Automatisierung',
    'Voice Agents',
    'WIES.AI',
    'Prozessautomation',
    'Mittelstand',
    'KI Beratung'
  ],
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://wies.ai',
    siteName: 'WIES.AI'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="de" suppressHydrationWarning>
        <body className={`${inter.variable} ${poppins.variable} bg-background text-foreground min-h-screen antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
