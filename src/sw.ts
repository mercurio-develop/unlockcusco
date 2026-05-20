import { Serwist, NetworkFirst, StaleWhileRevalidate, CacheFirst, ExpirationPlugin } from "serwist";
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (string | PrecacheEntry)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    {
      // Cache Mapbox tiles
      matcher: /^https:\/\/api\.mapbox\.com\/.*/,
      handler: new StaleWhileRevalidate({
        cacheName: "mapbox-tiles",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          }),
        ],
      }),
    },
    {
      // Cache business images
      matcher: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: new CacheFirst({
        cacheName: "images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          }),
        ],
      }),
    },
    {
      // Cache itinerary data
      matcher: /\/api\/itinerary\/.*/,
      handler: new NetworkFirst({
        cacheName: "itineraries",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();
