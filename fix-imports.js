const fs = require('fs');

function updateNavbar() {
    const file = 'src/components/layout/navbar.tsx';
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('useUiStore')) {
        // Just in case
    }
    content = content.replace(
        /import\s+{\s*Menu,\s*Map,\s*List\s*}\s*from\s*"lucide-react"/,
        'import { Menu, Map, List } from "lucide-react"\nimport { useUiStore } from "@/lib/store/use-ui-store"'
    );
    fs.writeFileSync(file, content);
}

function updateTaxiCard() {
    const file = 'src/features/concierge/components/taxi-fare-card.tsx';
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        /import\s+{\s*MapPin\s*}\s*from\s*"lucide-react"/,
        'import { MapPin } from "lucide-react"\nimport { useUiStore } from "@/lib/store/use-ui-store"\nimport { useItineraryStore } from "@/lib/store/use-itinerary-store"'
    );
    fs.writeFileSync(file, content);
}

function updateUseMapboxRoute() {
    const file = 'src/features/discovery/hooks/use-mapbox-route.ts';
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        /interface\s+RouteData/,
        'export interface RouteData'
    );
    fs.writeFileSync(file, content);
}

updateNavbar();
updateTaxiCard();
updateUseMapboxRoute();
