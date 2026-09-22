// Builds the scroll film from four of the Google Flow (Veo) clips in raw/tour/ (clip 0 runs under the title card, the rest are the chapters).
// 1-exterior-1080.mp4 is left out on client feedback; its file stays in raw/tour/ for reference.
//   1. erases the small "Veo" watermark in each clip's bottom-right corner
//   2. normalises every clip to the master resolution in config.mjs @ 24fps and joins them with 0.6s cross-fades
//   3. exports scroll-scrub WebP frames (desktop + mobile sizes), an mp4 fallback and a poster
// Usage: node build/video.mjs   (requires ffmpeg on PATH)
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, statSync, rmSync, existsSync } from 'node:fs';
import { TOUR } from './config.mjs';

const OUT = 'assets/video';
const TMP = 'raw/tour/_tmp';
const TARGET_SECONDS = TOUR.seconds;
const XFADE = TOUR.xfade;
const FRAMES = TOUR.frames;
const FPS = TOUR.fps;

// Clips in order. `logo` is the watermark box on that clip's native resolution ('' = none).
const CLIPS = [
  { file: 'raw/tour/0-tour-1080.mp4', logo: 'delogo=x=1700:y=860:w=80:h=76' },      // 1920x1080, one-take exterior → interior → court (title card)
  { file: 'raw/tour/2-facade.mp4', logo: 'delogo=x=1230:y=686:w=48:h=28' },        // 1280x720
  { file: 'raw/tour/3-lobby.mp4', logo: 'delogo=x=1230:y=686:w=48:h=28' },
  { file: 'raw/tour/4-court.mp4', logo: 'delogo=x=1230:y=686:w=48:h=28' },
];

const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const sizeOf = (dir) => readdirSync(dir).reduce((s, f) => s + statSync(`${dir}/${f}`).size, 0);
const mb = (b) => (b / 1048576).toFixed(2) + ' MB';
const dur = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());

mkdirSync(TMP, { recursive: true });
mkdirSync(`${OUT}/tour`, { recursive: true });

// 1+2a. clean + normalise each clip (intra-only so the concat filter cuts cleanly)
const norm = CLIPS.map((c, i) => {
  const out = `${TMP}/clip-${i + 1}.mp4`;
  ff(['-i', c.file, '-vf', `${c.logo ? c.logo + ',' : ''}scale=${TOUR.canvas[0]}:${TOUR.canvas[1]}:flags=lanczos,fps=${FPS},format=yuv420p`, '-an', '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-g', '1', out]);
  return out;
});

// 2b. cross-fade chain
const durs = norm.map(dur);
let filter = '', prev = '[0:v]', offset = 0;
for (let i = 1; i < norm.length; i++) {
  offset += durs[i - 1] - XFADE;
  const label = i === norm.length - 1 ? '[v]' : `[x${i}]`;
  filter += `${prev}[${i}:v]xfade=transition=fade:duration=${XFADE}:offset=${offset.toFixed(3)}${label};`;
  prev = label;
}
const master = 'raw/tour-master.mp4';
ff([...norm.flatMap((f) => ['-i', f]), '-filter_complex', filter.slice(0, -1), '-map', '[v]', '-t', String(TARGET_SECONDS), '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-pix_fmt', 'yuv420p', master]);
const total = dur(master);
console.log(`master: ${total.toFixed(2)}s`);

// 3a. scrub frames — pick FRAMES evenly spaced frames
const step = Math.max(1, Math.floor((total * FPS) / FRAMES));
for (const [name, [width, q]] of Object.entries(TOUR.tiers)) {
  const dir = `${OUT}/tour/${name}`;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  ff(['-i', master, '-vf', `select='not(mod(n\\,${step}))',scale=${width}:-2`, '-fps_mode', 'vfr', '-frames:v', String(FRAMES), '-c:v', 'libwebp', '-quality', String(q), `${dir}/f-%03d.webp`]);
  const n = readdirSync(dir).length;
  console.log(`${name}: ${n} frames, ${mb(sizeOf(dir))}`);
  if (n !== FRAMES) console.warn(`WARNING: expected ${FRAMES} frames in ${dir}, got ${n}`);
}

// 3b. fallback video + poster
ff(['-i', master, '-an', '-vf', 'scale=1280:-2', '-c:v', 'libx264', '-crf', '28', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${OUT}/tour.mp4`]);
ff(['-i', master, '-frames:v', '1', '-q:v', '3', `${OUT}/tour-poster.jpg`]);
// 1920-wide first frame for the LCP <img> srcset on large screens
ff(['-i', master, '-frames:v', '1', '-vf', 'scale=1920:-2:flags=lanczos', '-c:v', 'libwebp', '-quality', '70', `${OUT}/tour-poster.webp`]);
console.log('mp4:', mb(statSync(`${OUT}/tour.mp4`).size), '| poster:', mb(statSync(`${OUT}/tour-poster.jpg`).size));
if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
