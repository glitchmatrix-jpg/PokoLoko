import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { LivingRuntimeSnapshot, StaticPetPresentation } from '../../electron/preload/contracts';
import { BrowserAnimationDriver, type AnimationClockSnapshot } from '../../packages/animation-runtime/src';
import { resolveRuntimeAssetUrl } from '../shared/assetUrl';

const ALPHA_HIT_THRESHOLD = 24;

function pointHitsVisiblePixel(
  event: ReactPointerEvent<HTMLElement>,
  presentation: StaticPetPresentation,
  alphaCanvas: HTMLCanvasElement | null,
): boolean {
  if (!alphaCanvas) return false;
  const x = Math.floor((event.clientX - presentation.spriteOffset.x) / presentation.scale);
  const y = Math.floor((event.clientY - presentation.spriteOffset.y) / presentation.scale);
  if (x < 0 || y < 0 || x >= presentation.canvasSize || y >= presentation.canvasSize) return false;
  const context = alphaCanvas.getContext('2d', { willReadFrequently: true });
  if (!context) return false;
  return context.getImageData(x, y, 1, 1).data[3]! >= ALPHA_HIT_THRESHOLD;
}

function pointerCommandBase(event: ReactPointerEvent<HTMLElement>) {
  return {
    pointerId: event.pointerId,
    button: event.button,
    screen: { x: event.screenX, y: event.screenY },
    monotonicMs: performance.now(),
  } as const;
}

