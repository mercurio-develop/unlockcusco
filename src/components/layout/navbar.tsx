"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Home, Map, Sparkles, Route, Settings2, MessageSquareText } from "lucide-react"
import { homePath, explorePath, servicesPath, dashboardPath, travelDesignPath } from "@/paths"
import { useTrip } from "@/lib/store/trip-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const pathname = usePathname()
  const { isChatOpen, setIsChatOpen, travelVibe, setTravelVibe, travelIntensity, setTravelIntensity } = useTrip()
  const [isPrefsOpen, setIsPrefsOpen] = useState(false)

  const navItems = [
    { href: homePath(), label: "Home", icon: Home },
    { href: explorePath(), label: "Places", icon: Compass },
    { href: travelDesignPath(), label: "Travel Design", icon: Route },
  ]

  const isProfilePage = pathname?.match(/^\/services\/(agencies|healers)\/[^\/]+$/)
  
  if (isProfilePage) return null

  return (
    <nav className="fixed top-0 w-full z-[100] bg-white/90 backdrop-blur-xl border-b border-gray-200 h-14 flex items-center justify-center transition-all shadow-sm">
      <div className="w-full max-w-5xl px-4 md:px-6 flex items-center justify-between">
        
        {/* Brand/Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <Sparkles className="w-4 h-4 text-rose-600" />
          <span className="text-slate-900 font-bold text-sm tracking-wide">
            Vallecito
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-semibold tracking-wide transition-colors ${
                  isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Mobile Links */}
        <div className="flex md:hidden items-center gap-5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  isActive ? "text-rose-600" : "text-slate-400 hover:text-slate-900"
                }`}
              >
                <item.icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
              </Link>
            )
          })}
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Dialog open={isPrefsOpen} onOpenChange={setIsPrefsOpen}>
            <DialogTrigger render={
              <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors" title="Travel Preferences">
                <Settings2 className="w-4 h-4" />
              </button>
            } />
            <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white border border-gray-200">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl font-serif tracking-tight text-slate-900">Travel Preferences</DialogTitle>
                <p className="text-sm text-slate-500 mt-1">Set your vibe and intensity to get highly personalized recommendations from the Concierge.</p>
              </DialogHeader>
              
              <div className="flex flex-col gap-6 py-2">
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Travel Vibe</span>
                  <div className="flex flex-wrap gap-2">
                    {['LIVING_CULTURE', 'GASTRONOMIC', 'LUXURY_WELLNESS', 'SPIRITUAL', 'MOUNTAIN_EXPLORER'].map(a => (
                      <button
                        key={a}
                        onClick={() => setTravelVibe(travelVibe === a ? null : a)}
                        className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${travelVibe === a ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'}`}
                      >
                        {a.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Intensity Level</span>
                  <div className="flex gap-2 w-full">
                    {[1, 2, 3].map(i => (
                      <button
                        key={i}
                        onClick={() => setTravelIntensity(travelIntensity === i ? null : i)}
                        className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${travelIntensity === i ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'}`}
                      >
                        Level {i}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 text-center px-4">
                    Level 1 is relaxed and safe. Level 3 is extreme and off-the-beaten-path.
                  </p>
                </div>
              </div>
              
              <Button onClick={() => setIsPrefsOpen(false)} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-xl font-bold shadow-lg mt-4 transition-transform hover:scale-[1.02]">
                Save Preferences
              </Button>
            </DialogContent>
          </Dialog>

          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[11px] transition-all border ${isChatOpen ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Concierge</span>
          </button>
        </div>

      </div>
    </nav>
  )
}
