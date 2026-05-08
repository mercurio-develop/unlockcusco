import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add standard security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.posthog.com https://api.mapbox.com; connect-src 'self' https://*.posthog.com https://*.mapbox.com https://*.google.com https://*.googleapis.com; img-src 'self' blob: data: https://*.unsplash.com https://*.mapbox.com https://*.googleusercontent.com; style-src 'self' 'unsafe-inline' https://api.mapbox.com https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com;"
  )

  // Only apply production redirects for specific legacy paths
  if (process.env.NODE_ENV === 'production') {
    const { pathname } = request.nextUrl
    const isLegacyPath = ['/travel-design', '/services', '/pro'].some(path => pathname.startsWith(path))
    
    if (isLegacyPath) {
        return NextResponse.redirect(new URL('/explore', request.url))
    }
  }
  
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
