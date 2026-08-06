import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { LivingRuntimeSnapshot, StaticPetPresentation } from '../../electron/preload/contracts';
import { BrowserAnimationDriver, type AnimationClockSnapshot } from '../../packages/animation-runtime/src';
import { resolveRuntimeAssetUrl } from '../shared/assetUrl';

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
  const driverRef = useRef<BrowserAnimationDriver | null>(null);
  const capturedPointerRef = useRef<number | null>(null);
  const pendingPointerMoveRef = useRef<
    Parameters<typeof window.pokoloko.sendWindowCommand>[0] | null
  >(null);
  const pointerMoveFrameRef = useRef<number | null>(null);

  function sendPointerCommand(
    command: Parameters<typeof window.pokoloko.sendWindowCommand>[0],
  ): void {
    void window.pokoloko.sendWindowCommand(command).catch((error: unknown): void => {
      console.error('PokoLoko pointer command failed', error);
    });
  }

  function flushPendingPointerMove(): void {
    if (pointerMoveFrameRef.current !== null) {
      cancelAnimationFrame(pointerMoveFrameRef.current);
      pointerMoveFrameRef.current = null;
    }
    const command = pendingPointerMoveRef.current;
    pendingPointerMoveRef.current = null;
    if (command) sendPointerCommand(command);
  }

  function schedulePointerMove(
    command: Parameters<typeof window.pokoloko.sendWindowCommand>[0],
  ): void {
    pendingPointerMoveRef.current = command;
    if (pointerMoveFrameRef.current !== null) return;
    pointerMoveFrameRef.current = requestAnimationFrame((): void => {
      pointerMoveFrameRef.current = null;
      const latestCommand = pendingPointerMoveRef.current;
      pendingPointerMoveRef.current = null;
      if (latestCommand) sendPointerCommand(latestCommand);
    });
  }

  function finishPointer(pointerId: number, screenX: number, screenY: number): void {
    if (capturedPointerRef.current !== pointerId) return;
    flushPendingPointerMove();
    sendPointerCommand({
      type: 'pet_pointer_up',
      pointerId,
      button: 0,
      screen: { x: screenX, y: screenY },
      monotonicMs: performance.now(),
    });
    capturedPointerRef.current = null;
  }

  useEffect(() => {
    const driver = new BrowserAnimationDriver((event) => {
      if (
        event.type === 'ANIMATION_COMPLETED' ||
        (event.type === 'FRAME_CHANGED' && event.loopBoundary)
      ) {
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
    const handleWindowPointerUp = (event: PointerEvent): void => {
      finishPointer(event.pointerId, event.screenX, event.screenY);
    };
    const handleWindowBlur = (): void => {
      if (capturedPointerRef.current === null) return;
      sendPointerCommand({ type: 'pet_pointer_cancel', reason: 'renderer-window-blur' });
      capturedPointerRef.current = null;
    };
    window.addEventListener('pointerup', handleWindowPointerUp, true);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('pointerup', handleWindowPointerUp, true);
      window.removeEventListener('blur', handleWindowBlur);
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
    if (
      presentation.interaction.phase === 'dragged' ||
      presentation.interaction.phase === 'settling' ||
      living?.mode === 'paused'
    ) {
      driver.pause();
    } else {
      driver.resume();
    }
  }, [presentation?.interaction.phase, living?.mode]);

  const frameIndex = Math.min(
    clock?.frameIndex ?? 0,
    Math.max(0, (presentation?.frames.length ?? 1) - 1),
  );
  const framePath = presentation?.frames[frameIndex];
  const frameUrl = useMemo(
    () => (framePath ? resolveRuntimeAssetUrl(framePath) : undefined),
    [framePath],
  );

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>): void {
    if (capturedPointerRef.current !== event.pointerId) return;
    schedulePointerMove({ type: 'pet_pointer_move', ...pointerCommandBase(event) });
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLElement>): void {
    if (!presentation || event.button !== 0 || capturedPointerRef.current !== null) return;
    event.preventDefault();
    event.stopPropagation();
    capturedPointerRef.current = event.pointerId;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Native cursor polling remains authoritative even if Chromium refuses capture.
    }
    flushPendingPointerMove();
    sendPointerCommand({ type: 'pet_pointer_down', ...pointerCommandBase(event) });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLElement>): void {
    finishPointer(event.pointerId, event.screenX, event.screenY);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLElement>): void {
    if (capturedPointerRef.current !== event.pointerId) return;
    flushPendingPointerMove();
    sendPointerCommand({ type: 'pet_pointer_cancel', reason: 'renderer-pointer-cancel' });
    capturedPointerRef.current = null;
  }

  if (!presentation || !frameUrl) {
    return <main className="pet-surface" aria-label="PokoLoko pet loading" />;
  }

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
      onLostPointerCapture={() => {
        // Do not cancel here. Electron can lose renderer capture while the native
        // BrowserWindow moves; main-process cursor polling must keep the drag alive.
      }}
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
      <img
        className="static-pet-sprite"
        src={frameUrl}
        alt=""
        draggable={false}
        style={spriteStyle}
      />
    </main>
  );
}
