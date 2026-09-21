// Converts raw downloads into optimised WebP (large + small) with SEO file names.
// Usage: node build/images.mjs   (requires ffmpeg on PATH)
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { PROJECTS, imgName } from './data.mjs';

const RAW = 'raw';
const OUT = 'assets/img';
mkdirSync(`${OUT}/projects`, { recursive: true });

const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);
const webp = (src, dst, width, q = 78) =>
  ff(['-i', src, '-vf', `scale='min(${width},iw)':-2`, '-c:v', 'libwebp', '-quality', String(q), dst]);

for (const p of PROJECTS) {
  p.files.forEach((f, i) => {
    const src = `${RAW}/projects/${p.dir}/big/${f}.jpg`;
    if (!existsSync(src)) return console.warn('missing', src);
    const base = `${OUT}/projects/${imgName(p, i)}`;
    webp(src, `${base}.webp`, 1400);
    webp(src, `${base}-sm.webp`, 640, 72);
  });
}

// Hero / page banners
const heroes = {
  'hero-home': 'projects/edensquare/big/edensquare_1.jpg',
  'hero-construction': 'projects/sunil/big/sunil1.jpg',
  'hero-interiors': 'projects/recreationcentre-1/big/billards_2.jpg',
  'hero-sports': 'projects/sacred-heart/big/1.jpg',
  'hero-about': 'projects/kk-nirmala-school/big/schools1.jpg',
};
for (const [name, src] of Object.entries(heroes)) {
  webp(`${RAW}/${src}`, `${OUT}/${name}.webp`, 1920, 70);
  webp(`${RAW}/${src}`, `${OUT}/${name}-sm.webp`, 800, 65);
}

// Logo: white -> transparent, resized
ff(['-i', `${RAW}/images/logo.png`, '-vf', 'scale=360:-2,colorkey=white:0.08:0.05,format=rgba', `${OUT}/logo.png`]);
ff(['-i', `${OUT}/logo.png`, '-c:v', 'libwebp', '-quality', '90', `${OUT}/logo.webp`]);
// Favicon + social share image
ff(['-i', `${RAW}/images/logo.png`, '-vf', 'crop=1110:1060:0:0,scale=-2:168,pad=192:192:(ow-iw)/2:(oh-ih)/2:white', `${OUT}/favicon.png`]);
ff(['-i', `${RAW}/projects/edensquare/big/edensquare_1.jpg`, '-vf', 'scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630', '-q:v', '4', `${OUT}/og-image.jpg`]);


console.log('images done');
