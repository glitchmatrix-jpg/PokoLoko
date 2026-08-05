import { useEffect, useState } from 'react';
import { resolveRuntimeAssetUrl } from '../shared/assetUrl';

export function SplashSurface() {
  const [readyToSkip, setReadyToSkip] = useState(false);
  useEffect(() => {
    const skipTimer = window.setTimeout(() => setReadyToSkip(true), 650);
    const finishTimer = window.setTimeout(() => {
      void window.pokoloko.sendWindowCommand({ type: 'splash_complete' });
    }, 1900);
    return () => { window.clearTimeout(skipTimer); window.clearTimeout(finishTimer); };
  }, []);

  return <main className="splash-screen" onPointerDown={() => {
    if (readyToSkip) void window.pokoloko.sendWindowCommand({ type: 'splash_complete' });
  }}>
    <div className="splash-glow" aria-hidden="true" />
    <div className="splash-pair" aria-hidden="true">
      <img className="splash-poko" src={resolveRuntimeAssetUrl('assets/runtime/poko/idle/poko_idle_blink/frame_000.png')} alt="" />
      <img className="splash-loko" src={resolveRuntimeAssetUrl('assets/runtime/loko/idle/loko_idle_front/frame_000.png')} alt="" />
      <span className="splash-heart">♥</span>
    </div>
    <img className="splash-wordmark" src={resolveRuntimeAssetUrl('brand/pokoloko_wordmark_stacked.png')} alt="PokoLoko" />
    <p className="splash-skip" aria-live="polite">{readyToSkip ? 'Click anywhere to skip' : 'Waking your companions…'}</p>
  </main>;
}
