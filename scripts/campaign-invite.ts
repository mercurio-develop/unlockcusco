/**
 * UNLOCKCUSCO B2B CAMPAIGN SCRIPT
 * 
 * Purpose: Send mass invitations to local businesses in the Sacred Valley
 * to join the UnlockCusco platform.
 * 
 * Usage: Run locally with access to the Ghost Phone microservice.
 * npx tsx scripts/campaign-invite.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const GHOST_PHONE_URL = 'http://localhost:4000';
const WEBHOOK_SECRET = 'dev-secret';

async function sendInvite(phone: string, businessName: string) {
  const message = `Hola ${businessName}! 👋 
  
Soy del equipo de UnlockCusco.com. Estamos lanzando la plataforma #1 para conectar turistas con los mejores negocios del Valle Sagrado.

Hemos pre-registrado tu perfil y queremos invitarte a tomar el control de tus leads directamente por WhatsApp.

Responde con la palabra "VALLE" para recibir tu enlace de activación gratuito. ✨`;

  try {
    const res = await fetch(`${GHOST_PHONE_URL}/api/message/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WEBHOOK_SECRET}`
      },
      body: JSON.stringify({ phone, message })
    });
    
    return res.ok;
  } catch (e) {
    console.error(`Failed to send to ${businessName}:`, e);
    return false;
  }
}

async function runCampaign() {
  console.log("🚀 Starting UnlockCusco B2B Invitation Campaign...");
  
  // Fetch all unclaimed businesses with phone numbers
  const businesses = await prisma.business.findMany({
    where: {
      isClaimed: false,
      whatsapp: { not: null }
    },
    take: 500 // Safety cap
  });

  console.log(`Found ${businesses.length} target businesses.`);

  let successCount = 0;
  for (const b of businesses) {
    if (!b.whatsapp) continue;
    
    console.log(`Sending invite to: ${b.name} (${b.whatsapp})...`);
    const success = await sendInvite(b.whatsapp, b.name);
    
    if (success) {
      successCount++;
      console.log(`✅ Success`);
    } else {
      console.log(`❌ Failed`);
    }

    // Rate limiting to avoid WhatsApp spam detection
    // Wait 5-10 seconds between messages
    const delay = Math.floor(Math.random() * 5000) + 5000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  console.log(`\n✨ Campaign Complete!`);
  console.log(`Successfully sent ${successCount} invitations.`);
}

runCampaign()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
