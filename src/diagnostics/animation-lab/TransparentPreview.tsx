import { useEffect, useState } from 'react';
import manifestJson from '../../../../public/assets/runtime/runtime_manifest.json';
import { frameAtElapsed } from './player';
import type { RuntimeManifest } from './types';

const manifest = manifestJson as RuntimeManifest;
export function TransparentPreview() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('animation') ?? 'poko_idle_blink';
  const animation = manifest.animations.find((item) => item.id === id) ?? manifest.animations[0]!;
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const start = performance.now(); let raf = 0;
    const tick = (now:number) => { setFrame(frameAtElapsed(now-start, animation.frameCount, animation.fps, animation.playback, animation.loop).frameIndex); raf=requestAnimationFrame(tick); };
    raf=requestAnimationFrame(tick); return()=>cancelAnimationFrame(raf);
  }, [animation]);
  return <main className="transparent-preview"><div className="preview-ground"/><div className="preview-sprite"><img src={animation.frames[frame]} alt="transparent animation preview" /></div><div className="preview-caption">{animation.id} · {frame+1}/{animation.frameCount}</div></main>;
}
