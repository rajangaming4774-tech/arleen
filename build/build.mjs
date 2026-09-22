// Static site generator for arleenbuilders.com
// Usage: node build/build.mjs   -> writes *.php pages, sitemap.xml, robots.txt into the project root.
// Pages are plain HTML saved with .php extensions so the old URLs keep working on the existing host.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SITE, PROJECTS, SERVICE_AREAS, CATEGORY_LABEL, imgName, TEAM, publishedTestimonials, filledCredentials } from './data.mjs';

// Content hash appended to CSS/JS URLs so long-cached assets refresh when they change
const ver = (p) => createHash('md5').update(readFileSync(new URL('../' + p, import.meta.url))).digest('hex').slice(0, 8);
const CSS_V = ver('assets/css/style.css');
const JS_V = ver('assets/js/main.js');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const YEAR = new Date().getFullYear();
const P1 = SITE.phones[0], P2 = SITE.phones[1];
const addr = SITE.address;
const addrLine = `${addr.street}, ${addr.locality}, ${addr.city} – ${addr.postal.slice(0, 3)} ${addr.postal.slice(3)}`;

/* ---------- Icons ---------- */
const I = {
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1a8.2 8.2 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.5-.5.3-.5a.6.6 0 0 0 0-.5l-1-2.4c-.2-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.8.4 3.5 3.5 0 0 0-1.1 2.6 6 6 0 0 0 1.3 3.2 13.8 13.8 0 0 0 5.3 4.7c2.6 1 2.6.7 3.1.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.6-.3zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm8.4-18.2A11.8 11.8 0 0 0 1.8 17.9L.1 24l6.3-1.6a11.8 11.8 0 0 0 5.6 1.4A11.8 11.8 0 0 0 20.4 3.6z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8z"/></svg>',
  rupee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3a5 5 0 0 0 0-10"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
};

/* ---------- Navigation ---------- */
// Header links (FORMA-style: short words). The full menu overlay lists everything.
const NAV = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/projects.php', label: 'Projects', key: 'projects' },
  { href: '/aboutus.php', label: 'Studio', key: 'about' },
  { href: '/services.php', label: 'Services', key: 'services', children: ['construction', 'interiors', 'sports'] },
  { href: '/contactus.php', label: 'Contact', key: 'contact' },
];
const MENU = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/projects.php', label: 'Projects', key: 'projects' },
  { href: '/aboutus.php', label: 'Studio', key: 'about' },
  { href: '/services.php', label: 'Services', key: 'services' },
  { href: '/contactus.php', label: 'Contact', key: 'contact' },
];
const DIVISIONS = [
  { href: '/construction.php', label: 'Building construction', key: 'construction' },
  { href: '/interiors.php', label: 'Interior & exterior decor', key: 'interiors' },
  { href: '/sports-flooring.php', label: 'Sports flooring & courts', key: 'sports' },
];

/* ---------- Structured data ---------- */
// Each of these spreads adds nothing at all while its source data is empty.
const credentialSchema = () => {
  const list = filledCredentials();
  return !list.length ? {} : { identifier: list.map(([name, value]) => ({ '@type': 'PropertyValue', name, value })),
    ...(list.find(([n]) => n === 'GSTIN') ? { taxID: list.find(([n]) => n === 'GSTIN')[1] } : {}) };
};
const teamSchema = () => !TEAM.length ? {} : { employee: TEAM.map((m) => ({ '@type': 'Person', name: m.name, jobTitle: m.role })) };
// Quotes only — no rating. The owner supplies words, not scores, and a star value would be invented.
const reviewSchema = () => {
  const list = publishedTestimonials();
  return !list.length ? {} : { review: list.map((t) => ({ '@type': 'Review', author: { '@type': 'Person', name: t.author },
    reviewBody: t.quote, ...(t.date ? { datePublished: t.date } : {}) })) };
};
const ORG_ID = `${SITE.url}/#organization`;
const orgSchema = {
  '@type': ['GeneralContractor', 'LocalBusiness'],
  '@id': ORG_ID,
  name: SITE.name,
  legalName: SITE.legalName,
  url: `${SITE.url}/`,
  logo: { '@type': 'ImageObject', url: `${SITE.url}/assets/img/logo.png`, width: 360, height: 168 },
  image: `${SITE.url}/assets/img/og-image.jpg`,
  description: 'Chennai-based builders, interior & exterior decorators and sports flooring / court construction contractors since 2007.',
  foundingDate: SITE.founded,
  telephone: P1.tel,
  email: SITE.email,
  address: { '@type': 'PostalAddress', streetAddress: addr.street, addressLocality: `${addr.locality}, ${addr.city}`, addressRegion: addr.region, postalCode: addr.postal, addressCountry: addr.country },
  geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
  areaServed: [{ '@type': 'City', name: 'Chennai' }, ...SERVICE_AREAS.map((n) => ({ '@type': 'Place', name: `${n}, Chennai` }))],
  priceRange: '₹₹',
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: SITE.hours.opens, closes: SITE.hours.closes }],
  contactPoint: SITE.phones.map((p) => ({ '@type': 'ContactPoint', telephone: p.tel, contactType: 'sales', areaServed: 'IN', availableLanguage: ['English', 'Tamil'] })),
  knowsAbout: ['Building construction', 'Interior design', 'Exterior facade', 'ACP cladding', 'Structural glazing', 'Sports flooring', 'Indoor badminton court', 'Sports court construction'],
  ...credentialSchema(),
  ...teamSchema(),
  ...reviewSchema(),
};

const crumbSchema = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${SITE.url}${c.href}` })),
});
const faqSchema = (faqs) => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});
const serviceSchema = (name, type, desc, path) => ({
  '@type': 'Service', name, serviceType: type, description: desc, url: `${SITE.url}${path}`,
  provider: { '@id': ORG_ID }, areaServed: [{ '@type': 'City', name: 'Chennai' }, ...SERVICE_AREAS.map((n) => ({ '@type': 'Place', name: `${n}, Chennai` }))],
});
/* ---------- Layout ---------- */
// Fraunces (serif, optical sizing) for headings; Manrope for body text and small labels
const FONTS = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=Manrope:wght@400;500&display=swap';

function layout({ path, key, title, desc, h1Hero, body, schema = [], ogImage = 'og-image.jpg', preload, pageType = 'WebPage', org = true }) {
  const canonical = `${SITE.url}${path}`;
  const graph = { '@context': 'https://schema.org', '@graph': [...(org ? [orgSchema] : []), { '@type': pageType, '@id': `${canonical}#webpage`, url: canonical, name: title, description: desc, isPartOf: { '@type': 'WebSite', '@id': `${SITE.url}/#website`, url: `${SITE.url}/`, name: SITE.name, publisher: { '@id': ORG_ID } }, about: { '@id': ORG_ID }, inLanguage: 'en-IN' }, ...schema] };
  const cur = (n) => n.key === key || (n.children && n.children.includes(key));
  const navHtml = NAV.map((n) => `<li><a href="${n.href}"${cur(n) ? ' aria-current="page"' : ''}>${n.label}</a></li>`).join('');
  const menuHtml = MENU.map((n) => `<a href="${n.href}"${n.key === key ? ' aria-current="page"' : ''}>${n.label}</a>`).join('\n        ');
  const preloadTag = !preload ? '' : typeof preload === 'string'
    ? `<link rel="preload" as="image" href="/assets/img/${preload}.webp" imagesrcset="/assets/img/${preload}-sm.webp 800w, /assets/img/${preload}.webp ${HERO_W[preload] || 1280}w" imagesizes="(max-width: 900px) 100vw, 58vw">\n`
    : `<link rel="preload" as="image" href="${preload.href}" imagesrcset="${preload.srcset}" imagesizes="${preload.sizes || '100vw'}" fetchpriority="high">\n`;

  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#fdfcf9">
