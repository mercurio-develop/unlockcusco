import { X, Navigation, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ToolErrorCard({ message }: { message?: string }) {
  return (
    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 ml-11 mt-2">
      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
        <X className="w-3.5 h-3.5 text-white" />
      </div>
      <span className="text-xs font-medium text-red-800 leading-snug">
        {message || "Tool failed to execute."}
      </span>
    </div>
  );
}

export function ActionSuccessCard({ message }: { message: string }) {
  return (
    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 ml-11 mt-2">
      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
        <Check className="w-3.5 h-3.5 text-white" />
      </div>
      <span className="text-xs font-bold text-emerald-800 uppercase tracking-tight">
        {message}
      </span>
    </div>
  );
}

export function LocationRequestCard({ 
  message, 
  onShareLocation 
}: { 
  message?: string; 
  onShareLocation: () => void;
}) {
  return (
    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col gap-3 ml-11 mt-2">
      <p className="text-sm text-rose-900 font-medium leading-relaxed">
        {message || "Please share your location"}
      </p>
      <button
        onClick={onShareLocation}
        className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-rose-500 transition-all flex items-center justify-center gap-2"
      >
        <Navigation className="w-4 h-4" /> Share My GPS Position
      </button>
    </div>
  );
}

export function MacroTripCard({ title, daysCount }: { title?: string; daysCount?: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 w-full my-3">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
          <Navigation className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-widest text-purple-500 uppercase">Macro Trip Plan</p>
          <h3 className="text-sm font-semibold text-slate-900 leading-tight">{title || 'Your Sacred Valley Journey'}</h3>
        </div>
      </div>
      <div className="text-xs text-slate-600 font-medium ml-10">
        {daysCount || 0} Days planned
      </div>
    </div>
  );
}

export function SaveLinkCard({ url }: { url: string }) {
  return (
    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col gap-3 ml-11 mt-2">
      <p className="text-sm text-emerald-900 font-medium leading-relaxed">
        I have saved your itinerary! You can bookmark this link or share it with others.
      </p>
      <div className="flex items-center gap-2">
        <Input readOnly value={url} className="bg-white border-emerald-200 text-xs text-slate-600 h-9" />
        <button
          onClick={() => { navigator.clipboard.writeText(url); alert("Copied!"); }}
          className="h-9 px-3 bg-emerald-600 text-white rounded-lg font-bold text-xs shadow-sm hover:bg-emerald-500 transition-colors shrink-0"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
