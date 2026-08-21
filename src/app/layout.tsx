import type { Metadata } from 'next';
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${anton.variable} ${inter.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
