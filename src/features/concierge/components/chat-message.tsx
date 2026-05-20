import { Bot, User } from "lucide-react";
import { ReactNode } from "react";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant" | "system" | "data" | string;
  children: ReactNode;
}

export function ChatMessage({ id, role, children }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div id={`msg-text-${id}`} className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-slate-100" : "bg-rose-100"}`}>
        {isUser ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-rose-600" />}
      </div>
      <div 
        className={`p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
          isUser 
            ? "bg-slate-900 text-white rounded-tr-sm" 
            : "bg-slate-50 text-slate-800 rounded-tl-sm"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
