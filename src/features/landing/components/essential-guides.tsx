"use client"

import { ScrollCarousel } from "@/components/ui/scroll-carousel"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, HeartPulse, Backpack } from "lucide-react"

export function EssentialGuides({ locale = "en" }: { locale?: string }) {
  const isEs = locale === 'es'

  const guides = [
    {
      slug: "essential-health-hydration-peru",
      title: isEs 
        ? "La llamada de atención de Puno: Por qué importa la hidratación a 3,800 metros" 
        : "The Puno Wake-Up Call: Why Hydration Matters at 12,000 Feet",
      desc: isEs 
        ? "Puno, Perú, está ubicado a orillas del Lago Titicaca. La altitud y el aire seco significan que debes tomarte la hidratación muy en serio." 
        : "Puno, Peru is nestled on Lake Titicaca. The combination of extreme altitude, intense sun, and dry air means you must take hydration seriously.",
      image: "/images/guides/health-hydration-product-1.jpeg",
      icon: <HeartPulse className="w-4 h-4 text-rose-600" />,
      iconBg: "bg-rose-50 border border-rose-100"
    },
    {
      slug: "sacred-valley-packing-list",
      title: isEs 
        ? "Empacar para Cusco: Cómo estar listo para el sol intenso, la lluvia y el frío" 
        : "Packing for Cusco: How to Be Ready for Intense Sun, Rain, and Cold",
      desc: isEs 
        ? "Para salvar tu columna y tu estilo, déjame ayudarte a evitar cometer los mismos errores con mochilas gigantes y pantalones cargo." 
        : "To save your spine and your style, let me help you avoid making the exact same mistakes with giant packs and cargo pants.",
      image: "/images/guides/packing-cover.jpeg",
      icon: <Backpack className="w-4 h-4 text-indigo-600" />,
      iconBg: "bg-indigo-50 border border-indigo-100"
    }
  ]

  return (
    <div className="mb-12 mt-4">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            {isEs ? "Guías de Viaje Esenciales" : "Essential Travel Guides"}
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            {isEs 
              ? "Consejos médicos y prácticos para preparar tu viaje al Cusco." 
              : "Practical and medical tips to prepare for your journey to Cusco."}
          </p>
        </div>
        <Link 
          href={`/${locale}/guides`}
          className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:text-indigo-700 transition-colors"
        >
          {isEs ? "Ver todas las guías" : "View all guides"} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <ScrollCarousel className="mx-0 px-0 items-stretch">
        {guides.map((guide) => (
          <Link 
            href={`/${locale}/guides/${guide.slug}`} 
            key={guide.slug}
            className="shrink-0 w-[280px] sm:w-[320px] group flex flex-col justify-between snap-start h-full border border-slate-100 rounded-2xl p-4 bg-white hover:shadow-md transition-all"
          >
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-slate-100 shrink-0 shadow-sm">
              <Image 
                src={guide.image} 
                alt={guide.title}
                fill
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 280px, 320px"
              />
              <div className={`absolute top-3 left-3 w-8 h-8 rounded-lg flex items-center justify-center shadow-md bg-white/90 backdrop-blur-sm`}>
                {guide.icon}
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1.5 leading-snug">
                  {guide.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {guide.desc}
                </p>
              </div>
              <div className="text-indigo-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1 group-hover:gap-1.5 transition-all">
                {isEs ? "Leer Guía" : "Read Guide"} <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </ScrollCarousel>
    </div>
  )
}
