import { ExternalLink } from "lucide-react";
import { ElementType } from "react";
import Image from "next/image";

export interface AffiliateProduct {
  title: string;
  subtitle: string;
  desc: string;
  why: string;
  perf: string;
  bestUse: string;
  icon: ElementType;
  color: string;
  link: string;
  image?: string;
}

export interface AffiliateLabels {
  why: string;
  perf: string;
  bestUse: string;
  buyOnAmazon: string;
}

export function AffiliateProductCard({ product, labels }: { product: AffiliateProduct, labels: AffiliateLabels }) {
  const Icon = product.icon;
  
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row">
      {product.image && (
        <div className="relative w-full md:w-72 h-64 md:h-auto shrink-0 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className={`p-6 border-b ${product.color}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 leading-tight">{product.title}</h3>
                <p className="text-sm font-medium opacity-80">{product.subtitle}</p>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8 space-y-6">
            <p className="text-slate-600 leading-relaxed m-0">{product.desc}</p>
            
            <div className="grid md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest m-0">{labels.why}</h4>
                <p className="text-sm text-slate-700 m-0">{product.why}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest m-0">{labels.perf}</h4>
                <p className="text-sm text-slate-700 m-0">{product.perf}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 m-0">{labels.bestUse}</h4>
              <p className="text-sm text-slate-700 m-0">{product.bestUse}</p>
            </div>

            <div className="pt-2">
              <a 
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3.5 bg-[#FF9900] hover:bg-[#F3A847] text-slate-900 font-bold rounded-xl transition-transform hover:scale-[1.02] shadow-sm no-underline"
              >
                {labels.buyOnAmazon}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
