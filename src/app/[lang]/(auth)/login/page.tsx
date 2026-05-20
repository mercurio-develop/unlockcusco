import { AuthForm } from "@/features/auth/components/auth-form"
import { getDictionary, Locale } from "@/lib/dictionaries"
import Link from "next/link"

export default async function LoginPage(props: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { lang } = await props.params
  const searchParams = await props.searchParams
  const dict = await getDictionary(lang as Locale)
  const redirectPath = searchParams.redirect as string | undefined

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[calc(100vh-100px)]">
      <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-serif font-bold text-slate-900">Welcome Back</h1>
          <p className="text-sm font-medium text-slate-500">Sign in to access your saved itineraries and bookings.</p>
        </div>
        
        <AuthForm type="login" lang={lang} redirectPath={redirectPath} dict={(dict as any).auth || {}} />
        
        <div className="text-center text-sm font-medium text-slate-500">
          Don't have an account?{" "}
          <Link href={`/${lang}/register${redirectPath ? `?redirect=${redirectPath}` : ''}`} className="text-rose-600 hover:text-rose-700 font-bold transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
