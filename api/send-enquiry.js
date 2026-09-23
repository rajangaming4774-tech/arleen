// Enquiry form handler on Vercel (replaces send-enquiry.php, which needs PHP mail()).
// Sends via Resend (https://resend.com). Set these in Vercel → Project → Settings → Environment Variables:
//   RESEND_API_KEY  – required
//   ENQUIRY_TO      – inbox, default info@arleenbuilders.com
//   ENQUIRY_FROM    – sender on a domain verified in Resend, default no-reply@arleenbuilders.com
const FALLBACK = 'Sorry, your message could not be sent. Please call +91 93833 41020 or email info@arleenbuilders.com.';

function respond(ok, message, isAjax, field) {
  if (isAjax) return Response.json({ ok, message, ...(field ? { field } : {}) }, { headers: { 'Cache-Control': 'no-store' } });
  return new Response(null, { status: 303, headers: { Location: '/contactus.php?sent=' + (ok ? '1' : '0'), 'Cache-Control': 'no-store' } });
}

// One submission per address per minute is plenty for a contact form and keeps a script from
// burning the mail quota. Resets whenever the function instance does, which is fine for this.
const lastSeen = new Map();
const tooSoon = (ip) => {
  const now = Date.now();
  for (const [k, t] of lastSeen) if (now - t > 60000) lastSeen.delete(k);
  if (lastSeen.has(ip)) return true;
  lastSeen.set(ip, now);
  return false;
};

export async function GET() {
  return new Response(null, { status: 303, headers: { Location: '/contactus.php' } });
}

export async function POST(request) {
  const isAjax = request.headers.has('x-requested-with');
  let form;
  try { form = await request.formData(); } catch { return respond(false, FALLBACK, isAjax); }

  // Honeypot: bots fill the hidden "website" field
  if (form.get('website')) return respond(true, 'Thank you! We will contact you shortly.', isAjax);

  const clean = (key, max) => String(form.get(key) ?? '').trim().replace(/[\r\n]/g, ' ').replace(/<[^>]*>/g, '').slice(0, max);
  const name = clean('name', 80);
  const phone = clean('phone', 18); // matches the form's maxlength and the 8–18 rule below
  const email = clean('email', 120);
  const service = clean('service', 60);
  const location = clean('location', 120);
  const message = String(form.get('message') ?? '').trim().replace(/<[^>]*>/g, '').slice(0, 2000);

  for (const [key, value, label] of [['name', name, 'your name'], ['phone', phone, 'your phone number'], ['service', service, 'the service you need'], ['message', message, 'a few words about the project']]) {
    if (!value) return respond(false, `Please add ${label}.`, isAjax, key);
  }
  if (!/^[0-9+()\s-]{8,18}$/.test(phone)) return respond(false, 'Please enter a valid phone number.', isAjax, 'phone');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return respond(false, 'Please enter a valid email address.', isAjax, 'email');

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (tooSoon(ip)) return respond(false, 'That enquiry is already on its way to us — thank you.', isAjax);

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return respond(false, FALLBACK, isAjax);
  }

  const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  const text = `New enquiry from arleenbuilders.com\n\n`
    + `Name:     ${name}\nPhone:    ${phone}\nEmail:    ${email || '-'}\n`
    + `Service:  ${service}\nLocation: ${location || '-'}\n\nMessage:\n${message}\n\n-- \nSent ${when}\n`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `Arleen Builders Website <${process.env.ENQUIRY_FROM || 'no-reply@arleenbuilders.com'}>`,
      to: [process.env.ENQUIRY_TO || 'info@arleenbuilders.com'],
      ...(process.env.ENQUIRY_BCC ? { bcc: [process.env.ENQUIRY_BCC] } : {}),
      subject: `New enquiry · ${service}${location ? ' · ' + location : ''} – Arleen Builders`,
      text,
      ...(email ? { reply_to: `${name} <${email}>` } : {}),
    }),
  }).catch(() => null);

  if (res && res.ok) {
    return respond(true, `Thank you, ${name}! Your enquiry has been sent. We will call you within one working day.`, isAjax);
  }
  console.error('Resend failed', res && res.status, res && (await res.text()));
  return respond(false, FALLBACK, isAjax);
}
