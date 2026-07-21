"use client";

import * as React from "react";
import { Drawer } from "vaul";
import { X, Star, MapPin, ExternalLink, MessageCircle, Utensils, Bed, Compass } from "lucide-react";
import { SafeImageWrapper } from "@/components/ui/safe-image";
import { trackWhatsappClick } from "@/features/discovery/actions/track-click";
import { getCategoryData } from "@/features/discovery/constants";
import { getLocalizedField } from "@/lib/utils/localization";
import { cn } from "@/lib/utils";
import type { Business } from "@prisma/client";

export interface StopDetailContentProps {
  isEs: boolean;
  onClose: () => void;
  stopNumber?: number;
  business?: Business | null;
  title?: string;
  category?: string;
  description?: string;
  lat?: number;
  lng?: number;
  onSearchNearby?: (category: string) => void;
  onShowOnMap?: () => void;
  isInsideDrawer?: boolean;
}

export function StopDetailContent({
  isEs,
  onClose,
  stopNumber,
  business,
  title: fallbackTitle,
  category: fallbackCategory,
  description: fallbackDesc,
  lat: fallbackLat,
  lng: fallbackLng,
  onSearchNearby,
  onShowOnMap,
  isInsideDrawer = false
}: StopDetailContentProps) {
  const title = (business ? getLocalizedField(business, "name", isEs ? "es" : "en") : fallbackTitle) || "";
  const description = (business ? getLocalizedField(business, "description", isEs ? "es" : "en") : fallbackDesc) || "";
  const rawCategory = business?.category || fallbackCategory || "";
  
  const catData = getCategoryData(rawCategory);
  const categoryLabel = business ? (getLocalizedField(business, "category", isEs ? "es" : "en") || catData.label) : rawCategory;
  const rating = business?.rating;
  const imageUrl = business?.imageUrl || catData.fallbackImage;
  const locationSlug = business?.locationSlug;

  const activeLat = business?.lat ?? fallbackLat;
  const activeLng = business?.lng ?? fallbackLng;

  const handleWhatsApp = async () => {
    if (!business || !business.whatsapp) return;
    await trackWhatsappClick(business.id);
    let contextNote = "inquire about your services";
    if (business.category === "DINING") contextNote = "ask about your menu or a meal";
    else if (business.category === "STAYS" || business.category === "STAY") contextNote = "inquire about a room";
    else if (business.category === "WELLNESS") contextNote = "ask about a session";

    const msg = encodeURIComponent(
      `Hello ${business.name}! 👋 I saw your profile on UNLOCKCUSCO and I'd like to ${contextNote}. When do you have availability?`
    );
    window.open(`https://wa.me/51${business.whatsapp.replace(/\D/g, "")}?text=${msg}`, "_blank");
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-8">
      {/* Header info */}
      <div className="flex items-center justify-between mb-4 mt-2">
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border", catData.theme)}>
            {categoryLabel}
          </span>
          {stopNumber && (
            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-full">
              {isEs ? `Parada ${stopNumber}` : `Stop ${stopNumber}`}
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Title & Rating */}
      <div className="flex justify-between items-start mb-4">
        {isInsideDrawer ? (
          <Drawer.Title asChild>
            <h2 className="text-2xl font-serif font-bold text-slate-900 leading-tight">
              {title}
            </h2>
          </Drawer.Title>
        ) : (
          <h2 className="text-2xl font-serif font-bold text-slate-900 leading-tight">
            {title}
          </h2>
        )}
        {rating && (
          <div className="flex items-center gap-1 shrink-0 bg-amber-50 border border-amber-100 px-2 py-1 rounded-xl">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-xs text-slate-900">{rating}</span>
          </div>
        )}
      </div>

      {/* Location Subtitle */}
      {locationSlug && (
        <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          {locationSlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
        </p>
      )}

      {/* Hero Image */}
      {imageUrl && (
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 shadow-inner mb-6">
          <SafeImageWrapper
            src={imageUrl}
            fallbackSrc={catData.fallbackImage}
            alt={title}
            imgClassName="w-full h-full object-cover"
            wrapperClassName="w-full h-full"
          />
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-slate-600 text-sm italic leading-relaxed mb-6 bg-slate-50/50 border border-slate-100 p-4 rounded-2xl font-sans">
          &ldquo;{description}&rdquo;
        </p>
      )}

      {/* Proximity Search */}
      {onSearchNearby && activeLat != null && activeLng != null && (
        <div className="space-y-3 mb-6 border-t border-slate-100 pt-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {isEs ? "Explorar Cerca" : "Explore Nearby"}
          </p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => onSearchNearby("dining")}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-700 hover:bg-orange-100 transition-all text-xs font-bold uppercase tracking-wider border border-orange-100/50 hover:scale-[1.02] shadow-sm cursor-pointer"
            >
              <Utensils className="w-4 h-4" />
              <span>{isEs ? "Comer Cerca" : "Eat Nearby"}</span>
            </button>
            <button
              onClick={() => onSearchNearby("stays")}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all text-xs font-bold uppercase tracking-wider border border-blue-100/50 hover:scale-[1.02] shadow-sm cursor-pointer"
            >
              <Bed className="w-4 h-4" />
              <span>{isEs ? "Dormir Cerca" : "Stay Nearby"}</span>
            </button>
            <button
              onClick={() => onSearchNearby("adventure")}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all text-xs font-bold uppercase tracking-wider border border-emerald-100/50 hover:scale-[1.02] shadow-sm cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>{isEs ? "Hacer Cerca" : "Do Nearby"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Actions Row */}
      <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-6">
        {business?.slug && (
          <a
            href={`/${isEs ? "es" : "en"}/business/${business.slug}`}
            className="flex-1 min-w-[120px] flex items-center justify-center bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 font-bold rounded-xl h-12 transition-all gap-2 text-xs uppercase tracking-wider text-center"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{isEs ? "Ver Detalles" : "View Details"}</span>
          </a>
        )}
        {onShowOnMap && (
          <button
            onClick={onShowOnMap}
            className="flex-1 min-w-[120px] flex items-center justify-center bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 font-bold rounded-xl h-12 transition-all gap-2 text-xs uppercase tracking-wider cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            <span>{isEs ? "Ver en Mapa" : "Show on Map"}</span>
          </button>
        )}
        {business?.whatsapp && (business.isClaimed || business.isAsociado) && (
          <button
            onClick={handleWhatsApp}
            className="flex-1 min-w-[120px] bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl h-12 transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_-5px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(37,211,102,0.6)] text-xs uppercase tracking-wider cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>WhatsApp</span>
          </button>
        )}
      </div>
    </div>
  );
}

interface StopDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isEs: boolean;
  stopNumber?: number;
  business?: Business | null;
  title?: string;
  category?: string;
  description?: string;
  lat?: number;
  lng?: number;
  onSearchNearby?: (category: string) => void;
  onShowOnMap?: () => void;
}

export function StopDrawer({
  isOpen,
  onClose,
  isEs,
  stopNumber,
  business,
  title,
  category,
  description,
  lat,
  lng,
  onSearchNearby,
  onShowOnMap
}: StopDrawerProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[1000] backdrop-blur-[2px]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[1001] mx-auto max-w-2xl max-h-[85vh] bg-white rounded-t-[32px] border-t border-slate-200 shadow-2xl flex flex-col focus:outline-none">
          <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-slate-200 my-4" />
          <StopDetailContent
            isEs={isEs}
            onClose={onClose}
            stopNumber={stopNumber}
            business={business}
            title={title}
            category={category}
            description={description}
            lat={lat}
            lng={lng}
            onSearchNearby={onSearchNearby}
            onShowOnMap={onShowOnMap}
            isInsideDrawer={true}
          />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
