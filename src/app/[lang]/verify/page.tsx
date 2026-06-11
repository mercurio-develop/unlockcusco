import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { legacyVerifyBusinessAction } from "@/features/discovery/actions/legacy-verify-business"
import { ShieldCheck } from "lucide-react"

export default async function VerifyPage(props: { params: Promise<{ lang: string }>, searchParams: Promise<{ id?: string }> }) {
  const { lang } = await props.params
  const { id } = await props.searchParams

  if (!id) return notFound()

  const business = await prisma.business.findUnique({ where: { id } })
  
  if (!business) return notFound()

  if (business.isClaimed) {
    redirect(`/${lang}/business/${business.slug}`)
  }

  const isEs = lang === 'es'

  const title = isEs ? "Verifica tu Negocio" : "Verify Your Business"
  const desc = isEs 
    ? `Haz clic en el botón de abajo para verificar tu número de WhatsApp y reclamar el perfil de ` 
    : `Click the button below to verify your WhatsApp number and claim the profile for `
  const btnText = isEs ? "Verificar Ahora" : "Verify Now"

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-serif tracking-tight text-slate-900 mb-3">{title}</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            {desc} <strong className="text-slate-900">{business.name}</strong>.
          </p>
          
          <form action={async () => {
            "use server";
            await legacyVerifyBusinessAction(business.id);
            redirect(`/${lang}/business/${business.slug}`);
          }}>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
              {btnText}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
