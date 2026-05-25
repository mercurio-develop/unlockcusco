"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CATEGORIES, LOCATIONS } from '@/features/discovery/constants'
import { siteConfig } from '@/lib/config/site'

export function Footer({ lang }: { lang: string }) {
  const isEs = lang === 'es'
  const pathname = usePathname() || ''

  if (pathname.includes('/explore')) {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-slate-300 py-16 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Brand Section */}
        <div className="space-y-6">
          <Link href={`/${lang}`} className="text-2xl font-serif font-bold text-white tracking-tight">
            UNLOCK<span className="text-rose-500">CUSCO</span>
          </Link>
          <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
            {isEs 
              ? "La guía definitiva y planificador de itinerarios para explorar el Cusco, el Valle Sagrado y Machu Picchu."
              : "The ultimate guide and itinerary planner for exploring Cusco, the Sacred Valley, and Machu Picchu."}
          </p>
        </div>

        {/* Locations Directory */}
        <div>
          <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6">
            {isEs ? "Destinos" : "Locations"}
          </h3>
          <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
            {LOCATIONS.map((loc) => (
              <li key={loc.value}>
                <Link 
                  href={`/${lang}/explore?loc=${loc.value}`}
                  className="text-sm hover:text-rose-400 transition-colors capitalize"
                >
                  {loc.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories Directory */}
        <div>
          <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6">
            {isEs ? "Categorías" : "Categories"}
          </h3>
          <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
            {CATEGORIES.filter(c => (c.value !== 'Template' && c.value !== 'Guide')).map((cat) => (
              <li key={cat.value}>
                <Link 
                  href={`/${lang}/explore?cat=${cat.value.toLowerCase()}`}
                  className="text-sm hover:text-rose-400 transition-colors"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Links Section */}
        <div>
          <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6">
            {isEs ? "Recursos" : "Resources"}
          </h3>
          <ul className="space-y-3">
            <li>
              <Link href={`/${lang}/guides`} className="text-sm hover:text-rose-400 transition-colors">
                {isEs ? "Guías de Viaje" : "Travel Guides"}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/explore`} className="text-sm hover:text-rose-400 transition-colors">
                {isEs ? "Mapa Interactivo" : "Interactive Map"}
              </Link>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
        <div className="flex gap-6 text-xs text-slate-500">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}
