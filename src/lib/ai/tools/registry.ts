 
import { askAvailability } from './ask-availability';
import { askUserLocation } from './ask-user-location';
import { buildMacroTrip } from './build-macro-trip';
import { searchDatabase } from './search-database';
import { showBoletoInfo } from './show-boleto-info';
import { estimateTaxiFare } from './taxi-estimator';
import { triggerSupportAlert } from './trigger-support';
import { queryExpatsGuide } from './query-expats-guide';
import { buildItinerary } from './build-itinerary';
import { mutateItinerary } from './mutate-itinerary';
import { generateSaveLink } from './save-itinerary';

// Export the native Vercel AI SDK tools
export const toolsRegistry = {
  askAvailability,
  askUserLocation,
  buildMacroTrip,
  searchDatabase,
  showBoletoInfo,
  estimateTaxiFare,
  triggerSupportAlert,
  queryExpatsGuide,
  buildItinerary,
  mutateItinerary,
  generateSaveLink
};