<meta name="color-scheme" content="light">
<meta name="geo.region" content="IN-TN">
<meta name="geo.placename" content="Chennai">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:locale" content="en_IN">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.url}/assets/img/${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(SITE.name)} — ${esc(title.split('|')[0].trim())}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE.url}/assets/img/${ogImage}">
<link rel="icon" type="image/png" href="/assets/img/favicon.png">
<link rel="apple-touch-icon" href="/assets/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
${preloadTag}<link rel="stylesheet" href="/assets/css/style.css?v=${CSS_V}">
<script type="application/ld+json">${JSON.stringify(graph)}</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header scrolled">
  <nav class="container nav" aria-label="Main">
    <a class="nav__brand" href="/" aria-label="${SITE.name} home"><picture><source srcset="/assets/img/logo.webp" type="image/webp"><img src="/assets/img/logo.png" width="360" height="168" alt="${SITE.name}"></picture></a>
    <ul class="nav__menu">${navHtml}</ul>
    <div class="nav__right">
      <span class="nav__tag" aria-hidden="true">Builders · Interiors<br>Sports flooring — Chennai</span>
      <button class="nav__toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><span></span><span></span><span></span><span></span></button>
    </div>
  </nav>
</header>
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Site menu" aria-hidden="true">
  <nav class="menu__links" aria-label="Pages">
        ${menuHtml}
  </nav>
  <div class="menu__aside">
    <div>
      <h3>Divisions</h3>
      <ul>${DIVISIONS.map((d) => `<li><a href="${d.href}"${d.key === key ? ' aria-current="page"' : ''}>${d.label}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h3>Contact</h3>
      <ul>
        <li><a href="tel:${P1.tel}">${P1.display}</a></li>
        <li><a href="tel:${P2.tel}">${P2.display}</a></li>
        <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
        <li><a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></li>
      </ul>
    </div>
    <div>
      <h3>Studio</h3>
      <p>${addr.street},<br>${addr.locality}, ${addr.city} – ${addr.postal.slice(0, 3)} ${addr.postal.slice(3)}<br>${SITE.hours.display}</p>
      <p><a href="/Arleen-Builders-Brochure.pdf" target="_blank" rel="noopener">Brochure (PDF) ↗</a></p>
    </div>
  </div>
</div>
<main id="main">
${h1Hero}
${body}
</main>
<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <a class="footer-logo" href="/"><img src="/assets/img/logo.png" alt="Arleen Builders" width="110" height="51" loading="lazy"></a>
      <p>${SITE.legalName} — builders, interior &amp; exterior decorators and sports infrastructure contractors in Chennai since ${SITE.founded}.</p>
      <p><em>“${SITE.tagline}”</em></p>
      ${credentialsLine()}
    </div>
    <div>
      <h3>Services</h3>
      <ul>
        <li><a href="/construction.php">Builders in Chennai</a></li>
        <li><a href="/interiors.php">Interior Decorators in Chennai</a></li>
        <li><a href="/interiors.php#exterior">ACP Cladding &amp; Glazing</a></li>
        <li><a href="/sports-flooring.php">Sports Flooring in Chennai</a></li>
        <li><a href="/sports-flooring.php#courts">Indoor Badminton Courts</a></li>
      </ul>
    </div>
    <div>
      <h3>Company</h3>
      <ul>
        <li><a href="/aboutus.php">Studio</a></li>
        <li><a href="/projects.php">Projects</a></li>
        <li><a href="/contactus.php">Contact</a></li>
        <li><a href="/Arleen-Builders-Brochure.pdf" target="_blank" rel="noopener">Brochure (PDF)</a></li>
      </ul>
    </div>
    <div>
      <h3>Get in touch</h3>
      <ul>
        <li>${addrLine}</li>
        <li><a href="tel:${P1.tel}">${P1.display}</a> / <a href="tel:${P2.tel}">${P2.display}</a></li>
        <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
        <li>${SITE.hours.display.replace('·', '—')}</li>
      </ul>
    </div>
  </div>
  <div class="container footer-bottom">
    <span>© <span data-year>${YEAR}</span> ${SITE.legalName}. All rights reserved.</span>
    <span>Builders · Interior Decorators · Sports Flooring — Chennai</span>
  </div>
</footer>
<div class="float-actions">
  <a class="fa-wa" href="https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hi Arleen Builders, I would like to enquire about a project.')}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${I.wa}</a>
  <a class="fa-call" href="tel:${P1.tel}" aria-label="Call ${P1.display}">${I.phone}</a>
</div>
<script src="/assets/js/main.js?v=${JS_V}" defer></script>
</body>
</html>
`;
}

/* ---------- Components ---------- */
const pic = (base, alt, { w = 1400, h = 933, cls = '', eager = false, sizes = '(max-width: 640px) 100vw, 50vw' } = {}) =>
  `<img${cls ? ` class="${cls}"` : ''} src="/assets/img/${base}.webp" srcset="/assets/img/${base}-sm.webp 640w, /assets/img/${base}.webp 1400w" sizes="${sizes}" alt="${esc(alt)}" width="${w}" height="${h}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`;

// hero-sports is the only 1920-wide source; the rest are 1280, and claiming otherwise made
// browsers pick the small file on high-resolution screens.
const HERO_W = { 'hero-sports': 1920 };
const heroImg = (name, alt) => {
  const w = HERO_W[name] || 1280;
  return `<img class="cover__img" src="/assets/img/${name}.webp" srcset="/assets/img/${name}-sm.webp 800w, /assets/img/${name}.webp ${w}w" sizes="(max-width: 900px) 100vw, 58vw" alt="${esc(alt)}" width="${w}" height="${Math.round(w * 2 / 3)}" fetchpriority="high">`;
};

const startLink = (label = 'Start a project') => `<a class="btn" href="/contactus.php">${label}</a>`;

// Four figures on one rounded rail, under (or overlapping) the hero — the reference layout's stat bar.
const FACTS = [
  [`Since ${SITE.founded}`, `${addr.locality}, ${addr.city}`],
  [`${YEAR - Number(SITE.founded)} years`, 'Building, interiors and courts'],
  ['3 divisions', 'One in-house team'],
  ['Chennai', 'City and suburbs'],
];
const statBar = ({ float = false } = {}) => `<section class="statbar-wrap${float ? ' statbar-wrap--float' : ''}">
  <div class="container">
    <ul class="statbar reveal">${FACTS.map(([n, l]) => `<li><strong>${n}</strong><span>${l}</span></li>`).join('')}</ul>
  </div>
</section>`;

// Card grid that closes a page: label, arrow title, one line — the reference layout's tiles.
const TILES = [
  { label: 'Our projects', title: 'See the work', text: `${PROJECTS.length} schools, homes, showrooms, recreation centres and courts across Chennai.`, href: '/projects.php' },
  { label: 'Our services', title: 'What we build', text: 'Construction, interior and exterior decor, sports flooring and courts.', href: '/services.php' },
  { label: 'The studio', title: 'Who we are', text: `A ${addr.city} firm of builders, decorators and court contractors since ${SITE.founded}.`, href: '/aboutus.php' },
];
const tiles = () => `<section class="section section--flush">
  <div class="container">
    <div class="tiles">${TILES.map((t) => `<a class="tile reveal" href="${t.href}">
      <span class="tile__label">${t.label}</span>
      <h3 class="tile__title">${t.title}</h3>
      <p>${t.text}</p>
    </a>`).join('')}</div>
  </div>
</section>`;

// Inner-page cover: headline on paper with the photo offset to the right and a caption under it
function pageHero({ img, alt, caption = '', crumbs, kicker, h1, intro, actions = true, stats = true }) {
  return `<section class="cover">
  <div class="container cover__grid">
    <div class="cover__text">
      <nav class="breadcrumb reveal" aria-label="Breadcrumb"><ol>${crumbs.map((c, i) => i === crumbs.length - 1 ? `<li aria-current="page">${c.name}</li>` : `<li><a href="${c.href}">${c.name}</a></li>`).join('')}</ol></nav>
      ${kicker ? `<span class="kicker reveal">${kicker}</span>` : ''}
      <h1 class="display reveal">${h1}</h1>
      <p class="lead reveal">${intro}</p>
      ${actions ? `<div class="reveal">${startLink()}</div>` : ''}
    </div>
    <figure class="cover__media reveal">
      ${heroImg(img, alt)}
      ${caption ? `<figcaption>${caption}</figcaption>` : ''}
    </figure>
  </div>
</section>
${stats ? statBar() : ''}`;
}

// Home cover: one real project photograph filling the card, with the headline over it.
// Kept separate from pageHero() — that one sets text on paper beside the photo and needs a
// breadcrumb, neither of which suits the home page.
const HOME_HEROES = {
  a: { base: 'hero-index-a',
       alt: 'Indoor synthetic badminton court with steel roofing built by Arleen Builders at Sacred Heart Matriculation Hr. Sec. School, Church Park, Chennai',
       credit: 'Sacred Heart Matriculation Hr. Sec. School — indoor shuttle court, Church Park' },
  b: { base: 'hero-index-b',
       alt: 'Glazed entrance block with ACP cladding built by Arleen Builders at Stella Matutina College of Education, Ashok Nagar, Chennai',
       credit: 'Stella Matutina College of Education — glazed entrance block, Ashok Nagar' },
};
const HOME_HERO = HOME_HEROES[process.env.HERO === 'b' ? 'b' : 'a'];
const homeHeroSrcset = (b) => `/assets/img/${b}-sm.webp 800w, /assets/img/${b}-1280.webp 1280w, /assets/img/${b}.webp 1920w`;
function homeHero() {
  const b = HOME_HERO.base;
  return `<figure class="hero">
  <div class="hero__card">
    <img class="hero__img" src="/assets/img/${b}-1280.webp" srcset="${homeHeroSrcset(b)}" sizes="100vw" width="1920" height="1080" alt="${esc(HOME_HERO.alt)}" fetchpriority="high" decoding="async">
    <div class="hero__scrim" aria-hidden="true"></div>
    <div class="hero__text">
      <span class="kicker">${SITE.name} — ${addr.city}, since ${SITE.founded}</span>
      <h1 class="display hero__title">Builders, interiors and <em>sports courts</em> in Chennai</h1>
      <p class="mono">School blocks, apartments, showroom facades and indoor courts — built by one team since ${SITE.founded}.</p>
      <a class="btn" href="/contactus.php">Start a project</a>
    </div>
  </div>
  <figcaption class="hero__credit">${HOME_HERO.credit}</figcaption>
</figure>`;
}

const projectAlt = (p, i) => `${p.title}, ${p.place} – ${p.work} by Arleen Builders${p.files.length > 1 ? ` (photo ${i + 1})` : ''}`;

function workTile(p) {
  const n = p.files.length;
  const gallery = { title: p.title, place: p.place, images: p.files.map((_, k) => ({ src: `/assets/img/projects/${imgName(p, k)}.webp`, alt: projectAlt(p, k) })) };
  return `<article class="work__item reveal" id="${p.slug}">
    <div class="work__media">
      <button type="button" data-gallery='${esc(JSON.stringify(gallery))}' aria-label="View ${n} photo${n > 1 ? 's' : ''} of ${esc(p.title)}">
        ${pic(`projects/${imgName(p, 0)}`, projectAlt(p, 0), { w: 1400, h: 1050, sizes: '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 50vw' })}
      </button>
    </div>
    <div class="work__meta">
      <span class="mono">${CATEGORY_LABEL[p.category]}${n > 1 ? ` · ${n} photos` : ''}</span>
      <h3>${esc(p.title)}</h3>
      <p class="work__place">${esc(p.place)}</p>
      <p class="work__work">${esc(p.work)}</p>
    </div>
  </article>`;
}
// editorial: the first project runs wide and the second tall (see .work--editorial); plain: three-up
const workGrid = (list, editorial = true) => `<div class="work${editorial ? ' work--editorial' : ''}">${list.map(workTile).join('')}</div>`;

const lightbox = `<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Project photos">
  <button class="lb-close" aria-label="Close">×</button>
  <button class="lb-prev" aria-label="Previous photo">‹</button>
  <figure><img alt=""><figcaption></figcaption></figure>
  <button class="lb-next" aria-label="Next photo">›</button>
</div>`;

const contactBand = (heading = 'Start a<br>project', text = `Send the site address and what you want built. ${SITE.responsePromise}`) => `${tiles()}
<section class="section">
  <div class="container contact-band">
    <div class="reveal">
      <span class="kicker">Enquiries</span>
      <h2 class="display">${heading}</h2>
      <p class="lead">${text}</p>
    </div>
    <div class="contact-band__list reveal">
      <div><span class="mono">Call</span><a href="tel:${P1.tel}">${P1.display}</a></div>
      <div><span class="mono">Alternate</span><a href="tel:${P2.tel}">${P2.display}</a></div>
      <div><span class="mono">Email</span><a href="mailto:${SITE.email}">${SITE.email}</a></div>
      <div><span class="mono">WhatsApp</span><a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener">Chat on WhatsApp ↗</a></div>
      <div><span class="mono">Studio</span><a href="/contactus.php">${addr.locality}, ${addr.city} →</a></div>
    </div>
  </div>
</section>`;

const faqBlock = (faqs, heading) => `<section class="section">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">Questions</span><h2 class="display">${heading}</h2></div>
    <div class="faq">${faqs.map(([q, a]) => `<details><summary>${q}</summary><div><p>${a}</p></div></details>`).join('')}</div>
  </div>
</section>`;

// Client quotes. Nothing renders until TESTIMONIALS in data.mjs holds a real, consented quote.
const testimonialBlock = (list, heading = 'In their words') => !list.length ? '' : `<section class="section">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">Clients</span><h2 class="display">${heading}</h2></div>
    <div class="quotes">${list.map((t) => {
      const project = PROJECTS.find((p) => p.slug === t.projectSlug);
      const who = [t.role, t.org].filter(Boolean).join(', ');
      return `<figure class="quote reveal">
        <blockquote class="pull">${esc(t.quote)}</blockquote>
        <figcaption><strong>${esc(t.author)}</strong>${who ? `<span>${esc(who)}</span>` : ''}${project ? `<a class="link" href="/projects.php#${project.slug}">See the project</a>` : ''}</figcaption>
      </figure>`;
    }).join('')}</div>
  </div>
</section>`;

// The people on site. Nothing renders until TEAM in data.mjs is filled in.
const teamBlock = () => !TEAM.length ? '' : `<section class="section">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">The team</span><h2 class="display">The people on your site</h2></div>
    <div class="rows rows--columns team">${TEAM.map((m) => `<article class="row reveal">
      <h3>${esc(m.name)}</h3>
      <div class="row__body">
        <p>${[m.role, m.qualification].filter(Boolean).map(esc).join(' · ')}</p>
        ${m.note ? `<p>${esc(m.note)}</p>` : ''}
      </div>
      ${m.photo ? `<div class="row__media">${pic(`team/${m.photo}`, `${m.name} — ${m.role}, Arleen Builders`, { w: 800, h: 800, sizes: '200px' })}</div>` : ''}
    </article>`).join('')}</div>
  </div>
</section>`;

// Statutory registrations, shown wherever they help: nothing until CREDENTIALS is filled in.
const credentialsBlock = () => {
  const list = filledCredentials();
  return !list.length ? '' : `<section class="section">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">Registered</span><h2 class="display">Company registration</h2></div>
    <ul class="statbar reveal">${list.map(([label, value]) => `<li><strong>${esc(value)}</strong><span>${label}</span></li>`).join('')}</ul>
  </div>
</section>`;
};
const credentialsLine = () => {
  const list = filledCredentials();
  return !list.length ? '' : `<p class="mono creds-line">${list.map(([label, value]) => `${label} ${esc(value)}`).join(' · ')}</p>`;
};

const related = (cat, heading) => {
  const list = PROJECTS.filter((p) => p.category === cat).slice(0, 3);
  return `<section class="section">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">Recent work</span><h2 class="display">${heading}</h2></div>
    ${workGrid(list, false)}
    <p class="section-foot reveal"><a class="link" href="/projects.php#${cat}">All ${CATEGORY_LABEL[cat].toLowerCase()} projects</a></p>
  </div>
</section>
${lightbox}`;
};

const SERVICES = [
  { key: 'construction', href: '/construction.php', title: 'Building construction', img: 'projects/' + imgName(PROJECTS[4], 0),
    alt: 'Sunil Residency apartment building in Nungambakkam constructed by Arleen Builders',
    text: 'Turnkey construction of apartments, villas, independent houses, commercial complexes and institutional buildings.',
    tags: ['Apartments', 'Villas', 'Commercial', 'Schools'] },
  { key: 'interiors', href: '/interiors.php', title: 'Interior &amp; exterior decor', img: 'projects/' + imgName(PROJECTS[3], 1),
    alt: 'Billiards room interior design with pendant lighting by Arleen Builders, Chennai',
    text: 'Residential and commercial interiors plus modern facades — ACP cladding, structural glazing and spider glazing.',
    tags: ['Kitchens', 'Offices', 'Salons', 'ACP &amp; glazing'] },
  { key: 'sports', href: '/sports-flooring.php', title: 'Sports flooring &amp; courts', img: 'projects/' + imgName(PROJECTS[0], 0),
    alt: 'Indoor synthetic badminton court flooring at Sacred Heart School, Chennai',
    text: 'Indoor and outdoor sports courts — badminton, basketball, volleyball, squash, cricket, football and golf.',
    tags: ['Badminton', 'Basketball', 'Squash', 'Multi-sport'] },
];

// The three divisions as magazine columns: picture, italic title, text, tags, link
const divisionRows = () => `<div class="rows rows--columns">${SERVICES.map((s) => `<article class="row reveal">
  <h3><a href="${s.href}">${s.title}</a></h3>
  <div class="row__body">
    <p>${s.text}</p>
    <ul class="row__tags">${s.tags.map((t) => `<li>${t}</li>`).join('')}</ul>
    <a class="link" href="${s.href}">View services</a>
  </div>
  <div class="row__media">${pic(s.img, s.alt, { w: 1400, h: 1050, sizes: '200px' })}</div>
</article>`).join('')}</div>`;

// Generic hairline rows from [title, text] pairs
const rows = (items, { cols2 = false, steps = false } = {}) => `<div class="rows${cols2 ? ' rows--2' : ''}${steps ? ' rows--steps' : ''}">${items.map(([t, d]) => `<div class="row reveal">
  <h3>${t}</h3>
  <div class="row__body"><p>${d}</p></div>
</div>`).join('')}</div>`;

// The four steps a client actually goes through — stated once, used on every page that needs it.
const PROCESS = [
  ['Consultation', 'A free site visit to understand the requirement, the site and the budget.'],
  ['Design &amp; estimate', 'Drawings, material specifications and an itemised quotation.'],
  ['Execution', 'Supervised construction with regular progress updates.'],
  ['Handover', 'Quality checks, a clean handover and support after it.'],
];
const processSection = (kicker = 'How we work') => `<section class="section">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">${kicker}</span><h2 class="display">A simple, transparent process</h2></div>
    ${rows(PROCESS, { steps: true })}
  </div>
</section>`;

// Where we work, from SERVICE_AREAS — a real section rather than a grey footnote.
const coverageSection = () => `<section class="section">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">Coverage</span><h2 class="display">Where we work</h2><p class="lead">We take projects across ${addr.city} and the suburbs around it.</p></div>
    <div class="offset"><ul class="list cols-2">${SERVICE_AREAS.map((a) => `<li>${a}</li>`).join('')}</ul>
    <p class="section-foot mono reveal">Somewhere else in ${addr.city}? Call ${P1.display} — we travel for the site visit.</p></div>
  </div>
</section>`;

const WHY = [
  ['Since 2007', `${YEAR - Number(SITE.founded)} years from the same office in ${addr.locality}.`],
  ['Named clients', 'Sacred Heart School, Stella Matutina College, D.G. Vaishnav College, CavinCare, Sreeleathers.'],
  ['One contract', 'Civil work, interiors and sports flooring under one agreement and one site engineer.'],
  ['One quotation', 'Priced line by line before work starts, so you can see what each item costs.'],
];

const CLIENTS = ['Stella Matutina College', 'D.G. Vaishnav College', 'Sacred Heart School', 'Sreeleathers', 'CavinCare', 'Naturals Salon & Spa', 'Eden Square', 'Cloudy Shop'];

/* ---------- Pages ---------- */
const pages = {};

// HOME
pages['index.php'] = layout({
  path: '/', key: 'home', ogImage: 'og-home.jpg',
  preload: { href: `/assets/img/${HOME_HERO.base}-1280.webp`, srcset: homeHeroSrcset(HOME_HERO.base), sizes: '100vw' },
  title: 'Builders, Interiors & Sports Flooring in Chennai | Arleen Builders',
  desc: 'Arleen Builders – trusted builders, interior & exterior decorators and sports flooring contractors in Chennai since 2007. Call +91 93833 41020 for a free quote.',
  h1Hero: homeHero(),
  body: `${statBar({ float: true })}
<section class="section section--flush">
  <div class="container">
    <p class="statement reveal">Construction, interiors and sports courts <b>delivered by one team in Chennai</b> — from the first site visit <b>to handover</b>.</p>
  </div>
</section>

<section class="section" id="studio">
  <div class="container">
    <div class="studio">
      <div class="reveal">
        <span class="kicker">The studio</span>
        <h2 class="display">One team for construction, interiors and <em>sports courts</em></h2>
      </div>
      <div class="reveal prose">
        <p>${SITE.legalName} is a Chennai construction company with three specialist divisions under one roof: residential and commercial building construction, interior and exterior decoration, and sports arena construction.</p>
        <p>Backed by professional architects, experienced engineers and a skilled workforce, we have delivered apartments, villas, individual homes, commercial complexes, schools and sports facilities across the city since ${SITE.founded} — with a single point of responsibility from planning to handover.</p>
        <p><a class="link" href="/aboutus.php">About the studio</a></p>
      </div>
      <blockquote class="pull reveal">A single point of responsibility, from the first site visit to handover.<cite>How we work, since ${SITE.founded}</cite></blockquote>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">Selected work</span><h2 class="display">Recent <em>projects</em></h2><p class="lead">Schools, residences, showrooms, recreation centres and sports courts across Chennai.</p></div>
    ${workGrid(PROJECTS.filter((p) => p.featured))}
    <p class="section-foot reveal"><a class="link" href="/projects.php">All ${PROJECTS.length} projects</a></p>
  </div>
</section>
${lightbox}

<section class="section">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">Three divisions</span><h2 class="display">Construction, interiors and sports infrastructure under one roof</h2></div>
    ${divisionRows()}
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">Why Arleen</span><h2 class="display">Why clients across Chennai <em>choose us</em></h2></div>
    <div class="offset">${rows(WHY, { cols2: true })}</div>
  </div>
</section>

${processSection()}

${testimonialBlock(publishedTestimonials().slice(0, 2))}

<section class="section">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">Clients</span><h2 class="display">Trusted by schools, colleges <em>and brands</em></h2></div>
    <ul class="clients">${CLIENTS.map((c) => `<li>${c}</li>`).join('')}</ul>
  </div>
</section>

${contactBand()}`,
});

// ABOUT (Studio)
pages['aboutus.php'] = layout({
  path: '/aboutus.php', key: 'about', ogImage: 'og-about.jpg', pageType: 'AboutPage', preload: 'hero-about',
  title: 'About Arleen Builders | Chennai Construction Company Since 2007',
  desc: 'Learn about Arleen Builders India Pvt. Ltd – a Chennai construction, interior decoration and sports infrastructure company delivering quality projects since 2007.',
  schema: [crumbSchema([{ name: 'Home', href: '/' }, { name: 'About Us', href: '/aboutus.php' }])],
  h1Hero: pageHero({ img: 'hero-about', alt: 'Institutional building constructed by Arleen Builders in Ashok Nagar, Chennai', caption: 'Stella Matutina College — canteen block, Ashok Nagar',
    crumbs: [{ name: 'Home', href: '/' }, { name: 'Studio' }], kicker: 'Studio',
    h1: 'About <em>Arleen Builders</em>', intro: 'A Chennai construction company built on trust, effort, commitment and standard quality — since 2007.' }),
  body: `<section class="section section--flush">
  <div class="container split">
    <div class="reveal prose">
      <span class="kicker">Who we are</span>
      <h2 class="display">Builders, decorators and sports arena constructors</h2>
      <p>${SITE.legalName} was founded in ${SITE.founded}. Through the commitment of our professional team and by God’s grace, we have grown into a builder, interior and exterior decorator and constructor of sports arenas in Chennai.</p>
      <p>We have delivered apartments, commercial complexes, villas, individual homes, school and college buildings, showroom facades and indoor sports courts — for clients including Sacred Heart School, Stella Matutina College, D.G. Vaishnav College, CavinCare and Sreeleathers.</p>
    </div>
    <figure class="split__media reveal">
      ${pic('projects/' + imgName(PROJECTS[5], 0), 'Sreeleathers showroom glass facade in Purasaiwakkam by Arleen Builders', { w: 1400, h: 930 })}
      <figcaption>Sreeleathers showroom — Purasaiwakkam</figcaption>
    </figure>
  </div>
</section>

<section class="section">
  <div class="container split split--rev">
    <div class="reveal prose">
      <span class="kicker">Arleen Builders care</span>
      <h2 class="display">A pleasant experience from foundation to finish</h2>
      <p>One civil engineer stays with your site from the foundation to the snag list, and reports progress to you as the work goes on. Architects, supervisors and our own skilled labour work to that engineer, so there is one person to ask about anything on site.</p>
      <p>Our focus on timely completion is what has earned us our reputation as one of Chennai’s dependable builders.</p>
      <ul class="list">
        <li>Professional architects &amp; civil engineers</li>
        <li>Dedicated site supervisors and skilled labour</li>
        <li>Modern equipment and construction technology</li>
        <li>Timely completion with regular progress updates</li>
      </ul>
    </div>
    <figure class="split__media reveal">
      ${pic('projects/' + imgName(PROJECTS[0], 2), 'Indoor sports court constructed by Arleen Builders for Sacred Heart School, Chennai', { w: 1400, h: 1050 })}
      <figcaption>Indoor shuttle court — Sacred Heart School</figcaption>
    </figure>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">Our belief</span><h2 class="display">The four pillars</h2><p class="lead">We recognise that every customer is unique, with their own needs, values and goals — and we work closely with each one to fulfil them.</p></div>
    ${rows([['Trust', 'Honest advice, transparent pricing and clear communication.'], ['Effort', 'A hands-on team that goes the extra mile on every site.'], ['Commitment', 'We keep our promises on scope, budget and timelines.'], ['Standard quality', 'Proven materials and workmanship that lasts.']], { cols2: true })}
  </div>
</section>

${processSection()}

${teamBlock()}
${credentialsBlock()}
${testimonialBlock(publishedTestimonials())}

<section class="section">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">What we do</span><h2 class="display">Three divisions</h2></div>
    ${divisionRows()}
  </div>
</section>

${contactBand()}`,
});

// SERVICES HUB
pages['services.php'] = layout({
  path: '/services.php', key: 'services', preload: 'hero-construction',
  title: 'Construction & Interior Services in Chennai | Arleen Builders',
  desc: 'Explore Arleen Builders services in Chennai: building construction, interior & exterior decoration, ACP cladding, glazing and sports flooring & court construction.',
  schema: [crumbSchema([{ name: 'Home', href: '/' }, { name: 'Services', href: '/services.php' }])],
  h1Hero: pageHero({ img: 'hero-construction', alt: 'Residential apartment building constructed by Arleen Builders in Chennai', caption: 'Sunil Residency — Nungambakkam',
    crumbs: [{ name: 'Home', href: '/' }, { name: 'Services' }], kicker: 'Services',
    h1: 'Construction &amp; interior services <em>in Chennai</em>', intro: 'Complete building, interior, exterior and sports infrastructure solutions — designed, executed and delivered by one experienced team.' }),
  body: `<section class="section section--flush">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">Three divisions</span><h2 class="display">Choose a service</h2></div>
    ${divisionRows()}
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="grid grid-3">
      <div class="reveal">
        <span class="kicker">Interior</span>
        <h3>Residential</h3>
        <ul class="list"><li>Kitchen</li><li>Bathroom</li><li>Bedroom</li><li>Living room</li></ul>
        <h3>Commercial</h3>
        <ul class="list"><li>Corporate offices</li><li>Hotels</li><li>Showrooms</li><li>Clubs</li><li>Retail stores</li><li>Salons</li><li>Spas</li></ul>
        <p class="section-foot"><a class="link" href="/interiors.php">Interior decorators in Chennai</a></p>
      </div>
      <div class="reveal">
        <span class="kicker">Exterior</span>
        <h3>Facades</h3>
        <ul class="list"><li>ACP claddings</li><li>Structural glazing works</li><li>Spider glazing</li><li>Facade renovation</li></ul>
        <p class="section-foot"><a class="link" href="/interiors.php#exterior">Exterior facade works</a></p>
      </div>
      <div class="reveal">
        <span class="kicker">Sports arena</span>
        <h3>Courts</h3>
        <ul class="list"><li>Indoor shuttle court</li><li>Volleyball court</li><li>Football court</li><li>Cricket</li><li>Golf</li><li>Squash court</li><li>Basketball court</li></ul>
        <p class="section-foot"><a class="link" href="/sports-flooring.php">Sports flooring in Chennai</a></p>
      </div>
    </div>
  </div>
</section>

${processSection()}
${contactBand()}`,
});

/* ---- Service landing page builder ---- */
function servicePage({ file, key, cat, n, title, desc, hero, heroAlt, heroCaption, kicker, h1, intro, sections, faqs, faqHeading, schemaName, schemaType }) {
  const path = `/${file}`;
  pages[file] = layout({
    path, key, preload: hero, title, desc, ogImage: `og-${cat}.jpg`,
    schema: [crumbSchema([{ name: 'Home', href: '/' }, { name: 'Services', href: '/services.php' }, { name: schemaName, href: path }]), serviceSchema(schemaName, schemaType, desc, path), faqSchema(faqs)],
    h1Hero: pageHero({ img: hero, alt: heroAlt, caption: heroCaption, crumbs: [{ name: 'Home', href: '/' }, { name: 'Services', href: '/services.php' }, { name: schemaName }], kicker, h1, intro }),
    body: `${sections}
${related(cat, `Our ${CATEGORY_LABEL[cat].toLowerCase()} projects`)}
${testimonialBlock(publishedTestimonials().filter((t) => PROJECTS.find((p) => p.slug === t.projectSlug)?.category === cat).slice(0, 2))}
${faqBlock(faqs, faqHeading)}
${contactBand()}`,
  });
}

const areas = `${SERVICE_AREAS.join(', ')} and across Chennai`;
const areasLine = (t) => `<p class="section-foot mono reveal">${t}</p>`;

// CONSTRUCTION
servicePage({
  file: 'construction.php', key: 'construction', cat: 'construction', n: '01', kicker: 'Construction',
  title: 'Builders in Chennai | Residential & Commercial Construction',
  desc: 'Looking for reliable builders in Chennai? Arleen Builders constructs apartments, villas, independent houses and commercial buildings with quality and on-time delivery.',
  hero: 'hero-construction', heroAlt: 'Sunil Residency apartments in Nungambakkam built by Arleen Builders', heroCaption: 'Sunil Residency — Nungambakkam',
  h1: 'Builders &amp; construction company <em>in Chennai</em>',
  intro: 'Apartments, villas, independent houses, commercial complexes and institutional buildings — built right, built on time.',
  schemaName: 'Building Construction', schemaType: 'Residential and commercial building construction',
  sections: `<section class="section section--flush">
  <div class="container split">
    <div class="reveal prose">
      <span class="kicker">The structure</span>
      <h2 class="display">Trusted builders for homes and businesses</h2>
      <p>Since ${SITE.founded}, Arleen Builders has been building homes and commercial spaces across Chennai. Whether you are planning an independent house on your own plot, a joint-venture apartment project, or a school or office building, our team of architects and civil engineers manages everything — approvals, design, structure, finishing and handover.</p>
      <p>We use branded cement and steel, follow structural drawings to the letter and keep a qualified engineer on site throughout. You get weekly progress updates, a transparent bill of quantities and a building that stands the test of time.</p>
    </div>
    <figure class="split__media reveal">${pic('projects/' + imgName(PROJECTS[1], 0), 'Stella Matutina College of Education building with glazed entrance, built by Arleen Builders', { w: 1400, h: 930 })}<figcaption>Stella Matutina College — Ashok Nagar</figcaption></figure>
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">What we build</span><h2 class="display">Construction services</h2></div>
    ${rows([['Residential apartments', 'Multi-storey flats and joint-venture developments with modern amenities and Vastu-friendly layouts.'],
         ['Villas &amp; independent houses', 'Custom homes designed around your family, plot and budget — from foundation to painting.'],
         ['Commercial buildings', 'Offices, showrooms and commercial complexes with efficient, future-ready layouts.'],
         ['Schools &amp; institutions', 'Classrooms, college blocks and campus infrastructure delivered to schedule.'],
         ['Renovation &amp; extension', 'Additional floors, structural repairs, re-plastering and complete makeovers.'],
         ['Civil &amp; road works', 'Campus internal roads, compound walls, paving and drainage works.']], { cols2: true })}
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">Our process</span><h2 class="display">How we build your project</h2></div>
    ${rows([['Site visit &amp; planning', 'Soil check, requirement study and budget planning.'], ['Design &amp; approvals', 'Architectural and structural drawings, plus CMDA / corporation approvals.'], ['Construction', 'Foundation, structure, MEP and finishing under engineer supervision.'], ['Handover', 'Final quality inspection, snag fixing and documentation.']], { steps: true })}
    ${areasLine(`We build in ${areas}.`)}
  </div>
</section>`,
  faqHeading: 'Building construction — frequently asked questions',
  faqs: [
    ['What types of buildings does Arleen Builders construct in Chennai?', 'We construct residential apartments, villas, independent houses, commercial complexes, showrooms, schools and college buildings, and also take on renovation, extension and civil road works.'],
    ['Do you help with building plan approvals?', 'Yes. Our architects prepare the drawings and we assist with the required CMDA / Greater Chennai Corporation approvals as part of the project.'],
    ['How is the construction cost calculated?', 'After a free site visit we provide an itemised estimate based on built-up area, specifications and finishes. There are no hidden charges — any change in scope is agreed in writing first.'],
    ['How long does it take to build a house?', 'A typical independent house takes 8–12 months depending on size, design and approvals. We share a detailed schedule before work begins and update you every week.'],
  ],
});

// INTERIORS
servicePage({
  file: 'interiors.php', key: 'interiors', cat: 'interiors', n: '02', kicker: 'Interiors &amp; facades',
  title: 'Interior Decorators in Chennai | Interior & Exterior Design',
  desc: 'Arleen Builders are interior & exterior decorators in Chennai for homes, offices, showrooms, salons and hotels, plus ACP cladding, structural and spider glazing.',
  hero: 'hero-interiors', heroAlt: 'Billiards room interior with pendant lights designed by Arleen Builders, Nungambakkam', heroCaption: 'Recreation Centre — billiards room, Nungambakkam',
  h1: 'Interior &amp; exterior decorators <em>in Chennai</em>',
  intro: 'Beautiful, functional interiors and striking facades for homes, offices, showrooms, salons, hotels and clubs.',
  schemaName: 'Interior & Exterior Decoration', schemaType: 'Interior design and exterior facade works',
  sections: `<section class="section section--flush">
  <div class="container split">
    <div class="reveal prose">
      <span class="kicker">The interior</span>
      <h2 class="display">Interiors designed around the way you live and work</h2>
      <p>From modular kitchens and wardrobes to complete office, salon and showroom fit-outs, we handle design, false ceilings, lighting, flooring, electrical, carpentry and painting — all under one contract.</p>
      <h3>Residential interiors</h3>
      <ul class="list cols-2"><li>Modular kitchen</li><li>Bathroom</li><li>Bedroom &amp; wardrobes</li><li>Living &amp; dining room</li></ul>
      <h3>Commercial interiors</h3>
      <ul class="list cols-2"><li>Corporate offices</li><li>Hotels</li><li>Showrooms</li><li>Clubs &amp; recreation centres</li><li>Retail stores</li><li>Salons &amp; spas</li></ul>
    </div>
    <figure class="split__media reveal">${pic('projects/' + imgName(PROJECTS[6], 0), 'Naturals Salon & Spa interior with glass partitions at Mahindra World City by Arleen Builders', { w: 1400, h: 930 })}<figcaption>Naturals Salon &amp; Spa — Mahindra World City</figcaption></figure>
  </div>
</section>
<section class="section" id="exterior">
  <div class="container split split--rev">
    <div class="reveal prose">
      <span class="kicker">The facade</span>
      <h2 class="display">ACP cladding, structural glazing &amp; spider glazing</h2>
      <p>A building’s facade is its first impression. We design and install modern exterior facades that look premium, keep out heat and dust and need very little maintenance.</p>
      <ul class="list">
        <li><strong>ACP cladding</strong> — aluminium composite panels in a wide range of colours and finishes for shops, showrooms and offices.</li>
        <li><strong>Structural glazing</strong> — sleek, frameless-look glass facades for commercial buildings.</li>
        <li><strong>Spider glazing</strong> — point-fixed glass for entrances, lobbies and showroom fronts.</li>
        <li><strong>Facade renovation</strong> — upgrade an older building with a contemporary look.</li>
      </ul>
    </div>
    <figure class="split__media reveal">${pic('projects/' + imgName(PROJECTS[2], 0), 'Eden Square commercial building with structural glazing facade by Arleen Builders, Chennai', { w: 1400, h: 933 })}<figcaption>Eden Square — structural glazing</figcaption></figure>
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">Our process</span><h2 class="display">From concept to completion</h2></div>
    ${rows([['Consultation', 'We visit your space and understand your style, needs and budget.'], ['Design', 'Layouts, material boards and 3D views for your approval.'], ['Execution', 'Carpentry, ceilings, lighting and finishes by our skilled team.'], ['Handover', 'Deep clean, final walk-through and after-sales support.']], { steps: true })}
    ${areasLine(`We serve homes and businesses in ${areas}.`)}
  </div>
</section>`,
  faqHeading: 'Interior &amp; exterior works — frequently asked questions',
  faqs: [
    ['Do you do both home and commercial interiors in Chennai?', 'Yes. We design and execute residential interiors (kitchens, bedrooms, bathrooms, living rooms) as well as commercial interiors for offices, hotels, showrooms, clubs, retail stores, salons and spas.'],
    ['What is ACP cladding and is it suitable for Chennai weather?', 'ACP (aluminium composite panel) cladding is a lightweight, weather-resistant facade material. It handles Chennai’s heat and humidity well, is easy to clean and is available in many colours and finishes.'],
    ['What is the difference between structural glazing and spider glazing?', 'Structural glazing bonds glass to an aluminium frame behind it for a seamless glass facade. Spider glazing holds glass panels with stainless-steel point fittings, and is popular for entrances, lobbies and showroom fronts.'],
    ['How long does an interior project take?', 'A typical apartment interior takes 6–10 weeks, and commercial fit-outs vary with size. We share a timeline with your quotation and stick to it.'],
  ],
});

// SPORTS
servicePage({
  file: 'sports-flooring.php', key: 'sports', cat: 'sports', n: '03', kicker: 'Sports',
  title: 'Sports Flooring in Chennai | Badminton & Sports Court Builders',
  desc: 'Sports flooring and court construction in Chennai – indoor badminton, basketball, volleyball, squash, cricket, football and golf courts by Arleen Builders. Free quote.',
  hero: 'hero-sports', heroAlt: 'Indoor synthetic badminton court with steel roof built by Arleen Builders at Sacred Heart School, Chennai', heroCaption: 'Sacred Heart School — indoor court, Church Park',
  h1: 'Sports flooring &amp; court construction <em>in Chennai</em>',
  intro: 'Complete sports arenas — from the steel roof and lighting to professional synthetic, wooden and acrylic court flooring.',
  schemaName: 'Sports Flooring & Court Construction', schemaType: 'Sports flooring and sports court construction',
  sections: `<section class="section section--flush">
  <div class="container split">
    <div class="reveal prose">
      <span class="kicker">The court</span>
      <h2 class="display">Professional sports courts for schools, clubs &amp; communities</h2>
      <p>We deliver a complete sports arena under one contract: civil base preparation, pre-engineered steel structures and roofing, ventilation, sports lighting and the final court surface with line marking.</p>
      <p>We have built indoor courts for schools, colleges, apartment communities and private clubs. Every court is laid to the correct level, slope and dimensions, with surfaces chosen for grip, shock absorption, durability and the right ball bounce.</p>
      <ul class="list cols-2">
        <li>Synthetic PVC / PU flooring</li><li>Wooden sports flooring</li><li>Acrylic outdoor courts</li><li>Artificial turf</li><li>Steel shed &amp; roofing</li><li>Sports lighting</li>
      </ul>
    </div>
    <figure class="split__media reveal">${pic('projects/' + imgName(PROJECTS[0], 1), 'Synthetic indoor shuttle court flooring with line marking by Arleen Builders, Chennai', { w: 1400, h: 1050 })}<figcaption>Indoor shuttle court — Church Park</figcaption></figure>
  </div>
</section>
<section class="section" id="courts">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">Courts we build</span><h2 class="display">Indoor &amp; outdoor sports courts</h2></div>
    ${rows([['Indoor shuttle / badminton court', 'BWF-standard synthetic mats on a levelled base with proper lighting.'],
         ['Basketball court', 'Acrylic or PU surfaces for outdoor courts, wooden flooring for indoor courts.'],
         ['Volleyball court', 'Cushioned synthetic or sand courts with net posts and markings.'],
         ['Squash court', 'Plastered walls, wooden flooring and a glass back wall.'],
         ['Football turf', 'FIFA-grade artificial grass for 5-a-side and 7-a-side grounds.'],
         ['Cricket pitch &amp; nets', 'Practice nets with artificial turf or concrete pitches.'],
         ['Golf putting greens', 'Artificial putting greens for campuses, clubs and homes.'],
         ['Multi-sport courts', 'One court with multi-game markings, ideal for schools.']], { cols2: true })}
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="section-head reveal"><span class="kicker">Our process</span><h2 class="display">How we build your court</h2></div>
    ${rows([['Site survey', 'We check the area, levels, drainage and how the court will be used.'], ['Base preparation', 'A levelled RCC or bituminous base with the correct slope.'], ['Structure &amp; roofing', 'Steel structure, roofing and lighting for indoor arenas.'], ['Surface &amp; marking', 'Flooring installation, line marking and equipment fitting.']], { steps: true })}
    ${areasLine(`Sports courts built for schools, colleges, clubs and apartments in ${areas}.`)}
  </div>
</section>`,
  faqHeading: 'Sports flooring — frequently asked questions',
  faqs: [
    ['What types of sports flooring do you install in Chennai?', 'We install synthetic PVC and PU sports flooring, wooden sports flooring, acrylic outdoor court coatings and artificial turf for badminton, basketball, volleyball, squash, football, cricket and golf.'],
    ['Can you build a complete indoor badminton court with roofing?', 'Yes. We deliver turnkey indoor badminton arenas, including the civil base, steel structure and roofing, lighting, ventilation, synthetic court mats and line marking — as we did for Sacred Heart School, Church Park.'],
    ['How much does a badminton court cost in Chennai?', 'The cost depends on the flooring type, whether the court is indoor or outdoor, the condition of the base and whether roofing is needed. Contact us for a free site visit and an itemised quote.'],
    ['Do you build sports courts for schools and apartments?', 'Yes. Schools, colleges, apartment associations and private clubs are our main sports infrastructure clients. We also build multi-sport courts that let one space serve several games.'],
  ],
});

// PROJECTS
pages['projects.php'] = layout({
  path: '/projects.php', key: 'projects', ogImage: 'og-projects.jpg', pageType: 'CollectionPage', preload: 'hero-sports',
  title: 'Our Projects | Construction, Interiors & Sports Courts in Chennai',
  desc: 'See completed Arleen Builders projects across Chennai – schools, apartments, villas, showrooms, salon interiors, glass facades and indoor badminton courts.',
  schema: [crumbSchema([{ name: 'Home', href: '/' }, { name: 'Projects', href: '/projects.php' }]),
    { '@type': 'ItemList', name: 'Arleen Builders projects', itemListElement: PROJECTS.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: `${p.title}, ${p.place}`, image: `${SITE.url}/assets/img/projects/${imgName(p, 0)}.webp` })) }],
  h1Hero: pageHero({ img: 'hero-sports', alt: 'Indoor sports arena built by Arleen Builders in Chennai', caption: 'Sacred Heart School — indoor court, Church Park',
    crumbs: [{ name: 'Home', href: '/' }, { name: 'Projects' }], kicker: 'Work',
    h1: 'Our projects <em>in Chennai</em>', intro: `${PROJECTS.length} completed projects — schools, colleges, residences, showrooms, salons, recreation centres and sports courts.`, actions: false }),
  // one group per division; the ids keep the /projects.php#construction links from the service pages working
  body: `<section class="section section--flush">
  <div class="container">
    ${Object.entries(CATEGORY_LABEL).map(([k, v]) => `<div class="work-group" id="${k}">
      <h2 class="reveal">${v} <span class="mono">${PROJECTS.filter((p) => p.category === k).length} projects</span></h2>
      ${workGrid(PROJECTS.filter((p) => p.category === k))}
    </div>`).join('\n    ')}
  </div>
</section>
${lightbox}
${contactBand('Planning something<br>similar?')}`,
});

