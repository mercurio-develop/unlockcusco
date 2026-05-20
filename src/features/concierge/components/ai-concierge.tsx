"use client"
import { Business } from "@prisma/client";

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Send, Bot, User, Settings2, Check, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

import { ItinerarySummaryCard } from "./itinerary-summary-card"
import { PendingAvailability } from "./pending-availability"
import { SearchResultsCard } from "./search-results-card"
import { BoletoInfoCard } from "./boleto-info-card"
import { TaxiFareCard } from "./taxi-fare-card"
import { useConciergeChat } from "../hooks/use-concierge-chat"
import { usePreferences } from "@/lib/store/preferences-context"

export function AiConcierge() {
  const {
    isChatOpen, setIsChatOpen, pathname,
    messages, input, setInput, isLoading,
    handleSubmit, handleShareLocation, sendMessage
  } = useConciergeChat();
  
  const { travelVibe } = usePreferences()

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

    let isScrolledToBottom = true;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      isScrolledToBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
    };
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
    scrollToBottom("smooth");
  }, [messages.length, isLoading])

  if (!pathname?.includes("/explore") && !pathname?.includes("/pro")) {
    return null;
  }

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
                    <h3 className="font-semibold text-sm sm:text-base text-slate-900 tracking-wide">UnlockCusco Concierge</h3>
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
                {messages.map((msg: any, index: number) => {
                  const content = (msg as any).content || (msg as any).parts?.map((p: any) => p.type === 'text' ? p.text : '').join('');
                  if (msg.role === "user" && content?.startsWith("[INTERNAL]")) return null;

                  return (
                    <div key={`${msg.id}-${index}`} className="flex flex-col gap-2">
                      {content && (
                        <div 
                          id={`msg-text-${msg.id}`}
                          className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                        >
                          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-slate-100" : "bg-rose-100"}`}>
                            {msg.role === "user" ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-rose-600" />}
                          </div>
                          <div 
                            className={`p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                              msg.role === "user" 
                                ? "bg-slate-900 text-white rounded-tr-sm" 
                                : "bg-slate-50 text-slate-800 rounded-tl-sm"
                            }`}
                          >
                            {(() => {
                              const text = content || '';
                              
                              const renderBold = (str: string) => {
                                return str.split(/(\*\*.*?\*\*)/g).map((chunk, i) => {
                                  if (chunk.startsWith('**') && chunk.endsWith('**')) {
                                    return <strong key={i} className="font-bold text-inherit">{chunk.slice(2, -2)}</strong>;
                                  }
                                  return <span key={i}>{chunk}</span>;
                                });
                              };

                              if (!text.includes('[[SETTINGS_ICON]]')) return renderBold(text);

                              const parts = text.split('[[SETTINGS_ICON]]');
                              return (
                                <>
                                  {renderBold(parts[0])}
                                  <Settings2 className="inline-block w-3.5 h-3.5 mx-0.5 mb-0.5 align-middle text-slate-500" />
                                  {renderBold(parts[1])}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                      
                      {/* Tool parts (AI SDK v6: msg.parts, state=output-available or older v3 msg.toolInvocations) */}
                      {(() => {
                        const partsTools = ((msg as any).parts || []).filter((p: any) => p?.type?.startsWith('tool-') || p?.type === 'dynamic-tool');
                        const invocationsTools = ((msg as any).toolInvocations || []).filter((ti: any) => ti != null).map((ti: any) => ({
                          type: 'tool-invocation',
                          toolInvocation: ti,
                          state: ti?.state === 'result' ? 'output-available' : undefined,
                          output: ti?.result,
                          input: ti?.args,
                          toolCallId: ti?.toolCallId,
                          toolName: ti?.toolName
                        }));
                        // Prefer parts tools if they exist, otherwise fallback to invocations mapped
                        return partsTools.length > 0 ? partsTools : invocationsTools;
                      })().map((part: any, idx: number) => {
                        const isToolPart = part?.type?.startsWith('tool-') || part?.type === 'dynamic-tool';
                        if (!part || !isToolPart) return null;
                        const key = part.toolCallId || part.toolInvocation?.toolCallId || idx;
                        const toolInvocation = part.toolInvocation || part;
                        const toolName = part.toolName || toolInvocation.toolName || part.type.replace(/^tool-/, '');
                        const isDone = part?.state === 'output-available' || toolInvocation?.state === 'result';
                        const output = toolInvocation.result || part.output;
                        const input = toolInvocation.args || part.input;

                        if (!isDone) {
                          if (toolName === 'askAvailability') {
                            return <PendingAvailability key={key} message="Contacting vendor via Ghost Phone..." />
                          }
                          if (toolName === 'showBoletoInfo') {
                            return <PendingAvailability key={key} message="Retrieving Boleto Turístico information..." />
                          }
                          if (toolName === 'askUserLocation') {
                            return (
                              <div key={key} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col gap-3 ml-11 mt-2">
                                <p className="text-sm text-rose-900 font-medium leading-relaxed">
                                  {input?.message || "Please share your location"}
                                </p>
                                <button
                                  onClick={handleShareLocation}
                                  className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-rose-500 transition-all flex items-center justify-center gap-2"
                                >
                                  <Navigation className="w-4 h-4" /> Share My GPS Position
                                </button>
                              </div>
                            )
                          }
                          if (toolName === 'searchDatabase') {
                            return (
                              <div key={key}>
                                <PendingAvailability message="Searching UnlockCusco library..." />
                                <style>{`#msg-text-${msg.id} { display: none; }`}</style>
                              </div>
                            )
                          }
                          return null;
                        }

                        if (output?.error || typeof output === 'string') {
                          return (
                            <div key={key} className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 ml-11 mt-2">
                              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                                <X className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="text-xs font-medium text-red-800 leading-snug">
                                {typeof output === 'string' ? 'Tool failed to execute.' : 'I ran into a snag — try rephrasing?'}
                              </span>
                            </div>
                          );
                        }

                        if (toolName === 'askUserLocation') {
                          return (
                            <div key={key} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col gap-3 ml-11 mt-2">
                              <p className="text-sm text-rose-900 font-medium leading-relaxed">
                                {output?.message || input?.message || "Please share your location"}
                              </p>
                              <button
                                onClick={handleShareLocation}
                                className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-rose-500 transition-all flex items-center justify-center gap-2"
                              >
                                <Navigation className="w-4 h-4" /> Share My GPS Position
                              </button>
                            </div>
                          )
                        }
                        if (toolName === 'buildItinerary') {
                          return <ItinerarySummaryCard key={key} itinerary={output} />
                        }
                        if (toolName === 'buildMacroTrip') {
                          return (
                            <div key={key} className="bg-white rounded-2xl shadow-sm p-4 w-full my-3">
                              <div className="flex items-center gap-2.5 mb-2">
                                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                                  <Navigation className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold tracking-widest text-purple-500 uppercase">Macro Trip Plan</p>
                                  <h3 className="text-sm font-semibold text-slate-900 leading-tight">{output?.title || 'Your Sacred Valley Journey'}</h3>
                                </div>
                              </div>
                              <div className="text-xs text-slate-600 font-medium ml-10">
                                {output?.days?.length || 0} Days planned
                              </div>
                            </div>
                          );
                        }
                        if (toolName === 'searchDatabase') {
                          return <SearchResultsCard key={key} businesses={output} messageId={msg.id} input={input} />
                        }
                        if (toolName === 'askAvailability') {
                          return <PendingAvailability key={key} message={output?.message} />
                        }
                        if (toolName === 'showBoletoInfo') {
                          if (!output?.data) {
                            return (
                              <div key={key} className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 ml-11 mt-2">
                                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                                  <X className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="text-xs font-medium text-red-800 leading-snug">Sorry, I couldn't fetch the Boleto information.</span>
                              </div>
                            );
                          }
                          return <BoletoInfoCard key={key} data={output?.data} message={output?.message || input?.message} />
                        }
                        if (toolName === 'estimateTaxiFare') {
                          return <TaxiFareCard key={key} data={output} />
                        }
                        if (toolName === 'generateSaveLink' && output?.url) {
                          return (
                            <div key={key} className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col gap-3 ml-11 mt-2">
                              <p className="text-sm text-emerald-900 font-medium leading-relaxed">
                                I have saved your itinerary! You can bookmark this link or share it with others.
                              </p>
                              <div className="flex items-center gap-2">
                                <Input readOnly value={output.url} className="bg-white border-emerald-200 text-xs text-slate-600 h-9" />
                                <button
                                  onClick={() => { navigator.clipboard.writeText(output.url); alert("Copied!"); }}
                                  className="h-9 px-3 bg-emerald-600 text-white rounded-lg font-bold text-xs shadow-sm hover:bg-emerald-500 transition-colors shrink-0"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          )
                        }
                        if (toolName === 'mutateItinerary') {
                          return (
                            <div key={key} className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 ml-11 mt-2">
                              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="text-xs font-bold text-emerald-800 uppercase tracking-tight">Itinerary Updated</span>
                            </div>
                          )
                        }
                        return null;
                      })}
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
                {(
                  travelVibe === 'Explorer' ? [
                    { label: isEs ? "Mejores caminatas cerca" : "Best hikes near me", icon: "🥾", theme: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
                    { label: isEs ? "Ruinas poco conocidas" : "Off-the-beaten-path ruins", icon: "🏺", theme: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
                    { label: isEs ? "Días de mercado local" : "Market day schedule", icon: "🧶", theme: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" },
                    { label: isEs ? "Necesito un Taxi" : "I need a Taxi", icon: "🚕", theme: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" }
                  ] : travelVibe === 'Foodie' ? [
                    { label: isEs ? "Mejor ceviche local" : "Best local ceviche", icon: "🐟", theme: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" },
                    { label: isEs ? "Comida de la granja a la mesa" : "Farm-to-table dining", icon: "🌽", theme: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
                    { label: isEs ? "Lugares para probar Pisco" : "Pisco tasting spots", icon: "🍸", theme: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
                    { label: isEs ? "Necesito un Taxi" : "I need a Taxi", icon: "🚕", theme: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" }
                  ] : travelVibe === 'Luxury' ? [
                    { label: isEs ? "Mejor spa en el valle" : "Best spa in the valley", icon: "💆‍♀️", theme: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
                    { label: isEs ? "Contratar conductor privado" : "Hire a private driver", icon: "🚙", theme: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
                    { label: isEs ? "Alta cocina con vistas" : "Fine dining with views", icon: "🥂", theme: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" },
                    { label: isEs ? "Planear mi día completo" : "Plan my full day", icon: "🌅", theme: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" }
                  ] : [
                    { label: isEs ? "Planear mi día completo" : "Plan my full day", icon: "🌅", theme: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
                    { label: isEs ? "Buscar Restaurante" : "Find a Restaurant", icon: "🍽️", theme: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" },
                    { label: isEs ? "Necesito un Taxi" : "I need a Taxi", icon: "🚕", theme: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
                    { label: isEs ? "Tips locales" : "Local Travel Tips", icon: "💡", theme: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
                    { label: isEs ? "Buscar un Hotel" : "Find a Hotel", icon: "🏨", theme: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" }
                  ]
                ).map(suggestion => (
                  <button
                    key={suggestion.label}
                    onClick={() => { 
                      sendMessage({ text: suggestion.label });
                    }}
                    className={`whitespace-nowrap px-2.5 py-1 border text-[11px] font-bold rounded-full transition-all shadow-sm flex items-center gap-1.5 ${suggestion.theme}`}
                  >
                    <span>{suggestion.icon}</span> {suggestion.label}
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