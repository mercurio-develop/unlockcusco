"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Zap, Loader2 } from "lucide-react";
import { COORDS_MAP } from "@/lib/constants";
import { getCategoryColor } from "@/lib/utils/category-style";
import type { Business } from "@prisma/client";

import { getBusinesses } from "@/features/discovery";

const QUICK_HUBS = [
  { name: "Urubamba",      lat: -13.3047, lng: -72.1167 },
  { name: "Ollantaytambo", lat: -13.2588, lng: -72.2633 },
  { name: "Pisac",         lat: -13.4225, lng: -71.8488 },
  { name: "Cusco",         lat: -13.5226, lng: -71.9673 },
  { name: "Machu Picchu",  lat: -13.1547, lng: -72.5252 },
];

interface PickResult { lat: number; lng: number; name: string; service?: Business; }

interface EndPointPickerProps {
  value?: string;
  onSelect: (result: PickResult) => void;
  placeholder?: string;
}

// Longest-key-first COORDS_MAP town search
function searchTowns(q: string, max = 5): PickResult[] {
  if (!q.trim()) return [];
  const lower = q.toLowerCase();
  const seen = new Set<string>();
  return Object.entries(COORDS_MAP)
    .sort((a, b) => b[0].length - a[0].length)
    .filter(([k]) => k.replace(/-/g, ' ').includes(lower) || lower.includes(k.replace(/-/g, ' ')))
    .reduce<PickResult[]>((acc, [k, c]) => {
      const name = k.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
      if (!seen.has(name)) { seen.add(name); acc.push({ name, lat: c.lat, lng: c.lng }); }
      return acc;
    }, [])
    .slice(0, max);
}

export function EndPointPicker({ value, onSelect, placeholder }: EndPointPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [bizResults, setBizResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced business search
  const fetchBiz = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setBizResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getBusinesses({ query: q, limit: 5 });
        setBizResults((data.businesses || []).filter((b) => b.lat && b.lng));
      } catch { setBizResults([]); }
      finally { setLoading(false); }
    }, 300);
  }, []);

  const handleChange = (v: string) => { setQuery(v); setOpen(true); fetchBiz(v); };

  const confirm = (result: PickResult) => {
    setQuery("");
    setBizResults([]);
    setOpen(false);
    onSelect(result);
  };

  const townMatches = searchTowns(query);
  const showDropdown = open && (query.trim() || true); // always show when open

  return (
    <div ref={wrapperRef} className="relative flex-1 min-w-0">
      {/* Input */}
      <input
        value={query}
        placeholder={value || placeholder || "Where does your day end?"}
        onChange={e => handleChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); setQuery(""); } e.stopPropagation(); }}
        onClick={e => e.stopPropagation()}
        data-vaul-no-drag
        className="w-full text-sm font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none truncate transition-colors"
      />

      {/* Dropdown */}
      {showDropdown && open && (
        <div className="absolute z-[200] mt-2 left-0 w-72 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden">
          {/* Quick hub pills — always shown */}
          <div className="px-3 pt-3 pb-2">
            <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mb-2">Quick destinations</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_HUBS.map(h => (
                <button
                  key={h.name}
                  onMouseDown={e => { e.preventDefault(); confirm(h); }}
                  className="text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 hover:border-rose-200 px-2 py-1 rounded-full transition-colors"
                >
                  {h.name}
                </button>
              ))}
            </div>
          </div>

          {/* Town matches */}
          {townMatches.length > 0 && (
            <div className="border-t border-slate-50 py-1">
              {townMatches.map(t => (
                <button
                  key={t.name}
                  onMouseDown={e => { e.preventDefault(); confirm(t); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="text-sm text-slate-700 font-medium truncate">{t.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Business matches */}
          {(loading || bizResults.length > 0) && (
            <div className="border-t border-slate-50 py-1">
              <div className="px-4 py-1 flex items-center gap-2">
                <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">Experiences</p>
                {loading && <Loader2 className="w-3 h-3 text-slate-300 animate-spin" />}
              </div>
              {bizResults.map((b) => (
                <button
                  key={b.id}
                  onMouseDown={e => {
                    e.preventDefault();
                    confirm({ lat: b.lat!, lng: b.lng!, name: b.name, service: b });
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: getCategoryColor(b.category) }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-medium truncate">{b.name}</p>
                    {b.tagline && <p className="text-[10px] text-slate-400 truncate">{b.tagline}</p>}
                  </div>
                  <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
