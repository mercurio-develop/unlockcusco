import { Info, Lock } from "lucide-react"
import type { Business } from "@prisma/client"
import Link from "next/link"

interface BasicTemplateProps {
  business: Business
}

export function BasicTemplate({ business }: BasicTemplateProps) {
  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Info className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h2 className="text-3xl font-serif text-slate-900">About</h2>
            <p className="text-slate-500 text-sm">General Information</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-slate-600 leading-relaxed font-light">
            {business.description || "Discover an authentic experience in the heart of the Sacred Valley. Visit us to learn more about our services and offerings."}
          </p>
        </div>
      </section>

      {/* Upsell / Claim Prompt */}
      {!business.isClaimed && !business.isAsociado && (
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-serif text-white mb-2">Are you the owner?</h3>
          <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
            Claim this business profile to unlock premium templates, showcase your services, and connect directly with tourists via WhatsApp.
          </p>
          <Link 
            href={`/claim/${business.id}`}
            className="inline-block bg-white text-slate-900 hover:bg-slate-100 font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Claim Business Profile
          </Link>
        </section>
      )}
    </div>
  )
}
