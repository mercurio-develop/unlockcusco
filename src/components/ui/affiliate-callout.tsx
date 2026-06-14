import React from "react";
import { ExternalLink } from "lucide-react";

interface AffiliateCalloutProps {
  title: string;
  description: string;
  link: string;
  ctaText?: string;
}

export function AffiliateCallout({
  title,
  description,
  link,
  ctaText = "Check on Amazon",
}: AffiliateCalloutProps) {
  return (
    <div className="my-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
      {/* Background Accent */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/40 blur-3xl rounded-full" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-rose-200/20 blur-2xl rounded-full" />

      <div className="relative z-10 flex-1">
        <div className="inline-block px-3 py-1 mb-3 rounded-full bg-white/80 text-rose-700 text-xs font-bold uppercase tracking-wider shadow-sm border border-rose-100">
          Pro Tip / Essential Gear
        </div>
        <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900 mb-2">
          {title}
        </h3>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl">
          {description}
        </p>
      </div>

      <div className="relative z-10 shrink-0 md:min-w-[200px]">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-full items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-medium px-6 py-3.5 rounded-xl transition-all shadow-md shadow-rose-200 hover:shadow-lg hover:-translate-y-0.5"
        >
          {ctaText}
          <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
        <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
          We may earn a small commission if you book or buy through our links, at no extra cost to you.
        </p>
      </div>
    </div>
  );
}
