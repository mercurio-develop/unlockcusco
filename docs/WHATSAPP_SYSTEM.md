# WhatsApp System — Ghost Phone + Verification Campaign

## Architecture Overview

UnlockCusco uses WhatsApp as the primary contact channel between tourists and local businesses. The system has two layers:

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
INCOMING_WEBHOOK_URL=https://unlockcusco.com/api/whatsapp/
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

### How to Run the Verification Campaign

Follow these exact steps to run the campaign safely:

1. **Start the Ghost Phone Microservice** (Required for sending messages)
   Open a new terminal window and run:
   ```bash
   cd ghost-phone
   npm install # if not already installed
   node index.js
   ```
   *(Wait for it to say "Client is ready!" and scan the QR code with your phone if it's your first time).*

2. **Check the Analytics** (Optional but recommended)
   Open a second terminal at the project root to see how many businesses are currently pending verification:
   ```bash
   node_modules/.bin/tsx scripts/analytics-whatsapp.ts
   ```

3. **Run a Dry Run** (Crucial for safety)
   Always run a dry run first to see exactly what messages will be generated and who they will be sent to, without actually sending them:
   ```bash
   node_modules/.bin/tsx scripts/verify-whatsapp-campaign.ts --dry-run
   ```

4. **Execute the Live Campaign**
   Once you are happy with the dry run output, run the live script. It will process businesses in batches of 300 and includes a 6-11 second delay between messages to avoid WhatsApp spam detection.
   ```bash
   node_modules/.bin/tsx scripts/verify-whatsapp-campaign.ts
   ```

**Campaign log** saved to `/tmp/verification-campaign-YYYY-MM-DD.json`

---

## Incoming Webhook — `/api/whatsapp/`

**File:** `src/app/api/whatsapp/route.ts`  
**URL:** `POST https://unlockcusco.com/api/whatsapp/`

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
  → Does text contain trigger word? [VERIFICA, VERIFY, UNLOCKCUSCO, VALLE, SI, YES, OK, 1]
    → No: ignore
    → Yes: find business by whatsapp field
      → Already claimed: send reminder with profile link
      → Not claimed: set isClaimed=true, revalidateTag('businesses')
        → Send confirmation message with:
          - "¡Verificado!" message
          - Link: unlockcusco.com/explore/{locationSlug}/{category}?q={name}
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

`scripts/campaign-invite.ts` — invites unclaimed businesses to join UnlockCusco platform.

- Target: `isClaimed: false && whatsapp: not null`
- Reply trigger: "VALLE" → sends activation link
- Different from verification campaign (which just verifies the WA number works)

---

## Phone Number Format

Stored in DB: 9 digits, no country code (e.g. `974213502`)  
WA URL format: `https://wa.me/51${whatsapp}` (adds Peru +51 prefix)  
Ghost Phone format: `51${whatsapp}` (e.g. `51974213502`)  
Webhook strips prefix: `phone.replace(/^\+?51/, '').replace(/\D/g, '')`
