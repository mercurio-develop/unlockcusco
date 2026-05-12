export const GHOST_PHONE_URL = process.env.GHOST_PHONE_URL || 'http://localhost:4000';
export const GHOST_PHONE_SECRET =
  process.env.GHOST_PHONE_SECRET || process.env.WEBHOOK_SECRET || 'dev-secret';

export async function ghostPhoneFetch(endpoint: string, data: unknown): Promise<unknown> {
  const res = await fetch(`${GHOST_PHONE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GHOST_PHONE_SECRET}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Ghost Phone ${res.status}: ${await res.text()}`);
  return res.json();
}