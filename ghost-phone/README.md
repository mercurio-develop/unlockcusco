# The Deterministic Ghost Phone

A standalone Express/Node.js microservice using `whatsapp-web.js` (No LLMs). 
It listens for webhooks from Next.js to send programmatic text alerts to local businesses and admin Yape payout alerts.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
PORT=4000
WEBHOOK_SECRET=your_secure_random_string_here
```

3. Start the service:
```bash
node index.js
```

4. **Authentication:** 
Upon first run, a QR code will be rendered in the terminal. Open WhatsApp on your dedicated "Ghost Phone" device and scan the QR code via "Linked Devices". The session will be saved locally in the `.wwebjs_auth` folder so you don't have to scan it again on restart.

## Usage

Send a POST request from the Next.js backend (e.g., when a user pays for a Taxi or claims a profile) to trigger a WhatsApp message.

**Endpoint:** `POST /webhook/send`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer your_secure_random_string_here`

**Payload:**
```json
{
  "phone": "51987654321",
  "message": "Hello! A tourist just booked a taxi via Vallecito. Pickup: Pisac, Dropoff: Urubamba."
}
```
