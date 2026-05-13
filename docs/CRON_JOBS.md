# Vercel Cron Jobs & Data Lifecycle

Vallecito uses Vercel Cron Jobs to automate data lifecycle management and keep the PostgreSQL database performant while minimizing storage costs.

## Current Cron Jobs

### 1. Itinerary Cleanup (`/api/cron/cleanup-itineraries`)

**Schedule:** Daily at Midnight (`0 0 * * *`)
**Path:** `src/app/api/cron/cleanup-itineraries/route.ts`

**Purpose:**
When users save an itinerary via the "Magic Link" feature, the state is saved as JSON in the `SavedItinerary` Prisma model. To prevent these from accumulating indefinitely, this cron job automatically deletes any `SavedItinerary` records that are older than 30 days.

**Security:**
The endpoint is protected by Vercel's Cron authentication. It requires an `Authorization: Bearer <CRON_SECRET>` header. 
- Vercel automatically sends this header when triggering the job.
- You must ensure the `CRON_SECRET` environment variable is set in your Vercel project settings (and locally if you wish to test it).

## Testing Locally

You can test the execution of the cron job locally using tools like `curl` or Postman by mocking the authorization header.

1. Ensure `CRON_SECRET` is set in your `.env.local` (e.g., `CRON_SECRET=my-secret-key`).
2. Start the development server: `npm run dev`
3. Run the following curl command:

```bash
curl -H "Authorization: Bearer my-secret-key" http://localhost:3000/api/cron/cleanup-itineraries
```

Expected Response:
```json
{
  "success": true,
  "deletedCount": 0,
  "cutoffDate": "2026-04-13T00:00:00.000Z"
}
```

## Adding New Cron Jobs

1. Create a new API route under `src/app/api/cron/`.
2. Implement the same `CRON_SECRET` authorization check at the top of your handler.
3. Add the job to the `"crons"` array in the `vercel.json` file in the project root.

```json
{
  "crons": [
    {
      "path": "/api/cron/my-new-job",
      "schedule": "0 0 * * *"
    }
  ]
}
```
