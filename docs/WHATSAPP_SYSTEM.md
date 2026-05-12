# WhatsApp System — Ghost Phone + Verification Campaign

## Architecture Overview

Vallecito uses WhatsApp as the primary contact channel between tourists and local businesses. The system has two layers:

1. **Ghost Phone** — a local microservice (`ghost-phone/`) that manages a WhatsApp Web session for outbound messaging and receiving replies
2. **Twilio** — cloud-based WA Business API for production reliability

---

## Ghost Phone Microservice

**Location:** `ghost-phone/` directory  
**Port:** 4000  
**Start:** `cd ghost-phone && node index.js`  
**Auth:** Scan QR code on first run, session saved to `.wwebjs_auth/`

### Endpoints

```
POST /api/message/send
  Body: { phone: "51XXXXXXXXX", message: "..." }
  Headers: Authorization: Bearer {GHOST_PHONE_SECRET}

Incoming webhook → POST to INCOMING_WEBHOOK_URL (configured in ghost-phone .env)
  Body: { from: "51XXXXXXXXX", body: "reply text" }
  Body (location): { from, latitude, longitude, address? }
```

### Environment
```bash
# ghost-phone/.env
PORT=4000
GHOST_PHONE_SECRET=dev-secret
INCOMING_WEBHOOK_URL=https://vallecito.app/api/whatsapp/
```

---

## Verification Campaign

### Goal
786 businesses have WhatsApp numbers scraped from Google Maps but are `isClaimed: false` — tourists can't contact them. The campaign asks them to reply "VERIFICA" to activate their contact button.

### Campaign Flow

```
1. Run analytics script → confirm scope
2. Run campaign script → sends to 786 businesses (300/batch, 6-11s delays)
3. Business replies "VERIFICA" → Ghost Phone POSTs to /api/whatsapp/
4. Webhook: finds business by phone → isClaimed = true → revalidateTag('businesses')
5. Sends confirmation: explore link + request to share GPS location
6. If business shares GPS → webhook updates lat/lng
7. Tourist visits business profile → WhatsApp button now visible
```

### Scripts

```bash
# See full analytics breakdown
node_modules/.bin/tsx scripts/analytics-whatsapp.ts

# Preview campaign (no messages sent)
node_modules/.bin/tsx scripts/verify-whatsapp-campaign.ts --dry-run

# Live run (300 businesses, ~50 min with rate limiting)
node_modules/.bin/tsx scripts/verify-whatsapp-campaign.ts
```

**Campaign log** saved to `/tmp/verification-campaign-YYYY-MM-DD.json`

---

## Incoming Webhook — `/api/whatsapp/`

**File:** `src/app/api/whatsapp/route.ts`  
**URL:** `POST https://vallecito.app/api/whatsapp/`

### Logic

```
Receive POST from Ghost Phone
  ↓
Is it a GPS location? (body.latitude && body.longitude)
  → Update business lat/lng
  → Send "📍 Ubicación actualizada"
  → Done

Is it a text message?
  → Strip country code from phone: "51XXXXXXXXX" → "XXXXXXXXX"
  → Does text contain trigger word? [VERIFICA, VERIFY, VALLECITO, VALLE, SI, YES, OK, 1]
    → No: ignore
    → Yes: find business by whatsapp field
      → Already claimed: send reminder with profile link
      → Not claimed: set isClaimed=true, revalidateTag('businesses')
        → Send confirmation message with:
          - "¡Verificado!" message
          - Link: vallecito.app/explore/{locationSlug}/{category}?q={name}
          - Request to share GPS location for map accuracy
```

---

## UI — WhatsApp Contact Button

**Business detail page** (`src/app/business/[slug]/page.tsx`):
```typescript
const isVerified = business.isClaimed || business.isAsociado

// Button shows only if verified AND has WA number
{isVerified && business.whatsapp ? (
  <a href={`https://wa.me/51${business.whatsapp}?text=${msg}`}>
    {isAsociado ? 'Book via WhatsApp' : 'Contact via WhatsApp'}
  </a>
) : (
  <Link href={`/claim/${business.id}`}>Check Availability</Link>
)}
```

**Explore page** (`src/app/explore/[location]/[category]/page.tsx`):
```typescript
// "Book Now" button shown when:
business.isClaimed && business.whatsapp
```

---

## B2B Invitation Campaign (separate)

`scripts/campaign-invite.ts` — invites unclaimed businesses to join Vallecito platform.

- Target: `isClaimed: false && whatsapp: not null`
- Reply trigger: "VALLE" → sends activation link
- Different from verification campaign (which just verifies the WA number works)

---

## Phone Number Format

Stored in DB: 9 digits, no country code (e.g. `974213502`)  
WA URL format: `https://wa.me/51${whatsapp}` (adds Peru +51 prefix)  
Ghost Phone format: `51${whatsapp}` (e.g. `51974213502`)  
Webhook strips prefix: `phone.replace(/^\+?51/, '').replace(/\D/g, '')`
