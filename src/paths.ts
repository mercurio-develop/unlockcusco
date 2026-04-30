export const homePath = () => "/";

export const explorePath = (query?: string) => 
  query ? `/explore?q=${encodeURIComponent(query)}` : "/explore";

export const servicesPath = () => "/explore?mode=service";

export const designPath = () => "/design";

export const exploreCategoryPath = (locationSlug: string, categorySlug: string) => 
  `/explore/${locationSlug}/${categorySlug}`;

export const businessPath = (businessId: string) => 
  `/business/${businessId}`;

export const claimPath = (businessId: string) => 
  `/claim/${businessId}`;

export const checkoutPath = (businessId: string) => 
  `/claim/${businessId}/checkout`;

export const dashboardPath = () => "/dashboard";

export const agenciesPath = () => "/agencies";

export const agencyPath = (slug: string) => `/agencies/${slug}`;

export const therapistsPath = () => "/therapists";

export const therapistPath = (slug: string) => `/therapists/${slug}`;
