import React from "react";
import { ExternalLink } from "lucide-react";

interface ProductCardProps {
  title: string;
  description: string;
  category: string;
  price?: string;
  link: string;
  imageUrl?: string;
  ctaText?: string;
  provider?: "Amazon" | "Booking.com" | "Viator" | "GetYourGuide";
}

export function ProductCard({
  title,
  description,
  category,
  price,
  link,
  imageUrl,
  ctaText = "View Details",
  provider,
}: ProductCardProps) {
  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Optional Image Area */}
      {imageUrl ? (
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase text-slate-700">
            {category}
          </div>
        </div>
      ) : (
        <div className="h-3 bg-gradient-to-r from-rose-400 to-orange-400 w-full" />
      )}

      {/* Content Area */}
      <div className="flex-1 p-5 md:p-6 flex flex-col">
        {!imageUrl && (
          <div className="text-[10px] font-bold tracking-wider uppercase text-rose-600 mb-2">
            {category}
          </div>
        )}
        
        <h3 className="text-lg font-bold font-serif text-slate-900 mb-2 line-clamp-2">
          {title}
        </h3>
        
        <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
          {description}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            {price && (
              <span className="text-lg font-bold text-slate-900">
                {price}
              </span>
            )}
            {provider && (
              <span className="text-xs text-slate-500">
                via {provider}
              </span>
            )}
          </div>
          
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {ctaText}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
