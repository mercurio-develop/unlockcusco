/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Business } from "@prisma/client";
import { Star, MessageCircle, MapPin } from "lucide-react";
import {
  AsociadoBadge,
  GastronomicTemplate,
  ExpeditionTemplate,
  SanctuaryTemplate,
  StaysTemplate,
  CultureTemplate,
} from "@/features/discovery";
import { SafeImageWrapper } from "@/components/ui/safe-image";
import { ScrollCarousel } from "@/components/ui/scroll-carousel";
import { ExpandableText } from "@/components/ui/expandable-text";
import { BackButton } from "@/components/ui/back-button";
import { BusinessCard } from "./business-card";
import { ComparableExperiences } from "./comparable-experiences";
import { VerifyOverlay } from "./verify-overlay";
import {
  AffiliateBookingButtons,
  type AffiliateLink,
} from "./affiliate-booking-buttons";
import type { Locale } from "@/paths";
import type { BusinessJsonLd, BusinessWithRelations } from "../types/business-detail";
import { buildWhatsappMessage } from "../utils/business-detail-helpers";

interface BusinessDetailViewProps {
  business: BusinessWithRelations;
  lang: Locale;
  dict: Record<string, any>;
  verifyToken?: string;
  display: {
    isEs: boolean;
    bName: string;
    categoryName: string;
    locationName: string;
  };
  images: string[];
  theme: {
    primaryColor?: string | null;
    accentColor?: string | null;
    fonts: string[];
    displayFont: string | null;
    bodyFont: string | null;
    isDarkTheme: boolean;
  };
  jsonLd: BusinessJsonLd;
  breadcrumbJsonLd: Record<string, unknown>;
  comparableExperiences: Business[];
  nearbyStays: Business[];
  nearbyDining: Business[];
}

