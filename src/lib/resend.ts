// Server-only Resend helper (minimal V1). Never import from client components.
export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY not configured (server only).');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Axiora Protocol <noreply@axioraprotocol.com>', ...opts }),
  });
  if (!res.ok) throw new Error(`Resend error: ${res.status}`);
  return res.json();
}