// CONTACT
pages['contactus.php'] = layout({
  path: '/contactus.php', key: 'contact', ogImage: 'og-home.jpg', pageType: 'ContactPage', preload: 'hero-home',
  title: 'Contact Arleen Builders | Nungambakkam, Chennai | Free Quote',
  desc: 'Contact Arleen Builders, Nungambakkam, Chennai. Call +91 93833 41020 / +91 99403 58889 or email info@arleenbuilders.com for a free site visit and quote.',
  schema: [crumbSchema([{ name: 'Home', href: '/' }, { name: 'Contact', href: '/contactus.php' }])],
  h1Hero: pageHero({ img: 'hero-home', alt: 'Commercial building by Arleen Builders, Chennai', caption: 'Eden Square — structural glazing facade',
    crumbs: [{ name: 'Home', href: '/' }, { name: 'Contact' }], kicker: 'Contact',
    h1: 'Contact <em>Arleen Builders</em>', intro: 'Tell us about your project. We will call you back within one working day to arrange a free site visit.', actions: false, stats: false }),
  body: `<section class="statbar-wrap">
  <div class="container">
    <ul class="statbar reveal">
      <li><strong>One working day</strong><span>${SITE.responsePromise.replace('We reply within one working day.', 'We reply to every enquiry')}</span></li>
      <li><strong>Free site visit</strong><span>Anywhere in ${addr.city} and the suburbs</span></li>
      <li><strong>Itemised quotation</strong><span>Priced line by line, no hidden costs</span></li>
    </ul>
  </div>
</section>
<section class="section section--flush">
  <div class="container contact-grid">
    <div class="info-card reveal">
      <h2 class="display">Get in touch</h2>
      <p>Visit our office or reach us by phone, WhatsApp or email.</p>
      <div class="info-item"><span class="mono">Studio</span><strong>${SITE.legalName}</strong><br>${addr.street},<br>${addr.locality}, ${addr.city} – 600 034</div>
      <div class="info-item"><span class="mono">Phone</span><a href="tel:${P1.tel}">${P1.display}</a><br><a href="tel:${P2.tel}">${P2.display}</a></div>
      <div class="info-item"><span class="mono">Email</span><a href="mailto:${SITE.email}">${SITE.email}</a></div>
      <div class="info-item"><span class="mono">Hours</span>${SITE.hours.days}<br>9:30 AM – 6:30 PM</div>
      ${filledCredentials().length ? `<div class="info-item"><span class="mono">Registration</span>${filledCredentials().map(([l, v]) => `${l} ${esc(v)}`).join('<br>')}</div>` : ''}
      <div class="info-links">
        <a class="link" href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener">Chat on WhatsApp</a>
        <a class="link link--muted" href="/Arleen-Builders-Brochure.pdf" target="_blank" rel="noopener">Download brochure</a>
      </div>
    </div>
    <form class="form reveal" id="enquiry-form" action="/send-enquiry.php" method="post" data-thanks="Thank you — your enquiry has been sent. ${SITE.responsePromise}" data-fallback="Sorry, your enquiry could not be sent. Please call ${P1.display} or email ${SITE.email}.">
      <h2 class="display">Enquiry</h2>
      <div class="form-msg" id="form-status" role="status" aria-live="polite"></div>
      <div class="form-row">
        <div class="field"><label for="f-name">Your name *</label><input id="f-name" name="name" type="text" autocomplete="name" required maxlength="80"></div>
        <div class="field"><label for="f-phone">Phone number *</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" required pattern="[0-9+()\\s\\-]{8,18}" maxlength="18" title="Digits, spaces, brackets, + and - only" aria-describedby="form-status"></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" maxlength="120"></div>
        <div class="field"><label for="f-service">Service required *</label>
          <select id="f-service" name="service" required>
            <option value="">Select a service</option>
            <option>Building Construction</option>
            <option>Interior Decoration</option>
            <option>Exterior / ACP / Glazing</option>
            <option>Sports Flooring / Court</option>
            <option>Other</option>
          </select></div>
      </div>
      <div class="field"><label for="f-location">Project location</label><input id="f-location" name="location" type="text" maxlength="120" placeholder="e.g. Anna Nagar, Chennai"></div>
      <div class="field"><label for="f-msg">Project details *</label><textarea id="f-msg" name="message" required maxlength="2000" placeholder="Tell us about your project, size and timeline"></textarea></div>
      <div class="hp" aria-hidden="true"><input id="f-web" name="website" type="text" tabindex="-1" autocomplete="off" aria-label="Leave this field empty"></div>
      <p class="form-note">Your details reach our office inbox and are used only to answer this enquiry. We do not pass them to anyone else.</p>
      <button class="btn" type="submit">Send enquiry</button>
    </form>
  </div>
</section>
${coverageSection()}
<section aria-label="Map showing Arleen Builders office location">
  <iframe class="map" title="Arleen Builders office location on Google Maps" src="https://www.google.com/maps?q=${encodeURIComponent('Arleen Builders, ' + SITE.mapQuery)}&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
</section>`,
});

