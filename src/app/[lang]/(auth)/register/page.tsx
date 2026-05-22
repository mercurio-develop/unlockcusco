 
import { AuthForm } from "@/features/auth/components/auth-form"
import { getDictionary, Locale } from "@/lib/dictionaries"

export default async function RegisterPage(props: {
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
          <h1 className="text-2xl font-serif font-bold text-slate-900">Create Account</h1>
          <p className="text-sm font-medium text-slate-500">Join UnlockCusco to save itineraries and book experiences.</p>
        </div>
        
        <AuthForm type="register" lang={lang} redirectPath={redirectPath} 
          dict={(dict as Record<string, unknown>).auth as Record<string, unknown> || {}} />
      </div>
    </div>
  )
}
