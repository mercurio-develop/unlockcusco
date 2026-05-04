# Competitor Analysis Report: Wanderlog

**Date:** April 30, 2026  
**Focus Area:** Collaborative Itinerary Planning  

## 1. Executive Summary
Wanderlog functions as the "Google Docs for travel," solving the complexity of group travel by offering real-time, multi-user itinerary editing synced with a live map. Its collaborative features are a gold standard that Vallecito should study to enhance how groups coordinate and book expeditions in the Sacred Valley.

## 2. Key Findings & UX Teardown
*Wanderlog's collaboration is built around a single source of truth that updates instantly for all invited users.*
- **Strengths:** 
  - **Real-Time Editing:** Changes made by one user (adding a stop, changing a date) appear instantly for everyone else without page reloads.
  - **Expense Tracking:** Built-in "who owes who" calculator directly tied to the itinerary events.
  - **Shared Map Visualization:** Every added place is pinned on a shared interactive map, allowing groups to visually cluster their day.
- **Weaknesses:** It can feel overwhelming and cluttered on mobile devices when multiple people are editing at once. The requirement for all members to download the app for the best experience can cause friction.
- **Noteworthy Patterns:** Granular permissions (View vs. Edit access) and the ability to forward booking emails to a shared trip address which automatically parses and adds them to the timeline.

## 3. Feature Parity & Gap Analysis
- **Core Features:** Real-time multi-player editing, shared expense tracker, collaborative mapping, email parsing, voting/notes on locations.
- **Vallecito Gap:** Currently, Vallecito's itinerary builder (`ItineraryPanel` and `DayExplorer`) is a single-player experience. We lack real-time collaborative editing (e.g., WebSockets/CRDTs) and built-in expense splitting for groups.
- **Vallecito Advantage:** Vallecito's itineraries are deeply integrated with verifiable local agency data and direct WhatsApp booking, turning planning directly into execution without a middleman OTA taking a 30% cut.

## 4. Business & Pricing Strategy
- **Consumer Pricing:** Freemium. The core collaborative planning is free.
- **Business/Host Pricing:** N/A (It is primarily a consumer planning tool, though it monetizes via affiliate links for hotels/flights).
- **Insights:** The "Wanderlog Pro" subscription unlocks offline access and Google Maps exporting. Vallecito could consider offline access as a premium feature given the spotty cellular connectivity in remote Andean communities.

## 5. Actionable Recommendations for Vallecito
1. **Implement "View-Only" Trip Sharing:** Allow users to generate a read-only, beautifully formatted link of their Vallecito itinerary to share with their travel group via WhatsApp.
2. **Add Multi-Player Itinerary Notes:** Before building full real-time editing, allow invited users to leave comments or notes on specific waypoints in the `DayExplorer`.
3. **Group Expense Estimator:** Enhance the "Estimated Budget" footer in the Itinerary Panel to show a per-person breakdown based on the specified `pax` (pax = number of passengers).