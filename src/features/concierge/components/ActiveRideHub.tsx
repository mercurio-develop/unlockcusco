"use client"

import { useState, useEffect } from "react"
import { Send, MapPin, Navigation2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ActiveRideHubProps {
  rideId: string
  origin: string
  destinationName: string
}

export function ActiveRideHub({ rideId, origin, destinationName }: ActiveRideHubProps) {
  // In a real app, this would poll an API or use websockets/Supabase realtime
  // to fetch the ride status and messages.
  // For the sandbox, we will just simulate a polling interval that fetches from our server action.
  
  const [messages, setMessages] = useState<any[]>([])
  const [status, setStatus] = useState("HOLD_SECURED")
  const [driver, setDriver] = useState<any>(null)
  const [input, setInput] = useState("")

  // Fetch the latest ride state
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/taxi/ride-status?id=${rideId}`)
        const data = await res.json()
        if (data.ride) {
          setStatus(data.ride.status)
          setMessages(data.ride.messages)
          setDriver(data.ride.driver)
        }
      } catch (err) {
        console.error(err)
      }
    }, 2000) // Poll every 2 seconds for sandbox responsiveness
    
    return () => clearInterval(poll)
  }, [rideId])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Optimistic update
    const newMsg = { id: Date.now().toString(), sender: "TOURIST", text: input }
    setMessages(prev => [...prev, newMsg])
    setInput("")

    try {
      await fetch(`/api/taxi/ride-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rideId, text: newMsg.text })
      })
    } catch (err) {
      console.error(err)
    }
  }

  if (status === "COMPLETED") {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 max-w-sm w-full mx-auto my-4 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2">You have arrived!</h3>
        <p className="text-sm text-slate-500 mb-4">Hope you had a great ride with {driver?.name || "your driver"}.</p>
        <div className="bg-slate-50 p-4 rounded-lg border border-gray-100">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Receipt</p>
           <div className="flex justify-between items-center text-sm">
             <span>Stripe Payment</span>
             <span className="font-medium text-slate-900">Captured</span>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden max-w-sm w-full mx-auto my-4 flex flex-col h-[500px]">
      {/* Header */}
      <div className="bg-slate-900 p-4 text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
            <Navigation2 className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm">{status === 'HOLD_SECURED' ? 'Finding your driver...' : 'Driver is on the way'}</h3>
            <p className="text-xs text-slate-400">{origin} → {destinationName}</p>
          </div>
        </div>
      </div>

      {/* Driver Info (If assigned) */}
      {driver && (
        <div className="bg-slate-50 border-b border-gray-100 p-3 shrink-0 flex items-center justify-between">
          <div>
            <p className="font-bold text-sm text-slate-900">{driver.name}</p>
            <p className="text-xs text-slate-500">{driver.carModel} • {driver.licensePlate}</p>
          </div>
          <div className="text-right">
             <p className="text-2xl font-black text-rose-600">12<span className="text-sm font-medium">m</span></p>
             <p className="text-[10px] text-slate-400 font-bold uppercase">ETA</p>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
        {status === 'HOLD_SECURED' && messages.length === 0 && (
          <div className="text-center text-sm text-slate-500 py-8 animate-pulse">
            Connecting you with the nearest driver...
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'TOURIST' ? 'justify-end' : m.sender === 'SYSTEM' ? 'justify-center' : 'justify-start'}`}>
            {m.sender === 'SYSTEM' ? (
               <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-full">{m.text}</span>
            ) : (
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                m.sender === 'TOURIST' 
                  ? 'bg-rose-600 text-white rounded-br-sm' 
                  : 'bg-white border border-gray-200 text-slate-900 rounded-bl-sm'
              }`}>
                {m.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      {status === 'DRIVER_ASSIGNED' && (
        <div className="p-3 bg-white border-t border-gray-100 shrink-0">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Message your driver..." 
              className="rounded-full bg-slate-50 border-slate-200"
            />
            <Button type="submit" size="icon" className="rounded-full bg-slate-900 hover:bg-slate-800 shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
