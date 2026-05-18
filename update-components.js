const fs = require('fs');
const path = require('path');

// Update BusinessCard
const bcPath = path.join(__dirname, 'src/features/discovery/components/business-card.tsx');
let bcContent = fs.readFileSync(bcPath, 'utf8');

// Add dict prop
bcContent = bcContent.replace(
  /mapTargetId\?: string/,
  "mapTargetId?: string\n  dict?: any"
);

// Add getLocalizedField import
if (!bcContent.includes('getLocalizedField')) {
  bcContent = bcContent.replace(
    /import \{ cn \} from "@\/lib\/utils"/,
    "import { cn } from \"@/lib/utils\"\nimport { getLocalizedField } from \"@/lib/utils/localization\""
  );
}

// Update component signature
bcContent = bcContent.replace(
  /mapTargetId,\n(\s*)\}: BusinessCardProps/,
  "mapTargetId,\n  dict,\n$1}: BusinessCardProps"
);

// Remove old inline translation
bcContent = bcContent.replace(
  /  const locale = pathname\?\.split\('\/'\)\[1\] \|\| 'en'\n  const isEs = locale === 'es'\n\n  const t = isEs \? \{[\s\S]*?\} : \{[\s\S]*?\}/,
  "  const locale = pathname?.split('/')[1] || 'en'\n  const t = dict?.businessCard || {\n    viewProfile: \"View Profile\",\n    whatsapp: \"WhatsApp\",\n    requiresBoleto: \"Requires Boleto Turístico\",\n    boletoTitle: \"Cusco Tourist Ticket (BTC)\",\n    boletoDesc1: \"This site requires the\",\n    boletoDesc2: \"It's a unified government-managed ticket allowing access to up to 16 major archaeological sites and museums in Cusco and the Sacred Valley.\",\n    options: \"Options:\",\n    fullTicket: \"Full Ticket (130 Soles):\",\n    fullTicketDesc: \"Valid for 10 days. Includes all 16 sites across Cusco, Sacred Valley, and South Valley.\",\n    partialTicket: \"Partial Ticket (70 Soles):\",\n    partialTicketDesc: \"Valid for 1-2 days for a specific circuit (e.g., Sacred Valley ruins only).\",\n    note: \"Note: The ticket cannot be purchased online in advance. It must be bought in person at the COSITUC office (Av. El Sol 103, Cusco) or at the entrance of the first site you visit.\",\n    gotIt: \"Got it\",\n    selected: \"Selected\",\n    swap: \"Swap\",\n    exchange: \"Exchange\",\n    add: \"Add\",\n    map: \"Map\",\n    details: \"Details\",\n    verified: \"Verified\"\n  }"
);

// Replace hardcoded spans
bcContent = bcContent.replace(/<span className="hidden sm:inline">Add<\/span>/g, '<span className="hidden sm:inline">{t.add}</span>');
bcContent = bcContent.replace(/<span className="hidden sm:inline">Map<\/span>/g, '<span className="hidden sm:inline">{t.map}</span>');
bcContent = bcContent.replace(/<span className="hidden sm:inline">Details<\/span>/g, '<span className="hidden sm:inline">{t.details}</span>');
bcContent = bcContent.replace(/<span className="hidden sm:inline">WhatsApp<\/span>/g, '<span className="hidden sm:inline">{t.whatsapp}</span>');

// Replace bName and bDesc
bcContent = bcContent.replace(
  /const bName = isEs && business\.nameEs \? business\.nameEs : business\.name/,
  "const bName = getLocalizedField(business, 'name', locale)"
);

bcContent = bcContent.replace(
  /const bDesc = isEs && business\.descriptionEs \? business\.descriptionEs : business\.description/,
  "const bDesc = getLocalizedField(business, 'description', locale)"
);

// We need to fix the category and specialties using the helper too if possible, but let's do description first.
bcContent = bcContent.replace(
  /const displayCategory = isEs && business\.categoryEs \? business\.categoryEs : catData\.label;/,
  "const displayCategory = getLocalizedField(business, 'category', locale) || catData.label;"
);

// Remove any remaining isEs usages
bcContent = bcContent.replace(/isEs && /g, "");

fs.writeFileSync(bcPath, bcContent);

console.log("BusinessCard updated");
