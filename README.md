# Arleen Builders – website (SEO redesign)

A fast, mobile-first rebuild of https://www.arleenbuilders.com. It keeps the old URLs (`index.php`, `aboutus.php`, `services.php`, `projects.php`, `contactus.php`), so existing Google rankings carry over. It also adds three keyword-targeted service pages.

## Pages
| URL | Target keyword |
|---|---|
| `/` | builders, interior decorators & sports flooring in Chennai |
| `/construction.php` | builders in Chennai |
| `/interiors.php` | interior decorators in Chennai, ACP cladding, glazing |
| `/sports-flooring.php` | sports flooring in Chennai, badminton court construction |
| `/projects.php` | filterable gallery with lightbox (15 projects) |
| `/aboutus.php`, `/services.php`, `/contactus.php` | supporting pages |

## Editing content
All pages are generated from two files:
- `build/data.mjs`: phone numbers, address, email and the **project list** (add new projects here).
- `build/build.mjs`: page text, titles, meta descriptions, FAQs and schema.

Rebuild after editing:
```bash
node build/images.mjs   # only when you add or replace photos or the hero video (needs ffmpeg)
node build/build.mjs    # regenerates the .php pages, sitemap.xml and robots.txt
node build/serve.mjs    # local preview on http://localhost:8080
```
The home page opens with a headline and one framed photo that slowly cross-fades through three real projects (see "Home hero" below). Inner pages open with a full-bleed still from `assets/img/hero-*.webp`.

To add a project:
1. Put its photos in `raw/projects/<folder>/big/`.
2. Add an entry to `PROJECTS` in `data.mjs` (`featured: true` puts it on the home page; the first featured project gets the wide tile, the second the tall one).
3. Run both build commands.

## Home hero
`HERO_PHOTOS` in `build/build.mjs` lists the photos that cross-fade in the hero frame, with their alt text and caption. They are the `hero-*.webp` banners, rendered from the raw project photos by `build/images.mjs` (the `heroes` map there says which raw file each one comes from). The first photo is preloaded; the fade runs every 5.5 s in `assets/js/main.js` and is switched off for visitors with "reduce motion" on.

The earlier AI-generated scroll film was removed on client feedback (too long, and not their building). Its source clips are still in `raw/tour/` if ever needed.

## Design
Warm white UI, near-black text, hairline dividers; the inner-page heroes are full-bleed photos with white captions. Type: `Fraunces` (light serif, sentence case) for headings and `Manrope` for body text and small uppercase labels, from one Google Fonts request. Projects use an editorial grid (`.work--editorial`): the first tile wide, the second tall, the rest three-up. The header is a fixed bar (transparent over the dark inner-page heroes, light on the home page); the grid button opens a full-screen menu with every page, the three divisions and contact details. Gold (`--gold`) is used for kickers, the active nav link, focus rings and the submit button; the WhatsApp button keeps its green. Motion is one soft fade-up per section, switched off for "reduce motion".

## Deploying (cPanel / shared hosting)
Upload these files to `public_html`, replacing the old site:
```
index.php aboutus.php services.php construction.php interiors.php sports-flooring.php
projects.php contactus.php 404.php send-enquiry.php .htaccess sitemap.xml robots.txt
Arleen-Builders-Brochure.pdf  assets/   (includes assets/video/ — about 42 MB, mostly the 660 film frames in three sizes)
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
- Scroll animations (no library): quiet staggered reveal of sections, counting stats and inner-page hero parallax. All of it is switched off automatically for visitors who have "reduce motion" enabled.
