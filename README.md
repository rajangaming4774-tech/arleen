# Arleen Builders – website (SEO redesign)

A fast, mobile-first rebuild of https://www.arleenbuilders.com. It keeps the old URLs (`index.php`, `aboutus.php`, `services.php`, `projects.php`, `contactus.php`), so existing Google rankings carry over. It also adds three keyword-targeted service pages.

## Pages
| URL | Target keyword |
|---|---|
| `/` | builders, interior decorators & sports flooring in Chennai |
| `/construction.php` | builders in Chennai |
| `/interiors.php` | interior decorators in Chennai, ACP cladding, glazing |
| `/sports-flooring.php` | sports flooring in Chennai, badminton court construction |
| `/projects.php` | gallery with lightbox, grouped by division (15 projects) |
| `/aboutus.php`, `/services.php`, `/contactus.php` | supporting pages |

## Editing content
All pages are generated from two files:
- `build/data.mjs`: phone numbers, address, email and the **project list** (add new projects here).
- `build/build.mjs`: page text, titles, meta descriptions, FAQs and schema.

Rebuild after editing:
```bash
node build/images.mjs   # only when you add or replace photos (needs ffmpeg)
node build/build.mjs    # regenerates the .php pages, sitemap.xml and robots.txt
node build/serve.mjs    # local preview on http://localhost:8080
```
The home page opens with a real project photograph in a rounded card (see "Home hero"). Inner pages open with a `.cover`: the headline on paper with the photo beside it.

To add a project:
1. Put its photos in `raw/projects/<folder>/big/`.
2. Add an entry to `PROJECTS` in `data.mjs` (`featured: true` puts it on the home page; the first featured project gets the wide tile, the second the tall one).
3. Run both build commands.

## Home hero
The home page opens with the rounded card playing a short **scroll film** made of two clips the
owner supplied, cross-faded into one 15 s take: the building exterior → interior tour first
(`raw/tour/0-tour-1080.mp4` = `Building_exterior_and_interior_tour_20260921203742.mp4`), then the
office lobby (`raw/tour/3-lobby.mp4` = `Modern_office_lobby_interior_20260921212448.mp4`).
The card pins for three screens of scrolling while the footage advances with the scroll; the
headline stays over it. Frames are rendered by `build/film.mjs` (`FILM`: clips in order, watermark
boxes, cross-fade, frame count, sizes) into `assets/video/hero/` — 200 WebP frames at 1280 and 720
wide plus a poster that is the LCP `<img>` and the whole hero for "reduce motion" / no-JS visitors:
```bash
node build/film.mjs     # re-render after changing the clips or FRAMES (needs ffmpeg)
node build/build.mjs
```
The scroll length is `.hero--film { --screens: 3 }` (2.6 on phones) in `assets/css/style.css`.
The text, alt and credit line live in `HERO_FILM` in `build/build.mjs`.

`HOME_HEROES` / `hero-index-*.webp` (real project photographs cut by `build/images.mjs`) remain
available as a still alternative; `HOME_HERO` picks one but nothing renders it at present.

## Material the owner supplies
`build/data.mjs` ends with three deliberately empty structures — `TESTIMONIALS`, `TEAM` and
`CREDENTIALS`. Each section renders **only** when its data is filled in, so the site never shows an
empty heading and never shows anything invented. Fill them from real material: a testimonial needs
`consent: true` and the client's own words; registration numbers come off the certificate. Filled
values also flow into the footer line, the contact card and the search data automatically.

## Design
Warm editorial. Paper background (`--paper`), ink text, a terracotta accent (`--accent`) for kickers, italic emphasis and hovers; only the home hero card and the footer are dark. Type: `Fraunces` (light serif; italics for emphasis words, pull quotes, captions and menu links) with `Manrope` for body text and small uppercase labels, from one Google Fonts request. Layout: section labels sit in a fixed left margin column (`--margin`, see `.section-head`) with content beside them like a magazine spread; inner pages open with a `.cover` (headline on paper, photo offset right with an italic caption) instead of a full-bleed hero; prose gets a drop cap; the divisions are three columns (`.rows--columns`); projects use an editorial grid (`.work--editorial`: first tile wide, second tall, rest three-up); clients are a running italic line. The header is a fixed paper bar on every page; the grid button opens a full-screen menu. Motion is one soft fade-up per section, switched off for "reduce motion".

## Deploying (cPanel / shared hosting)
Upload these files to `public_html`, replacing the old site:
```
index.php aboutus.php services.php construction.php interiors.php sports-flooring.php
projects.php contactus.php 404.php send-enquiry.php .htaccess sitemap.xml robots.txt
Arleen-Builders-Brochure.pdf  assets/   (about 6.5 MB of photographs)
```
Do **not** upload `raw/`, `build/` or `.claude/`.

After going live:
1. Back up the old site first. Keep its old `images/` and `projects/` folders so old image links do not break.
2. Check that the contact form email arrives. `send-enquiry.php` uses PHP `mail()`; if the host blocks it, switch to SMTP.
3. **Google Search Console**: add the property and submit `https://www.arleenbuilders.com/sitemap.xml`.
4. **Google Business Profile**: use exactly the same name, address and both phone numbers as on the site.
5. Test with the Rich Results Test and PageSpeed Insights.

## SEO included
- A unique title, meta description and canonical link on each page, plus one H1 per page, Open Graph/Twitter tags and `lang="en-IN"`.
- JSON-LD: GeneralContractor/LocalBusiness, Service, FAQPage, BreadcrumbList and ItemList.
- Images are WebP with SEO file names, alt text, `srcset` and lazy loading. They total 6.5 MB, down from 15 MB, and no jQuery is used.
- `sitemap.xml`, `robots.txt`, and `.htaccess` with https + www redirects, gzip, caching and a 404 page.
- Full-screen menu, fixed header, and click-to-call and WhatsApp buttons.
- Scroll animations (no library): one quiet staggered fade-up per section, switched off automatically for visitors who have "reduce motion" enabled.
