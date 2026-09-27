import type { Metadata, Viewport } from 'next';
import { Anton, Inter } from 'next/font/google';
import './globals.css';

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CF OS — Chris Fitness',
  description: 'Centro de operaciones de Chris Fitness',
  applicationName: 'Chris Fitness',
  // Al "Añadir a pantalla de inicio" en iPhone se abre a pantalla completa, como una app
  appleWebApp: { capable: true, title: 'Chris Fitness', statusBarStyle: 'black' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0A0A0A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${anton.variable} ${inter.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
