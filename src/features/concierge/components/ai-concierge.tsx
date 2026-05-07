"use client"
import { Business } from "@prisma/client";

import { useState, useEffect, useRef } from "react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Send, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { DEFAULT_COORDS } from "@/lib/constants"
import { ItinerarySummaryCard } from "@/features/concierge/components/ItinerarySummaryCard"
import { PendingAvailability } from "@/features/concierge/components/PendingAvailability"
import { SearchResultsCard } from "@/features/concierge/components/SearchResultsCard"
import { MacroItineraryCard } from "@/features/concierge/components/MacroItineraryCard"
import { BoletoInfoCard } from "./BoletoInfoCard"
import { TaxiFareCard } from "./TaxiFareCard"
import { useTrip } from "@/lib/store/trip-context"

export function AiConcierge() {
  const [input, setInput] = useState("")
  const { isChatOpen, setIsChatOpen, travelVibe, travelIntensity, isWorkspaceCollapsed, panelMode, aiPromptToTrigger, setAiPromptToTrigger } = useTrip()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Determine the offset: if in builder mode and sidebar is open, push left by 500px
  const isBuilder = panelMode === 'builder'
  const sidebarOffset = (isBuilder && !isWorkspaceCollapsed) ? "500px" : "0px"

  const initialMessages: any[] = [
    {
      id: "1",
      role: "assistant",
      content: "Welcome to Vallecito. ✨\n\nHow can I curate your day in the Sacred Valley?\n\nTip: You can set your travel style in the top menu to get better personalized recommendations!"
    }
  ];

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    messages: initialMessages
  });

  // Listen for manual trigger from TripContext
  useEffect(() => {
    if (aiPromptToTrigger) {
      setIsChatOpen(true);
      sendMessage(
        { text: aiPromptToTrigger },
        {
          body: {
            userLat: DEFAULT_COORDS.lat,
            userLng: DEFAULT_COORDS.lng,
            localTime: new Date().toLocaleTimeString(),
            archetype: travelVibe,
            intensity: travelIntensity
          }
        }
      );
      setAiPromptToTrigger(null);
    }
  }, [aiPromptToTrigger, travelVibe, travelIntensity, sendMessage, setIsChatOpen, setAiPromptToTrigger]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
      }
    }, 100);
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, status])

  // Seamless Handoff: auto-submit ai_prompt if present
  useEffect(() => {
    const aiPrompt = searchParams.get("ai_prompt");
    const data = searchParams.get("data");
    
    if (aiPrompt) {
      setIsChatOpen(true);
      
      let promptText = aiPrompt;
      if (aiPrompt === "macro_trip" && data) {
        try {
          const parsedData = JSON.parse(decodeURIComponent(data));
          promptText = `I have completed the Journey Designer. Here is my profile:\n
Dates: ${parsedData.dates?.start} to ${parsedData.dates?.end}
Travelers: ${parsedData.pax}
Exertion Profile: ${parsedData.exertionProfile}
Lenses of Discovery: ${parsedData.lenses?.join(', ')}
Autonomy Ratio: ${parsedData.autonomy}
Needs Hotels: ${parsedData.needsHotels ? 'Yes' : 'No'}\n
Please generate my macro trip plan.`;
        } catch (e) {
          console.error("Failed to parse journey designer data", e);
        }
      }

      // Wait a tiny bit for UI to mount before sending message
      setTimeout(() => {
        sendMessage(
          { text: promptText },
          {
        body: {
          userLat: DEFAULT_COORDS.lat,
          userLng: DEFAULT_COORDS.lng,
          localTime: new Date().toLocaleTimeString(),
          archetype: travelVibe,
          intensity: travelIntensity
        }
          }
        );
      }, 300);
      
      // Clean up the URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("ai_prompt");
      params.delete("data");
      const newSearch = params.toString();
      const newUrl = newSearch ? `${pathname}?${newSearch}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, travelVibe, travelIntensity, pathname, router]);

  if (pathname?.startsWith("/trip/")) {
    return null;
  }

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage(
      { text: input.trim() },
      {
        body: {
          userLat: DEFAULT_COORDS.lat,
          userLng: DEFAULT_COORDS.lng,
          localTime: new Date().toLocaleTimeString(),
          archetype: travelVibe,
          intensity: travelIntensity
        }
      }
    )
    setInput("")
  }

  return (
    <>
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0, right: sidebarOffset }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-[56px] z-40 w-full sm:w-[450px] h-[calc(100vh-56px)]"
          >
            <Card className="flex flex-col h-full rounded-none shadow-2xl border-l border-gray-200 overflow-hidden bg-white/95 backdrop-blur-xl">
              {/* Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-50 border border-rose-100 p-2 rounded-xl shadow-inner">
                    <Sparkles className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 tracking-wide">Vallecito Concierge</h3>
                    <p className="text-xs text-slate-500 font-medium">AI Travel Assistant</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-400 hover:text-slate-900 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setIsChatOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide flex flex-col bg-white">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex flex-col gap-2">
                    <div 
                      className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-slate-100" : "bg-rose-100"}`}>
                        {msg.role === "user" ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-rose-600" />}
                      </div>
                      <div 
                        className={`p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                          msg.role === "user" 
                            ? "bg-slate-900 text-white rounded-tr-sm" 
                            : "bg-gray-50 border border-gray-100 text-slate-800 rounded-tl-sm"
                        }`}
                      >
                        {(msg as any).content || msg.parts?.map((p: { type: string, text?: string }) => p.type === 'text' ? p.text : '').join('')}
                      </div>
                    </div>
                      {/* AI SDK v6: ToolUIPart uses type `tool-${toolName}`, state 'output-available', field `output` */}
                    {msg.parts && msg.parts.map((part: any, idx: number) => {
                      const key = part.toolCallId || idx;
                      if (part.state === 'output-available') {
                        if (part.type === 'tool-buildItinerary') {
                          return <ItinerarySummaryCard key={key} itinerary={part.output} />
                        }
                        if (part.type === 'tool-buildMacroTrip') {
                          return <MacroItineraryCard key={key} itinerary={part.output} />
                        }
                        if (part.type === 'tool-searchDatabase') {
                          return <SearchResultsCard key={key} businesses={part.output} />
                        }
                        if (part.type === 'tool-askAvailability') {
                          return <PendingAvailability key={key} message={part.output.message} />
                        }
                        if (part.type === 'tool-showBoletoInfo') {
                          return <BoletoInfoCard key={key} data={part.output.data} message={part.output.message} />
                        }
                        if (part.type === 'tool-estimateTaxiFare') {
                          return <TaxiFareCard key={key} data={part.output} />
                        }
                      }
                      if (part.type === 'tool-askAvailability' && part.state !== 'output-available') {
                        return <PendingAvailability key={key} message="Contacting vendor via Ghost Phone..." />
                      }
                      return null;
                    })}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex flex-col gap-2 max-w-[85%] mr-auto">
                    <div className="flex gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-rose-100">
                        <Bot className="w-4 h-4 text-rose-600" />
                      </div>
                      <div className="p-3 rounded-2xl text-sm bg-gray-50 border border-gray-100 text-slate-800 rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                    {(messages[messages.length - 1] as any)?.content?.includes("I have completed the Journey Designer") && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-2 rounded-xl overflow-hidden shadow-lg border border-rose-100 relative h-48 w-[300px]"
                      >
                        <img 
                          src="https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop" 
                          alt="Designing Journey" 
                          className="absolute inset-0 w-full h-full object-cover filter brightness-75"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex flex-col justify-end p-4">
                          <Sparkles className="w-6 h-6 text-rose-400 mb-2 animate-pulse" />
                          <h4 className="text-white font-serif font-bold text-lg leading-tight">Designing your expedition...</h4>
                          <p className="text-slate-300 text-xs mt-1">Consulting the ancestral routes.</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestions / Multi-Chip Selection */}
              <div className="px-4 pt-3 pb-3 flex gap-2 overflow-x-auto scrollbar-hide border-t border-gray-100 bg-white shrink-0">
                {[
                  { label: "Plan my day", icon: "🌅", theme: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
                  { label: "Find a Restaurant", icon: "🍽️", theme: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" },
                  { label: "I need a Taxi", icon: "🚕", theme: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
                  { label: "Book Machu Picchu", icon: "⛰️", theme: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
                  { label: "Spiritual retreats", icon: "🧿", theme: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" }
                ].map(suggestion => (
                  <button
                    key={suggestion.label}
                    onClick={() => { 
                      sendMessage(
                        { text: suggestion.label },
                        {
                          body: {
                            userLat: DEFAULT_COORDS.lat,
                            userLng: DEFAULT_COORDS.lng,
                            localTime: new Date().toLocaleTimeString(),
                            archetype: travelVibe,
                            intensity: travelIntensity
                          }
                        }
                      )
                    }}
                    className={`whitespace-nowrap px-4 py-2 border text-[13px] font-bold rounded-full transition-all shadow-sm flex items-center gap-1.5 hover:scale-105 active:scale-95 ${suggestion.theme}`}
                  >
                    <span>{suggestion.icon}</span> {suggestion.label}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="px-4 pb-6 pt-2 bg-white shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input 
                    placeholder="Describe your ideal day..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-rose-500 rounded-full h-12 px-5 shadow-inner"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="bg-slate-900 text-white hover:bg-slate-800 rounded-full shrink-0 shadow-md transition-transform hover:scale-105 h-12 w-12 flex items-center justify-center"
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
