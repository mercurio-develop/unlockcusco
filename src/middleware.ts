import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only apply production redirects
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(new URL('/explore', request.url))
  }
  
  // In development, allow the request to proceed
  return NextResponse.next()
}

// Configure the paths where this middleware should run
export const config = {
  matcher: [
    '/travel-design/:path*',
    '/services/:path*',
    '/pro/:path*',
    '/api/travel-design/:path*',
    '/api/services/:path*',
    '/api/pro/:path*'
  ],
}
