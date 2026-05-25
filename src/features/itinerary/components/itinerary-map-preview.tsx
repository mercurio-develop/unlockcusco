"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

interface ItineraryMapPreviewProps {
  slug: string;
  lang: string;
  isEs: boolean;
}

export function ItineraryMapPreview({ slug, lang, isEs }: ItineraryMapPreviewProps) {
  return (
    <Link 
      href={`/${lang}/explore?trip=${slug}`}
      className="block relative w-full h-[400px] md:h-[600px] overflow-hidden group bg-slate-900 cursor-pointer mb-16 md:mb-24"
    >
      {/* Static 3D Map Image */}
      <Image
        src="/images/map.png"
        alt="3D Map Preview of the Sacred Valley"
        fill 
        className="object-cover"
        priority
      />

      {/* Vignette Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent pointer-events-none" />

      {/* CTA Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10 text-center pointer-events-none">
        <div className="inline-flex items-center justify-center gap-3 bg-white text-rose-600 px-8 py-4 rounded-2xl font-bold text-lg group-hover:bg-slate-50 transition-all shadow-2xl shadow-black/30 w-full md:w-auto">
          {isEs ? "Abrir en Mapa Interactivo" : "Open Interactive Map"} <Sparkles className="w-5 h-5 text-rose-500" />
        </div>
      </div>
    </Link>
  );
}