import { useEffect, useMemo, useRef, useState } from 'react';
import type { AnimationDef } from '../types/animation';

function resolveAssetUrl(src: string): string {
  const normalized = src.replace(/^\//, '');
  return new URL(normalized, document.baseURI).toString();
}

export function useSpriteAnimation(def: AnimationDef | undefined, onDone?: () => void): string | undefined {
  const [frame, setFrame] = useState(0);
  const doneCallback = useRef(onDone);
  doneCallback.current = onDone;

  const urls = useMemo(
    () => (def?.frames ?? []).map(resolveAssetUrl),
    [def],
  );

  useEffect(() => {
    let cancelled = false;
    for (const src of urls) {
      const image = new Image();
      image.decoding = 'async';
      image.src = src;
      void image.decode().catch(() => undefined);
    }
    return () => {
      cancelled = true;
      void cancelled;
    };
  }, [urls]);

  useEffect(() => {
    setFrame(0);
    if (!def || urls.length < 2) {
      if (def && urls.length === 1 && !def.loop) {
        const timeout = window.setTimeout(() => doneCallback.current?.(), 1000 / Math.max(def.fps, 1));
        return () => window.clearTimeout(timeout);
      }
      return;
    }

    let current = 0;
    let timer: number | undefined;
    let last = performance.now();
    const frameDuration = 1000 / Math.max(def.fps, 1);

    const tick = (now: number) => {
      if (now - last >= frameDuration) {
        last = now - ((now - last) % frameDuration);
        current += 1;

        if (current >= urls.length) {
          if (def.loop) {
            current = 0;
          } else {
            current = urls.length - 1;
            setFrame(current);
            doneCallback.current?.();
            return;
          }
        }
        setFrame(current);
      }
      timer = window.requestAnimationFrame(tick);
    };

    timer = window.requestAnimationFrame(tick);
    return () => {
      if (timer !== undefined) window.cancelAnimationFrame(timer);
    };
  }, [def, urls]);

  return urls[frame] ?? urls[0];
}
