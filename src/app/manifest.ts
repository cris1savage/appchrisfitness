import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Chris Fitness',
    short_name: 'Chris Fitness',
    description: 'Tu entrenamiento, nutrición y progreso con Chris Fitness',
    start_url: '/post-login',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0A0A0A',
    theme_color: '#0A0A0A',
    lang: 'es',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
