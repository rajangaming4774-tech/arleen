// Unknown .php URLs (old-site links, bots) are rewritten here by vercel.json so the styled 404 page
// is served WITH a 404 status. A plain rewrite to /404.html answers 200, which search engines log
// as a "soft 404" and may keep the dead URL in the index.
const FALLBACK = '<!DOCTYPE html><meta charset="utf-8"><title>Page Not Found | Arleen Builders</title>'
  + '<p>Page not found. <a href="/">Arleen Builders home</a></p>';

async function notFound(request) {
  let html = FALLBACK;
  try {
    const res = await fetch(new URL('/404.html', request.url), { headers: { 'x-not-found': '1' } });
    if (res.ok) html = await res.text();
  } catch { /* fall back to the plain page */ }
  return new Response(html, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate', 'X-Robots-Tag': 'noindex' },
  });
}

export const GET = notFound;
export const HEAD = notFound;
export const POST = notFound;
