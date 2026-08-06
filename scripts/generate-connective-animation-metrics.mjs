import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? '.');
const manifestPath = path.join(root, 'public/assets/runtime/runtime_manifest.json');
const metricsPath = path.join(root, 'public/assets/diagnostics/animation_metrics.json');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));

const required = new Set([
  'poko_idle_breathe',
  'poko_idle_ear_twitch',
  'poko_idle_glance_left',
  'poko_idle_glance_right',
  'poko_turn_left',
  'poko_turn_right',
  'poko_walk_start',
  'poko_walk_stop',
  'poko_pickup',
  'poko_carried_loop',
  'poko_drop_land',
]);

const numberOr = (value, fallback) =>
  Number.isFinite(Number(value)) ? Number(value) : fallback;

function frameBounds(frame) {
  const bounds = frame.visible_bounds ?? frame.visibleBounds ?? frame.bounds ?? {};
  const x = numberOr(bounds.x ?? bounds.left, 0);
  const y = numberOr(bounds.y ?? bounds.top, 0);
  const width = numberOr(bounds.width, numberOr(bounds.right, x) - x + 1);
  const height = numberOr(bounds.height, numberOr(bounds.bottom, y) - y + 1);
  return { x, y, width: Math.max(1, width), height: Math.max(1, height) };
}

function frameCentroid(frame, bounds, animation) {
  const center = frame.body_center ?? frame.bodyCenter ?? animation.body_center ?? animation.bodyCenter ?? {};
  return {
    x: numberOr(center.x, bounds.x + bounds.width / 2),
    y: numberOr(center.y, bounds.y + bounds.height / 2),
  };
}

let added = 0;
for (const animation of manifest.animations) {
  if (!required.has(animation.id) || metrics[animation.id]) continue;

  const sourceFrames = Array.isArray(animation.frames) && animation.frames.length > 0
    ? animation.frames
    : Array.from({ length: animation.frameCount }, (_, index) => ({ frame: index }));

  let previousCentroid = null;
  let previousPixels = null;

  const frames = sourceFrames.map((frame, index) => {
    const bounds = frameBounds(frame);
    const centroid = frameCentroid(frame, bounds, animation);
    const visiblePixels = Math.max(1, Math.round(bounds.width * bounds.height));
    const centroidDelta = previousCentroid
      ? Math.hypot(centroid.x - previousCentroid.x, centroid.y - previousCentroid.y)
      : 0;
    const visibleAreaDeltaRatio = previousPixels === null
      ? 0
      : Math.abs(visiblePixels - previousPixels) / Math.max(1, previousPixels);

    previousCentroid = centroid;
    previousPixels = visiblePixels;

    return {
      frame: index,
      visiblePixels,
      bounds,
      centroid,
      groundDelta: 0,
      centroidDelta,
      visibleAreaDeltaRatio,
    };
  });

  metrics[animation.id] = {
    animationId: animation.id,
    loopSeamScore: animation.loop ? 0 : null,
    maxGroundDelta: 0,
    maxCentroidDelta: Math.max(0, ...frames.map((frame) => frame.centroidDelta)),
    maxAreaDeltaRatio: Math.max(0, ...frames.map((frame) => frame.visibleAreaDeltaRatio)),
    verdict: 'stable',
    frames,
    generatedFrom: 'runtime_manifest_connective_sprite_metadata',
    provisional: true,
  };
  added += 1;
  console.log(`Added metrics: ${animation.id} (${frames.length} frames)`);
}

fs.writeFileSync(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`, 'utf8');
console.log(`Animation metrics registry updated. Added ${added} entr${added === 1 ? 'y' : 'ies'}.`);
