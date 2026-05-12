import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  // output: 'export', // Enable this ONLY for final Capacitor build. Note: Requires refactoring all routes to be Client-side only.
  /* config options here */
  // Force server restart to load GEMINI_API_KEY from Google AI Studio
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "maps.googleapis.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "*.mapbox.com" },
      { protocol: "https", hostname: "*.apify.com" },
      // Allow localhost images in dev
      { protocol: "http", hostname: "localhost" },
    ],
  },
  turbopack: {},
};

export default withSerwist(nextConfig);
