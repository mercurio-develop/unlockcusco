"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Send, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import ItineraryAlternatives from "@/components/concierge/ItineraryAlternatives"
import { TaxiPaymentCard } from "@/features/concierge/components/TaxiPaymentCard"
import ExperienceRecommendations from "@/components/concierge/ExperienceRecommendations"
import { CinematicTimeline } from "@/features/concierge/components/CinematicTimeline"
import { PendingAvailability } from "@/features/concierge/components/PendingAvailability"

export function AiConcierge() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")

  const initialMessages: UIMessage[] = [
    {
      id: "1",
      role: "assistant",
      parts: [{ type: 'text', text: "Welcome to InkaPortal. ✨\n\nHow can I curate your day in the Sacred Valley?" }]
    }
  ];

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    messages: initialMessages
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input.trim() })
    setInput("")
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-24 right-6 z-50 w-[350px] sm:w-[450px]"
          >
            <Card className="flex flex-col h-[600px] shadow-2xl border-white/10 overflow-hidden bg-[#09090B]/95 backdrop-blur-xl">
              {/* Header */}
              <div className="bg-white/5 border-b border-white/10 p-4 flex justify-between items-center shrink-0 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="bg-black/40 border border-white/10 p-2 rounded-xl shadow-inner">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white tracking-wide">InkaPortal Concierge</h3>
                    <p className="text-xs text-white/40 font-medium">Khipu AI Assistant</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide flex flex-col">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex flex-col gap-2">
                    <div 
                      className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-white/10" : "bg-[#D4AF37]/20"}`}>
                        {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-[#D4AF37]" />}
                      </div>
                      <div 
                        className={`p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                          msg.role === "user" 
                            ? "bg-white/10 text-white rounded-tr-sm backdrop-blur-md" 
                            : "bg-white/5 border border-white/10 text-white/90 rounded-tl-sm backdrop-blur-md"
                        }`}
                      >
                        {msg.parts?.map((p: { type: string, text?: string }) => p.type === 'text' ? p.text : '').join('')}
                      </div>
                    </div>
                    {msg.parts?.map((part: { type: string, toolInvocation?: { toolName: string, state: string, toolCallId: string, result: unknown } }) => {
                      if (part.type === 'tool-invocation') {
                        const toolInvocation = part.toolInvocation;
                        if (toolInvocation?.toolName === 'buildSpatialItinerary' && toolInvocation?.state === 'result') {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          return <ItineraryAlternatives key={toolInvocation.toolCallId} plans={toolInvocation.result as any} />
                        }
                        if (toolInvocation?.toolName === 'estimateTaxiFare' && toolInvocation?.state === 'result') {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          return <TaxiPaymentCard key={toolInvocation.toolCallId} taxi={toolInvocation.result as any} />
                        }
                        if (toolInvocation?.toolName === 'findLocalExperiences' && toolInvocation?.state === 'result') {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          return <ExperienceRecommendations key={toolInvocation.toolCallId} result={toolInvocation.result as any} />
                        }
                      }
                      return null;
                    })}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3 max-w-[85%] mr-auto">
                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#D4AF37]/20">
                      <Bot className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <div className="p-3 rounded-2xl text-sm bg-white/5 border border-white/10 text-white/90 rounded-tl-sm flex items-center gap-1.5 backdrop-blur-md">
                      <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-black/40 border-t border-white/10 shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input 
                    placeholder="Describe your ideal day..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#D4AF37] rounded-full"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="bg-[#D4AF37] text-black hover:bg-[#C5A059] rounded-full shrink-0 shadow-md transition-transform hover:scale-105"
                    disabled={!input.trim() || isLoading}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            data-testid="ai-chat-trigger"
            className="absolute bottom-6 right-6 z-50 h-14 w-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-2xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 group transition-all"
          >
            <Sparkles className="w-6 h-6 text-[#D4AF37] group-hover:animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
