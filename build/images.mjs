// Converts raw downloads into optimised WebP (large + small) with SEO file names.
// Usage: node build/images.mjs   (requires ffmpeg on PATH)
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { PROJECTS, imgName } from './data.mjs';

const RAW = 'raw';
const OUT = 'assets/img';
mkdirSync(`${OUT}/projects`, { recursive: true });

// Widest file we ever emit. Every scale below is `min(CAP,iw)`, so this is a ceiling and never an
// upscale: a 1280-wide original still ships at 1280. Raising it simply stops us from throwing away
// the detail the sharper sources (the 2048-wide sacred-heart set) actually have.
const FULL = 2048;

const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);
const webp = (src, dst, width, q = 78) =>
  ff(['-i', src, '-vf', `scale='min(${width},iw)':-2`, '-c:v', 'libwebp', '-quality', String(q), dst]);

// The Eden Square frame has a rival contractor's signboard at the right edge; everything that uses
// this photo goes through the crop below so the board never ships.
const EDENSQUARE = 'projects/edensquare/big/edensquare_1.jpg';
const noRival = 'crop=iw*0.88:ih:0:0';

for (const p of PROJECTS) {
  p.files.forEach((f, i) => {
    const src = `${RAW}/projects/${p.dir}/big/${f}.jpg`;
    if (!existsSync(src)) return console.warn('missing', src);
    const base = `${OUT}/projects/${imgName(p, i)}`;
    const pre = src.endsWith(EDENSQUARE) ? `${noRival},` : '';
    // `min(CAP,iw)` never upscales, so the cap only ever throws detail away. Most of these
    // originals are 1280 wide and the sacred-heart set is 2048; capping at 1400 was discarding
    // the sharpest source we have, which showed as soft tiles on large and high-DPI screens.
    ff(['-i', src, '-vf', `${pre}scale='min(${FULL},iw)':-2`, '-c:v', 'libwebp', '-quality', '78', `${base}.webp`]);
    ff(['-i', src, '-vf', `${pre}scale='min(640,iw)':-2`, '-c:v', 'libwebp', '-quality', '72', `${base}-sm.webp`]);
  });
}

// Home hero: a 16:9 crop of one real project, biased up so the roof line survives.
// Two candidates while the owner picks; the unused one is dropped afterwards.
const HOME_HEROES = {
  'hero-index-a': 'projects/sacred-heart/big/1.jpg', // indoor court, 2048x1536 — the only true 1920w source
  'hero-index-b': 'projects/kk-nirmala-school/big/schools1.jpg', // college block at dusk, 1280w
};
const wide = "crop=iw:iw*9/16:0:(ih-ih*9/16)*0.40";
for (const [name, src] of Object.entries(HOME_HEROES)) {
  for (const [suffix, width, q] of [['', FULL, 72], ['-1280', 1280, 70], ['-sm', 800, 66]]) {
    ff(['-i', `${RAW}/${src}`, '-vf', `${wide},scale='min(${width},iw)':-2`, '-c:v', 'libwebp', '-quality', String(q), `${OUT}/${name}${suffix}.webp`]);
  }
}

// Hero / page banners
const heroes = {
  'hero-home': EDENSQUARE,
  'hero-construction': 'projects/sunil/big/sunil1.jpg',
  'hero-interiors': 'projects/recreationcentre-1/big/billards_2.jpg',
  'hero-sports': 'projects/sacred-heart/big/1.jpg',
  'hero-about': 'projects/kk-nirmala-school/big/schools1.jpg',
};
for (const [name, src] of Object.entries(heroes)) {
  const pre = src === EDENSQUARE ? `${noRival},` : '';
  ff(['-i', `${RAW}/${src}`, '-vf', `${pre}scale='min(${FULL},iw)':-2`, '-c:v', 'libwebp', '-quality', '70', `${OUT}/${name}.webp`]);
  ff(['-i', `${RAW}/${src}`, '-vf', `${pre}scale='min(800,iw)':-2`, '-c:v', 'libwebp', '-quality', '65', `${OUT}/${name}-sm.webp`]);
}

// One share image per page, from that page's own hero, so a shared link previews the right work.
const OG = {
  'og-home': HOME_HEROES['hero-index-a'],
  'og-about': 'projects/kk-nirmala-school/big/schools1.jpg',
  'og-construction': 'projects/sunil/big/sunil1.jpg',
  'og-interiors': 'projects/recreationcentre-1/big/billards_2.jpg',
  'og-sports': 'projects/sacred-heart/big/1.jpg',
  'og-projects': 'projects/cloudyshop/big/cloudyshop_1.jpg',
};
for (const [name, src] of Object.entries(OG)) {
  ff(['-i', `${RAW}/${src}`, '-vf', 'scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630', '-q:v', '4', `${OUT}/${name}.jpg`]);
}

// Logo: white -> transparent, resized
ff(['-i', `${RAW}/images/logo.png`, '-vf', 'scale=360:-2,colorkey=white:0.08:0.05,format=rgba', `${OUT}/logo.png`]);
ff(['-i', `${OUT}/logo.png`, '-c:v', 'libwebp', '-quality', '90', `${OUT}/logo.webp`]);
// Favicon + social share image
ff(['-i', `${RAW}/images/logo.png`, '-vf', 'crop=1110:1060:0:0,scale=-2:168,pad=192:192:(ow-iw)/2:(oh-ih)/2:white', `${OUT}/favicon.png`]);
ff(['-i', `${RAW}/${EDENSQUARE}`, '-vf', `${noRival},scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630`, '-q:v', '4', `${OUT}/og-image.jpg`]);


console.log('images done');
