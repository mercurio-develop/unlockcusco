# Responsive Business Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adapt the mobile-first business profile page into a responsive "Editorial Split" layout for desktop and tablet screens without breaking the mobile view.

**Architecture:** We will constrain the hero section on large screens, wrap the main content in a grid layout (`lg:grid-cols-3`), and extract a new "Sticky Action Card" containing the WhatsApp CTA for the right column (`lg:col-span-1`). The existing mobile CTA will be hidden on large screens.

**Tech Stack:** Next.js App Router, Tailwind CSS, React

---

### Task 1: Refactor Layout Wrapper & Hero Section

**Files:**
- Modify: `src/app/[lang]/business/[slug]/page.tsx`

- [ ] **Step 1: Wrap Hero in a constrained container for large screens**
Update the `<section>` containing the Hero Image Carousel to be centered and rounded on large screens. Also, adjust the mobile back button to sit properly within the desktop constraints.

```tsx
// Inside src/app/[lang]/business/[slug]/page.tsx

// Locate the main tag:
// <main className="min-h-screen bg-gray-50 pb-24 relative selection:bg-rose-100 selection:text-rose-900">
// Change to:
    <main className="min-h-screen bg-gray-50 pb-24 lg:pb-12 relative selection:bg-rose-100 selection:text-rose-900">

// Locate the BackButton:
// <BackButton className="absolute top-4 left-4 z-50 bg-white/80 backdrop-blur-md shadow-sm" />
// Change to:
      <div className="absolute top-4 left-4 lg:left-auto lg:right-[calc(50%+24rem+1rem)] z-50">
        <BackButton className="bg-white/80 backdrop-blur-md shadow-sm" />
      </div>

// Locate the Hero Image Carousel section:
// <section className="relative w-full h-[40vh] min-h-[300px] bg-slate-200">
// Change to:
      <section className="relative w-full h-[40vh] min-h-[300px] lg:h-[50vh] lg:max-w-6xl lg:mx-auto lg:rounded-b-3xl overflow-hidden bg-slate-200 shadow-sm">
        <ScrollCarousel className="w-full h-full [&>div]:snap-start">
          {images.map((url, i) => (
            <div key={i} className="relative w-screen lg:w-full h-[40vh] min-h-[300px] lg:h-[50vh] flex-shrink-0">
               <SafeImageWrapper 
                  src={url} 
                  alt={bName || ''} 
                  wrapperClassName="w-full h-full"
                  imgClassName="w-full h-full object-cover"
                  priority={i === 0}
                />
            </div>
          ))}
        </ScrollCarousel>
        
        {/* Trust Signal Overlay */}
        <div className="absolute -bottom-4 right-4 z-10 bg-white px-4 py-1.5 rounded-full shadow-md border border-slate-100 flex items-center gap-1 lg:hidden">
           <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
           <span className="font-medium text-sm text-slate-900">{business.rating?.toFixed(1) || 'New'}</span>
           <span className="text-xs text-slate-500 ml-1">({business.reviewsCount || 0})</span>
        </div>
      </section>
```

- [ ] **Step 2: Run type check**
Run: `npx tsc --noEmit`
Expected: No errors.


### Task 2: Implement Editorial Split Grid & Right Card

**Files:**
- Modify: `src/app/[lang]/business/[slug]/page.tsx`

- [ ] **Step 1: Wrap existing content in grid and add right column**
Add the max-width grid container around everything below the hero section. Move the header, body, and reviews into the left column (`lg:col-span-2`), and add the new Sticky Action Card to the right column (`lg:col-span-1`). Hide the mobile bottom bar on desktop.

```tsx
// Inside src/app/[lang]/business/[slug]/page.tsx, immediately after the hero <section>

      {/* Main Grid Layout */}
      <div className="lg:max-w-6xl lg:mx-auto lg:px-6 lg:py-12 lg:grid lg:grid-cols-3 lg:gap-12">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2">
          {/* 2. Header Section */}
          <section className="px-4 lg:px-0 pt-8 lg:pt-0 pb-6 bg-white lg:bg-transparent -mt-6 lg:mt-0 relative z-20 rounded-t-[2rem] lg:rounded-none">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl lg:text-4xl font-serif text-slate-900 leading-tight">
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
          <div className="bg-white lg:bg-transparent">
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
                <ScrollCarousel className="-mx-4 px-4 pb-4 lg:mx-0 lg:px-0">
                  {business.reviews.map((review) => (
                    <div key={review.id} className="w-[280px] lg:w-[320px] flex-shrink-0 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
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
                      <ExpandableText text={review.text || ''} maxLength={180} />
                    </div>
                  ))}
                </ScrollCarousel>
             </section>
          )}
        </div>

        {/* Right Column (Sticky Action Card) - DESKTOP ONLY */}
        <div className="hidden lg:block lg:col-span-1">
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

            {/* Desktop CTA */}
            {business.whatsapp ? (
              <a
                href={`https://wa.me/51${business.whatsapp.replace(/\D/g, '')}?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full py-4 px-4 rounded-xl text-white font-bold text-[15px] shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  backgroundColor: business.premiumProfile?.primaryColor || '#10b981' 
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
                Contact Not Available
              </button>
            )}
            
            <p className="text-center text-xs font-medium text-slate-400 mt-4 uppercase tracking-widest">
              {dict.business.replyTime || "Usually replies within 1 hour"}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Sticky Action Bar - MOBILE ONLY */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 z-40 pb-safe">
        {business.whatsapp ? (
          <a
            href={`https://wa.me/51${business.whatsapp.replace(/\D/g, '')}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full py-3.5 px-4 rounded-xl text-white font-medium text-[15px] shadow-sm transition-transform active:scale-[0.98]"
            style={{ 
              backgroundColor: business.premiumProfile?.primaryColor || '#10b981' // WhatsApp Green default
            }}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {isEs ? 'Contactar por WhatsApp' : 'Contact via WhatsApp'}
          </a>
        ) : (
          <button 
            disabled
            className="flex items-center justify-center w-full py-3.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-medium text-[15px]"
          >
            Contact Not Available
          </button>
        )}
      </div>
```

*Note: Ensure to completely REPLACE the existing Header, Category Body, Reviews, and Sticky Action Bar with the combined grid structure provided above.*

- [ ] **Step 2: Run type check and commit**
Run: `npx tsc --noEmit`
Expected: PASS

```bash
git add src/app/[lang]/business/[slug]/page.tsx
git commit -m "feat(ui): implement responsive editorial split layout for desktop"
```