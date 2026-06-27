"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export const KlookWidget = ({ lang }: { lang: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any previous scripts or content to avoid duplicate elements during hot-reloads
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    const locale = lang === "es" ? "es" : "en";
    script.src = `https://tpemd.com/content?currency=USD&trs=539707&shmarker=739604&t=539707&marker=739604&locale=${locale}&city_id=1012&category=3&amount=3&powered_by=true&campaign_id=137&promo_id=4497`;
    script.async = true;
    script.charset = "utf-8";

    script.onload = () => {
      // Add a tiny delay to ensure the script's internal elements have mounted before removing the loading state
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    script.onerror = () => {
      setIsLoading(false);
    };

    containerRef.current.appendChild(script);
  }, [lang]);

  return (
    <section className="py-20 bg-slate-50 border-y border-slate-100">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-sm font-bold text-rose-600 uppercase tracking-widest block mb-3">
            {lang === "es" ? "Experiencias Recomendadas" : "Recommended Experiences"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            {lang === "es" ? "Tours Destacados en Cusco" : "Top Cusco Tours & Activities"}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-500 max-w-xl mx-auto font-medium">
            {lang === "es"
              ? "Explora las mejores caminatas, excursiones y recorridos culturales de la mano de guías locales calificados."
              : "Discover the highest-rated treks, cultural guided tours, and local day trips in the Cusco region."}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/60 p-4 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] min-h-[450px] relative overflow-hidden flex flex-col justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 gap-3">
              <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                {lang === "es" ? "Cargando experiencias..." : "Loading experiences..."}
              </span>
            </div>
          )}
          <div ref={containerRef} className="w-full relative min-h-[400px]" />
        </div>
      </div>
    </section>
  );
};
