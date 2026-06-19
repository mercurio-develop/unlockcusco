"use client"

import { useState, useMemo, useTransition } from "react"
import { 
  simulateDriverAccept, 
  simulateDriverMessage, 
  simulateRideComplete 
} from "@/features/sandbox/actions/simulate-webhooks"
import { 
  generateTrackedLink, 
  saveAffiliateLink, 
  deleteAffiliateLink 
} from "@/features/sandbox/actions/affiliate-actions"
import type { RideBooking, Driver, RideMessage } from "@prisma/client"
import { 
  Smartphone, 
  Link2, 
  Search, 
  Filter, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  Trash2, 
  AlertCircle,
  HelpCircle,
  Activity,
  Bed,
  MapPin,
  CheckCircle
} from "lucide-react"

type RideWithDetails = RideBooking & { 
  driver: Driver | null; 
  messages: RideMessage[]; 
}

interface BusinessStub {
  id: string
  name: string
  category: string
  locationSlug: string
  slug: string
  affiliateLinks: any // JSON type from Prisma
}

interface SandboxDashboardProps {
  rides: RideWithDetails[]
  businesses?: BusinessStub[]
}

interface AffiliateLink {
  provider: string
  url: string
}

export function SandboxDashboard({ rides, businesses = [] }: SandboxDashboardProps) {
  const [activeTab, setActiveTab] = useState<"simulator" | "affiliate">("simulator")
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Filters for affiliate link manager
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")

  // States for URL inputs, generated shortlinks, errors, and loading statuses per business
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({})
  const [generatedShortlinks, setGeneratedShortlinks] = useState<Record<string, string>>({})
  const [businessErrors, setBusinessErrors] = useState<Record<string, string>>({})
  const [generatingStatus, setGeneratingStatus] = useState<Record<string, boolean>>({})

  // Unique categories & locations for filtering
  const categories = useMemo(() => {
    const cats = new Set(businesses.map(b => b.category.toLowerCase()))
    return Array.from(cats).sort()
  }, [businesses])

  const locations = useMemo(() => {
    const locs = new Set(businesses.map(b => b.locationSlug).filter(Boolean))
    return Array.from(locs).sort()
  }, [businesses])

  // Filtered businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCat = categoryFilter === "all" || b.category.toLowerCase() === categoryFilter.toLowerCase()
      const matchesLoc = locationFilter === "all" || b.locationSlug.toLowerCase() === locationFilter.toLowerCase()
      return matchesSearch && matchesCat && matchesLoc
    })
  }, [businesses, searchQuery, categoryFilter, locationFilter])

  // Simulator actions
  const handleAccept = async (id: string) => {
    setLoading(true)
    await simulateDriverAccept(id)
    setLoading(false)
  }

  const handleMessage = async (id: string) => {
    setLoading(true)
    await simulateDriverMessage(id, "I am outside in the silver Yaris.")
    setLoading(false)
  }

  const handleComplete = async (id: string) => {
    setLoading(true)
    const res = await simulateRideComplete(id)
    if (res?.error) {
      alert("Simulation failed: " + res.error)
    }
    setLoading(false)
  }

  // Affiliate actions
  const getKlookSearchUrl = (name: string, location: string) => {
    const locStr = location ? ` ${location}` : ""
    return `https://www.klook.com/search/?keyword=${encodeURIComponent(name + locStr)}`
  }

  const handleGenerateShortlink = async (businessId: string, name: string, location: string) => {
    const rawUrl = urlInputs[businessId] || getKlookSearchUrl(name, location)
    
    setGeneratingStatus(prev => ({ ...prev, [businessId]: true }))
    setBusinessErrors(prev => ({ ...prev, [businessId]: "" }))

    const result = await generateTrackedLink(rawUrl)
    
    setGeneratingStatus(prev => ({ ...prev, [businessId]: false }))

    if (result.error) {
      setBusinessErrors(prev => ({ ...prev, [businessId]: result.error || "Generation failed" }))
    } else if (result.partnerUrl) {
      setGeneratedShortlinks(prev => ({ ...prev, [businessId]: result.partnerUrl }))
    }
  }

  const handleSaveLink = (businessId: string, shortlink: string) => {
    startTransition(async () => {
      const res = await saveAffiliateLink(businessId, "Klook", shortlink)
      if (res.error) {
        setBusinessErrors(prev => ({ ...prev, [businessId]: res.error || "Save failed" }))
      } else {
        alert("Affiliate link successfully saved to business detail page!")
        // Clear local generated links states
        setGeneratedShortlinks(prev => {
          const next = { ...prev }
          delete next[businessId]
          return next
        })
      }
    })
  }

  const handleDeleteLink = (businessId: string) => {
    if (!confirm("Are you sure you want to remove the affiliate link for this business?")) return

    startTransition(async () => {
      const res = await deleteAffiliateLink(businessId, "Klook")
      if (res.error) {
        alert("Failed to delete link: " + res.error)
      } else {
        alert("Affiliate link removed.")
      }
    })
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Developer Sandbox
          </h1>
          <p className="text-slate-500 mt-1">Simulate booking behaviors and verify affiliate integrations.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab("simulator")}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 -mb-[2px] ${
            activeTab === "simulator"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-slate-500 hover:text-slate-950"
          }`}
        >
          <Smartphone className="w-4.5 h-4.5" />
          Ghost Phone Simulator
        </button>
        <button
          onClick={() => setActiveTab("affiliate")}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 -mb-[2px] ${
            activeTab === "affiliate"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-slate-500 hover:text-slate-950"
          }`}
        >
          <Link2 className="w-4.5 h-4.5" />
          Klook Affiliate Manager
        </button>
      </div>

      {/* Ghost Phone Simulator Tab */}
      {activeTab === "simulator" && (
        <div>
          <p className="text-sm text-slate-500 mb-6">
            Verify Stripe-secured taxi holds and simulate live WhatsApp webhook conversations (Yape / capturing hold status).
          </p>

          {rides.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-500 bg-white">
              <Smartphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-800">No active rides found</p>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                Go to the explore view, start a chat with the Concierge, and book a taxi to trigger a simulated hold booking here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {rides.map(ride => (
                <div key={ride.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                        {ride.pickupLocation} <span className="text-slate-400 font-normal">→</span> {ride.dropoffLocation}
                      </h3>
                      <p className="text-sm font-semibold text-slate-500 mt-0.5">
                        Tourist: <span className="text-slate-800">{ride.touristName || 'Anonymous'}</span> | Price: <span className="text-rose-600">${ride.priceUsd}</span>
                      </p>
                    </div>
                    <div className={`self-start px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      ride.status === 'HOLD_SECURED' ? 'bg-amber-100 text-amber-800' :
                      ride.status === 'DRIVER_ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                      ride.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {ride.status}
                    </div>
                  </div>

                  {ride.driver && (
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl mb-4 text-xs font-semibold text-slate-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <strong>Driver Assigned:</strong> {ride.driver.name} ({ride.driver.carModel} - {ride.driver.licensePlate})
                    </div>
                  )}

                  {/* Chat Log Preview */}
                  {ride.messages.length > 0 && (
                    <div className="mb-4 space-y-2 max-h-36 overflow-y-auto border border-slate-100 p-3 rounded-xl bg-slate-50/50 text-xs">
                      <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mb-1">WhatsApp Chat Log</p>
                      {ride.messages.map((m: RideMessage) => (
                        <div key={m.id} className="flex gap-2">
                          <span className={`font-bold shrink-0 ${
                            m.sender === 'DRIVER' ? 'text-blue-600' : 
                            m.sender === 'TOURIST' ? 'text-slate-800' : 'text-rose-600'
                          }`}>{m.sender}:</span> 
                          <span className="text-slate-600">{m.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Simulator Actions */}
                  <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    {ride.status === 'HOLD_SECURED' && (
                      <button 
                        onClick={() => handleAccept(ride.id)} 
                        disabled={loading}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                      >
                        Simulate Driver &quot;ACCEPT&quot;
                      </button>
                    )}
                    {ride.status === 'DRIVER_ASSIGNED' && (
                      <>
                        <button 
                          onClick={() => handleMessage(ride.id)} 
                          disabled={loading}
                          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                          Simulate &quot;I am outside&quot; Message
                        </button>
                        <button 
                          onClick={() => handleComplete(ride.id)} 
                          disabled={loading}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 sm:ml-auto"
                        >
                          Simulate Ride Complete (Capture Hold)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Klook Affiliate Manager Tab */}
      {activeTab === "affiliate" && (
        <div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-extrabold text-slate-900 mb-2">Automated Link Reviewer</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              We have pre-structured Klook search queries for all business listings. 
              Search a hotel, click <strong>Search on Klook</strong> to confirm they list the property, and generate/verify the tracked affiliate link.
            </p>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search business name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 focus:bg-white transition-all text-slate-800"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
                <Bed className="w-4.5 h-4.5 text-slate-400 mr-2" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-transparent text-sm py-1 font-semibold text-slate-600 outline-none capitalize"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
                <MapPin className="w-4.5 h-4.5 text-slate-400 mr-2" />
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full bg-transparent text-sm py-1 font-semibold text-slate-600 outline-none capitalize"
                >
                  <option value="all">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Business Cards List */}
          <div className="space-y-4">
            {filteredBusinesses.length === 0 ? (
              <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 bg-white">
                <Filter className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No matching businesses found</p>
                <p className="text-xs text-slate-400 mt-0.5">Try clearing filters or queries.</p>
              </div>
            ) : (
              filteredBusinesses.map(business => {
                const currentLinks = (business.affiliateLinks || []) as AffiliateLink[]
                const klookLink = currentLinks.find(l => l.provider === "Klook")
                const searchUrl = getKlookSearchUrl(business.name, business.locationSlug)
                const isGenerating = generatingStatus[business.id]
                const generatedLink = generatedShortlinks[business.id]
                const error = businessErrors[business.id]
                
                return (
                  <div key={business.id} className="bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.01)] rounded-2xl p-5 hover:border-slate-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1.5 max-w-sm">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-[15px]">{business.name}</h4>
                        {klookLink && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest text-[10px]">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 capitalize">{business.category}</span>
                        {business.locationSlug && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 capitalize">{business.locationSlug}</span>
                        )}
                      </div>
                      {klookLink && (
                        <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 pt-1">
                          <span className="font-semibold text-slate-700">Link:</span>
                          <a href={klookLink.url} target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline truncate max-w-xs flex items-center gap-1">
                            {klookLink.url} <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Step-by-Step Review Actions */}
                    <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                      
                      {/* Step 1: Open Search */}
                      <a 
                        href={searchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 px-4 py-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
                      >
                        Search Klook <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {/* Step 2: Paste Exact URL input */}
                      <div className="relative flex-1 sm:w-56">
                        <input
                          type="text"
                          placeholder="Paste direct Klook page URL..."
                          value={urlInputs[business.id] !== undefined ? urlInputs[business.id] : ""}
                          onChange={(e) => {
                            const val = e.target.value
                            setUrlInputs(prev => ({ ...prev, [business.id]: val }))
                          }}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-rose-500 outline-none text-slate-800 placeholder-slate-400 font-medium"
                        />
                        {urlInputs[business.id] && (
                          <button 
                            onClick={() => setUrlInputs(prev => ({ ...prev, [business.id]: "" }))}
                            className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Step 3: Action Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 justify-end">
                        {!generatedLink ? (
                          <button
                            onClick={() => handleGenerateShortlink(business.id, business.name, business.locationSlug)}
                            disabled={isGenerating || isPending}
                            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                          >
                            {isGenerating ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Generating
                              </>
                            ) : (
                              "Create Shortlink"
                            )}
                          </button>
                        ) : (
                          <div className="flex gap-1.5 w-full sm:w-auto">
                            {/* Step 4: Test generated link */}
                            <a
                              href={generatedLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
                            >
                              Test Redirect <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {/* Step 5: Save link to database */}
                            <button
                              onClick={() => handleSaveLink(business.id, generatedLink)}
                              disabled={isPending}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 disabled:opacity-50"
                            >
                              Approve & Save
                            </button>
                          </div>
                        )}

                        {/* Optional Remove Button */}
                        {klookLink && (
                          <button
                            onClick={() => handleDeleteLink(business.id)}
                            disabled={isPending}
                            className="p-2 border border-slate-200 hover:border-rose-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                            title="Remove link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Error indicator */}
                    {error && (
                      <div className="w-full text-left text-xs font-semibold text-rose-600 mt-2 flex items-center gap-1 bg-rose-50 p-2 rounded-lg border border-rose-100">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Error: {error}</span>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
