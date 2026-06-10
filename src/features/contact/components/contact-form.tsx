"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { sendContactEmail } from "../actions/send-contact-email";

export function ContactForm({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push(`/${lang}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, lang, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await sendContactEmail(formData);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto w-full text-center relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600 shadow-sm border border-rose-200">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6 tracking-tight">
          {isEs ? "¡Mensaje enviado!" : "Message sent!"}
        </h3>
        <p className="text-slate-600 text-lg font-light leading-relaxed max-w-md">
          {isEs
            ? "Gracias por contactarnos. Nos pondremos en contacto contigo pronto. Redirigiendo al inicio..."
            : "Thank you for reaching out. We will get back to you shortly. Redirecting to home..."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 md:p-12 relative z-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-slate-900 mb-4">
          {isEs ? "Contáctanos" : "Contact Us"}
        </h1>
        <p className="text-slate-600 text-lg font-light leading-relaxed">
          {isEs
            ? "¿Tienes alguna pregunta o necesitas ayuda con tu viaje? Envíanos un mensaje y te responderemos pronto."
            : "Have a question or need help with your trip? Send us a message and we'll get back to you shortly."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2.5">
          <Label htmlFor="name" className="text-slate-700 font-medium">{isEs ? "Nombre" : "Name"}</Label>
          <Input 
            id="name" 
            name="name" 
            required 
            placeholder={isEs ? "Tu nombre" : "Your name"} 
            className="rounded-xl px-4 py-6 text-base bg-slate-50/50 border-slate-200 focus-visible:ring-rose-500/20 focus-visible:border-rose-500 transition-all"
          />
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="email" className="text-slate-700 font-medium">{isEs ? "Correo electrónico" : "Email"}</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            required 
            placeholder={isEs ? "tu@correo.com" : "you@email.com"} 
            className="rounded-xl px-4 py-6 text-base bg-slate-50/50 border-slate-200 focus-visible:ring-rose-500/20 focus-visible:border-rose-500 transition-all"
          />
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="message" className="text-slate-700 font-medium">{isEs ? "Mensaje" : "Message"}</Label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            placeholder={isEs ? "¿En qué podemos ayudarte?" : "How can we help you?"}
            className="flex w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-rose-500/20 focus-visible:border-rose-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
          />
        </div>

        {error && (
          <div className="text-sm text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100">
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full rounded-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-6 text-base shadow-md hover:shadow-lg transition-all"
        >
          {loading 
            ? (isEs ? "Enviando..." : "Sending...") 
            : (isEs ? "Enviar mensaje" : "Send message")}
        </Button>
      </form>
    </div>
  );
}
