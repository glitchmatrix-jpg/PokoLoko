import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Sprite } from './Sprite';
import type {
  AnimationManifest,
  PetName,
  PetState,
  ReactionName,
} from '../types/animation';

const stateAnimation: Partial<Record<PetState, string>> = {
  IDLE: 'idle',
  WALKING_LEFT: 'walk_left',
  WALKING_RIGHT: 'walk_right',
  SITTING: 'sit',
  DRAGGED: 'dragged',
  LANDING: 'landing',
};

const DRAG_THRESHOLD = 6;
const DOUBLE_CLICK_DELAY = 240;

interface PointerStart {
  x: number;
  y: number;
  pointerId: number;
  dragging: boolean;
}

export function Pet() {
  const [manifest, setManifest] = useState<AnimationManifest | null>(null);
  const [pet, setPet] = useState<PetName>('poko');
  const [behavior, setBehavior] = useState<PetState>('IDLE');
  const [animation, setAnimation] = useState('idle');
  const previousBehavior = useRef<PetState>('IDLE');
  const pointer = useRef<PointerStart | null>(null);
  const clickTimes = useRef<number[]>([]);
  const clickTimer = useRef<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const manifestUrl = new URL('assets/animations.json', document.baseURI);

    fetch(manifestUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Animation manifest failed: ${response.status}`);
        return response.json() as Promise<AnimationManifest>;
      })
      .then(setManifest)
      .catch((error: unknown) => {
        if ((error as DOMException).name !== 'AbortError') console.error(error);
      });

    void window.pokoAPI.getSettings().then((settings) => setPet(settings.pet));
    const offPet = window.pokoAPI.onPetChanged(setPet);
    const offBehavior = window.pokoAPI.onBehavior(setBehavior);
    const offReaction = window.pokoAPI.onReaction((reaction: ReactionName) => {
      setAnimation(reaction === 'confused' ? 'confused' : 'happy');
    });

    return () => {
      controller.abort();
      offPet();
      offBehavior();
      offReaction();
      if (clickTimer.current !== null) window.clearTimeout(clickTimer.current);
    };
  }, []);

  useEffect(() => {
    if (behavior === 'SLEEPING') {
      setAnimation(previousBehavior.current === 'SLEEPING' ? 'sleep_loop' : 'sleep_transition');
    } else if (behavior === 'IDLE' && previousBehavior.current === 'SLEEPING') {
      setAnimation('wake');
    } else if (behavior !== 'INTERACTING') {
      setAnimation(stateAnimation[behavior] ?? 'idle');
    }
    previousBehavior.current = behavior;
  }, [behavior]);

  useEffect(() => {
    setAnimation('idle');
  }, [pet]);

  const definition = useMemo(
    () => manifest?.[pet]?.[animation] ?? manifest?.[pet]?.idle,
    [animation, manifest, pet],
  );

  const animationDone = () => {
    const next = definition?.next;
    if (next) setAnimation(next);
  };

  const runClickReaction = () => {
    const now = Date.now();
    clickTimes.current = [...clickTimes.current.filter((time: number) => now - time < 1_400), now];
    const reaction: ReactionName = clickTimes.current.length >= 4 ? 'confused' : 'happy';
    window.pokoAPI.react(reaction);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    pointer.current = {
      x: event.screenX,
      y: event.screenY,
      pointerId: event.pointerId,
      dragging: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = pointer.current;
    if (!current || current.pointerId !== event.pointerId) return;

    const moved = Math.hypot(event.screenX - current.x, event.screenY - current.y);
    if (!current.dragging && moved >= DRAG_THRESHOLD) {
      current.dragging = true;
      window.pokoAPI.startDrag(current.x, current.y);
    }
    if (current.dragging) window.pokoAPI.dragMove(event.screenX, event.screenY);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = pointer.current;
    if (!current || current.pointerId !== event.pointerId) return;

    if (current.dragging) {
      window.pokoAPI.endDrag();
    } else {
      if (clickTimer.current !== null) window.clearTimeout(clickTimer.current);
      clickTimer.current = window.setTimeout(() => {
        runClickReaction();
        clickTimer.current = null;
      }, DOUBLE_CLICK_DELAY);
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pointer.current = null;
  };

  const onPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointer.current?.dragging) window.pokoAPI.endDrag();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pointer.current = null;
  };

  const onDoubleClick = () => {
    if (clickTimer.current !== null) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    window.pokoAPI.openSettings();
  };

  return (
    <div
      className="pet-stage"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onContextMenu={(event) => {
        event.preventDefault();
        window.pokoAPI.showContextMenu();
      }}
      onDoubleClick={onDoubleClick}
      aria-label={`${pet === 'poko' ? 'Poko' : 'Loko'} desktop pet`}
    >
      <Sprite def={definition} onDone={animationDone} />
      <div className="hit-glow" />
    </div>
  );
}
