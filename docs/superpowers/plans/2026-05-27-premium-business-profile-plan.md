# Premium Business Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a mobile-first, category-specific redesign of the verified business profile page.

**Architecture:** Refactor the main `page.tsx` to act as a "Global Shell" featuring a hero carousel, trust badges, and a sticky WhatsApp footer. It will then dynamically render the appropriate `*Template` component based on the business category for the body content.

**Tech Stack:** Next.js App Router, Tailwind CSS, Prisma, React (lucide-react)

---

### Task 1: Refactor `page.tsx` Global Shell (Hero & Header)

**Files:**
- Modify: `src/app/[lang]/business/[slug]/page.tsx`

- [ ] **Step 1: Simplify and update the layout structure**
Refactor the main `BusinessPage` component. Remove the old layout and implement the new mobile-first top section: Hero Carousel, floating Trust Badge, and Header info.

```tsx
// Inside src/app/[lang]/business/[slug]/page.tsx
// Ensure you have these imports:
// import { Star, MessageCircle, MapPin, Clock } from "lucide-react"

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug, lang } = await params
  const dict = await getDictionary(lang as Locale)
  const isEs = lang === 'es'

  const business = await prisma.business.findUnique({
    where: { slug: slug },
    include: { 
      premiumProfile: { include: { pillars: true } },
      services: true,
      tourPackages: true,
      reviews: true
    }
  }) as BusinessWithRelations;

  if (!business) {
    notFound()
  }

  // Safe fallback for images
  let galleryImages = [business.imageUrl]
  try {
    const parsed = JSON.parse(business.heroImages)
    if (Array.isArray(parsed) && parsed.length > 0) galleryImages = parsed
  } catch (e) {
    // Keep fallback
  }

  const bName = isEs && business.nameEs ? business.nameEs : business.name

  return (
    <main className="min-h-screen bg-gray-50 pb-24 relative selection:bg-rose-100 selection:text-rose-900">
      <BackButton className="absolute top-4 left-4 z-50 bg-white/80 backdrop-blur-md shadow-sm" />
      
      {/* 1. Hero Image Carousel */}
      <section className="relative w-full h-[40vh] min-h-[300px] bg-slate-200">
        <ScrollCarousel items={galleryImages} className="w-full h-full">
          {(url) => (
            <div className="relative w-screen h-[40vh] min-h-[300px] flex-shrink-0">
               <SafeImageWrapper 
                  src={url} 
                  alt={bName} 
                  fill 
                  className="object-cover"
                  priority
                />
            </div>
          )}
        </ScrollCarousel>
        
        {/* Trust Signal Overlay */}
        <div className="absolute -bottom-4 right-4 z-10 bg-white px-4 py-1.5 rounded-full shadow-md border border-slate-100 flex items-center gap-1">
           <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
           <span className="font-medium text-sm text-slate-900">{business.rating?.toFixed(1) || 'New'}</span>
           <span className="text-xs text-slate-500 ml-1">({business.reviewsCount})</span>
        </div>
      </section>

      {/* 2. Header Section */}
      <section className="px-4 pt-8 pb-6 bg-white">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-serif text-slate-900 leading-tight">
            {bName}
          </h1>
          {business.isAsociado && <AsociadoBadge className="mt-1 flex-shrink-0" />}
        </div>
        
        {/* Quick Info Strip */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-600">
          <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium text-slate-700">{business.category}</span>
          <span>•</span>
          <span className="font-medium">{business.priceTier || '$$'}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
             <MapPin className="w-3.5 h-3.5" />
             <span>{business.locationSlug}</span>
          </div>
        </div>
      </section>

      {/* BODY CONTENT WILL GO HERE IN TASK 2 */}
      
      {/* 4. Reviews Section (Placeholder for now, keep existing or build new) */}
      {business.reviews.length > 0 && (
         <section className="px-4 py-8 bg-slate-50">
            <h2 className="text-xl font-serif text-slate-900 mb-4">Reviews</h2>
            <ScrollCarousel items={business.reviews} className="-mx-4 px-4 pb-4">
              {(review) => (
                <div className="w-[280px] flex-shrink-0 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-medium">
                      {review.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900">{review.author}</p>
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-3">{review.text}</p>
                </div>
              )}
            </ScrollCarousel>
         </section>
      )}

      {/* STICKY CTA WILL GO HERE IN TASK 3 */}
    </main>
  )
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No new type errors.

### Task 2: Implement Dynamic Category Body

**Files:**
- Modify: `src/app/[lang]/business/[slug]/page.tsx`

- [ ] **Step 1: Add the dynamic switch statement**
Insert the logic to render the correct template between the Header and the Reviews section.

```tsx
// Insert this block right after the Header section (`</section>`) in page.tsx

      {/* 3. Category-Specific Body */}
      <div className="bg-white">
        {business.category === 'DINING' && (
          <GastronomicTemplate business={business} dict={dict} />
        )}
        {business.category === 'TOURS' && (
          <ExpeditionTemplate business={business} dict={dict} />
        )}
        {business.category === 'WELLNESS' && (
          <SanctuaryTemplate business={business} dict={dict} />
        )}
        {business.category === 'STAYS' && (
          <StaysTemplate business={business} dict={dict} />
        )}
        {(business.category === 'CULTURE' || business.category === 'SHOPPING') && (
          <CultureTemplate business={business} dict={dict} />
        )}
      </div>
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors.

### Task 3: Implement Sticky WhatsApp CTA

**Files:**
- Modify: `src/app/[lang]/business/[slug]/page.tsx`

- [ ] **Step 1: Add the Sticky Action Bar**
At the very bottom of the `<main>` tag, add the sticky footer.

```tsx
// Insert this block right before the closing `</main>` tag in page.tsx

      {/* 5. Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 z-40 pb-safe">
        {business.whatsapp ? (
          <a
            href={`https://wa.me/${business.whatsapp}?text=Hola%20${encodeURIComponent(business.name)},%20I%20found%20you%20on%20UnlockCusco!`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full py-3.5 px-4 rounded-xl text-white font-medium text-[15px] shadow-sm transition-transform active:scale-[0.98]"
            style={{ 
              backgroundColor: business.premiumProfile?.primaryColor || '#10b981' // WhatsApp Green default
            }}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Contact via WhatsApp
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

- [ ] **Step 2: Add CSS utility for safe area**
If `pb-safe` doesn't exist, ensure padding is sufficient. We added `pb-24` to `<main>` in Task 1 which covers the space.

- [ ] **Step 3: Run type check and commit**

Run: `npx tsc --noEmit`
Expected: PASS

```bash
git add src/app/[lang]/business/[slug]/page.tsx
git commit -m "feat(ui): implement mobile-first business profile layout with sticky whatsapp cta"
```

### Task 4: Enhance Existing Templates (Optional/Cleanup)
*If the existing templates in `src/features/discovery/components/templates/` have structural padding that conflicts with the new shell (e.g., they have their own `<main>` tags or massive top margins), they should be cleaned up. Since we are injecting them into a `div` inside `page.tsx`, they should just be standard components.*

**Files:**
- Modify: `src/features/discovery/components/templates/*` (as needed based on inspection).

- [ ] **Step 1: Verify Template Cleanliness**
Review the template files. Ensure they return semantic HTML (like `<section>`) and do not have conflicting absolute positioning or full-screen height declarations that would break the mobile shell flow. Make minor styling adjustments (e.g., removing redundant headers if they existed).

- [ ] **Step 2: Commit template tweaks**
```bash
git add src/features/discovery/components/templates
git commit -m "style: adjust category templates to fit within new mobile shell"
```
