"use client";

import React from "react";
import { ExternalLink, CreditCard } from "lucide-react";

export interface AffiliateLink {
  provider: string; // e.g., "Booking.com", "Agoda", "Viator"
  url: string;
}

interface AffiliateBookingButtonsProps {
  links: AffiliateLink[];
  compact?: boolean;
}

export function AffiliateBookingButtons({ links, compact = false }: AffiliateBookingButtonsProps) {
  if (!links || links.length === 0) return null;

  return (
    <div className={`flex flex-col gap-2 ${compact ? 'mt-2' : 'mt-6 gap-3'}`} onClick={(e) => e.stopPropagation()}>
      {!compact && (
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
          Booking Options
        </h3>
      )}
      <div className={`flex flex-col ${compact ? 'gap-2' : 'gap-3'}`}>
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative flex items-center justify-between w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-rose-200 text-slate-900 rounded-xl transition-all shadow-sm hover:shadow-md ${
              compact ? 'px-4 py-2.5' : 'px-5 py-4'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`${compact ? 'p-1.5 bg-rose-50' : 'bg-rose-100 p-2'} rounded-lg text-rose-600`}>
                <CreditCard className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
              </div>
              <span className={`${compact ? 'font-medium text-sm' : 'font-semibold'} text-slate-800`}>
                Book on {link.provider}
              </span>
            </div>
            <ExternalLink className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-slate-400 group-hover:text-rose-500 transition-colors`} />
          </a>
        ))}
      </div>
      {!compact && (
        <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
          We may earn a small commission if you book through these links, at no extra cost to you.
        </p>
      )}
    </div>
  );
}
