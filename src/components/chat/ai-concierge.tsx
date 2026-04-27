"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Send, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

type Message = {
  id: string
  role: "ai" | "user"
  content: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "ai",
    content: "¡Hola! Soy tu Conserje de InkaPortal. ✨\n\n¿Buscas aventura, relajación, o la mejor picantería del Valle Sagrado? Dime qué te apetece y te armaré el itinerario perfecto."
  }
]

export function AiConcierge() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input }
    setMessages(prev => [...prev, userMsg])
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "ai", 
        content: "¡Excelente elección! Estoy buscando las mejores opciones 'No Verificadas' y 'Premium' en nuestra base de datos para ofrecerte una experiencia auténtica. (Modo Demo: Respuestas IA próximamente 🚀)" 
      }
      setMessages(prev => [...prev, aiMsg])
    }, 1000)
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
              <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">InkaPortal Concierge</h3>
                    <p className="text-xs text-indigo-200">Asistente IA 24/7</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-indigo-100 hover:text-white hover:bg-white/20 rounded-full"
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
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-slate-200" : "bg-indigo-100"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div 
                      className={`p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                        msg.role === "user" 
                          ? "bg-slate-900 text-white rounded-tr-sm" 
                          : "bg-white border border-indigo-50 text-slate-700 rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-slate-50 border-t shrink-0">
                <form onSubmit={handleSend} className="flex gap-2">
                  <Input 
                    placeholder="Escribe tu idea aquí..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-white border-slate-200 focus-visible:ring-indigo-500 rounded-full"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="bg-indigo-600 hover:bg-indigo-700 rounded-full shrink-0 shadow-md transition-transform hover:scale-105"
                    disabled={!input.trim()}
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