import { ReactNode } from "react";

interface Suggestion {
  label: string;
  icon: ReactNode;
}

interface ConciergeSuggestionsProps {
  suggestions: Suggestion[];
  sendMessage: (msg: { text: string }) => void;
}

export function ConciergeSuggestions({ suggestions, sendMessage }: ConciergeSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null;
  
  return (
    <div className="px-4 pt-3 pb-3 flex gap-2 overflow-x-auto scrollbar-hide bg-white shrink-0">
      {suggestions.map(suggestion => (
        <button
          key={suggestion.label}
          onClick={() => sendMessage({ text: suggestion.label })}
          className="whitespace-nowrap bg-white/80 backdrop-blur-sm border border-gray-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
        >
          {suggestion.icon} <span>{suggestion.label}</span>
        </button>
      ))}
    </div>
  );
}