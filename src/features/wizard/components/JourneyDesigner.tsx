"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Loader2, Check, Search } from "lucide-react"
import { useItinerary } from "@/lib/store/itinerary-context"

type ExertionProfile = 'OBSERVER' | 'EXPLORER' | 'EXPEDITIONIST' | ''
type Autonomy = 'ORCHESTRATED' | 'ANCHOR_METHOD' | ''

type TourPackage = {
  id: string
  title: string
  sector: string
  pace: string
  basePriceUsd: number
  tags: string
  description: string
  heroImage?: string | null
  galleryJson?: string | null
  _score?: number
  agency?: {
    id: string
    name: string
    slug: string
    imageUrl: string
  } | null
}

const WIZARD_SECTORS = ['EAST_VALLEY', 'URUBAMBA', 'CUSCO_CITY', 'OTHER'] as const
type WizardSector = typeof WIZARD_SECTORS[number]

const SECTOR_LABELS: Record<string, string> = {
  EAST_VALLEY: 'Sacred Valley East',
  URUBAMBA: 'Urubamba Valley',
  CUSCO_CITY: 'Cusco City',
  OTHER: 'Hidden Gems',
}

const SECTOR_ICON: Record<string, string> = {
  EAST_VALLEY: '🏞️',
  URUBAMBA: '🌿',
  CUSCO_CITY: '🏛️',
  OTHER: '💎',
}

const SECTOR_GRADIENT: Record<string, string> = {
  EAST_VALLEY: 'from-emerald-400 to-green-600',
  URUBAMBA: 'from-amber-400 to-orange-500',
  CUSCO_CITY: 'from-rose-500 to-red-700',
  OTHER: 'from-violet-500 to-purple-700',
}

const PACE_ICON: Record<string, string> = { SLOW: '🍃', BALANCED: '🥾', FAST: '🧗‍♂️' }

const QUICK_PICKS = [
  {
    id: 'classic',
    label: '🏔️ The Classic',
    desc: 'MP + Valley + Cusco',
    pick: (pkgs: TourPackage[]) => {
      const mp = pkgs.find(p => p.sector === 'MACHU_PICCHU')
      const valley = pkgs.find(p => p.sector === 'EAST_VALLEY' || p.sector === 'URUBAMBA')
      const city = pkgs.find(p => p.sector === 'CUSCO_CITY')
      return [mp?.id, valley?.id, city?.id].filter(Boolean) as string[]
    },
  },
  {
    id: 'offpath',
    label: '💎 Hidden Gems',
    desc: 'Ancestral & remote',
    pick: (pkgs: TourPackage[]) =>
      pkgs.filter(p => p.sector === 'OTHER' || p.tags.includes('ancestral')).slice(0, 3).map(p => p.id),
  },
  {
    id: 'soul',
    label: '🌿 Soul Journey',
    desc: 'Wellness & community',
    pick: (pkgs: TourPackage[]) =>
      pkgs.filter(p => p.tags.includes('wellness') || p.tags.includes('culture') || p.tags.includes('community')).slice(0, 3).map(p => p.id),
  },
]

const LENS_OPTIONS = [
  { id: 'HISTORIAN', label: 'The Historian', desc: 'Archaeology, ruins, deep lore', icon: '🏺' },
  { id: 'CULTURE', label: 'Living Culture', desc: 'Textiles, indigenous communities, markets', icon: '🧶' },
  { id: 'EPICUREAN', label: 'The Epicurean', desc: 'Pachamanca earth-ovens, local tasting', icon: '🍽️' },
  { id: 'SANCTUARY', label: 'The Sanctuary', desc: 'Plant medicine, thermal baths, silence', icon: '🌿' },
]

