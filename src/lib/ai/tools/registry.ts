import { askAvailability } from './ask-availability';
import { askUserLocation } from './ask-user-location';
import { buildMacroTrip } from './build-macro-trip';
import { findNearby } from './find-nearby';
import { searchDatabase } from './search-database';
import { showBoletoInfo } from './show-boleto-info';
import { estimateTaxiFare } from './taxi-estimator';
import { triggerSupportAlert } from './trigger-support';
import { queryExpatsGuide } from './query-expats-guide';

// Export the native Vercel AI SDK tools
export const toolsRegistry = {
  askAvailability,
  askUserLocation,
  buildMacroTrip,
  findNearby,
  searchDatabase,
  showBoletoInfo,
  estimateTaxiFare,
  triggerSupportAlert,
  queryExpatsGuide
};
