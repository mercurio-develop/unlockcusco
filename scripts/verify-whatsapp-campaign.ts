/**
 * UNLOCKCUSCO WHATSAPP VERIFICATION CAMPAIGN
 *
 * Sends a message to all unclaimed businesses asking them to reply "VERIFICA"
 * to verify their WhatsApp number. On reply, the webhook at /api/whatsapp
 * marks them as isClaimed=true and sends a confirmation.
 *
 * Usage:
 *   node_modules/.bin/tsx scripts/verify-whatsapp-campaign.ts           (live run)
 *   node_modules/.bin/tsx scripts/verify-whatsapp-campaign.ts --dry-run (no messages sent)
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();
const GHOST_PHONE_URL = 'http://localhost:4000';
const WEBHOOK_SECRET = 'dev-secret';
const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_LIMIT = 300;

async function sendVerification(businessId: string, phone: string, businessName: string, slug: string): Promise<boolean> {
  // Generate a random secure token
  const token = crypto.randomBytes(16).toString('hex');
  
  if (!DRY_RUN) {
    try {
      await prisma.business.update({
        where: { id: businessId },
        data: { verificationToken: token }
      });
    } catch (e) {
      console.error(`  Failed to save token for ${businessName}:`, e);
      return false;
    }
  }

  const verifyUrl = `https://unlockcusco.com/es/business/${slug}?verify=${token}`;

  const message = `Hola ${businessName} 👋

Soy UnlockCusco, la guía de turismo del Valle Sagrado de los Incas.

Los turistas buscan tu negocio en nuestra plataforma. Para que puedan contactarte directamente por WhatsApp, ingresa a este enlace para verificar tu negocio:
${verifyUrl}

O si prefieres, simplemente responde con la palabra *VERIFICA* a este mensaje.

Es gratis y solo toma 5 segundos ✅

---
Hello ${businessName}! Tourists are searching for you on UnlockCusco — the Sacred Valley travel guide. Click this link to verify your business:
${verifyUrl.replace('/es/', '/en/')}

Or reply *VERIFY* to activate your WhatsApp contact button for tourists. Free & instant.`;

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would send to ${phone}:`);
    console.log(`    Link: ${verifyUrl}`);
    return true;
  }

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
    console.error(`  Failed to send to ${businessName}:`, e);
    return false;
  }
}

async function runCampaign() {
  console.log(`\n🚀 UnlockCusco WhatsApp Verification Campaign ${DRY_RUN ? '[DRY RUN]' : ''}`);
  console.log('='.repeat(55));

  const businesses = await prisma.business.findMany({
    where: {
      isClaimed: false,
      whatsapp: { not: null }
    },
    select: { id: true, name: true, whatsapp: true, locationSlug: true, category: true, slug: true },
    take: BATCH_LIMIT
  });

  console.log(`Targeting ${businesses.length} businesses (cap: ${BATCH_LIMIT})\n`);

  const log: any[] = [];
  let success = 0, failed = 0;

  for (const b of businesses) {
    if (!b.whatsapp) continue;
    process.stdout.write(`  ${b.locationSlug} | ${b.name} ... `);

    const ok = await sendVerification(b.id, b.whatsapp, b.name, b.slug);
    const status = ok ? 'sent' : 'failed';
    if (ok) { success++; console.log('✅'); } else { failed++; console.log('❌'); }

    log.push({ id: b.id, name: b.name, whatsapp: b.whatsapp, locationSlug: b.locationSlug, status, sentAt: new Date().toISOString() });

    if (!DRY_RUN) {
      const delay = Math.floor(Math.random() * 5000) + 6000; // 6-11s
      await new Promise(r => setTimeout(r, delay));
    }
  }

  const logFile = `/tmp/verification-campaign-${new Date().toISOString().slice(0, 10)}.json`;
  fs.writeFileSync(logFile, JSON.stringify(log, null, 2));

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Sent:   ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📄 Log:    ${logFile}`);
}

runCampaign()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
