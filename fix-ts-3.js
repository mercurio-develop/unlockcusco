const fs = require('fs');

const replaceInFile = (file, search, replaceStr) => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  const newContent = content.replace(search, replaceStr);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log(`Updated ${file}`);
  }
};

// Revert scoreQuality where it shouldn't be
replaceInFile('src/features/concierge/components/ItinerarySummaryCard.tsx', /\(morning\.scoreQuality \? morning\.scoreQuality \/ 20 : 0\)/g, 'morning.rating');
replaceInFile('src/features/concierge/components/ItinerarySummaryCard.tsx', /\(afternoon\.scoreQuality \? afternoon\.scoreQuality \/ 20 : 0\)/g, 'afternoon.rating');
replaceInFile('src/components/trip/BasecampCarousel.tsx', /scoreQuality: number/g, 'rating: number');
replaceInFile('src/components/trip/BasecampCarousel.tsx', /scoreQuality: 4\.9/g, 'rating: 4.9');
replaceInFile('src/components/trip/BasecampCarousel.tsx', /scoreQuality: 4\.8/g, 'rating: 4.8');
replaceInFile('src/app/business/[slug]/page.tsx', /\(review\.scoreQuality \? review\.scoreQuality \/ 20 : 0\)/g, 'review.rating');
replaceInFile('src/features/therapists/data.ts', /scoreQuality: number/g, 'rating: number');
replaceInFile('src/features/therapists/data.ts', /scoreQuality: 4\.9/g, 'rating: 4.9');
replaceInFile('src/lib/ai/tools/get-business-details.ts', /businessName,/g, 'businessName: string,');

// Fix build-itinerary.ts
replaceInFile('src/lib/ai/tools/build-itinerary.ts', /businessType:\s*['"]\w+['"],?\s*/g, '');
replaceInFile('src/lib/ai/tools/build-itinerary.ts', /function score\(rating: number/g, 'function score(scoreQuality: number');
replaceInFile('src/lib/ai/tools/build-itinerary.ts', /\(selected\.scoreQuality \? selected\.scoreQuality \/ 20 : 0\)/g, '(selected as any).scoreQuality ? (selected as any).scoreQuality / 20 : 0');
replaceInFile('src/lib/ai/tools/build-itinerary.ts', /a\.zonesCount/g, '(a as any).zonesCount');
replaceInFile('src/lib/ai/tools/build-itinerary.ts', /b\.zonesCount/g, '(b as any).zonesCount');
replaceInFile('src/lib/ai/tools/build-itinerary.ts', /const ratingA = \(a\.scoreQuality \? a\.scoreQuality \/ 20 : 0\) \?\? 0;/g, 'const ratingA = (a as any).scoreQuality ? (a as any).scoreQuality / 20 : 0;');
replaceInFile('src/lib/ai/tools/build-itinerary.ts', /const ratingB = \(b\.scoreQuality \? b\.scoreQuality \/ 20 : 0\) \?\? 0;/g, 'const ratingB = (b as any).scoreQuality ? (b as any).scoreQuality / 20 : 0;');
replaceInFile('src/lib/ai/tools/build-itinerary.ts', /const ratingA = \(\(a as any\)\.scoreQuality \? \(a as any\)\.scoreQuality \/ 20 : 0\) \?\? 0;/g, 'const ratingA = (a as any).scoreQuality ? (a as any).scoreQuality / 20 : 0;');
replaceInFile('src/lib/ai/tools/build-itinerary.ts', /const ratingB = \(\(b as any\)\.scoreQuality \? \(b as any\)\.scoreQuality \/ 20 : 0\) \?\? 0;/g, 'const ratingB = (b as any).scoreQuality ? (b as any).scoreQuality / 20 : 0;');

// Fix fetch-accommodations.ts
replaceInFile('src/features/business/actions/fetch-accommodations.ts', /businessType:\s*['"]\w+['"],?\s*/g, '');

// Fix service-card.tsx
replaceInFile('src/components/cards/service-card.tsx', /service\.serviceZones/g, '(service as any).serviceZones');