"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { agencyPath, therapistPath } from "@/paths"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star, Zap, Plus, Phone, Users, MapPin, Briefcase, MoreHorizontal, ExternalLink, MessageCircle, Calendar, Utensils, Repeat, Landmark, Ticket } from "lucide-react"
import { trackWhatsappClick } from "@/features/business/actions/track-click"
import { trackBusinessView } from "@/features/business/actions/track-view"
import { submitLead } from "@/features/leads/actions/submit-lead"
import { generateShadowLead } from "@/features/leads/actions/shadow-lead"
import { useTrip } from "@/lib/store/trip-context"
import { cn } from "@/lib/utils"
import type { Business } from "@prisma/client"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

interface BusinessCardProps {
  business: Business
  isHighlighted?: boolean
  onSelect?: () => void
  orientation?: "vertical" | "horizontal"
}

export function BusinessCard({ 
  business, 
  isHighlighted, 
  onSelect, 
  orientation = "vertical"
}: BusinessCardProps) {
  const [touristName, setTouristName] = useState("")
  const [touristPhone, setTouristPhone] = useState("")
  const [date, setDate] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const { activeItinerary, panelMode, exchangeTargetIndex, insertWaypoint } = useTrip()
  const router = useRouter()
  
  const isHorizontal = orientation === "horizontal"
  const isClaimed = business.isClaimed || false
  const hasProfile = (business.category === 'AGENCY' || business.category === 'WELLNESS') && !!business.tagline

  const handleBookNow = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!business.whatsapp) return
    await trackWhatsappClick(business.id)
    const msg = encodeURIComponent(
      `Hello ${business.name}! 👋 I saw your profile on VALLECITO and I'd like to make a reservation. When do you have availability?`
    )
    window.open(`https://wa.me/51${business.whatsapp.replace(/\\D/g, '')}?text=${msg}`, "_blank")
  }

  const handleConsult = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!touristName || !date) return

    try {
      const res = await generateShadowLead(business.id, touristName, date)
      await submitLead({
        businessId: business.id,
        touristName,
        touristEmail: "inquiry@vallecito.app", // Platform placeholder
        touristPhone: touristPhone || undefined,
        date: new Date(date),
      })
      if (res.success) {
        window.open(res.url, "_blank")
        setIsOpen(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleCardClick = () => {
    if (onSelect) {
      onSelect()
      trackBusinessView(business.id)
    }
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/json", JSON.stringify(business));
      }}
      onClick={handleCardClick}
      className={cn(
        "group cursor-pointer transition-all duration-300 relative",
        isHighlighted ? "opacity-100 scale-[1.02]" : "opacity-90 hover:opacity-100",
        isHorizontal ? "flex flex-row items-center gap-4" : "flex flex-col gap-3"
      )}
    >
      {/* Top Right Action Menu */}
      {false && exchangeTargetIndex === null && (
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
              {business.whatsapp && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleBookNow(e as any); }}>
                  <MessageCircle className="w-4 h-4 mr-2" /> Contact
                </DropdownMenuItem>
              )}
              {!isClaimed && !business.isAsociado && (
                <DropdownMenuItem onClick={() => setIsOpen(true)}>
                  <Zap className="w-4 h-4 mr-2" /> Check Availability
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Image Container */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-300 bg-slate-100",
        isHorizontal ? "w-20 sm:w-24 aspect-[4/3] shrink-0" : "w-full aspect-[4/3] sm:aspect-[4/3]",
        isHighlighted ? "shadow-[0_0_0_3px_#E11D48] shadow-rose-600/50" : "shadow-sm group-hover:shadow-md"
      )}>
        {business.imageUrl ? (
          <>
            <img
              src={business.imageUrl}
              alt={business.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=600&auto=format&fit=crop";
                e.currentTarget.onerror = null;
              }}
            />
            {/* Magazine-style overlays to normalize image appearance */}
            <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 group-hover:bg-black/0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
             {business.category === 'TRANSPORT' ? <Users className="w-10 h-10" /> : <Briefcase className="w-10 h-10" />}
          </div>
        )}
        
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
              <span className={isHorizontal ? "hidden sm:inline" : ""}>Verified</span>
            </span>
          )}
        </div>
      </div>

      {/* Info Container */}
      <div className={cn(
        "flex flex-col min-w-0",
        isHorizontal ? "flex-1 py-0.5 justify-between" : "gap-1"
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
                    isHorizontal ? "text-[15px] sm:text-base" : "text-[15px]"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  {business.name}
                </Link>
              ) : (
                <h3 className={cn(
                  "font-bold text-slate-900 leading-tight",
                  isHorizontal ? "text-[15px] sm:text-base" : "text-[15px]"
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
             <span className={cn(
               "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border flex items-center gap-1",
               business.category?.toUpperCase() === 'DINING'
                 ? "bg-amber-50 text-amber-700 border-amber-200/50"
                 : business.category?.toUpperCase() === 'CULTURE'
                 ? "bg-purple-50 text-purple-700 border-purple-200/50"
                 : business.category?.toUpperCase() === 'BOLETO'
                 ? "bg-sky-50 text-sky-700 border-sky-200/50"
                 : "bg-rose-50 text-rose-600 border-rose-100/50"
             )}>
               {business.category?.toUpperCase() === 'DINING' && <Utensils className="w-2.5 h-2.5" />}
               {business.category?.toUpperCase() === 'CULTURE' && <Landmark className="w-2.5 h-2.5" />}
               {business.category?.toUpperCase() === 'BOLETO' && <Ticket className="w-2.5 h-2.5" />}
               {business.category}
             </span>
             {business.locationSlug && (
               <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                 <MapPin className="w-2.5 h-2.5" />
                 {business.locationSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
               </span>
             )}
             {business.priceTier && <span className="text-emerald-600 text-[10px] font-bold ml-1">{business.priceTier}</span>}
          </div>
          
          {/* Zagat Description */}
          {business.description && (
            <p className={cn(
              "text-slate-500 text-[11px] italic leading-relaxed mt-1",
              isHorizontal ? "line-clamp-1" : "line-clamp-3"
            )}>
              &ldquo;{business.description}&rdquo;
            </p>
          )}
        </div>

        {/* Action Row */}
        <div className={cn(isHorizontal ? "mt-2" : "mt-2", "flex gap-2")}>
          {exchangeTargetIndex !== null ? (
            <Button
              onClick={(e) => { e.stopPropagation(); insertWaypoint(business); }}
              className={cn(
                "w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md",
                isHorizontal ? "h-8 text-[10px] uppercase tracking-widest" : "py-2.5 text-xs uppercase tracking-widest"
              )}
            >
              <Repeat className="w-3.5 h-3.5" />
              Exchange
            </Button>
          ) : (
            <>
              <Button
                onClick={(e) => { e.stopPropagation(); insertWaypoint(business); }}
                className={cn(
                  "flex-1 bg-white text-slate-900 border border-slate-200 hover:border-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5",
                  isHorizontal ? "h-8 text-[10px] uppercase tracking-tighter" : "py-2.5 text-xs uppercase tracking-tighter"
                )}
              >
                <Plus className="w-3 h-3" />
                {isHorizontal ? "Add" : "Add to Day"}
              </Button>
              {isClaimed || business.category === 'TRANSPORT' || business.whatsapp ? (
                <Button
                  onClick={handleBookNow}
                  className={cn(
                    "flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all",
                    isHorizontal ? "h-8 text-[10px] uppercase tracking-tighter" : "py-2.5 text-sm"
                  )}
                >
                  Contact
                </Button>
              ) : (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger render={
                    <Button 
                      onClick={(e) => e.stopPropagation()} 
                      className={cn(
                        "flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all",
                        isHorizontal ? "h-8 text-[10px] uppercase tracking-tighter" : "py-2.5 text-sm"
                      )}
                    >
                      Contact
                    </Button>
                  } />
                  <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white border border-gray-200" onClick={(e) => e.stopPropagation()}>
                    <DialogHeader className="mb-4">
                      <DialogTitle className="text-2xl font-serif tracking-tight text-slate-900">Contact {business.name}</DialogTitle>
                      <DialogDescription className="text-sm text-slate-500 mt-1">
                        Send an inquiry to {business.name} to check for availability and pricing.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-4">
                      <div className="grid gap-2.5">
                        <Label htmlFor="name" className="text-slate-700 font-medium">Your Name</Label>
                        <Input
                          id="name"
                          placeholder="e.g. Sarah Jenkins"
                          value={touristName}
                          onChange={(e) => setTouristName(e.target.value)}
                          className="rounded-xl border-gray-200 bg-gray-50 text-slate-900 focus-visible:ring-rose-600 px-4 py-6 placeholder:text-gray-400"
                        />
                      </div>
                      <div className="grid gap-2.5">
                        <Label htmlFor="phone" className="text-slate-700 font-medium">WhatsApp Number (optional)</Label>
                        <Input
                          id="phone"
                          placeholder="e.g. +51 987 654 321"
                          value={touristPhone}
                          onChange={(e) => setTouristPhone(e.target.value)}
                          className="rounded-xl border-gray-200 bg-gray-50 text-slate-900 focus-visible:ring-rose-600 px-4 py-6 placeholder:text-gray-400"
                        />
                      </div>
                      <div className="grid gap-2.5">
                        <Label htmlFor="date" className="text-slate-700 font-medium">Estimated Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="rounded-xl border-gray-200 bg-gray-50 text-slate-900 focus-visible:ring-rose-600 px-4 py-6"
                        />
                      </div>
                    </div>
                    <Button onClick={handleConsult} className="w-full bg-rose-600 hover:bg-rose-700 text-white py-6 rounded-xl font-bold shadow-lg mt-2 transition-transform hover:scale-[1.02]">
                      Send Inquiry
                    </Button>
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

