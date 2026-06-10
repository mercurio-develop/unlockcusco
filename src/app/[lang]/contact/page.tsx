import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { ContactForm } from "@/features/contact/components/contact-form";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const isEs = lang === "es";
  const title = isEs ? "Contacto | UNLOCKCUSCO" : "Contact | UNLOCKCUSCO";
  const description = isEs
    ? "Contáctanos para cualquier duda, sugerencia o ayuda con tu viaje a Cusco."
    : "Contact us for any questions, suggestions, or help with your trip to Cusco.";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/${lang}/contact`,
      languages: {
        en: `${siteConfig.url}/en/contact`,
        es: `${siteConfig.url}/es/contact`,
        "x-default": `${siteConfig.url}/en/contact`,
      },
    },
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { lang } = await params;

  return (
    <div className="bg-slate-50 min-h-[90vh] py-20 px-6 flex flex-col justify-center relative overflow-hidden">
      {/* Soft background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-rose-100/50 blur-[100px] rounded-full z-0 pointer-events-none" />

      <ContactForm lang={lang} />
    </div>
  );
}
