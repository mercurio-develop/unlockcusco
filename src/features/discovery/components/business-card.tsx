/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { agencyPath, therapistPath } from "@/paths"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Star, Zap, Plus, MapPin, MoreHorizontal, ExternalLink, MessageCircle, Repeat, Bed, Navigation } from "lucide-react"
import { trackWhatsappClick } from "@/features/discovery/actions/track-click"
import { trackBusinessView } from "@/features/discovery/actions/track-view"
import { SafeImageWrapper } from "@/components/ui/safe-image"
import { useUiStore } from "@/lib/store/use-ui-store"
import { useItineraryStore } from "@/lib/store/use-itinerary-store"

import { cn } from "@/lib/utils"
import { getLocalizedField } from "@/lib/utils/localization"
import { DICTIONARIES } from "../constants"
import type { Business } from "@prisma/client"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { getCategoryData } from "@/features/discovery/constants"

interface BusinessCardProps {
  business: Business
  isHighlighted?: boolean
  onSelect?: () => void
  orientation?: "vertical" | "horizontal"
  onImageLoad?: () => void
  showActions?: boolean
  showItineraryAdd?: boolean
  showItineraryEnd?: boolean
  showContact?: boolean
  showMap?: boolean
  showDetails?: boolean
  mapTargetId?: string
  intent?: string
   
  dict?: any
  onDoubleClick?: () => void
}

