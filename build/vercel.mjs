// Vercel build: copies the static site into public/ (build/ and raw/ stay out of it).
// The .php pages contain no PHP, so they are served as HTML (Content-Type set in vercel.json).
// index.php and 404.php are also written as index.html / 404.html so Vercel picks them up.
import { cpSync, copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'public');
const SKIP = new Set(['send-enquiry.php']);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);

for (const f of readdirSync(ROOT)) {
  if (SKIP.has(f)) continue;
  if (/\.(php|xml|txt|pdf)$/.test(f)) copyFileSync(join(ROOT, f), join(OUT, f));
}
cpSync(join(ROOT, 'assets'), join(OUT, 'assets'), { recursive: true });

// The form posts to /send-enquiry.php for the PHP host. On Vercel that path is served as a static
// file, which drops the POST body, so point the copied page straight at the function instead.
const contact = join(OUT, 'contactus.php');
const html = readFileSync(contact, 'utf8');
const ACTION = 'action="/send-enquiry.php"';
if (html.split(ACTION).length !== 2) throw new Error(`vercel build: expected exactly one ${ACTION} in contactus.php`);
writeFileSync(contact, html.replace(ACTION, 'action="/api/send-enquiry"'));

copyFileSync(join(ROOT, 'index.php'), join(OUT, 'index.html'));
copyFileSync(join(OUT, 'contactus.php'), join(OUT, 'contactus.html'));
copyFileSync(join(ROOT, '404.php'), join(OUT, '404.html'));

console.log('public/ ready');
