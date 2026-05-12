import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateTag } from 'next/cache';
import { ghostPhoneFetch, GHOST_PHONE_SECRET } from '@/lib/config/services';

const TRIGGER_WORDS = ['VERIFICA', 'VERIFY', 'VALLECITO', 'VALLE', 'SI', 'SÍ', 'YES', 'OK', '1'];

async function sendWA(phone: string, message: string) {
  try {
    await ghostPhoneFetch('/api/message/send', { phone, message });
  } catch (e) {
    console.error('[WA webhook] Failed to send reply:', e);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Validate caller — Ghost Phone must send Authorization: Bearer {GHOST_PHONE_SECRET}
    const authHeader = req.headers.get('authorization');
    if (!GHOST_PHONE_SECRET || authHeader !== `Bearer ${GHOST_PHONE_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const rawPhone: string = body.from || body.phone || '';
    const phone = rawPhone.replace(/^\+?51/, '').replace(/\D/g, '');

    if (!phone) return NextResponse.json({ ok: true });

    // --- Handle GPS location share ---
    if (body.latitude && body.longitude) {
      const business = await prisma.business.findFirst({ where: { whatsapp: phone } });
      if (business) {
        await prisma.business.update({
          where: { id: business.id },
          data: { lat: parseFloat(body.latitude), lng: parseFloat(body.longitude) }
        });
        ;(revalidateTag as (t: string) => void)('businesses');
        await sendWA(rawPhone, `📍 ¡Ubicación actualizada! Tu pin en el mapa de Vallecito ya refleja tu posición real. / Location updated on the Vallecito map!`);
      }
      return NextResponse.json({ ok: true });
    }

    // --- Handle text trigger ---
    const text = (body.body || body.message || body.text || '').trim().toUpperCase();
    const isTriggered = TRIGGER_WORDS.some(w => text.includes(w));
    if (!isTriggered) return NextResponse.json({ ok: true });

    const business = await prisma.business.findFirst({ where: { whatsapp: phone } });
    if (!business) return NextResponse.json({ ok: true });

    // Already verified — just send a reminder
    if (business.isClaimed) {
      const exploreUrl = buildExploreUrl(business);
      await sendWA(rawPhone, `✅ ${business.name} ya está verificado en Vallecito. Los turistas pueden contactarte directamente.\n\n👉 Tu perfil: ${exploreUrl}`);
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }

    // Mark as verified
    await prisma.business.update({ where: { id: business.id }, data: { isClaimed: true } });
    ;(revalidateTag as (t: string) => void)('businesses');

    const exploreUrl = buildExploreUrl(business);
    await sendWA(rawPhone,
      `✅ ¡Verificado, ${business.name}! Ahora los turistas pueden contactarte directamente por WhatsApp en Vallecito.\n\n👉 Ve tu negocio en el mapa:\n${exploreUrl}\n\n📍 ¿Quieres mejorar tu ubicación en el mapa? Comparte tu *ubicación de WhatsApp* respondiendo con tu pin GPS.\n\n---\nVerified! Tourists can now contact you directly. View your listing: ${exploreUrl}`
    );

    return NextResponse.json({ ok: true, verified: business.name });

  } catch (e) {
    console.error('[WA webhook] Error:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

function buildExploreUrl(business: { name: string; locationSlug: string | null; category: string }) {
  const loc = business.locationSlug || 'urubamba';
  const cat = (business.category || 'culture').toLowerCase();
  return `https://vallecito.app/explore/${loc}/${cat}?q=${encodeURIComponent(business.name)}`;
}
