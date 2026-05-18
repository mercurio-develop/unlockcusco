# Deployment & Production Setup Guide

This document outlines the steps required to take the UnlockCusco application from a local Docker environment to a production-ready state using Supabase and Vercel.

## 1. Database Setup (Supabase)

For production, we use **Supabase** due to its built-in connection pooling, generous free tier, and native support for PostGIS (which is critical for Mapbox integrations and spatial queries).

### Creating the Project
1. Create a free account at [Supabase](https://supabase.com/).
2. Click **New Project** and select your organization.
3. Name the project (e.g., `unlockcusco-prod`) and generate a secure database password. Save this password!
4. Choose a region closest to your Vercel deployment (e.g., `us-east-1`).

### Getting Connection Strings
Vercel's serverless environment requires connection pooling to avoid exhausting database connections.

1. In your Supabase dashboard, go to **Project Settings -> Database**.
2. Scroll down to **Connection String** and select **URI**.
3. Under **Connection pooling**, ensure it is checked.
4. Copy the **Transaction pooler** string (usually port `6543`). This will be your `POSTGRES_PRISMA_URL`.
   - *Example:* `postgres://[user].[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
5. Uncheck **Connection pooling** to get the direct string (usually port `5432`). This will be your `POSTGRES_URL_NON_POOLING`.
   - *Example:* `postgres://[user].[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres`

### Pushing the Schema
Before deploying, you must push your Prisma schema to the new Supabase database.

1. Temporarily update your local `.env` file with the new Supabase connection strings.
2. Run the Prisma schema push command:
   ```bash
   npx prisma db push
   ```
3. *(Optional)* Run your seed scripts locally to populate the production database:
   ```bash
   npx tsx scripts/seed-mock-data.ts
   npx tsx scripts/enrich-businesses.ts
   ```

## 2. Vercel Deployment

Vercel will host the Next.js application, serverless API routes (like the AI Concierge), and static assets.

### Connecting GitHub
1. Commit and push all your code to the `main` branch on GitHub.
2. Log in to [Vercel](https://vercel.com/dashboard).
3. Click **Add New... -> Project**.
4. Import your GitHub repository.

### Environment Variables
Before clicking deploy, you MUST configure the environment variables in Vercel to match your `.env` file.

**Required Variables:**
- `POSTGRES_PRISMA_URL`: Your Supabase *Transaction pooler* string (port 6543).
- `POSTGRES_URL_NON_POOLING`: Your Supabase *Session/Direct* string (port 5432).
- `GEMINI_API_KEY` (or `GOOGLE_GENERATIVE_AI_API_KEY`): For the AI Concierge.
- `NEXT_PUBLIC_MAPBOX_TOKEN`: For the interactive maps.
- `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`: Critical for rate-limiting the AI chat.
- `NEXT_PUBLIC_POSTHOG_KEY` & `NEXT_PUBLIC_POSTHOG_HOST`: For analytics.

Click **Deploy**. Vercel will automatically run `npm run build` (which includes `prisma generate`).

## 3. Cost Control & Safety Measures (Beta Launch)

Since this is a beta with potentially unpredictable traffic, strict cost limits are required.

### Vercel Spend Management (Hard Limit)
1. Go to Vercel **Team Settings -> Billing**.
2. Locate **Spend Management**.
3. Set a strict limit (e.g., $30) and set the action to **Pause Projects**. This ensures the app goes offline rather than incurring hundreds of dollars in overages if a bot attacks the site.

### Upstash Rate Limiting
- The app uses Upstash Redis to limit the `/api/chat` route to **10 messages per hour per IP**. This is the primary defense against AI API abuse. Ensure the Upstash tokens are correctly set in Vercel.

### Provider Budgets
- **Google Cloud (Gemini):** Set a budget alert/hard cap in the Google Cloud Billing console.
- **Mapbox:** Monitor the dashboard. The free tier is 100,000 Directions API calls, but dynamic routing can burn through this if heavily used.

## 4. Post-Deployment Checks
- Verify the map loads (checks Mapbox token).
- Send a message to the AI Concierge (checks Gemini API, Upstash, and Supabase connection).
- Go to `https://your-domain.com/sitemap.xml` to verify the dynamic SEO sitemap is generating correctly from the production database.
