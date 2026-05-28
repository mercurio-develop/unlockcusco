"use client";

import { useState } from "react";
import { verifyBusinessAction } from "./actions";
import { CheckCircle2, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface VerifyOverlayProps {
  businessId: string;
  token: string;
  lang: string;
}

export function VerifyOverlay({ businessId, token, lang }: VerifyOverlayProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);
    const result = await verifyBusinessAction(businessId, token);
    setIsVerifying(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setHidden(true);
        router.replace(`/${lang}/business/${businessId}`); // or slug if we passed it
      }, 3000);
    } else {
      setError(result.error || "Verification failed");
    }
  };

  if (hidden) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 text-white shadow-2xl animate-in slide-in-from-bottom-full duration-500">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/20 rounded-full shrink-0">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Verify Your Business</h3>
            <p className="text-sm text-slate-300">
              Claim this profile to verify your WhatsApp number and show up in tourist searches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {error && <span className="text-red-400 text-sm">{error}</span>}
          {success ? (
            <div className="flex items-center gap-2 text-emerald-400 font-bold px-4 py-2 bg-emerald-400/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
              Verified Successfully!
            </div>
          ) : (
            <Button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              {isVerifying ? "Verifying..." : "Verify Now"}
            </Button>
          )}
          <button 
            onClick={() => setHidden(true)}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
