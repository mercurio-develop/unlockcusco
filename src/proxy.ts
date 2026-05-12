import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes/prefixes that are dev-only — return 404 in production
const DEV_ONLY_PREFIXES = [
  '/pro',
  '/dashboard',
  '/claim',
  '/sandbox',
  '/api/trip',
  '/api/taxi',
  '/api/travel-design',
  '/api/internal',
  '/api/webhooks',      // Stripe not active yet
  '/api/machu-picchu',  // Scraper not needed in prod yet
  '/api/packages',
  '/api/experiences',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Block dev-only routes in production
  if (process.env.NODE_ENV === 'production') {
    if (DEV_ONLY_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
      return new Response('Not Found', { status: 404 })
    }
  }

  const response = NextResponse.next()

  // Add standard security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.posthog.com https://api.mapbox.com; worker-src 'self' blob:; connect-src 'self' https://*.posthog.com https://*.mapbox.com https://*.google.com https://*.googleapis.com; img-src 'self' blob: data: https://*.unsplash.com https://*.mapbox.com https://*.googleusercontent.com; style-src 'self' 'unsafe-inline' https://api.mapbox.com https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com;"
  )

  return response
}

// Configure the paths where this middleware should run
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) -> we want headers here too actually
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
    },
  ],
}
