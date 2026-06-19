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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if pathname starts with /sandbox or /[locale]/sandbox
  const isSandbox = pathname === '/sandbox' || 
                    pathname.startsWith('/sandbox/') ||
                    locales.some(lang => pathname === `/${lang}/sandbox` || pathname.startsWith(`/${lang}/sandbox/`))

  if (isSandbox) {
    const adminPassword = process.env.AUTH_ADMIN

    if (adminPassword) {
      const authHeader = request.headers.get('authorization')
      
      if (!authHeader) {
        return new NextResponse('Authentication Required', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Secure Sandbox"',
          },
        })
      }

      try {
        const auth = authHeader.split(' ')[1]
        const decoded = atob(auth)
        const [_, password] = decoded.split(':')

        if (password !== adminPassword) {
          return new NextResponse('Unauthorized', {
            status: 401,
            headers: {
              'WWW-Authenticate': 'Basic realm="Secure Sandbox"',
            },
          })
        }
      } catch (err) {
        return new NextResponse('Invalid Authorization Header', { status: 400 })
      }
    }
  }

  // Check if there is any supported locale in the pathname
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

// Export default as well for backward/framework compatibility
export default proxy

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|images|public|.*\\..*).*)',
  ],
}

