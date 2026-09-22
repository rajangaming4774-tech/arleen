// Renders the home-hero scroll film from ONE clip: erases its corner watermark, exports FRAMES evenly
// spaced WebP frames in two sizes (laptop / phone), plus a poster for the LCP <img> and the no-JS view.
// Usage: node build/film.mjs   (requires ffmpeg on PATH). Re-run after changing the clip or FRAMES.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, statSync, rmSync } from 'node:fs';

// The clip: the office-lobby take (the same file as the one supplied as
// Modern_office_lobby_interior_20260921212448.mp4), 1280x720, 24 fps, 8 s.
export const FILM = {
  clip: 'raw/tour/3-lobby.mp4',
  logo: 'delogo=x=1230:y=686:w=48:h=28', // small "Veo" mark in the bottom-right corner
  frames: 120,                            // frames the scroll animation steps through (15 per second of footage)
  tiers: { lg: [1280, 60], sm: [720, 56] }, // width and WebP quality; the source is 720p so no larger tier
  canvas: [1280, 720],                    // <canvas> drawing surface
};

const OUT = 'assets/video/hero';
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const dur = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const sizeOf = (dir) => readdirSync(dir).reduce((s, f) => s + statSync(`${dir}/${f}`).size, 0);
const mb = (b) => (b / 1048576).toFixed(2) + ' MB';

if (process.argv[1] && process.argv[1].endsWith('film.mjs')) {
  const total = dur(FILM.clip);
  // fps = frames / duration, so frame i sits at i / FRAMES of the running time
  const sampleFps = (FILM.frames / total).toFixed(6);
  for (const [name, [width, q]] of Object.entries(FILM.tiers)) {
    const dir = `${OUT}/${name}`;
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    ff(['-i', FILM.clip, '-vf', `${FILM.logo},fps=${sampleFps},scale=${width}:-2`, '-frames:v', String(FILM.frames), '-c:v', 'libwebp', '-quality', String(q), `${dir}/f-%03d.webp`]);
    const n = readdirSync(dir).length;
    console.log(`${name}: ${n} frames, ${mb(sizeOf(dir))}`);
    if (n !== FILM.frames) console.warn(`WARNING: expected ${FILM.frames} frames in ${dir}, got ${n}`);
  }
  // posters = frame 1 at each tier (the <img> under the canvas; also the no-JS / reduced-motion view)
  for (const [name, [width, q]] of Object.entries(FILM.tiers)) {
    ff(['-i', FILM.clip, '-vf', `${FILM.logo},scale=${width}:-2`, '-frames:v', '1', '-c:v', 'libwebp', '-quality', String(q + 10), `${OUT}/poster-${name}.webp`]);
  }
  console.log('film done');
}
