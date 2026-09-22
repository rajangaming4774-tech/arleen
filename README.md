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
The home page opens with a short pinned, scroll-driven film (see "The film" below). Inner pages open with a full-bleed still from `assets/img/hero-*.webp`.

To add a project:
1. Put its photos in `raw/projects/<folder>/big/`.
2. Add an entry to `PROJECTS` in `data.mjs` (`featured: true` puts it on the home page; the first featured project gets the wide tile, the second the tall one).
3. Run both build commands.

## The film (Home page)
The home page opens with a title card and then plays one continuous, scroll-scrubbed take with three chapters (facade, interiors, sports court). It is stitched from four 8-second clips in `raw/tour/` — `0-tour-1080.mp4` (the opening take under the title card), then `2-facade.mp4`, `3-lobby.mp4`, `4-court.mp4` for the chapters. (`1-exterior-1080.mp4` was dropped on client feedback but is kept in the folder; add it back to `CLIPS` in `build/video.mjs`, set `clips = 5` in `config.mjs` and add its chapter to `FILM` to restore it.)
```bash
node build/video.mjs    # cross-fades the clips into raw/tour-master.mp4, exports 220 WebP frames in three sizes (1920 / 1280 / 720 wide), an mp4 fallback and posters
node build/build.mjs
```
- Clip count, frame count, clip length, cross-fade and sizes live in `build/config.mjs` (`TOUR`). Both `video.mjs` and `build.mjs` read it.
- Chapter titles, sub-lines and links live in `FILM` in `build/build.mjs`. Chapter boundaries follow the cross-fades (`cutPoints()`).
- **Scroll length** is set in CSS: `.film { --screens: 2.6 }` (2.4 on phones) in `assets/css/style.css`. It was 8 before the client asked for a shorter intro; the whole take now plays in about one and a half screens of scrolling. Captions switch on the frame actually drawn (the eased value), so they never run ahead of the footage on a fast flick.
- Frame tiers are in `TOUR.tiers`; the browser picks one by screen size and connection, loads frames coarse-to-fine and eases the shown frame towards the scroll position.
- Visitors with "reduce motion" on, or without JavaScript, get the first frame, the chapters as a list, and a normal `<video>` with controls.

## Design
Warm editorial. Paper background (`--paper`), ink text, a terracotta accent (`--accent`) for kickers, italic emphasis and hovers; only the home film and the footer are dark. Type: `Fraunces` (light serif; italics for emphasis words, pull quotes, captions and menu links) with `Manrope` for body text and small uppercase labels, from one Google Fonts request. Layout: section labels sit in a fixed left margin column (`--margin`, see `.section-head`) with content beside them like a magazine spread; inner pages open with a `.cover` (headline on paper, photo offset right with an italic caption) instead of a full-bleed hero; prose gets a drop cap; the divisions are three columns (`.rows--columns`); projects use an editorial grid (`.work--editorial`: first tile wide, second tall, rest three-up); clients are a running italic line. The header is a fixed paper bar (white text only over the home film); the grid button opens a full-screen menu. Motion is one soft fade-up per section, switched off for "reduce motion".

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
