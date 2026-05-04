export const homePath = () => "/";

export const explorePath = (query?: string) => 
  query ? `/explore?q=${encodeURIComponent(query)}` : "/explore";

export const servicesPath = () => "/services";

export const travelDesignPath = () => "/travel-design";

export const exploreCategoryPath = (locationSlug: string, categorySlug: string) => 
  `/explore/${locationSlug}/${categorySlug}`;

export const businessPath = (businessId: string) => 
  `/business/${businessId}`;

export const claimPath = (businessId: string) => 
  `/claim/${businessId}`;

export const checkoutPath = (businessId: string) => 
  `/claim/${businessId}/checkout`;

export const dashboardPath = () => "/dashboard";

export const agenciesPath = () => "/services/agencies";

export const agencyPath = (slug: string) => `/services/agencies/${slug}`;

export const therapistsPath = () => "/services/healers";

export const therapistPath = (slug: string) => `/services/healers/${slug}`;

export const transportPath = () => "/services/transport";

export const restaurantsPath = () => "/services/restaurants";

export const lodgingPath = () => "/services/lodging";
