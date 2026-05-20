import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'UnlockCusco',
    short_name: 'UnlockCusco',
    description: 'Your AI Travel Concierge for Cusco & the Sacred Valley',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#e11d48', // rose-600
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
