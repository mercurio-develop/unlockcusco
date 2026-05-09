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
import { Star, Zap, Plus, Phone, Users, MapPin, Briefcase, MoreHorizontal, ExternalLink, MessageCircle, Calendar, Clock, AlertCircle } from "lucide-react"
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
  const [showLeadTimeWarning, setShowLeadTimeWarning] = useState(false)
  const { activeItinerary, panelMode, exchangeTargetIndex, insertWaypoint, targetDate, setTargetDate, setAiPromptToTrigger } = useTrip()
  const router = useRouter()
  
  const isHorizontal = orientation === "horizontal"
  const isClaimed = business.isClaimed || false
  const hasProfile = (business.category === 'AGENCY' || business.category === 'WELLNESS') && !!business.tagline

  // Lead time calculation
  const now = new Date()
  const diffInHours = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  const hasSufficientNotice = business.minAdvanceHours === 0 || diffInHours >= business.minAdvanceHours
  const isTooSoon = !hasSufficientNotice && business.bookingType === 'REQUEST_ONLY'

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isTooSoon) {
      setShowLeadTimeWarning(true)
    } else {
      insertWaypoint(business)
    }
  }

  const handleMoveToTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setTargetDate(tomorrow)
    insertWaypoint(business)
    setShowLeadTimeWarning(false)
    setAiPromptToTrigger(`[INTERNAL] User moved itinerary to Tomorrow because ${business.name} required ${business.minAdvanceHours}h notice. Acknowledge the change and confirm the experience is now added.`)
  }

  const handleBookNow = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!business.whatsapp) return
    await trackWhatsappClick(business.id)
    const msg = encodeURIComponent(
      `Hello ${business.name}! 👋 I saw your profile on VALLECITO and I'd like to make a reservation. When do you have availability?`
    )
    window.open(`https://wa.me/51${business.whatsapp.replace(/\D/g, '')}?text=${msg}`, "_blank")
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
        isHorizontal 
          ? "flex flex-row items-center gap-4 p-3 bg-white border border-slate-100 rounded-[20px] hover:shadow-md hover:border-slate-200" 
          : "flex flex-col gap-3",
        isHighlighted 
          ? (isHorizontal ? "opacity-100 scale-[1.01] border-rose-200 shadow-md ring-1 ring-rose-600/5" : "opacity-100 scale-[1.02]") 
          : "opacity-90 hover:opacity-100"
      )}
    >
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
          <div className="flex items-center gap-1.5 flex-wrap">
             <span className="bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border border-rose-100/50">
               {business.category}
             </span>
             {business.priceTier && <span className="text-slate-400 text-[10px] font-bold">{business.priceTier}</span>}
             
             {business.bookingType === 'REQUEST_ONLY' && business.minAdvanceHours > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight flex items-center gap-1 border",
                  isTooSoon 
                    ? "bg-amber-50 text-amber-600 border-amber-100" 
                    : "bg-slate-50 text-slate-500 border-slate-100"
                )}>
                  <Clock className="w-2.5 h-2.5" />
                  {business.minAdvanceHours}h Notice
                </span>
             )}

             {isHorizontal && (
                <span className="text-slate-400 text-[10px] font-medium truncate max-w-[150px]">
                   • {business.locationSlug?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
             )}
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
          <Button
            onClick={handleAddClick}
            className={cn(
              "flex-1 bg-white text-slate-900 border border-slate-200 hover:border-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5",
              isHorizontal ? "h-8 text-[10px] uppercase tracking-tighter" : "py-2.5 text-xs uppercase tracking-tighter"
            )}
          >
            <Plus className="w-3 h-3" />
            {isHorizontal ? "Add" : "Add to Day"}
          </Button>
          {exchangeTargetIndex !== null ? (
            <Button
              onClick={(e) => { e.stopPropagation(); insertWaypoint(business); }}
              className={cn(
                "flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all",
                isHorizontal ? "h-8 text-[10px] uppercase tracking-tighter" : "py-2.5 text-sm"
              )}
            >
              Select
            </Button>
          ) : isClaimed || business.category === 'TRANSPORT' || business.whatsapp ? (
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
        </div>
      </div>

      <Dialog open={showLeadTimeWarning} onOpenChange={setShowLeadTimeWarning}>
          <DialogContent className="sm:max-w-md p-8 rounded-3xl bg-white border border-gray-200 shadow-2xl z-[150]" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                 <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <DialogTitle className="text-2xl font-serif font-bold text-slate-900 mb-2">Advance Notice Required</DialogTitle>
              <DialogDescription className="text-slate-500 leading-relaxed mb-8">
                {business.name} typically requires at least <strong>{business.minAdvanceHours} hours</strong> notice to prepare guides and equipment.
                <br/><br/>
                Since you&apos;re planning for today, we might not be able to secure this instantly.
              </DialogDescription>
              
              <div className="flex flex-col gap-3 w-full">
                <Button 
                  onClick={handleMoveToTomorrow}
                  className="w-full bg-slate-900 text-white py-6 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all"
                >
                  Move Planning to Tomorrow
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => { insertWaypoint(business); setShowLeadTimeWarning(false); }}
                  className="w-full text-slate-400 hover:text-slate-600 font-bold"
                >
                  Add Anyway (Request Only)
                </Button>
              </div>
            </div>
          </DialogContent>
      </Dialog>
    </div>
  )
}