export function PetSurface() {
  const [presentation, setPresentation] = useState<StaticPetPresentation | null>(null);
  const [clock, setClock] = useState<AnimationClockSnapshot | null>(null);
  const [living, setLiving] = useState<LivingRuntimeSnapshot | null>(null);
  const alphaCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const interactiveRef = useRef(false);
  const driverRef = useRef<BrowserAnimationDriver | null>(null);
  const capturedPointerRef = useRef<number | null>(null);

  useEffect(() => {
    const driver = new BrowserAnimationDriver((event) => {
      if (event.type === 'ANIMATION_COMPLETED' || (event.type === 'FRAME_CHANGED' && event.loopBoundary)) {
        void window.pokoloko.sendWindowCommand({ type: 'report_animation_event', event });
      }
    });
    driverRef.current = driver;
    const unsubscribe = driver.subscribe(setClock);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') driver.suspend();
      else driver.resumeFromSuspend();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      unsubscribe();
      driver.dispose();
      driverRef.current = null;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void window.pokoloko.getStaticPetPresentation().then((value) => {
      if (active) setPresentation(value);
    });
    const unsubscribe = window.pokoloko.onStaticPetPresentation(setPresentation);
    const unsubscribeLiving = window.pokoloko.onLivingRuntimeSnapshot(setLiving);
    const unsubscribeLocomotion = window.pokoloko.onLocomotionEvent((event) => {
      document.documentElement.dataset.lastLocomotionEvent = event.type;
    });
    return () => {
      active = false;
      unsubscribe();
      unsubscribeLocomotion();
      unsubscribeLiving();
    };
  }, []);

  useEffect(() => {
    if (!presentation || !driverRef.current) return;
    driverRef.current.play({
      definition: {
        id: presentation.animationId,
        frames: presentation.frames,
        fps: presentation.fps,
        playback: presentation.playback,
        loop: presentation.loop,
      },
      generation: presentation.animationGeneration,
    });
  }, [
    presentation?.animationGeneration,
    presentation?.animationId,
    presentation?.fps,
    presentation?.loop,
    presentation?.playback,
    presentation?.frames,
  ]);

  useEffect(() => {
    const driver = driverRef.current;
    if (!driver || !presentation) return;
    if (presentation.interaction.phase === 'dragged' || presentation.interaction.phase === 'settling' || living?.mode === 'paused') driver.pause();
    else driver.resume();
  }, [presentation?.interaction.phase, living?.mode]);

  const frameIndex = Math.min(clock?.frameIndex ?? 0, Math.max(0, (presentation?.frames.length ?? 1) - 1));
  const framePath = presentation?.frames[frameIndex];
  const frameUrl = useMemo(() => framePath ? resolveRuntimeAssetUrl(framePath) : undefined, [framePath]);

  useEffect(() => {
    if (!presentation || !frameUrl) return;
    let active = true;
    const source = new Image();
    source.decoding = 'sync';
    source.onload = () => {
      if (!active) return;
      const canvas = document.createElement('canvas');
      canvas.width = presentation.canvasSize;
      canvas.height = presentation.canvasSize;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;
      context.imageSmoothingEnabled = false;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(source, 0, 0, presentation.canvasSize, presentation.canvasSize);
      if (active) alphaCanvasRef.current = canvas;
    };
    source.onerror = () => { if (active) alphaCanvasRef.current = null; };
    source.src = frameUrl;
    return () => {
      active = false;
      source.onload = null;
      source.onerror = null;
      alphaCanvasRef.current = null;
    };
  }, [frameUrl, presentation?.canvasSize]);

  async function updateHitTest(interactive: boolean): Promise<void> {
    if (!interactive) return;
    if (interactiveRef.current) return;
    interactiveRef.current = true;
    await window.pokoloko.sendWindowCommand({
      type: 'set_pet_hit_test',
      interactive: true,
    });
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>): void {
    if (!presentation) return;
    if (capturedPointerRef.current === event.pointerId) {
      void window.pokoloko.sendWindowCommand({ type: 'pet_pointer_move', ...pointerCommandBase(event) });
      return;
    }
    void updateHitTest(pointHitsVisiblePixel(event, presentation, alphaCanvasRef.current));
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLElement>): void {
    if (!presentation || event.button !== 0 || !pointHitsVisiblePixel(event, presentation, alphaCanvasRef.current)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    capturedPointerRef.current = event.pointerId;
    void updateHitTest(true);
    void window.pokoloko.sendWindowCommand({ type: 'pet_pointer_down', ...pointerCommandBase(event) });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLElement>): void {
    if (capturedPointerRef.current !== event.pointerId) return;
    void window.pokoloko.sendWindowCommand({ type: 'pet_pointer_up', ...pointerCommandBase(event) });
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    capturedPointerRef.current = null;
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLElement>): void {
    if (capturedPointerRef.current !== event.pointerId) return;
    void window.pokoloko.sendWindowCommand({ type: 'pet_pointer_cancel', reason: 'renderer-pointer-cancel' });
    capturedPointerRef.current = null;
    void updateHitTest(false);
  }

  function handlePointerLeave(): void {
    if (capturedPointerRef.current === null) void updateHitTest(false);
  }

  if (!presentation || !frameUrl) return <main className="pet-surface" aria-label="PokoLoko pet loading" />;

  const spriteStyle = {
    left: `${presentation.spriteOffset.x}px`,
    top: `${presentation.spriteOffset.y}px`,
    width: `${presentation.canvasSize * presentation.scale}px`,
    height: `${presentation.canvasSize * presentation.scale}px`,
  } as const;

  return (
    <main
      className="pet-surface static-pet-surface"
      aria-label={`${presentation.character} animated on the desktop`}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
      onContextMenu={(event) => {
        event.preventDefault();
        void window.pokoloko.sendWindowCommand({ type: 'open_settings' });
      }}
      data-animation-id={presentation.animationId}
      data-frame-index={frameIndex}
      data-animation-generation={presentation.animationGeneration}
      data-locomotion-state={presentation.locomotion.state}
      data-locomotion-direction={presentation.locomotion.direction}
      data-locomotion-generation={presentation.locomotion.generation}
      data-interaction-phase={presentation.interaction.phase}
      data-interaction-generation={presentation.interaction.generation}
    >
      <img className="static-pet-sprite" src={frameUrl} alt="" draggable={false} style={spriteStyle} />
    </main>
  );
}
