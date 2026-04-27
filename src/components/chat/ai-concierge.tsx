"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Send, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

import { askConcierge } from "@/app/actions/chat"

type Message = {
  id: string
  role: "ai" | "user"
  content: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "ai",
    content: "Welcome to Valle. ✨\n\nHow can I curate your day in the Sacred Valley?"
  }
]

export function AiConcierge() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userText = input.trim()
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: userText }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const responseText = await askConcierge(userText)
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "ai", 
        content: responseText 
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "ai", 
        content: "Error de conexión. Intenta nuevamente más tarde." 
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
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
            className="absolute bottom-24 right-6 z-50 w-80 sm:w-96"
          >
            <Card className="flex flex-col h-[500px] shadow-2xl border-indigo-100 overflow-hidden bg-white/95 backdrop-blur-md">
              {/* Header */}
              <div className="bg-[#D4AF37] p-4 text-black flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="bg-black/10 p-1.5 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Valle Concierge</h3>
                    <p className="text-xs text-black/70">Khipu AI Assistant</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-black/70 hover:text-black hover:bg-black/10 rounded-full"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide flex flex-col">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                  >
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-slate-200" : "bg-[#D4AF37]/20"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-[#D4AF37]" />}
                    </div>
                    <div 
                      className={`p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                        msg.role === "user" 
                          ? "bg-slate-900 text-white rounded-tr-sm" 
                          : "bg-white border border-[#D4AF37]/20 text-slate-700 rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 max-w-[85%] mr-auto">
                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#D4AF37]/20">
                      <Bot className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <div className="p-3 rounded-2xl text-sm bg-white border border-[#D4AF37]/20 text-slate-700 rounded-tl-sm flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-slate-50 border-t shrink-0">
                <form onSubmit={handleSend} className="flex gap-2">
                  <Input 
                    placeholder="Describe tu día ideal..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="bg-white border-slate-200 focus-visible:ring-[#D4AF37] rounded-full"
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
            className="absolute bottom-6 right-6 z-50 h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 group"
          >
            <Sparkles className="w-8 h-8 text-white group-hover:animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}