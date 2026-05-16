"use client";

import { useState } from "react";
import { ArrowLeft, Calendar, Loader2, Train, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function MachuPicchuPage() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    setLoading(true);
    setResults(null);

    try {
      const res = await fetch(`/api/machu-picchu/scrape?date=${date}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data);
      } else {
        alert(data.error || "Failed to fetch availability.");
      }
    } catch (err) {
      console.error(err);
      alert("Error checking availability.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full"
              onClick={() => router.push("/explore")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-serif text-xl font-bold text-slate-900">
              Machu Picchu Tickets & Trains
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-600" />
            Check Live Availability
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            We scan tuboleto.cultura.pe and official train schedules to find matching availability for your selected date.
          </p>

          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="date"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={new Date().toISOString().split("T")[0]}
            />
            <Button
              type="submit"
              disabled={loading || !date}
              className="bg-slate-900 text-white rounded-xl px-8 py-6 h-auto hover:bg-slate-800 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </form>
        </div>

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Tickets */}
            <section>
              <h3 className="text-xl font-serif font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-rose-600" />
                Llaqta Entrance Tickets
              </h3>
              <div className="grid gap-3">
                {results.tickets.map((ticket: any, idx: number) => (
                  <Card key={idx} className={`p-4 flex items-center justify-between border-l-4 ${ticket.available > 0 ? "border-l-emerald-500" : "border-l-rose-500 bg-rose-50/50"}`}>
                    <div>
                      <h4 className="font-semibold">{ticket.type}</h4>
                      <p className="text-sm text-slate-500">{ticket.circuit} • Entry: {ticket.time}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{ticket.price}</div>
                      <div className={`text-sm ${ticket.available > 0 ? "text-emerald-600" : "text-rose-600 font-medium"}`}>
                        {ticket.available > 0 ? `${ticket.available} left` : "Sold out"}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Trains */}
            <section>
              <h3 className="text-xl font-serif font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Train className="w-5 h-5 text-rose-600" />
                Trains (Ollantaytambo)
              </h3>
              <div className="grid gap-3">
                {results.trains.map((train: any, idx: number) => (
                  <Card key={idx} className={`p-4 flex items-center justify-between border-l-4 ${train.available ? "border-l-blue-500" : "border-l-rose-500 bg-rose-50/50"}`}>
                    <div>
                      <h4 className="font-semibold">{train.company} - {train.type}</h4>
                      <p className="text-sm text-slate-500">{train.departure} → {train.arrival}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{train.price}</div>
                      <div className={`text-sm ${train.available ? "text-blue-600" : "text-rose-600 font-medium"}`}>
                        {train.available ? "Available" : "Sold out"}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
            
            <p className="text-xs text-center text-slate-400 mt-8">
              Data retrieved via live scrape {results.source ? `(${results.source})` : ""}. Actual checkout requires official government ID verification.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