export function BusinessDetailView({
  business,
  lang,
  dict,
  verifyToken,
  display,
  images,
  theme,
  jsonLd,
  breadcrumbJsonLd,
  comparableExperiences,
  nearbyStays,
  nearbyDining,
}: BusinessDetailViewProps) {
  const { isEs, bName, categoryName, locationName } = display;
  const { primaryColor, accentColor, fonts, displayFont, bodyFont, isDarkTheme } = theme;
  const whatsappMsg = buildWhatsappMessage(business.name, isEs);

  return (
    <main className="-mt-12 min-h-screen bg-gray-50 pb-24 lg:pb-12 relative selection:bg-rose-100 selection:text-rose-900">
      {/* Dynamic Premium Styles */}
      {business.premiumProfile && (
        <>
          {(displayFont || bodyFont) && (
            <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${displayFont ? `family=${displayFont}:wght@400;700&` : ''}${bodyFont ? `family=${bodyFont}:wght@400;500;700&` : ''}display=swap`} />
          )}
          <style dangerouslySetInnerHTML={{__html: `
            ${displayFont ? `.premium-font-display { font-family: '${fonts[0]}', serif !important; }` : ''}
            ${bodyFont ? `.premium-font-body { font-family: '${fonts[1]}', sans-serif !important; }` : ''}
            ${primaryColor ? `
              .premium-page-bg { background-color: ${primaryColor} !important; }
              .premium-text-primary { color: ${primaryColor} !important; }
              .premium-text-main { color: ${isDarkTheme ? '#ffffff' : '#0f172a'} !important; }
              .premium-text-muted { color: ${isDarkTheme ? 'rgba(255,255,255,0.6)' : '#64748b'} !important; }
              .premium-card-bg { background-color: ${primaryColor} !important; }
              .premium-card-border { border-color: ${isDarkTheme ? 'rgba(255,255,255,0.1)' : '#f1f5f9'} !important; }
            ` : ''}
            ${accentColor ? `
              .premium-accent-bg { background-color: ${accentColor} !important; color: ${isDarkTheme ? '#000000' : '#ffffff'} !important; }
              .premium-accent-text { color: ${accentColor} !important; }
            ` : ''}
          `}} />
        </>
      )}

      {verifyToken && business.verificationToken === verifyToken && (
        <VerifyOverlay businessId={business.id} token={verifyToken} lang={lang} />
      )}
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="absolute top-16 lg:top-4 left-4 lg:left-auto lg:right-[calc(50%+24rem+1rem)] z-50">
        <BackButton className="bg-white/80 backdrop-blur-md shadow-sm" />
      </div>

      {/* 1. Hero Image */}
      <section className="relative w-full h-[40vh] min-h-[300px] lg:h-[50vh] lg:max-w-6xl lg:mx-auto lg:rounded-b-3xl overflow-hidden bg-slate-200 shadow-sm">
        {images.length > 0 ? (
          <div className="relative w-full h-full flex-shrink-0">
            <SafeImageWrapper 
              src={images[0]} 
              alt={bName || ''} 
              wrapperClassName="w-full h-full"
              imgClassName="w-full h-full object-cover"
              priority={true}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            No image available
          </div>
        )}

        {/* Centered Logo Overlay */}
        {business.premiumProfile?.logoUrl && (
          <div className="absolute inset-0 m-auto w-48 h-48 md:w-72 md:h-72 z-10 flex items-center justify-center">
            <div className="relative w-full h-full drop-shadow-2xl">
              <SafeImageWrapper 
                src={business.premiumProfile.logoUrl} 
                alt={`${bName} logo`} 
                wrapperClassName="w-full h-full drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                imgClassName="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Trust Signal Overlay */}
        <div className="absolute -bottom-4 right-6 md:right-8 z-10 bg-white px-4 py-1.5 rounded-full shadow-md border border-slate-100 flex items-center gap-1 lg:hidden">
           <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
           <span className="font-medium text-sm text-slate-900">{business.rating?.toFixed(1) || 'New'}</span>
           <span className="text-xs text-slate-500 ml-1">({business.reviewsCount || 0})</span>
        </div>
      </section>

      {/* Main Grid Layout */}
      <div className={`lg:max-w-6xl lg:mx-auto lg:px-6 lg:py-12 lg:grid lg:grid-cols-3 lg:gap-12 ${business.premiumProfile ? 'premium-font-body' : ''}`}>

        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2">
          {/* 2. Header Section */}
          <section className="px-6 md:px-8 lg:px-0 pt-8 lg:pt-0 pb-6 bg-white lg:bg-transparent -mt-6 lg:mt-0 relative z-20 rounded-t-[2rem] lg:rounded-none">
            <div className="flex items-start justify-between gap-4">
              <h1 className={`text-3xl lg:text-4xl font-serif leading-tight ${business.premiumProfile ? 'premium-font-display premium-text-primary' : 'text-slate-900'}`}>
                {bName}
              </h1>
              {business.isAsociado && <AsociadoBadge className="mt-1 flex-shrink-0" />}
            </div>

            {/* Quick Info Strip */}
            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-slate-600 mb-6">
              <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium text-slate-700">{categoryName}</span>
              <span>•</span>
              <span className="font-medium">{business.priceTier || '$$'}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                 <MapPin className="w-3.5 h-3.5" />
                 <span>{locationName}</span>
              </div>
            </div>

            {/* Business Description */}
            {business.description && (
              <div className="mt-4">
                <ExpandableText text={business.description} maxLength={180} />
              </div>
            )}
          </section>

          {/* 3. Category-Specific Body */}
          <div className="bg-white lg:bg-transparent p-2">
            {(business.category?.toLowerCase() === 'dining') && (
              <GastronomicTemplate business={business as any} dict={dict} />
            )}
            {(business.category?.toLowerCase() === 'agency' || business.category?.toLowerCase() === 'adventure') && (
              <ExpeditionTemplate business={business as any} dict={dict} />
            )}
            {(business.category?.toLowerCase() === 'wellness') && (
              <SanctuaryTemplate business={business as any} dict={dict} />
            )}
            {(business.category?.toLowerCase() === 'stays') && (
              <StaysTemplate business={business as any} dict={dict} />
            )}
            {(business.category?.toLowerCase() === 'culture' || business.category?.toLowerCase() === 'shopping' || business.category?.toLowerCase() === 'boleto') && (
              <CultureTemplate business={business as any} dict={dict} />
            )}
          </div>

          {/* 4. Reviews Section */}
          {business.reviews && business.reviews.length > 0 && (
             <section className="px-4 lg:px-0 py-8 bg-slate-50 lg:bg-transparent">
                <h2 className="text-xl lg:text-2xl font-serif text-slate-900 mb-6">{dict.business.reviews}</h2>
                <ScrollCarousel className="-mx-4 px-4 pb-4 lg:mx-0 lg:px-0 items-stretch">
                  {business.reviews.map((review) => (
                    <div key={review.id} className="w-[280px] lg:w-[320px] flex-shrink-0 flex flex-col bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                          {review.author?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{review.author}</p>
                          <div className="flex mt-0.5">
                            {[...Array(review.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <ExpandableText text={isEs ? (review.textEs || review.text || '') : (review.textEn || review.text || '')} maxLength={180} />
                    </div>
                  ))}
                </ScrollCarousel>
             </section>
          )}
        </div>

        {/* Right Column (Sticky Action Card) */}
        <div className="lg:col-span-1 mt-8 lg:mt-0">
          <div className="sticky top-24 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            {/* Trust Signal */}
            <div className="flex flex-col items-center justify-center mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                <span className="font-bold text-2xl text-slate-900">{business.rating?.toFixed(1) || 'New'}</span>
              </div>
              <span className="text-sm font-medium text-slate-500 underline decoration-slate-200 cursor-pointer hover:text-slate-900 transition-colors">
                {business.reviewsCount || 0} {dict.business.reviews}
              </span>
            </div>

            {/* Affiliate Links */}
            {Array.isArray(business.affiliateLinks) && business.affiliateLinks.length > 0 && (
              <div className="mb-6">
                <AffiliateBookingButtons links={business.affiliateLinks as unknown as AffiliateLink[]} />
              </div>
            )}

            {/* Desktop CTA */}
            {business.category?.toUpperCase() !== 'BOLETO' && (
              <>
                {business.whatsapp && (business.isClaimed || business.isAsociado) ? (
                  <a
                    href={`https://wa.me/51${business.whatsapp.replace(/\D/g, '')}?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-4 px-4 rounded-xl text-white font-bold text-[15px] shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    style={{ 
                      backgroundColor: '#25D366' // WhatsApp Green
                    }}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {isEs ? 'Contactar por WhatsApp' : 'Contact via WhatsApp'}
                  </a>
                ) : (
                  <button 
                    disabled
                    className="flex items-center justify-center w-full py-4 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-[15px]"
                  >
                    {isEs ? 'Contacto no disponible' : 'Contact Not Available'}
                  </button>
                )}
                
                {business.whatsapp && (business.isClaimed || business.isAsociado) && (
                  <p className="text-center text-xs font-medium text-slate-400 mt-4 uppercase tracking-widest">
                    {dict.business.replyTime || "Usually replies within 1 hour"}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Comparable Experiences */}
      <ComparableExperiences experiences={comparableExperiences} isEs={isEs} dict={dict} />

      {/* Nearby Stays and Dining */}
      {(nearbyStays.length > 0 || nearbyDining.length > 0) && (
        <div className="lg:max-w-6xl lg:mx-auto lg:px-6 pt-4 pb-12">
          {nearbyStays.length > 0 && (
            <section className="px-4 lg:px-0 py-8 border-t border-slate-200/60">
              <h2 className="text-xl lg:text-2xl font-serif text-slate-900 mb-6">{isEs ? 'Alojamientos Cercanos' : 'Nearby Stays'}</h2>
              <ScrollCarousel className="-mx-4 px-4 pb-4 lg:mx-0 lg:px-0 items-stretch">
                {nearbyStays.map((stay) => (
                  <div key={stay.id} className="w-[280px] lg:w-[320px] flex-shrink-0 flex flex-col">
                    <BusinessCard
                      business={stay}
                      orientation="vertical"
                      showItineraryAdd={true}
                      dict={dict}
                    />
                  </div>
                ))}
              </ScrollCarousel>
            </section>
          )}

          {nearbyDining.length > 0 && (
            <section className="px-4 lg:px-0 py-8 border-t border-slate-200/60">
              <h2 className="text-xl lg:text-2xl font-serif text-slate-900 mb-6">{isEs ? 'Restaurantes Cercanos' : 'Nearby Dining'}</h2>
              <ScrollCarousel className="-mx-4 px-4 pb-4 lg:mx-0 lg:px-0 items-stretch">
                {nearbyDining.map((dining) => (
                  <div key={dining.id} className="w-[280px] lg:w-[320px] flex-shrink-0 flex flex-col">
                    <BusinessCard
                      business={dining}
                      orientation="vertical"
                      showItineraryAdd={true}
                      dict={dict}
                    />
                  </div>
                ))}
              </ScrollCarousel>
            </section>
          )}
        </div>
      )}
    </main>
  )
}
