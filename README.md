# Vallecito — Sacred Valley Travel Platform

AI-powered travel guide connecting tourists with verified local businesses in the Sacred Valley of the Incas (Cusco region, Peru).

## Documentation

| Doc | Contents |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System overview, tech stack, data model, routes, env vars |
| [docs/AI_CONCIERGE.md](docs/AI_CONCIERGE.md) | Concierge conversation flow, tools, prompts, day view sync |
| [docs/WHATSAPP_SYSTEM.md](docs/WHATSAPP_SYSTEM.md) | Ghost Phone setup, verification campaign, webhook |
| [docs/SCRIPTS_REFERENCE.md](docs/SCRIPTS_REFERENCE.md) | All data scripts — analytics, cleaning, AI generation, campaigns |

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Messaging (WhatsApp)

For local development and mass campaigns, use the Ghost Phone microservice:

```bash
cd ghost-phone && npm install && node index.js
# Scan the QR code with your WhatsApp
```

Configure in `.env.local`:
```
GHOST_PHONE_URL=http://localhost:4000
GHOST_PHONE_SECRET=dev-secret
INCOMING_WEBHOOK_URL=https://vallecito.app/api/whatsapp/
```

## AI Concierge

The chat assistant uses Gemini 2.5 Flash via `/api/chat`. Requires:
```
GEMINI_API_KEY=your_key
```

## Database Scripts

```bash
node_modules/.bin/tsx scripts/analytics-whatsapp.ts
node_modules/.bin/tsx scripts/generate-zagat-descriptions.ts
```

See [docs/SCRIPTS_REFERENCE.md](docs/SCRIPTS_REFERENCE.md) for the full list.
