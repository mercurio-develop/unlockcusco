import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const locales = ['en', 'es']
const defaultLocale = 'en'

function getLocale(request: NextRequest) {
  // Check if there is a preferred locale in the cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale
  }

  // Accept-Language header matching
  const acceptLang = request.headers.get('accept-language')
  if (acceptLang) {
    if (acceptLang.includes('es')) {
      return 'es'
    }
  }

  return defaultLocale
}

export default async function proxy(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    // Redirect if there is no locale
    const locale = getLocale(request)
    request.nextUrl.pathname = `/${locale}${pathname}`
    
    // e.g. incoming request is /business/casa-cori
    // The new URL is now /en/business/casa-cori
    return NextResponse.redirect(request.nextUrl)
  }

  // Next, update Supabase session
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|images|public|.*\\..*).*)',
  ],
}
