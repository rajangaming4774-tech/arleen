// Renders the home-hero scroll film: erases each clip's corner watermark, normalises the clips to one
// size, joins them with a short cross-fade, then exports FRAMES evenly spaced WebP frames in two sizes
// (laptop / phone) plus a poster for the LCP <img> and the no-JS view.
// Usage: node build/film.mjs   (requires ffmpeg on PATH). Re-run after changing the clips or FRAMES.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, statSync, rmSync, existsSync } from 'node:fs';

// Clips in order. `logo` is the small "Veo" mark to erase, in that clip's native pixels.
// Both files are the ones supplied by the owner (Building_exterior_and_interior_tour_… and
// Modern_office_lobby_interior_…), kept in raw/tour/ under shorter names.
export const FILM = {
  clips: [
    { file: 'raw/tour/0-tour-1080.mp4', logo: 'delogo=x=1700:y=860:w=80:h=76' }, // 1920x1080, exterior → interior tour (plays first)
    { file: 'raw/tour/3-lobby.mp4', logo: 'delogo=x=1230:y=686:w=48:h=28' },    // 1280x720, office lobby
  ],
  xfade: 0.6,                              // seconds of cross-fade between clips
  frames: 200,                             // frames the scroll animation steps through (~13 per second of footage)
  // width and WebP quality per tier. xl is for desktop and high-resolution screens: the tour clip is
  // genuinely 1920 wide, so rendering the master at 720p was throwing away detail the source has.
  // (The lobby clip is 1280x720 and is upscaled to match — it cannot get sharper than its source.)
  tiers: { xl: [1920, 72], lg: [1280, 66], sm: [720, 58] },
  // Phones hold the hero full-screen and portrait, so a landscape frame has to be blown up about
  // 4x to cover a tall screen — that is what looked soft on mobile. `portrait` renders a centre
  // 9:16 slice of the master instead, at a size close to a phone's real pixels.
  portrait: { size: [900, 1600], q: 58 },
  canvas: [1920, 1080],                    // master resolution and the <canvas> drawing surface
  canvasPortrait: [900, 1600],             // drawing surface when the portrait frames are in use
};

const OUT = 'assets/video/hero';
const TMP = 'raw/tour/_hero-tmp';
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const dur = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const sizeOf = (dir) => readdirSync(dir).reduce((s, f) => s + statSync(`${dir}/${f}`).size, 0);
const mb = (b) => (b / 1048576).toFixed(2) + ' MB';

if (process.argv[1] && process.argv[1].endsWith('film.mjs')) {
  mkdirSync(TMP, { recursive: true });
  mkdirSync(OUT, { recursive: true });
  const [W, H] = FILM.canvas;

  // 1. clean + normalise each clip (intra-only so the cross-fade cuts cleanly)
  const norm = FILM.clips.map((c, i) => {
    const out = `${TMP}/clip-${i + 1}.mp4`;
    ff(['-i', c.file, '-vf', `${c.logo ? c.logo + ',' : ''}scale=${W}:${H}:flags=lanczos,fps=24,format=yuv420p`, '-an', '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-g', '1', out]);
    return out;
  });

  // 2. cross-fade chain into one master
  const master = `${TMP}/master.mp4`;
  if (norm.length === 1) {
    ff(['-i', norm[0], '-c', 'copy', master]);
  } else {
    const durs = norm.map(dur);
    let filter = '', prev = '[0:v]', offset = 0;
    for (let i = 1; i < norm.length; i++) {
      offset += durs[i - 1] - FILM.xfade;
      const label = i === norm.length - 1 ? '[v]' : `[x${i}]`;
      filter += `${prev}[${i}:v]xfade=transition=fade:duration=${FILM.xfade}:offset=${offset.toFixed(3)}${label};`;
      prev = label;
    }
    ff([...norm.flatMap((f) => ['-i', f]), '-filter_complex', filter.slice(0, -1), '-map', '[v]', '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-pix_fmt', 'yuv420p', master]);
  }
  const total = dur(master);
  console.log(`master: ${total.toFixed(2)}s`);

  // 3. frames — fps = FRAMES / duration, so frame i sits at i / FRAMES of the running time
  const sampleFps = (FILM.frames / total).toFixed(6);
  for (const [name, [width, q]] of Object.entries(FILM.tiers)) {
    const dir = `${OUT}/${name}`;
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    ff(['-i', master, '-vf', `fps=${sampleFps},scale=${width}:-2`, '-frames:v', String(FILM.frames), '-c:v', 'libwebp', '-quality', String(q), `${dir}/f-%03d.webp`]);
    const n = readdirSync(dir).length;
    console.log(`${name}: ${n} frames, ${mb(sizeOf(dir))}`);
    if (n !== FILM.frames) console.warn(`WARNING: expected ${FILM.frames} frames in ${dir}, got ${n}`);
  }
  // portrait frames: a centre 9:16 slice, for phones holding the hero full-screen
  {
    const [pw, ph] = FILM.portrait.size;
    const dir = `${OUT}/pt`;
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    ff(['-i', master, '-vf', `fps=${sampleFps},crop=ih*9/16:ih,scale=${pw}:${ph}:flags=lanczos`, '-frames:v', String(FILM.frames),
      '-c:v', 'libwebp', '-quality', String(FILM.portrait.q), `${dir}/f-%03d.webp`]);
    console.log(`pt: ${readdirSync(dir).length} frames, ${mb(sizeOf(dir))}`);
    ff(['-i', master, '-frames:v', '1', '-vf', `crop=ih*9/16:ih,scale=${pw}:${ph}:flags=lanczos`, '-c:v', 'libwebp', '-quality', String(FILM.portrait.q + 10), `${OUT}/poster-pt.webp`]);
  }

  // posters = frame 1 at each tier (the <img> under the canvas; also the no-JS / reduced-motion view)
  for (const [name, [width, q]] of Object.entries(FILM.tiers)) {
    ff(['-i', master, '-frames:v', '1', '-vf', `scale=${width}:-2`, '-c:v', 'libwebp', '-quality', String(q + 10), `${OUT}/poster-${name}.webp`]);
  }
  if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
  console.log('film done');
}
