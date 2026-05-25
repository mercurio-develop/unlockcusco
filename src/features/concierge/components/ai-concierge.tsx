"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Send, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

import { useConciergeChat } from "../hooks/use-concierge-chat"
import { useUiStore } from "@/lib/store/use-ui-store"
import { ChatMessage } from "./chat-message"
import { ChatMessageText } from "./chat-message-text"
import { ToolRenderer } from "./tool-renderer"
import { getSuggestions } from "../utils/suggestions"
import type { UIMessage } from "@ai-sdk/react"

export function AiConcierge() {
  const {
    isChatOpen, setIsChatOpen, pathname,
    messages, input, setInput, isLoading,
    handleSubmit, handleShareLocation, sendMessage
  } = useConciergeChat();

  const travelVibe = useUiStore(s => s.travelVibe)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sidebarOffset = "0px"

  const isEs = pathname?.split('/')[1] === 'es'

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: "end" });
    }
  };

  useEffect(() => {
    if (!messagesEndRef.current) return;
    const scrollContainer = messagesEndRef.current.parentElement;
    if (!scrollContainer) return;

    let isScrolledToBottom = false;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      isScrolledToBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
    };
    handleScroll();
    scrollContainer.addEventListener('scroll', handleScroll);

    const resizeObserver = new ResizeObserver(() => {
      if (isScrolledToBottom) scrollToBottom("auto");
    });
    resizeObserver.observe(scrollContainer);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return;
    scrollToBottom("smooth");
  }, [messages.length, isLoading])

  if (!pathname?.includes("/explore")) {
    return null;
  }

  const suggestions = getSuggestions(travelVibe || "", isEs);

  return (
    <>
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%", x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0, right: sidebarOffset }}
            exit={{ opacity: 0, y: "100%", x: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed left-0 right-0 top-[calc(48px+env(safe-area-inset-top))] bottom-[calc(64px+env(safe-area-inset-bottom))] z-[100] w-full md:top-[48px] md:bottom-auto md:left-auto md:right-0 md:h-[calc(100vh-48px)] md:w-[450px] md:z-40"
          >
            <Card className="flex flex-col h-full rounded-none md:rounded-tl-3xl shadow-2xl overflow-hidden bg-white/95 backdrop-blur-xl border-none">
              <div className="bg-white p-4 sm:p-5 flex justify-between items-center shrink-0 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-50 border border-rose-100 p-2 rounded-xl shadow-inner">
                    <Sparkles className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                      UNLOCK<span className="text-rose-500">CUSCO</span> <span className="capitalize">Concierge</span>
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium">AI Travel Assistant</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-400 hover:text-slate-900 hover:bg-gray-100 rounded-full transition-colors h-10 w-10"
                  onClick={() => setIsChatOpen(false)}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide flex flex-col bg-white text-slate-900">
                {(messages as UIMessage[]).map((msg, index: number) => {
                  // Get text content from message parts
                  const content = (msg.parts || [])
                    .filter(p => p.type === 'text')
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map(p => (p as any).text)
                    .join('\n');

                  if (msg.role === "user" && content?.startsWith("[INTERNAL]")) return null;

                  return (
                    <div key={`${msg.id}-${index}`} className="flex flex-col gap-2">
                      {content && (
                        <ChatMessage id={msg.id} role={msg.role}>
                          <ChatMessageText content={content} />
                        </ChatMessage>
                      )}
                      <ToolRenderer message={msg} onShareLocation={handleShareLocation} />
                    </div>
                  )
                })}
                
                {isLoading && (
                  <div className="flex flex-col gap-2 max-w-[85%] mr-auto">
                    <div className="flex gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-rose-100">
                        <Bot className="w-4 h-4 text-rose-600" />
                      </div>
                      <div className="p-3 rounded-2xl text-sm bg-slate-50 text-slate-800 rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 pt-3 pb-3 flex gap-2 overflow-x-auto scrollbar-hide bg-white shrink-0">
                {suggestions.map(suggestion => (
                  <button
                    key={suggestion.label}
                    onClick={() => { 
                      sendMessage({ text: suggestion.label });
                    }}
                    className="whitespace-nowrap bg-white/80 backdrop-blur-sm border border-gray-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    {suggestion.icon} <span>{suggestion.label}</span>
                  </button>
                ))}
              </div>

              <div className="px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2 bg-white shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input 
                    placeholder={isEs ? "Describe tu día ideal..." : "Describe your ideal day..."} 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    data-vaul-no-drag
                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-rose-500 rounded-full h-10 px-4 text-sm shadow-inner"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="bg-slate-900 text-white hover:bg-slate-800 rounded-full shrink-0 shadow-md transition-transform hover:scale-105 h-10 w-10 flex items-center justify-center"
                    disabled={!input.trim() || isLoading}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
