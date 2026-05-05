import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, MapPin, Clock, DollarSign, CreditCard, CheckCircle2, Navigation } from "lucide-react";
import { motion } from "framer-motion";

interface TaxiFareCardProps {
  data: {
    destinationName: string;
    originGuessed: string;
    distanceKm: string | number;
    estimatedCostUSD: number;
    estimatedTimeMinutes: number;
    taxi?: {
      name: string;
      whatsapp: string | null;
      rating: number | null;
    };
  }
}

export function TaxiFareCard({ data }: TaxiFareCardProps) {
  const [isPaying, setIsPaying] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const handlePay = () => {
    setIsPaying(true);
    // Simulate Stripe / Apple Pay processing delay
    setTimeout(() => {
      setIsPaying(false);
      setIsPaid(true);
      // Here you would trigger the backend WhatsApp alert to the driver
    }, 1500);
  };

  return (
    <Card className="w-full my-3 overflow-hidden border border-slate-200 shadow-md">
      <CardHeader className="bg-slate-900 text-white p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <Car className="w-5 h-5" /> Private Transfer
          </CardTitle>
          <span className="bg-rose-600 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
            Premium
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-4 bg-white space-y-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
              <div className="w-0.5 h-10 bg-slate-200"></div>
              <MapPin className="w-4 h-4 text-rose-600" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Pickup</p>
                <p className="font-medium text-slate-900">{data.originGuessed}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Dropoff</p>
                <p className="font-medium text-slate-900">{data.destinationName}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100">
            <div className="flex flex-col items-center justify-center bg-slate-50 p-2 rounded-lg">
              <Navigation className="w-4 h-4 text-slate-400 mb-1" />
              <span className="text-xs text-slate-500 font-medium">{data.distanceKm} km</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-slate-50 p-2 rounded-lg">
              <Clock className="w-4 h-4 text-slate-400 mb-1" />
              <span className="text-xs text-slate-500 font-medium">~{data.estimatedTimeMinutes} min</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-slate-50 p-2 rounded-lg">
              <DollarSign className="w-4 h-4 text-slate-400 mb-1" />
              <span className="text-sm font-bold text-slate-900">${data.estimatedCostUSD}</span>
            </div>
          </div>
          
          {data.taxi && (
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{data.taxi.name}</p>
                  <p className="text-xs text-slate-500">Verified Driver • ★ {data.taxi.rating || 5.0}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          {!isPaid ? (
            <Button 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-6 font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
              onClick={handlePay}
              disabled={isPaying}
            >
              {isPaying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay ${data.estimatedCostUSD}.00 with Apple Pay
                </>
              )}
            </Button>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl py-4 flex flex-col items-center justify-center gap-2"
            >
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-5 h-5" /> Ride Confirmed!
              </div>
              <p className="text-xs text-center px-4 font-medium">
                Payment successful. We've dispatched {data.taxi?.name || "a driver"} to your location. They will contact you shortly.
              </p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
