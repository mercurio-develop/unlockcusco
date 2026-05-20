import { NextRequest, NextResponse } from 'next/server';
import { GHOST_PHONE_SECRET } from '@/lib/config/services';
import { handleIncomingWhatsAppMessage } from '@/features/concierge/services/whatsapp-service';

export async function POST(req: NextRequest) {
  try {
    // Validate caller — Ghost Phone must send Authorization: Bearer {GHOST_PHONE_SECRET}
    const authHeader = req.headers.get('authorization');
    if (!GHOST_PHONE_SECRET || authHeader !== `Bearer ${GHOST_PHONE_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = await handleIncomingWhatsAppMessage(body);

    return NextResponse.json(result);
  } catch (e) {
    console.error('[WA webhook] Error:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