// 404
pages['404.php'] = layout({
  path: '/404.php', key: '', org: false, title: 'Page Not Found | Arleen Builders',
  desc: 'The page you are looking for could not be found. Explore Arleen Builders construction, interior and sports flooring services in Chennai.',
  h1Hero: pageHero({ img: 'hero-home', alt: 'Eden Square commercial building with a structural glazing facade by Arleen Builders, Chennai', caption: 'Eden Square — Chennai', crumbs: [{ name: 'Home', href: '/' }, { name: 'Page not found' }], kicker: '404', h1: 'Page <em>not found</em>', intro: 'Sorry, we could not find that page. Try one of the divisions below.', actions: false, stats: false }),
  body: `<section class="section section--flush"><div class="container">
    <div class="section-head reveal"><span class="kicker">Where to next</span><h2 class="display">Our three divisions</h2></div>
    ${divisionRows()}
  </div></section>`,
}).replace('<meta name="robots" content="index, follow, max-image-preview:large">', '<meta name="robots" content="noindex, follow">');

/* ---------- Write files ---------- */
// Post-process: add scroll-reveal classes to repeated elements in one place.
const animate = (html) => html
  .replace(/<ul class="clients">([\s\S]*?)<\/ul>/g, (m, inner) => '<ul class="clients">' + inner.replace(/<li>/g, '<li class="reveal">') + '</ul>')
  .replace(/<details>/g, '<details class="reveal">')
  .replace(/<div class="container footer-grid">([\s\S]*?)<\/div>\n  <div class="container footer-bottom">/g, (m, inner) => '<div class="container footer-grid">' + inner.replace(/\n    <div>/g, '\n    <div class="reveal">') + '</div>\n  <div class="container footer-bottom">')
  .replace(/<iframe class="map"/g, '<iframe class="map reveal"');

for (const [file, html] of Object.entries(pages)) writeFileSync(file, animate(html));

const today = new Date().toISOString().slice(0, 10);
const sitemapPages = [['/', '1.0'], ['/services.php', '0.9'], ['/construction.php', '0.9'], ['/interiors.php', '0.9'], ['/sports-flooring.php', '0.9'], ['/projects.php', '0.8'], ['/aboutus.php', '0.7'], ['/contactus.php', '0.8']];
writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPages.map(([u, p]) => `  <url><loc>${SITE.url}${u}</loc><lastmod>${today}</lastmod><priority>${p}</priority></url>`).join('\n')}
</urlset>
`);
writeFileSync('robots.txt', `User-agent: *
Allow: /
Disallow: /build/
Disallow: /raw/
Disallow: /send-enquiry.php

Sitemap: ${SITE.url}/sitemap.xml
`);
console.log('Built', Object.keys(pages).length, 'pages');
