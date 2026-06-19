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

function getProviderLogo(provider: string, compact: boolean) {
  const sizeClass = compact ? "w-5 h-5" : "w-6 h-6";
  const normalized = provider.toLowerCase().trim();

  if (normalized.includes("klook")) {
    return (
      <svg viewBox="0 0 100 100" fill="none" className={sizeClass} xmlns="http://www.w3.org/2000/svg">
        <path
          d="M50 85c-19.3 0-35-15.7-35-35s15.7-35 35-35c15.2 0 28.1 9.7 32.8 23.2.9 2.6-.5 5.5-3.1 6.4-2.6.9-5.5-.5-6.4-3.1C75 32 63.6 25 50 25c-13.8 0-25 11.2-25 25s11.2 25 25 25c10 0 18.7-5.9 22.7-14.5.9-1.9 2.5-3.5 4.6-4 2.8-.7 5.7.8 6.5 3.6.8 2.8-.8 5.7-3.6 6.5C74.6 77.2 63.2 85 50 85z"
          fill="#FF5B00"
        />
        <circle cx="77" cy="40" r="11" fill="#EAEF28" />
      </svg>
    );
  }

  if (normalized.includes("booking")) {
    return (
      <div className={`flex items-center justify-center font-bold bg-[#003580] text-white rounded select-none shrink-0 ${
        compact ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-xs'
      }`}>
        B.
      </div>
    );
  }

  if (normalized.includes("viator")) {
    return (
      <div className={`flex items-center justify-center font-extrabold bg-[#FFBB00] text-slate-900 rounded-full select-none shrink-0 ${
        compact ? 'w-5 h-5 text-[9px]' : 'w-6 h-6 text-[10px]'
      }`}>
        V
      </div>
    );
  }

  if (normalized.includes("agoda")) {
    return (
      <div className="flex gap-[2px] shrink-0 items-center justify-center">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#FBBC05]" />
      </div>
    );
  }

  return <CreditCard className={compact ? "w-4 h-4" : "w-5 h-5"} />;
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
              compact ? 'px-4 py-2' : 'px-5 py-3'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100/80 text-slate-500 shrink-0 ${
                compact ? 'w-8 h-8' : 'w-10 h-10'
              }`}>
                {getProviderLogo(link.provider, compact)}
              </div>
              <span className={`${compact ? 'font-semibold text-sm' : 'font-bold'} text-slate-800`}>
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
