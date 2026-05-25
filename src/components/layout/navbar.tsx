"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Map, Sparkles, Bot, Route, Settings2, ChevronDown, HelpCircle, Menu } from "lucide-react"
import { explorePath } from "@/paths"
import { useUiStore } from "@/lib/store/use-ui-store"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { User } from "@prisma/client"

const LOCATIONS = [
  { id: "cusco", name: "Cusco" },
  { id: "urubamba", name: "Urubamba" },
  { id: "pisac", name: "Pisac" },
  { id: "ollantaytambo", name: "Ollantaytambo" },
  { id: "chinchero", name: "Chinchero" },
  { id: "maras", name: "Maras" },
  { id: "yucay", name: "Yucay" },
  { id: "calca", name: "Calca" },
]

export function Navbar({ dict, user }: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: Record<string, any>, 
  user?: User | null 
}) {
  const pathname = usePathname() || '/'
  const isChatOpen = useUiStore(s => s.isChatOpen)
  const setIsChatOpen = useUiStore(s => s.setIsChatOpen)
  const travelVibe = useUiStore(s => s.travelVibe)
  const setTravelVibe = useUiStore(s => s.setTravelVibe)
  const travelIntensity = useUiStore(s => s.travelIntensity)
  const setTravelIntensity = useUiStore(s => s.setTravelIntensity)
  const [isPrefsOpen, setIsPrefsOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const locale = pathname.split('/')[1] || 'en'
  const langPrefix = ['en', 'es'].includes(locale) ? `/${locale}` : '/en'

  // Use dict or fallback to English if not provided (e.g. some client route issue)
  const t = dict || {
    towns: "Towns",
    howToUse: "How to use UnlockCusco",
    quickGuide: "Quick guide to planning your perfect Sacred Valley trip.",
    mapIconTitle: "Map Icon (Towns & Filters)",
    mapIconDesc: "Use the unified filter in the top left of the map to select specific towns (like Pisac or Ollantaytambo) and filter by categories (Dining, Stays, Wellness, etc.).",
    compassIconTitle: "Compass Icon (Discover Mode)",
    compassIconDesc: "Use <b>Discover</b> mode to explore points of interest across the valley. Click places to add them to your itinerary.",
    routeIconTitle: "Route Icon (Itinerary Builder)",
    routeIconDesc: "In the Itinerary tab, you can add, remove, and reorder stops. Set your starting and ending points by clicking them on the map.",
    sparklesIconTitle: "Sparkles Icon (AI Concierge)",
    sparklesIconDesc: "Tap the Concierge button to open the chat. The AI can build an entire day for you based on your preferences, check Boleto Turístico info, and estimate taxi fares.",
    settingsIconTitle: "Settings Icon (Preferences)",
    settingsIconDesc: "Tap the settings icon to set your \"Travel Vibe\" and \"Intensity Level\". The Concierge uses this to give you highly personalized recommendations.",
    closeHelp: "Close Help",
    travelPreferences: "Travel Preferences",
    preferencesDesc: "Set your vibe and intensity to get highly personalized recommendations from the Concierge.",
    travelVibe: "Travel Vibe",
    intensityLevel: "Intensity Level",
    vibes: {
      LIVING_CULTURE: "Living Culture",
      GASTRONOMIC: "Gastronomic",
      LUXURY_WELLNESS: "Luxury Wellness",
      SPIRITUAL: "Spiritual",
      MOUNTAIN_EXPLORER: "Mountain Explorer"
    },
    intensities: {
      1: { label: "Level 1", desc: "Accessible" },
      2: { label: "Level 2", desc: "Immersive" },
      3: { label: "Level 3", desc: "The Edge" }
    },
    intensityNote: "Level 1 is relaxed and safe. Level 3 is extreme and off-the-beaten-path.",
    savePreferences: "Save & Close Preferences",
    changeLanguage: "Change Language",
    helpInstructions: "Help & Instructions"
  }

  const handleLanguageSwitch = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
    const segments = pathname.split('/')
    if (['en', 'es'].includes(segments[1])) {
      segments[1] = newLocale
    } else {
      segments.splice(1, 0, newLocale)
    }
    window.location.href = segments.join('/')
  }

  const navItems = [
    { href: explorePath(), label: "Explore", icon: Compass },
  ]

  const isProfilePage = pathname?.match(/^\/(en|es)?\/?services\/(agencies|healers)\/[^\/]+$/)
  
  if (isProfilePage) return null

  return (
    <nav className="fixed top-0 w-full z-[100] bg-white/90 backdrop-blur-xl border-b border-gray-200 h-[calc(48px+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] flex items-center justify-center transition-all shadow-sm">
      <div className="w-full max-w-5xl px-4 md:px-6 flex items-center justify-between">
        
        {/* Brand/Logo */}
        <Link href={langPrefix} className="flex items-center gap-2 group shrink-0">
          <Bot className="w-4 h-4 text-rose-600" />
          <span className="text-slate-900 font-bold text-sm tracking-wide uppercase">
            UNLOCK<span className="text-rose-500">CUSCO</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const fullHref = `${langPrefix}${item.href}`
            const isActive = pathname === fullHref || (pathname?.startsWith(fullHref) && item.href !== '/')
            return (
              <Link
                key={item.href}
                href={fullHref}
                className={`text-xs font-semibold tracking-wide transition-colors ${
                  isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            )
          })}

          <DropdownMenu>
            <DropdownMenuTrigger className="text-xs font-semibold tracking-wide text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 focus:outline-none">
              <Map className="w-3.5 h-3.5" />
              {t.towns} <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white/95 backdrop-blur-xl border-slate-200 shadow-xl rounded-2xl p-2 z-[110]">
              {LOCATIONS.map((loc) => (
                <DropdownMenuItem key={loc.id} className="rounded-xl focus:bg-slate-50 cursor-pointer p-0">
                  <Link href={`${langPrefix}/explore/${loc.id}`} className="w-full h-full px-3 py-2 text-sm font-medium text-slate-700">
                    {loc.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          <div className="flex items-center bg-slate-100/80 p-1 rounded-full border border-slate-200/60 shadow-inner" title={t.changeLanguage}>
            <button
              onClick={() => handleLanguageSwitch('en')}
              className={cn(
                "px-2.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                locale === 'en' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              EN
            </button>
            <button
              onClick={() => handleLanguageSwitch('es')}
              className={cn(
                "px-2.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                locale === 'es' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              ES
            </button>
          </div>

          {pathname?.includes("/explore") && (
            <>
              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[11px] transition-all border ${isChatOpen ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-gradient-to-r from-rose-500 to-purple-600 text-white border-transparent shadow-lg animate-pulse hover:animate-none hover:scale-105'}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Concierge</span>
              </button>

              <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
                <DialogTrigger render={
                  <button className="hidden md:flex p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors" title={t.helpInstructions}>
                    <HelpCircle className="w-4 h-4" />
                  </button>
                } />
                <DialogContent className="sm:max-w-md w-[95vw] max-h-[90dvh] overflow-y-auto p-4 sm:p-6 rounded-3xl bg-white border border-gray-200">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl font-serif tracking-tight text-slate-900">{t.howToUse}</DialogTitle>
                    <DialogDescription className="text-sm text-slate-500 mt-1">
                      {t.quickGuide}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-5 text-sm text-slate-700 py-2">
                    <div className="flex gap-3">
                      <div className="mt-0.5"><Map className="w-5 h-5 text-slate-400"/></div>
                      <div>
                        <h4 className="font-bold text-slate-900">{t.mapIconTitle}</h4>
                        <p className="mt-1 text-slate-600 leading-relaxed">{t.mapIconDesc}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="mt-0.5"><Compass className="w-5 h-5 text-slate-400"/></div>
                      <div>
                        <h4 className="font-bold text-slate-900">{t.compassIconTitle}</h4>
                        <p className="mt-1 text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.compassIconDesc }}></p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="mt-0.5"><Route className="w-5 h-5 text-slate-400"/></div>
                      <div>
                        <h4 className="font-bold text-slate-900">{t.routeIconTitle}</h4>
                        <p className="mt-1 text-slate-600 leading-relaxed">{t.routeIconDesc}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="mt-0.5"><Sparkles className="w-5 h-5 text-rose-500"/></div>
                      <div>
                        <h4 className="font-bold text-slate-900">{t.sparklesIconTitle}</h4>
                        <p className="mt-1 text-slate-600 leading-relaxed">{t.sparklesIconDesc}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="mt-0.5"><Settings2 className="w-5 h-5 text-slate-400"/></div>
                      <div>
                        <h4 className="font-bold text-slate-900">{t.settingsIconTitle}</h4>
                        <p className="mt-1 text-slate-600 leading-relaxed">{t.settingsIconDesc}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={() => setIsHelpOpen(false)} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-xl font-bold shadow-lg mt-2 transition-transform hover:scale-[1.02]">
                    {t.closeHelp}
                  </Button>
                </DialogContent>
              </Dialog>

              <Dialog open={isPrefsOpen} onOpenChange={setIsPrefsOpen}>
                <DialogTrigger render={
                  <button className="hidden md:flex p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors" title={t.travelPreferences}>
                    <Settings2 className="w-4 h-4" />
                  </button>
                } />
                <DialogContent className="sm:max-w-md w-[95vw] max-h-[90dvh] overflow-y-auto p-4 sm:p-6 rounded-3xl bg-white border border-gray-200">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl font-serif tracking-tight text-slate-900">{t.travelPreferences}</DialogTitle>
                    <DialogDescription className="text-sm text-slate-500 mt-1">
                      {t.preferencesDesc}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="flex flex-col gap-6 py-2">
                    <div className="flex flex-col gap-3">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.travelVibe}</span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'LIVING_CULTURE', label: t.vibes.LIVING_CULTURE, icon: '🏛️', theme: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100', active: 'bg-orange-600 text-white border-orange-600 shadow-md' },
                          { id: 'GASTRONOMIC', label: t.vibes.GASTRONOMIC, icon: '🍷', theme: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100', active: 'bg-rose-600 text-white border-rose-600 shadow-md' },
                          { id: 'LUXURY_WELLNESS', label: t.vibes.LUXURY_WELLNESS, icon: '🌿', theme: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', active: 'bg-emerald-600 text-white border-emerald-600 shadow-md' },
                          { id: 'SPIRITUAL', label: t.vibes.SPIRITUAL, icon: '🧿', theme: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100', active: 'bg-purple-600 text-white border-purple-600 shadow-md' },
                          { id: 'MOUNTAIN_EXPLORER', label: t.vibes.MOUNTAIN_EXPLORER, icon: '⛰️', theme: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100', active: 'bg-blue-600 text-white border-blue-600 shadow-md' }
                        ].map(a => (
                          <button
                            key={a.id}
                            onClick={() => setTravelVibe(travelVibe === a.id ? null : a.id)}
                            className={`px-4 py-2 text-[13px] font-bold rounded-full transition-all border flex items-center gap-1.5 ${travelVibe === a.id ? a.active : a.theme}`}
                          >
                            <span>{a.icon}</span> {a.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.intensityLevel}</span>
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        {[
                          { id: 1, label: t.intensities['1'].label, desc: t.intensities['1'].desc, theme: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100', active: 'bg-green-600 text-white border-green-600 shadow-md' },
                          { id: 2, label: t.intensities['2'].label, desc: t.intensities['2'].desc, theme: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100', active: 'bg-green-600 text-white border-green-600 shadow-md' },
                          { id: 3, label: t.intensities['3'].label, desc: t.intensities['3'].desc, theme: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100', active: 'bg-green-600 text-white border-green-600 shadow-md' }
                        ].map(i => (
                          <button
                            key={i.id}
                            onClick={() => setTravelIntensity(travelIntensity === i.id ? null : i.id)}
                            className={`flex-1 py-3 px-2 flex flex-col sm:flex-row sm:items-center sm:justify-center lg:flex-col items-center justify-center text-center rounded-xl transition-all border gap-1 sm:gap-2 lg:gap-0 ${travelIntensity === i.id ? i.active : i.theme}`}
                          >
                            <span className="font-bold text-sm">{i.label}</span>
                            <span className={`text-[10px] mt-0.5 sm:mt-0 lg:mt-0.5 ${travelIntensity === i.id ? 'text-white/80' : 'opacity-70'}`}>{i.desc}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 text-center px-4">
                        {t.intensityNote}
                      </p>
                    </div>
                  </div>
                  
                  <Button onClick={() => setIsPrefsOpen(false)} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-xl font-bold shadow-lg mt-4 transition-transform hover:scale-[1.02]">
                    {t.savePreferences}
                  </Button>
                </DialogContent>
              </Dialog>
            </>
          )}

          {/* Mobile Links */}
          <div className="flex md:hidden items-center ml-1">
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors focus:outline-none">
                <Menu className="w-5 h-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-xl border-slate-200 shadow-xl rounded-2xl p-2 z-[110] mr-4">
                {navItems.map((item) => {
                  const fullHref = `${langPrefix}${item.href}`
                  const isActive = pathname === fullHref || (pathname?.startsWith(fullHref) && item.href !== '/')
                  return (
                    <DropdownMenuItem key={item.href} className="rounded-xl focus:bg-slate-50 cursor-pointer p-0 mb-1">
                      <Link
                        href={fullHref}
                        className={cn("w-full h-full px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2", isActive ? "text-slate-900 font-bold" : "text-slate-700")}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
                
                <div className="h-px bg-slate-100 my-2 mx-1" />
                <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Map className="w-3.5 h-3.5" />
                  {t.towns}
                </div>
                
                {LOCATIONS.map((loc) => (
                  <DropdownMenuItem key={loc.id} className="rounded-xl focus:bg-slate-50 cursor-pointer p-0">
                    <Link href={`${langPrefix}/explore/${loc.id}`} className="w-full h-full px-3 py-2 text-sm font-medium text-slate-700">
                      {loc.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>

      </div>
    </nav>
  )
}
