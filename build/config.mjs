// Single source of truth for the home-page film (scroll-scrubbed frame sequence).
// Used by build/video.mjs (renders the frames) and build/build.mjs (writes the markup).
const clips = 4;        // clips in build/video.mjs CLIPS, in order: 0 (title-card take) + 3 chapters
const clipSeconds = 8;  // each raw clip
const xfade = 0.6;      // cross-fade between clips

export const TOUR = {
  frames: 220,          // frames the scroll animation steps through
  fps: 24,
  clips,
  clipSeconds,
  xfade,
  seconds: clips * clipSeconds - (clips - 1) * xfade, // length of the stitched master (30.2s)
  // Frame tiers: width and WebP quality. xl is the native 1080p master for large / high-DPI screens,
  // lg for laptops, sm for phones. The browser picks one tier by screen size and connection.
  tiers: { xl: [1920, 64], lg: [1280, 58], sm: [720, 56] },
  canvas: [1920, 1080], // master resolution and the <canvas> drawing surface
};

// Progress (0–1) at which each cross-fade sits: the title card runs over clip 0,
// then each chapter starts on its own clip.
export const cutPoints = () => Array.from({ length: clips - 1 }, (_, k) => ((k + 1) * (clipSeconds - xfade)) / TOUR.seconds);
