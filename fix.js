const fs = require('fs');
let code = fs.readFileSync('src/lib/ai/tools/build-itinerary.ts', 'utf8');
code = code.replace(/function score\(rating: number, distKm: number\) \{\s*return \(scoreQuality \? scoreQuality \/ 20 : 0\) \* 0\.6 \+ Math\.max\(0, 10 - distKm\) \* 0\.4;\s*\}/, "function score(rating: number, distKm: number) { return (rating || 0) * 0.6 + Math.max(0, 10 - distKm) * 0.4; }");
fs.writeFileSync('src/lib/ai/tools/build-itinerary.ts', code);
