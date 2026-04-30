"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Loader2, Check } from "lucide-react"
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

  const grouped = useMemo(() => {
    const groups: Record<string, TourPackage[]> = {}
    for (const pkg of availablePackages) {
      if (pkg.agency && pkg.agency.slug !== 'vallecito-originals') continue;
      if (!groups[pkg.sector]) groups[pkg.sector] = []
      groups[pkg.sector].push(pkg)
    }
    return groups
  }, [availablePackages])

  const groupedByAgency = useMemo(() => {
    const agencies: Record<string, { agency: any; packages: TourPackage[] }> = {}
    for (const pkg of availablePackages) {
      if (pkg.agency && pkg.agency.slug !== 'vallecito-originals') {
        if (!agencies[pkg.agency.id]) {
          agencies[pkg.agency.id] = { agency: pkg.agency, packages: [] }
        }
        agencies[pkg.agency.id].packages.push(pkg)
      }
    }
    return Object.values(agencies)
  }, [availablePackages])

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
      setMacroTrip(data)
      setPanelMode("macro")
      router.push('/explore')
    } catch (err) {
      console.error(err)
      alert("There was an error designing your expedition. Please try again.")
      setIsGenerating(false)
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
          <div className="flex justify-end mt-8">
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

          {/* Vallecito Originals Carousel */}
          {!loadingPackages && viewMode === 'vallecito' && WIZARD_SECTORS.filter(s => visibleSectors.includes(s) && grouped[s]?.length).map(sector => {
            const collapsed = collapsedSectors.includes(sector)
            return (
              <div key={sector} className="border border-slate-100 rounded-2xl overflow-hidden">
                {/* Section header */}
                <button
                  onClick={() => toggleSectorCollapse(sector)}
                  className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${SECTOR_GRADIENT[sector]}`} />
                    <span className="font-semibold text-slate-900 text-sm">{SECTOR_ICON[sector]} {SECTOR_LABELS[sector]}</span>
                    <span className="text-xs text-slate-400">{grouped[sector].length} experiences</span>
                  </div>
                  <span className={`text-slate-400 text-xs transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}>▼</span>
                </button>

                {/* Horizontal scroll row */}
                {!collapsed && (
                  <div className="overflow-x-auto px-4 py-4">
                    <div className="flex gap-3" style={{ width: 'max-content' }}>
                      {grouped[sector].map(pkg => {
                        const pinned = pinnedPackageIds.includes(pkg.id)
                        return (
                          <button
                            key={pkg.id}
                            onClick={() => togglePin(pkg.id)}
                            className={`relative w-44 rounded-xl overflow-hidden text-left transition-all duration-200 shrink-0 ${
                              pinned
                                ? 'ring-2 ring-slate-900 shadow-xl scale-[1.02]'
                                : 'ring-1 ring-slate-100 hover:ring-slate-300 hover:shadow-md'
                            }`}
                          >
                            {/* Gradient photo header */}
                            <div className={`h-24 bg-gradient-to-br ${SECTOR_GRADIENT[sector]} flex items-center justify-center relative`}>
                              <span className="text-3xl">{SECTOR_ICON[sector]}</span>
                              {pinned && (
                                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                                  <Check className="w-6 h-6 text-white" strokeWidth={3} />
                                </div>
                              )}
                              <div className="absolute bottom-1.5 left-2">
                                <span className="text-white/80 text-xs font-medium">{PACE_ICON[pkg.pace]}</span>
                              </div>
                            </div>
                            {/* Info */}
                            <div className="p-3 bg-white">
                              <p className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">{pkg.title}</p>
                              <p className="text-xs text-slate-400 mt-1 truncate">
                                {pkg.tags.split(',').slice(0, 3).map(t => t.trim()).filter(Boolean).join(' · ')}
                              </p>
                              <p className="text-xs font-semibold text-slate-600 mt-2">from ${pkg.basePriceUsd}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Elite Local Agencies Dashboard */}
          {!loadingPackages && viewMode === 'agencies' && groupedByAgency.map(({ agency, packages }) => {
            const isSelected = selectedAgencyId === agency.id;
            return (
              <div key={agency.id} className="border border-slate-100 rounded-2xl overflow-hidden mb-4">
                <button
                  onClick={() => setSelectedAgencyId(isSelected ? null : agency.id)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {agency.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={agency.imageUrl} alt={agency.name} className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-serif text-slate-500 font-bold">{agency.name.charAt(0)}</div>
                    )}
                    <div className="text-left">
                      <span className="font-bold text-slate-900 text-sm block">{agency.name}</span>
                      <span className="text-xs text-slate-400">{packages.length} premium experiences</span>
                    </div>
                  </div>
                  <span className={`text-slate-400 text-xs transition-transform duration-200 ${!isSelected ? '' : 'rotate-180'}`}>▼</span>
                </button>
                {isSelected && (
                  <div className="overflow-x-auto px-4 py-4 bg-white">
                    <div className="flex justify-end mb-3">
                      <button onClick={(e) => { e.stopPropagation(); router.push(`/agencies/${agency.slug}`); }} className="text-xs text-rose-600 font-semibold hover:text-rose-700 transition-colors bg-rose-50 px-3 py-1 rounded-full">
                        Read Full Agency Profile &rarr;
                      </button>
                    </div>
                    <div className="flex gap-3" style={{ width: 'max-content' }}>
                      {packages.map(pkg => {
                        const pinned = pinnedPackageIds.includes(pkg.id)
                        return (
                          <button
                            key={pkg.id}
                            onClick={() => togglePin(pkg.id)}
                            className={`relative w-44 rounded-xl overflow-hidden text-left transition-all duration-200 shrink-0 ${
                              pinned
                                ? 'ring-2 ring-slate-900 shadow-xl scale-[1.02]'
                                : 'ring-1 ring-slate-100 hover:ring-slate-300 hover:shadow-md'
                            }`}
                          >
                            <div className={`h-24 bg-gradient-to-br ${SECTOR_GRADIENT[pkg.sector as keyof typeof SECTOR_GRADIENT] || 'from-slate-400 to-slate-600'} flex items-center justify-center relative`}>
                              <span className="text-3xl">{SECTOR_ICON[pkg.sector as keyof typeof SECTOR_ICON] || '🗺️'}</span>
                              {pinned && (
                                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                                  <Check className="w-6 h-6 text-white" strokeWidth={3} />
                                </div>
                              )}
                              <div className="absolute bottom-1.5 left-2">
                                <span className="text-white/80 text-xs font-medium">{PACE_ICON[pkg.pace]}</span>
                              </div>
                            </div>
                            <div className="p-3 bg-white">
                              <p className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">{pkg.title}</p>
                              <p className="text-xs text-slate-400 mt-1 truncate">
                                {pkg.tags.split(',').slice(0, 3).map(t => t.trim()).filter(Boolean).join(' · ')}
                              </p>
                              <p className="text-xs font-semibold text-slate-600 mt-2">from ${pkg.basePriceUsd}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

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
    </div>
  )
}