export function BusinessCard({
  business,
  isHighlighted,
  onSelect,
  orientation = "vertical",
  onImageLoad,
  showActions = true,
  showItineraryAdd = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showItineraryEnd = true,
  showContact = true,
  showMap = true,
  showDetails = true,
  mapTargetId,
  intent,
  dict,
  onDoubleClick
}: BusinessCardProps) {
  const [isBoletoModalOpen, setIsBoletoModalOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasReportedLoad, setHasReportedLoad] = useState(false)
  const activeItinerary = useItineraryStore(s => s.activeItinerary);
  const swapWaypoint = useItineraryStore(s => s.swapWaypoint);
  const insertWaypoint = useItineraryStore(s => s.insertWaypoint);
  const setStartAnchorLocation = useItineraryStore(s => s.setStartAnchorLocation);
  const updateEndAnchorLocation = useItineraryStore(s => s.updateEndAnchorLocation);

  const setPanelMode = useUiStore(s => s.setPanelMode);
  const exchangeTargetId = useUiStore(s => s.exchangeTargetId);
  const setExchangeTargetId = useUiStore(s => s.setExchangeTargetId);
  const isExchangingStart = useUiStore(s => s.isExchangingStart);
  const setIsExchangingStart = useUiStore(s => s.setIsExchangingStart);
  const isExchangingEnd = useUiStore(s => s.isExchangingEnd);
  const setIsExchangingEnd = useUiStore(s => s.setIsExchangingEnd);
  const setSelectedId = useUiStore(s => s.setSelectedId);
  const addInteraction = useUiStore(s => s.addInteraction);
  const setIsChatOpen = useUiStore(s => s.setIsChatOpen);
  const conciergeSendMessage = useUiStore(s => s.conciergeSendMessage);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setMobileViewMode = useUiStore(s => s.setMobileViewMode);
  const router = useRouter()
  const pathname = usePathname()
  
  const locale = pathname?.split('/')[1] || 'en'
  const t = dict?.businessCard || DICTIONARIES.businessCard

  const isHorizontal = orientation === "horizontal"
  const isClaimed = business.isClaimed || false
  const hasProfile = (business.category === 'AGENCY' || business.category === 'WELLNESS') && !!business.tagline
  const isAlreadyInItinerary = activeItinerary?.waypoints?.some(w => w.id === business.id) || false;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const bName = getLocalizedField(business, 'name', locale)
  const bDesc = getLocalizedField(business, 'description', locale)

  const handleBookNow = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!business.whatsapp) return
    await trackWhatsappClick(business.id)
    
    let contextNote = "inquire about your services";
    if (business.category === 'DINING') contextNote = "ask about your menu or a meal";
    else if (business.category === 'STAYS' || business.category === 'STAY') contextNote = "inquire about a room";
    else if (business.category === 'WELLNESS') contextNote = "ask about a session";

    const msg = encodeURIComponent(
      `Hello ${business.name}! 👋 I saw your profile on UNLOCKCUSCO and I'd like to ${contextNote}. When do you have availability?`
    )
    window.open(`https://wa.me/51${business.whatsapp.replace(/\\D/g, '')}?text=${msg}`, "_blank")
  }

  const handleCardClick = () => {
    if (onSelect) {
      onSelect()
    }
    trackBusinessView(business.id)
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/json", JSON.stringify(business));
      }}
      onClick={handleCardClick}
      onDoubleClick={onDoubleClick}
      data-vaul-no-drag
      className={cn(
        "group cursor-pointer transition-all duration-300 relative bg-white border border-slate-200/60 shadow-md hover:shadow-xl rounded-2xl md:rounded-3xl",
        isHighlighted ? "opacity-100 scale-[1.02] ring-2 ring-rose-500/20" : "opacity-95 md:hover:opacity-100",
        isHorizontal ? "flex flex-row items-start gap-3 sm:gap-4 p-2.5 sm:p-3" : "flex flex-col gap-3 h-full p-3 sm:p-4"
      )}
    >
      {/* Top Right Action Menu */}
      {false && (
        <div 
          className="absolute top-3 right-3 z-30 flex items-center justify-center" 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button 
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 border border-slate-200 shadow-md text-slate-600 hover:text-rose-600 hover:scale-110 transition-all cursor-pointer backdrop-blur-sm"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            } />
            <DropdownMenuContent>
              {hasProfile && (
                <DropdownMenuItem onClick={() => router.push(business.category === 'AGENCY' ? agencyPath(business.slug) : therapistPath(business.slug))}>
                  <ExternalLink className="w-4 h-4 mr-2" /> View Profile
                </DropdownMenuItem>
              )}
              {business.whatsapp && business.isAsociado && business.category?.toUpperCase() !== 'BOLETO' && (
                <DropdownMenuItem onClick={(e) => { 
                  e.stopPropagation(); 
                   
                  handleBookNow(e as any); 
                }} className="text-[#25D366] font-medium">
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Image Container */}
      <div className={cn(
        "relative overflow-hidden transition-all duration-300 bg-slate-100",
        isHorizontal ? "w-12 sm:w-16 lg:w-20 aspect-square shrink-0 rounded-xl" : "w-full aspect-[4/3] sm:aspect-[4/3] rounded-2xl",
        isHighlighted ? "shadow-[0_0_0_3px_#E11D48] shadow-rose-600/50" : "shadow-sm md:group-hover:shadow-md"
      )}>
        {(() => {
          const catData = getCategoryData(business.category);
          const displayImage = business.imageUrl || catData.fallbackImage;

          return (
            <>
              <SafeImageWrapper
                src={displayImage}
                fallbackSrc={catData.fallbackImage}
                alt={business.name}
                imgClassName="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-700 ease-out"
                wrapperClassName="w-full h-full"
                onLoad={() => {
                  if (onImageLoad && !hasReportedLoad) {
                    setHasReportedLoad(true);
                    onImageLoad();
                  }
                }}
              />
              {/* Magazine-style overlays to normalize image appearance */}
              <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 md:group-hover:bg-black/0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-60 md:group-hover:opacity-80 transition-opacity duration-500" />            </>
          );
        })()}
        
        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10 pointer-events-none">
          {business.vehicleType && (
             <span className="bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-bold text-white shadow-sm uppercase tracking-wider">
               {business.vehicleType}
             </span>
          )}
          
          {isClaimed && (
            <span className="bg-white/90 text-slate-900 px-2 py-1 rounded-md text-[10px] font-bold shadow-sm backdrop-blur-md flex items-center gap-1 ml-auto">
              <Zap className="w-3 h-3 fill-rose-600 text-rose-600" />
              <span className={isHorizontal ? "hidden sm:inline" : ""}>{t.verified || "Verified"}</span>
            </span>
          )}
        </div>
      </div>

      {/* Info Container */}
      <div className={cn(
        "flex flex-col min-w-0",
        isHorizontal ? "flex-1 py-0.5 justify-between" : "flex-1 gap-1 justify-between"
      )}>
        <div className="flex flex-col gap-0.5">
          <div className={cn(
            "flex justify-between gap-2",
            isHorizontal ? "items-center" : "items-start"
          )}>
            <div className={cn("flex-1", isHorizontal ? "line-clamp-1" : "line-clamp-1")}>
              {hasProfile ? (
                <Link 
                  href={business.category === 'AGENCY' ? agencyPath(business.slug) : therapistPath(business.slug)} 
                  className={cn(
                    "font-bold text-slate-900 leading-tight hover:text-rose-600 transition-colors",
                    isHorizontal ? "text-[12px] sm:text-[14px] lg:text-base" : "text-[13px] sm:text-[14px] lg:text-[15px]"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  {business.name}
                </Link>
              ) : (
                <h3 className={cn(
                  "font-bold text-slate-900 leading-tight",
                  isHorizontal ? "text-[12px] sm:text-[14px] lg:text-base" : "text-[13px] sm:text-[14px] lg:text-[15px]"
                )}>
                  {business.name}
                </h3>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 bg-white/80 px-1.5 py-0.5 rounded-lg border border-slate-50">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-bold text-[11px] text-slate-900">{business.rating || "New"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
             {(() => {
               const catData = getCategoryData(business.category);
               const CatIcon = catData.icon;
               const displayCategory = getLocalizedField(business, 'category', locale) || catData.label;
               return (
                 <span className={cn(
                   "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border flex items-center gap-1",
                   catData.theme
                 )}>
                   <CatIcon className="w-2.5 h-2.5" />
                   {displayCategory}
                 </span>
               );
             })()}
             {business.locationSlug && (
               <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                 <MapPin className="w-2.5 h-2.5" />
                 {business.locationSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
               </span>
             )}
             {business.priceTier && (business.priceTier !== "$$" || (business.description && business.description.trim().length > 0)) && (
               <span className="text-emerald-600 text-[10px] font-bold ml-1">{business.priceTier}</span>
             )}
             </div>          
          {/* Zagat Description */}
          {bDesc && (
            <div className="mt-1" onClick={(e) => {
              if (bDesc && bDesc.length > 100) {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }
            }}>
              <p className={cn(
                "text-slate-500 text-xs italic leading-relaxed",
                !isExpanded && (isHorizontal ? "line-clamp-2" : "line-clamp-3")
              )}>
                &ldquo;{bDesc}&rdquo;
              </p>
              {bDesc.length > 100 && (
                <button 
                  type="button" 
                  className="text-[10px] text-rose-600 font-semibold mt-0.5 hover:text-rose-700 transition-colors"
                >
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          )}

          {/* Boleto Badge */}
          {business.category?.toUpperCase() === 'BOLETO' && (
            <div className="mt-1.5 flex" onClick={e => e.stopPropagation()}>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsBoletoModalOpen(true); }}
                className="flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/50 px-2 py-1 rounded-md transition-colors"
              >
                🎟️ Requires Boleto Turístico
              </button>
              <Dialog open={isBoletoModalOpen} onOpenChange={setIsBoletoModalOpen}>
                <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white border border-gray-200" onClick={(e) => e.stopPropagation()}>
                  <DialogHeader className="mb-2">
                    <DialogTitle className="text-xl font-serif tracking-tight text-slate-900 flex items-center gap-2">
                      🎟️ Cusco Tourist Ticket (BTC)
                    </DialogTitle>
                  </DialogHeader>
                  <div className="text-sm text-slate-600 space-y-4">
                    <p>
                      This site requires the <strong>Boleto Turístico del Cusco (BTC)</strong>. It is a unified ticket managed by the government that grants access to up to 16 major archaeological sites and museums in Cusco and the Sacred Valley.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-2">Options:</h4>
                      <ul className="space-y-2 list-disc pl-4 marker:text-slate-400">
                        <li><strong>Full Ticket (130 Soles):</strong> Valid for 10 days. Includes all 16 sites across Cusco, Sacred Valley, and South Valley.</li>
                        <li><strong>Partial Ticket (70 Soles):</strong> Valid for 1-2 days for a specific circuit (e.g., just Sacred Valley ruins).</li>
                      </ul>
                    </div>
                    <p className="text-xs text-slate-500">
                      <em>Note: The ticket cannot be purchased online in advance. It must be bought in person at the COSITUC office (Av. El Sol 103, Cusco) or at the entrance of the first site you visit.</em>
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => setIsBoletoModalOpen(false)} className="bg-slate-900 text-white rounded-xl px-6">Got it</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Action Row */}
        {showActions && (
          <div className={cn(isHorizontal ? "mt-2" : "mt-2", "flex flex-wrap gap-2")}>
            {showItineraryAdd && intent === 'SET_START' ? (
              <Button
                onClick={e => {
                  e.stopPropagation();
                  setStartAnchorLocation(business.lat || 0, business.lng || 0, business.name, business as any);
                  setPanelMode('itinerary' as any);
                  setSelectedId('itin-start');
                  if (pathname !== '/explore') {
                    router.push('/explore');
                  }
                  if (conciergeSendMessage) {
                    conciergeSendMessage({ text: `[INTERNAL] I just set my start location to ${business.name}.` });
                  }
                }}
                className={cn(
                  "flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-full transition-all flex items-center justify-center gap-1.5 shadow-sm",
                  isHorizontal ? "h-6 sm:h-8 px-2 sm:px-3 text-[8px] sm:text-[10px] uppercase tracking-widest" : "h-8 sm:h-10 px-3 sm:px-4 text-[9px] sm:text-[11px] uppercase tracking-widest"
                )}
              >
                <Navigation className="w-3 h-3" />
                <span className="hidden sm:inline">Set as Start</span>
              </Button>
            ) : showItineraryAdd && intent === 'SET_END' ? (
              <Button
                onClick={e => {
                  e.stopPropagation();
                  updateEndAnchorLocation(business.lat || 0, business.lng || 0, business.name, business as any);
                  setPanelMode('itinerary' as any);
                  setSelectedId('itin-arrival');
                  if (pathname !== '/explore') {
                    router.push('/explore');
                  }
                  if (conciergeSendMessage) {
                    conciergeSendMessage({ text: `[INTERNAL] I just set my end location to ${business.name}.` });
                  }
                }}
                className={cn(
                  "flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-full transition-all flex items-center justify-center gap-1.5 shadow-sm",
                  isHorizontal ? "h-6 sm:h-8 px-2 sm:px-3 text-[8px] sm:text-[10px] uppercase tracking-widest" : "h-8 sm:h-10 px-3 sm:px-4 text-[9px] sm:text-[11px] uppercase tracking-widest"
                )}
              >
                <Bed className="w-3 h-3" />
                <span className="hidden sm:inline">{t.setEnd || "Set as End"}</span>
              </Button>
            ) : showItineraryAdd && (
              <>
                {isExchangingStart && business.lat != null && business.lng != null ? (
                  <Button
                    onClick={e => {
                      e.stopPropagation();
                       
                      setStartAnchorLocation(business.lat!, business.lng!, business.name, business as any);
                      setIsExchangingStart(false);
                       
                      setPanelMode('itinerary' as any);
                      if (conciergeSendMessage) {
                        conciergeSendMessage({ text: `[INTERNAL] I just updated my start location to ${business.name}.` });
                      }
                    }}
                    className={cn(
                      "flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-full transition-all flex items-center justify-center gap-1.5 shadow-sm",
                      isHorizontal ? "h-6 sm:h-8 px-2 sm:px-3 text-[8px] sm:text-[10px] uppercase tracking-widest" : "h-8 sm:h-10 px-3 sm:px-4 text-[9px] sm:text-[11px] uppercase tracking-widest"
                    )}
                  >
                    <Navigation className="w-3 h-3" />
                    <span className="hidden sm:inline">Set as Start</span>
                  </Button>
                ) : isExchangingEnd && business.lat != null && business.lng != null ? (
                  <Button
                    onClick={e => {
                      e.stopPropagation();
                       
                      updateEndAnchorLocation(business.lat!, business.lng!, business.name, business as any);
                      setIsExchangingEnd(false);
                       
                      setPanelMode('itinerary' as any);
                      if (conciergeSendMessage) {
                        conciergeSendMessage({ text: `[INTERNAL] I just updated my end location to ${business.name}.` });
                      }
                    }}
                    className={cn(
                      "flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-full transition-all flex items-center justify-center gap-1.5 shadow-sm",
                      isHorizontal ? "h-6 sm:h-8 px-2 sm:px-3 text-[8px] sm:text-[10px] uppercase tracking-widest" : "h-8 sm:h-10 px-3 sm:px-4 text-[9px] sm:text-[11px] uppercase tracking-widest"
                    )}
                  >
                    <Bed className="w-3 h-3" />
                    <span className="hidden sm:inline">{t.setEnd || "Set as End"}</span>
                  </Button>
                ) : exchangeTargetId ? (
                  exchangeTargetId === business.id ? (
                    <Button
                      disabled
                      className={cn(
                        "flex-1 bg-slate-100 text-slate-400 font-medium rounded-full transition-all flex items-center justify-center gap-1.5 shadow-sm",
                        isHorizontal ? "h-6 sm:h-8 px-2 sm:px-3 text-[8px] sm:text-[10px] uppercase tracking-widest" : "h-8 sm:h-10 px-3 sm:px-4 text-[9px] sm:text-[11px] uppercase tracking-widest"
                      )}
                    >
                      <Repeat className="w-3 h-3" />
                      <span className="hidden sm:inline">Selected</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        swapWaypoint(exchangeTargetId, business); 
                        if (conciergeSendMessage) {
                          conciergeSendMessage({ text: `[INTERNAL] I just swapped an item in my itinerary with ${business.name || "this location"}.` });
                        }
                      }}
                      className={cn(
                        "flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full transition-all flex items-center justify-center gap-1.5 shadow-sm",
                        isHorizontal ? "h-6 sm:h-8 px-2 sm:px-3 text-[8px] sm:text-[10px] uppercase tracking-widest" : "h-8 sm:h-10 px-3 sm:px-4 text-[9px] sm:text-[11px] uppercase tracking-widest"
                      )}
                    >
                      <Repeat className="w-3 h-3" />
                      <span className="hidden sm:inline">Swap</span>
                    </Button>
                  )
                ) : isAlreadyInItinerary ? (
                  <Button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setExchangeTargetId(business.id); 
                       
                      setPanelMode('discover' as any); 
                    }}
                    className={cn(
                      "flex-1 bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 font-medium rounded-full transition-all flex items-center justify-center gap-1.5",
                      isHorizontal ? "h-6 sm:h-8 px-2 sm:px-3 text-[8px] sm:text-[10px] uppercase tracking-widest" : "h-8 sm:h-10 px-3 sm:px-4 text-[9px] sm:text-[11px] uppercase tracking-widest"
                    )}
                  >
                    <Repeat className="w-3 h-3" />
                    <span className="hidden sm:inline">Exchange</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        insertWaypoint(business);
                         
                        setPanelMode('itinerary' as any);
                        if (conciergeSendMessage) {
                          conciergeSendMessage({ text: `[INTERNAL] I just added ${business.name || "this location"} to my itinerary.` });
                        }
                        if (pathname !== '/explore') {
                          router.push('/explore');
                        }
                      }}
                      className={cn(
                        "flex-1 bg-transparent text-slate-700 border border-slate-300 hover:bg-rose-600 hover:text-white hover:border-rose-600 font-semibold rounded-full transition-all flex items-center justify-center gap-1.5",
                        isHorizontal ? "h-6 sm:h-8 px-2 sm:px-3 text-[8px] sm:text-[10px] uppercase tracking-widest" : "h-8 sm:h-10 px-3 sm:px-4 text-[9px] sm:text-[11px] uppercase tracking-widest"
                      )}
                    >
                      <Plus className="w-[14px] h-[14px]" strokeWidth={1} />
                      <span className="hidden sm:inline">{t.add}</span>
                    </Button>
                  </>
                )}
              </>
            )}

            {showMap && business.lat != null && business.lng != null && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addInteraction({ type: 'map_click', id: business.id, name: business.name });
                  setIsChatOpen(false); // Close the chat overlay to show the map
                  if (pathname === '/explore') {
                    setSelectedId(mapTargetId || business.id);
                    window.dispatchEvent(new CustomEvent('switch-to-map-view'));
                  } else {
                    router.push(`/explore?loc=${business.locationSlug || ''}&lat=${business.lat}&lng=${business.lng}&id=${business.id}`);
                  }
                }}
                className={cn(
                  "flex-1 flex items-center justify-center bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 font-medium rounded-full transition-all gap-1.5",
                  isHorizontal ? "h-6 sm:h-8 px-2 sm:px-3 text-[8px] sm:text-[10px] uppercase tracking-widest" : "h-8 sm:h-10 px-3 sm:px-4 text-[9px] sm:text-[11px] uppercase tracking-widest"
                )}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.map}</span>
              </button>
            )}
            
            {showDetails && (
              <Link
                href={`/${locale}/business/${business.slug}`}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "flex flex-1 items-center justify-center bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 font-medium rounded-full transition-all gap-1.5",
                  isHorizontal ? "h-6 sm:h-8 px-2 sm:px-3 text-[8px] sm:text-[10px] uppercase tracking-widest" : "h-8 sm:h-10 px-3 sm:px-4 text-[9px] sm:text-[11px] uppercase tracking-widest"
                )}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.details}</span>
              </Link>
            )}

            {showContact && business.whatsapp && business.isAsociado && business.category?.toUpperCase() !== 'BOLETO' && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                   
                  handleBookNow(e as any);
                }}
                className={cn(
                  "flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium rounded-full transition-all flex items-center justify-center gap-1.5 shadow-[0_10px_30px_-5px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(37,211,102,0.6)] group",
                  isHorizontal ? "h-6 sm:h-8 px-2 sm:px-3 text-[8px] sm:text-[10px] uppercase tracking-widest" : "h-8 sm:h-10 px-3 sm:px-4 text-[9px] sm:text-[11px] uppercase tracking-widest"
                )}
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">{t.whatsapp}</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
