/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const glob = require('glob'); // Note: we can use a recursive function instead if glob is not guaranteed to be installed.

const files = [
  'src/features/agencies/components/layouts/ExpeditionOnePage.tsx',
  'src/app/services/agencies/[slug]/page.tsx',
  'src/features/agencies/components/AvailabilityForm.tsx',
  'src/features/agencies/components/AgencyAbout.tsx',
  'src/features/agencies/components/AgencyCard.tsx',
  'src/features/agencies/components/AgencyHero.tsx',
  'src/features/agencies/components/layouts/SanctuaryOnePage.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/agency\./g, 'business.');
    content = content.replace(/\{\s*agency\s*\}/g, '{ business }');
    content = content.replace(/agency:/g, 'business:');
    content = content.replace(/agencyId:/g, 'businessId:');
    content = content.replace(/agencyId\b/g, 'businessId');
    fs.writeFileSync(file, content, 'utf8');
  }
}
