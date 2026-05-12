import nodemailer from 'nodemailer'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'

const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(10, '1h'), prefix: 'vallecito:availability' })
  : null

const AGENCY_EMAILS: Record<string, string> = {
  'jaguar-llaqta': process.env.JAGUAR_LLAQTA_EMAIL || 'contact@jaguar-llaqta.com',
}

const PLATFORM_EMAIL = process.env.PLATFORM_EMAIL || 'noreply@vallecito.pe'
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587')
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS

export async function POST(req: Request) {
  if (ratelimit) {
    const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)
    if (!success) return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const { agencyId, selectedPackage, pax, name, email, dates } = await req.json()

  const agencyEmail = AGENCY_EMAILS[agencyId]
  if (!agencyEmail) {
    return Response.json({ error: 'Unknown agency' }, { status: 400 })
  }

  const subject = `[Vallecito] Availability Request — ${selectedPackage} — ${pax} pax`
  const body = `
New availability request from Vallecito portal:

Package:        ${selectedPackage}
Party size:     ${pax} traveler${pax !== 1 ? 's' : ''}
Preferred dates: ${dates || 'Flexible'}
Contact name:   ${name}
Contact email:  ${email}

Please reply to ${email} within 24 hours to confirm availability and logistics.

— Vallecito Expeditions
  `.trim()

  // Send via SMTP if configured
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })

    await transporter.sendMail({
      from: `Vallecito Portal <${PLATFORM_EMAIL}>`,
      to: agencyEmail,
      replyTo: email,
      subject,
      text: body,
    })
  } else {
    // No SMTP configured — log for manual follow-up
    console.log('[availability-request]', { agencyId, agencyEmail, selectedPackage, pax, name, email, dates })
  }

  return Response.json({ ok: true })
}