export function JourneyDesigner() {
  const router = useRouter()
  const { setMacroTrip, setPanelMode } = useItinerary()

  const [step, setStep] = useState(1)
  const [dates, setDates] = useState({ start: "", end: "" })
  const [pax, setPax] = useState(1)
  const [exertionProfile, setExertionProfile] = useState<ExertionProfile>("")
  const [lenses, setLenses] = useState<string[]>([])
  const [autonomy, setAutonomy] = useState<Autonomy>("")
  const [needsHotels, setNeedsHotels] = useState(false)
  const [availablePackages, setAvailablePackages] = useState<TourPackage[]>([])
  const [pinnedPackageIds, setPinnedPackageIds] = useState<string[]>([])
  const [loadingPackages, setLoadingPackages] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [visibleSectors, setVisibleSectors] = useState<WizardSector[]>([...WIZARD_SECTORS])
  const [collapsedSectors, setCollapsedSectors] = useState<WizardSector[]>([])
  const [viewMode, setViewMode] = useState<'vallecito' | 'agencies'>('vallecito')
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [generatedTrip, setGeneratedTrip] = useState<any>(null)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [shareToken, setShareToken] = useState<string | null>(null)

  const [minStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })

  const minEndDate = (() => {
    if (!dates.start) return minStartDate
    const parts = dates.start.split('-')
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]) + 1)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    return minStartDate
  })()

  const numDays = useMemo(() => {
    if (!dates.start || !dates.end) return 0
    return Math.ceil((new Date(dates.end).getTime() - new Date(dates.start).getTime()) / 86400000)
  }, [dates])

  const isStep1Valid = Boolean(
    dates.start && dates.end && dates.start >= minStartDate && dates.end >= minEndDate
  )

  const filteredPackages = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return availablePackages.filter(pkg => {
      // Search filter
      if (query && !pkg.title.toLowerCase().includes(query) && !pkg.tags.toLowerCase().includes(query)) return false
      // Sector filter
      if (!visibleSectors.includes(pkg.sector as WizardSector)) return false
      // View mode filter
      if (viewMode === 'vallecito') {
        return !pkg.agency || pkg.agency.slug === 'vallecito-originals'
      } else {
        return pkg.agency && pkg.agency.slug !== 'vallecito-originals'
      }
    })
  }, [availablePackages, searchQuery, visibleSectors, viewMode])

  const toggleLens = (lensId: string) => {
    setLenses(prev => {
      if (prev.includes(lensId)) return prev.filter(l => l !== lensId)
      if (prev.length >= 2) return prev
      return [...prev, lensId]
    })
  }

  const togglePin = (id: string) => {
    setPinnedPackageIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const toggleSectorFilter = (sector: WizardSector) => {
    setVisibleSectors(prev =>
      prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]
    )
  }

  const toggleSectorCollapse = (sector: WizardSector) => {
    setCollapsedSectors(prev =>
      prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]
    )
  }

  const applyQuickPick = (pickFn: (pkgs: TourPackage[]) => string[]) => {
    setPinnedPackageIds(pickFn(availablePackages))
  }

  const enterStep5 = async () => {
    setStep(5)
    if (availablePackages.length > 0) return
    setLoadingPackages(true)
    try {
      const params = new URLSearchParams({ exertion: exertionProfile, lenses: lenses.join(',') })
      const res = await fetch(`/api/packages?${params}`)
      if (!res.ok) throw new Error("Failed to fetch packages")
      const text = await res.text()
      const data = text ? JSON.parse(text) : []
      setAvailablePackages(data)
    } catch (err) {
      console.error(err)
      setAvailablePackages([])
    } finally {
      setLoadingPackages(false)
    }
  }

  const handleDevAutofill = async () => {
    // Dev only: autofill wizard to test step 5
    const testStart = minStartDate
    const testEnd = new Date(new Date(minStartDate).getTime() + 4 * 86400000).toISOString().split('T')[0]
    setDates({ start: testStart, end: testEnd })
    setPax(2)
    setExertionProfile("EXPLORER")
    setLenses(["CULTURE", "EPICUREAN"])
    setAutonomy("ANCHOR_METHOD")
    setNeedsHotels(false)
    setStep(5)
    
    setLoadingPackages(true)
    try {
      const params = new URLSearchParams({ exertion: "EXPLORER", lenses: ["CULTURE", "EPICUREAN"].join(',') })
      const res = await fetch(`/api/packages?${params}`)
      if (!res.ok) throw new Error("Failed to fetch packages")
      const text = await res.text()
      const data = text ? JSON.parse(text) : []
      setAvailablePackages(data)
    } catch (err) {
      console.error(err)
      setAvailablePackages([])
    } finally {
      setLoadingPackages(false)
    }
  }

  const handleComplete = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/travel-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates, pax, exertionProfile, lenses, autonomy, needsHotels, pinnedPackageIds }),
      })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      setGeneratedTrip(data)
      setIsGenerating(false)
      setStep(6)
    } catch (err) {
      console.error(err)
      alert("There was an error designing your expedition. Please try again.")
      setIsGenerating(false)
    }
  }

  const handleUnlock = async () => {
    setIsUnlocking(true)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Save to DB and generate magic link
    try {
      const res = await fetch('/api/trip/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip: generatedTrip, dates, pax })
      })
      if (!res.ok) throw new Error("Failed to save trip")
      const data = await res.json()
      setShareToken(data.shareToken)
    } catch (err) {
      console.error(err)
      // Even if it fails, maybe proceed or show error
      alert("There was an issue securing your itinerary. Please contact support.")
      setIsUnlocking(false)
      return
    }

    setIsUnlocking(false)
    setIsUnlocked(true)
  }

  const proceedToItinerary = () => {
    if (shareToken) {
      router.push(`/trip/${shareToken}`)
    } else if (generatedTrip) {
      setMacroTrip(generatedTrip)
      setPanelMode("macro")
      router.push('/explore')
    }
  }

  const NAV_STEPS = ['Dates', 'Profile', 'Autonomy', 'Hotels', 'Experiences']

  return (
    <div className="w-full mx-auto relative overflow-hidden min-h-[400px] flex flex-col justify-center">
      {isGenerating && (
        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
          <Loader2 className="w-10 h-10 text-rose-600 animate-spin mb-4" />
          <h3 className="text-2xl font-serif text-slate-900 mb-2">Curating your exclusive local experiences...</h3>
          <p className="text-slate-500 text-sm">Designing your perfect Andean expedition...</p>
        </div>
      )}

      {/* Step nav */}
      <div className="flex justify-between mb-8 text-xs font-semibold text-slate-400">
        {NAV_STEPS.map((label, i) => (
          <button
            key={i}
            onClick={() => step > i + 1 ? setStep(i + 1) : undefined}
            className={`hover:text-slate-900 transition-colors ${step >= i + 1 ? 'text-slate-900' : 'cursor-default'}`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {/* Step 1: Dates */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-3xl font-serif text-slate-900">When are you traveling?</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-500 mb-2 block">Start Date</label>
              <input
                type="date"
                min={minStartDate}
                value={dates.start}
                onChange={e => setDates({ ...dates, start: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500 mb-2 block">End Date</label>
              <input
                type="date"
                min={minEndDate}
                value={dates.end}
                onChange={e => setDates({ ...dates, end: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-500 mb-2 block">Travelers (Pax)</label>
            <div className="flex items-center gap-4">
              <button onClick={() => setPax(Math.max(1, pax - 1))} className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-900 hover:bg-slate-200 transition-colors">-</button>
              <span className="text-2xl font-bold w-8 text-center text-slate-900">{pax}</span>
              <button onClick={() => setPax(pax + 1)} className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-900 hover:bg-slate-200 transition-colors">+</button>
            </div>
          </div>
          <div className="flex justify-between mt-8">
            <button
              onClick={handleDevAutofill}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-full transition-colors"
            >
              Dev Autofill
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!isStep1Valid}
              className="bg-slate-900 text-white rounded-xl px-8 py-3 font-bold disabled:opacity-50 hover:bg-slate-800 transition-colors"
            >
              Next Step &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Exertion + Lenses */}
      {step === 2 && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
          <div>
            <h2 className="text-3xl font-serif text-slate-900">The Exertion Profile</h2>
            <p className="text-slate-500 mb-6">Crucial for altitude planning in the Andes.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'OBSERVER', label: 'The Observer', desc: '🍃 Flat walks, scenic trains, no steep Inca stairs' },
                { id: 'EXPLORER', label: 'The Explorer', desc: '🥾 Moderate hikes, uneven terrain, 2-4 hours of walking' },
                { id: 'EXPEDITIONIST', label: 'The Expeditionist', desc: '🧗‍♂️ High-alpine treks, steep ascents, physical endurance' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setExertionProfile(p.id as ExertionProfile)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${exertionProfile === p.id ? 'border-slate-900 bg-slate-50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="font-bold text-slate-900">{p.label}</div>
                  <div className="text-sm text-slate-500 mt-1">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-serif text-slate-900">Lenses of Discovery</h2>
            <p className="text-slate-500 mb-6">Select up to 2 core focuses for your expedition.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {LENS_OPTIONS.map(lens => (
                <button
                  key={lens.id}
                  onClick={() => toggleLens(lens.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${lenses.includes(lens.id) ? 'border-slate-900 bg-slate-50 shadow-md shadow-slate-200' : 'border-gray-100 hover:border-gray-200 bg-white/50 backdrop-blur-sm'}`}
                >
                  <div className="text-2xl mb-2">{lens.icon}</div>
                  <div className="font-bold text-slate-900">{lens.label}</div>
                  <div className="text-sm text-slate-500 mt-1">{lens.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(1)} className="text-slate-500 font-semibold px-4 py-3 hover:text-slate-900 transition-colors">&larr; Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={!exertionProfile || lenses.length === 0}
              className="bg-slate-900 text-white rounded-xl px-8 py-3 font-bold disabled:opacity-50 hover:bg-slate-800 transition-colors"
            >
              Next Step &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Autonomy */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-3xl font-serif text-slate-900">The Autonomy Ratio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'ORCHESTRATED', label: '🗓️ Fully Orchestrated', desc: 'Plan every transfer, meal, and detail.' },
              { id: 'ANCHOR_METHOD', label: '🕰️ The Anchor Method', desc: 'Plan 1 main event per day, leave afternoons open for spontaneity.' },
            ].map(a => (
              <button
                key={a.id}
                onClick={() => setAutonomy(a.id as Autonomy)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${autonomy === a.id ? 'border-slate-900 bg-slate-50' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className="font-bold text-slate-900">{a.label}</div>
                <div className="text-sm text-slate-500 mt-1">{a.desc}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(2)} className="text-slate-500 font-semibold px-4 py-3 hover:text-slate-900 transition-colors">&larr; Back</button>
            <button
              onClick={() => setStep(4)}
              disabled={!autonomy}
              className="bg-slate-900 text-white rounded-xl px-8 py-3 font-bold disabled:opacity-50 hover:bg-slate-800 transition-colors"
            >
              Next Step &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Hotels */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-3xl font-serif text-slate-900">Need Basecamps?</h2>
          <p className="text-slate-500">Should Vallecito secure your boutique accommodations along the route?</p>
          <div className="flex gap-4">
            <button
              onClick={() => setNeedsHotels(true)}
              className={`flex-1 p-4 rounded-xl border-2 font-semibold transition-all ${needsHotels ? 'border-slate-900 bg-slate-50 text-slate-900' : 'border-gray-100 hover:border-gray-200 text-slate-600'}`}
            >
              Yes, curate hotels
            </button>
            <button
              onClick={() => setNeedsHotels(false)}
              className={`flex-1 p-4 rounded-xl border-2 font-semibold transition-all ${!needsHotels ? 'border-slate-900 bg-slate-50 text-slate-900' : 'border-gray-100 hover:border-gray-200 text-slate-600'}`}
            >
              No, I have them
            </button>
          </div>
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(3)} className="text-slate-500 font-semibold px-4 py-3 hover:text-slate-900 transition-colors">&larr; Back</button>
            <button
              onClick={enterStep5}
              className="bg-slate-900 text-white rounded-xl px-8 py-3 font-bold hover:bg-slate-800 transition-colors"
            >
              Next Step &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Experience Picker */}
      {step === 5 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div>
            <h2 className="text-3xl font-serif text-slate-900">Your Highlight Experiences</h2>
            <p className="text-slate-500 mt-1">Pin the days that matter most. AI curates the rest.</p>
          </div>

          {/* Search */}
          {!loadingPackages && availablePackages.length > 0 && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search experiences by title or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-slate-900"
              />
            </div>
          )}

          {/* Quick picks + day counter row */}
          {!loadingPackages && availablePackages.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mr-1">Presets:</span>
              {QUICK_PICKS.map(qp => (
                <button
                  key={qp.id}
                  onClick={() => applyQuickPick(qp.pick)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  {qp.label} <span className="text-slate-400 font-normal hidden sm:inline">{qp.desc}</span>
                </button>
              ))}
              {pinnedPackageIds.length > 0 && (
                <button onClick={() => setPinnedPackageIds([])} className="px-3 py-1.5 rounded-full text-rose-500 text-xs font-semibold hover:bg-rose-50 transition-colors">
                  Clear ×
                </button>
              )}
            </div>
          )}

          {/* Sector filter pills */}
          {!loadingPackages && availablePackages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {WIZARD_SECTORS.map(sector => {
                const active = visibleSectors.includes(sector)
                return (
                  <button
                    key={sector}
                    onClick={() => toggleSectorFilter(sector)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {SECTOR_ICON[sector]} {SECTOR_LABELS[sector]}
                  </button>
                )
              })}
            </div>
          )}

          {/* Day slot progress */}
          {numDays > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {Array.from({ length: Math.min(numDays, 12) }).map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < pinnedPackageIds.length ? 'w-6 bg-slate-900' : 'w-4 bg-slate-200'}`} />
                ))}
              </div>
              <span className="text-xs text-slate-500">
                <span className="font-semibold text-slate-900">{pinnedPackageIds.length}</span>/{numDays} days pinned
                {pinnedPackageIds.length < numDays && <span className="text-slate-400"> — AI fills the rest</span>}
              </span>
            </div>
          )}

          {/* Loading */}
          {loadingPackages && (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-3" />
              Curating experiences for your profile...
            </div>
          )}

          {/* Segmented Switcher */}
          {!loadingPackages && availablePackages.length > 0 && (
            <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
              <button
                onClick={() => setViewMode('vallecito')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${viewMode === 'vallecito' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Vallecito Originals
              </button>
              <button
                onClick={() => setViewMode('agencies')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${viewMode === 'agencies' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Elite Local Agencies
              </button>
            </div>
          )}

          {/* Dashboard Grid */}
          {!loadingPackages && filteredPackages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map(pkg => {
                const pinned = pinnedPackageIds.includes(pkg.id)
                const sectorIcon = SECTOR_ICON[pkg.sector as keyof typeof SECTOR_ICON] || '🗺️'
                const sectorLabel = SECTOR_LABELS[pkg.sector as keyof typeof SECTOR_LABELS] || 'Hidden Gems'
                const gallery = pkg.galleryJson ? JSON.parse(pkg.galleryJson) : []
                const mainImage = pkg.heroImage || gallery[0]?.url || "/images/og-default.jpg"

                return (
                  <button
                    key={pkg.id}
                    onClick={() => togglePin(pkg.id)}
                    className={`relative w-full bg-white rounded-3xl overflow-hidden border text-left flex flex-col group transition-all duration-500 ${
                      pinned
                        ? 'border-slate-900 shadow-xl ring-1 ring-slate-900'
                        : 'border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1'
                    }`}
                  >
                    {/* Photo & Price */}
                    <div className="relative h-56 overflow-hidden w-full">
                      <img 
                        src={mainImage} 
                        alt={pkg.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                        ${pkg.basePriceUsd}
                      </div>
                      <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap pr-4">
                        <span className="bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-sm flex items-center gap-1">
                          {sectorIcon} {sectorLabel}
                        </span>
                        {pkg.agency && pkg.agency.slug !== 'vallecito-originals' && (
                          <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-sm flex items-center gap-1">
                            by {pkg.agency.name}
                          </span>
                        )}
                      </div>
                      {pinned && (
                        <div className="absolute top-4 left-4 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col bg-white">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{PACE_ICON[pkg.pace]} PACE</span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-slate-900 mb-3 group-hover:text-rose-600 transition-colors line-clamp-2">
                        {pkg.title}
                      </h3>
                      <p className="text-sm text-slate-500 font-light leading-relaxed mt-auto line-clamp-3">
                        {pkg.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {!loadingPackages && filteredPackages.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              No experiences found matching your filters.
            </div>
          )}

          {/* CTA */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button onClick={() => setStep(4)} className="text-slate-500 font-semibold px-4 py-3 hover:text-slate-900 transition-colors">&larr; Back</button>
            <button
              onClick={handleComplete}
              disabled={isGenerating}
              className="bg-rose-600 text-white rounded-xl px-8 py-4 font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              <Sparkles className="w-5 h-5" /> Curate My Journey
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Unlock & Book Paywall */}
      {step === 6 && (
        <div className="max-w-2xl mx-auto text-center py-12 animate-in fade-in zoom-in duration-500">
          {!isUnlocked ? (
            <div className="space-y-8">
              <div className="mx-auto w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-rose-600" />
              </div>
              <h2 className="text-4xl font-serif text-slate-900 mb-4">Your Expedition is Ready</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                The AI has curated a perfect {numDays}-day journey based on your profile, balancing rest, exploration, and exclusive access to the Sacred Valley.
              </p>
              
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 p-8 bg-slate-50 mb-10">
                <div className="absolute inset-0 backdrop-blur-md bg-white/40 z-10 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-xl text-center max-w-sm">
                    <p className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-2">Premium Access</p>
                    <p className="text-slate-900 font-medium mb-6">Unlock the full itinerary, daily schedules, and your live AI WhatsApp Concierge.</p>
                    <button
                      onClick={handleUnlock}
                      disabled={isUnlocking}
                      className="w-full bg-slate-900 text-white rounded-xl px-8 py-4 font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isUnlocking ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                      ) : (
                        <>Unlock & Access Concierge • $29</>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Teaser content underneath the blur */}
                <div className="space-y-4 opacity-50 select-none pointer-events-none">
                  <div className="h-12 bg-slate-200 rounded-lg w-3/4 mx-auto" />
                  <div className="h-8 bg-slate-200 rounded-lg w-1/2 mx-auto" />
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="h-32 bg-slate-200 rounded-xl" />
                    <div className="h-32 bg-slate-200 rounded-xl" />
                    <div className="h-32 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-slate-400">Secure payment via Stripe. Satisfaction guaranteed.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="mx-auto w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                <Check className="w-12 h-12 text-emerald-500" strokeWidth={3} />
              </div>
              <h2 className="text-4xl font-serif text-slate-900 mb-4">Payment Successful!</h2>
              <p className="text-lg text-slate-600 mb-8">
                Your journey has been unlocked and securely saved.
              </p>

              {shareToken && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 mb-10 text-left shadow-sm max-w-md mx-auto relative group">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Your Magic Link</p>
                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <code className="text-slate-900 text-xs flex-1 overflow-x-hidden text-ellipsis whitespace-nowrap">
                      {typeof window !== 'undefined' ? `${window.location.origin}/trip/${shareToken}` : ''}
                    </code>
                    <button 
                      onClick={() => navigator.clipboard.writeText(typeof window !== 'undefined' ? `${window.location.origin}/trip/${shareToken}` : '')}
                      className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-md font-semibold transition-colors shrink-0 uppercase tracking-wider"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">Save this link. You can use it to access your live itinerary from any device.</p>
                </div>
              )}

              <button
                onClick={proceedToItinerary}
                className="bg-rose-600 text-white rounded-xl px-10 py-5 text-lg font-bold shadow-xl shadow-rose-600/30 hover:bg-rose-700 hover:scale-[1.02] transition-all"
              >
                Open My Journey &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
