# InkaPortal - Project Context & Deep Thinking Brief

This document serves as a comprehensive context brief for Gemini Deep Thinking, detailing the current state, architecture, recent accomplishments, and missing features of the **InkaPortal** MVP.

## 1. Project Overview
**InkaPortal** is an AI-powered local business discovery platform for the Sacred Valley, Peru. 
- **User Flow:** Tourists search and book experiences via an AI Concierge or Explore Map.
- **Business Flow:** Local businesses claim their shadow profile to receive direct WhatsApp leads.
- **MVP Monetization:** S/5 one-time identity validation + S/49/month subscription.
- **Tech Stack:** Next.js 16 (App Router), React, TailwindCSS v4, Mapbox GL (3D terrain), Prisma (SQLite), Google GenAI SDK (Gemini 2.5 Flash/Pro).

## 2. Recent Accomplishments & Stabilizations
- **Branding Unification:** Completely transitioned all legacy "Valle" and "OpenClaw" references to "InkaPortal".
- **Apple-Level UI/UX:** Refactored the Navbar to a fixed, full-width frosted glass header (`backdrop-blur-xl`). Addressed layout overlaps and ensured Next.js `<Image>` component optimizations across all pages.
- **Smart Data Sorting:** Replaced basic sorting with a weighted algorithm `(rating * log10(reviewsCount + 10))` and implemented category interleaving to ensure diverse, high-quality experiences surface first.
- **Live Taxi Dispatch Integration:** Upgraded the AI Concierge's `estimateTaxiFare` tool. It now calculates distance/time, estimates costs, queries the live SQLite database for top-rated local transport, and generates a one-click WhatsApp booking link.
- **Data Hygiene Pipeline:** Created a Python CLI (`scripts/clean_db.py`) to systematically purge out-of-bounds geographic locations, prune low-review businesses, and strip messy scraping artifacts from titles (e.g., removing ", Cusco" or " - Restaurant").
- **Cost Control:** Implemented strict token limits (`maxTokens: 300`) and prompt engineering to enforce brevity and minimize API costs during the bootstrapping phase.
- **Routing Overhaul:** Stripped brittle `slug` logic from the schema and routing, switching to robust UUID-based routing for business detail pages.

## 3. Pending Features (The Backlog)
These are the immediate next steps required for MVP launch:
1. **Infrastructure (Vercel):** Setup Vercel deployment configuration and ensure environment variables are mapped correctly.
2. **Infrastructure (Husky):** Configure Husky for automated pre-commit hooks (linting & testing) to maintain a zero-error codebase.
3. **AI Concierge Data:** Connect the AI Concierge to fully leverage the live Apify data stored in Prisma, moving completely away from static/dummy context.
4. **Payments:** Finalize and rigorously test the payment gateway flow for local businesses claiming their profiles.
5. **Testing:** Add comprehensive tests for the internal Project Manager API route.

## 4. Known Technical Debt & Architectural Hacks
- **The "Ghost Phone" Architecture:** To bypass the prohibitive costs of the official Meta WhatsApp API, the system relies on a localized hardware hack—a Node.js microservice connected to a physical 5-Soles Peruvian prepaid SIM card. 
- **Manual Payouts (Geographic Arbitrage):** When a tourist pays in USD via Stripe, the platform captures a forex spread. However, the payout to the local business owner requires an admin to manually scan a Yape QR code.

## 5. Future Roadmap (Project Khipu)
- **Enterprise BCP/Yape API:** Automate the manual payout flow once processing $10k+/month.
- **IoT Telemetry:** Deploy $4 ESP32 Wi-Fi sniffers in local cafes to generate real-time 3D density maps of tourist crowds.
- **Algorithmic Arbitrage:** Utilize telemetry data (e.g., train delays) to trigger "Surge Pricing" or send WhatsApp flash-sale rescue offers to stranded tourists.