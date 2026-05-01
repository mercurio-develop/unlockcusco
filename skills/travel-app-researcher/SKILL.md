---
name: travel-app-researcher
description: Triggers when the user asks to analyze, research, or compare travel apps (Wanderlog, Airbnb Experiences, GetYourGuide, TripAdvisor) for UX, features, or pricing.
---

# Travel App Researcher

This skill equips the agent to perform structured competitor analysis on major travel and itinerary platforms to extract actionable insights for the Vallecito platform. 

## Workflows

When asked to research or compare a travel app (e.g., "Research Wanderlog's UX" or "Compare pricing models on GetYourGuide"), follow this systematic approach:

1. **Determine the Competitors:**
   - If the user specifies a competitor (e.g., Wanderlog), focus on them.
   - If the user asks for a general comparison, read the provided `references/competitors.md` file to identify the most relevant players and their focus areas.

2. **Conduct the Analysis:**
   - Use `web_fetch` to gather up-to-date information from the competitor's website, pricing pages, or public documentation.
   - Use `mcp_pal_thinkdeep` or `mcp_pal_chat` for generating deep insights regarding their UX/UI, feature parity, or monetization strategies.

3. **Analysis Focus Areas:**
   - **UX & Design:** Look for how they handle map integration, itinerary timelines, booking flows, and overall aesthetics.
   - **Feature Parity:** Identify their core value propositions (e.g., offline maps, collaborative editing, one-click booking). Note what Vallecito currently lacks.
   - **Business & Pricing:** Investigate their monetization strategy (e.g., freemium, subscription, transaction fees, SaaS for B2B vs. B2C).

4. **Output Generation:**
   - You MUST output the final analysis using the markdown structure defined in `assets/research-report-template.md`. 
   - Ensure the recommendations are actionable and specifically tailored to improving the Vallecito platform.