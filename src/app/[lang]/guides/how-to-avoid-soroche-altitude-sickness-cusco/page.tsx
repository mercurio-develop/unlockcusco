import { Metadata } from "next";
import { Sparkles, Leaf } from "lucide-react";
import { getDictionary, Locale } from "@/lib/dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  return {
    title: dict.sorocheGuide.metadata.title,
    description: dict.sorocheGuide.metadata.description,
  };
}

export default async function SorocheGuidePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const content = dict.sorocheGuide;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": content.metadata.title,
            "description": content.metadata.description,
            "image": "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=1000&auto=format&fit=crop",
            "author": { "@type": "Organization", "name": "UnlockCusco" },
            "publisher": {
              "@type": "Organization",
              "name": "UnlockCusco",
              "logo": { "@type": "ImageObject", "url": "https://unlockcusco.com/icon.svg" }
            },
            "datePublished": new Date().toISOString().split('T')[0],
          })
        }}
      />
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
          {content.title}
        </h1>

        <p className="text-lg text-slate-600 mb-10 leading-relaxed">
          {content.desc}
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mb-4">{content.h2_1}</h2>
        <p className="text-slate-600 mb-8">{content.p1_1}</p>

        <h2 className="text-2xl font-bold text-slate-900 mb-4">{content.h2_2}</h2>
        <ul className="space-y-4 mb-8 text-slate-600 list-disc list-inside">
          <li><strong>{content.l2_1_strong}</strong>{content.l2_1_text}</li>
          <li><strong>{content.l2_2_strong}</strong>{content.l2_2_text}</li>
          <li><strong>{content.l2_3_strong}</strong>{content.l2_3_text}</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mb-4">{content.h2_3}</h2>
        <ul className="space-y-4 mb-8 text-slate-600 list-disc list-inside">
          <li><strong>{content.l3_1_strong}</strong>{content.l3_1_text}</li>
          <li><strong>{content.l3_2_strong}</strong>{content.l3_2_text}</li>
          <li><strong>{content.l3_3_strong}</strong>{content.l3_3_text}</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mb-4">{content.h2_4}</h2>
        <p className="text-slate-600 mb-12">{content.p4_1}</p>

        <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-xl">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-400" /> {content.callToAction}
            </h3>
            <p className="text-sm text-slate-300 mb-4">
              {content.callToActionDesc}
            </p>
            <button 
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-emerald-500 transition-colors"
            >
              {content.askAi} <Sparkles className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
