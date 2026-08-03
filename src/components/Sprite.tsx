import { useCallback } from 'react';
import { useSpriteAnimation } from '../hooks/useSpriteAnimation';
import type { AnimationDef } from '../types/animation';

export function Sprite({
  def,
  onDone,
}: {
  def?: AnimationDef;
  onDone?: () => void;
}) {
  const done = useCallback(() => onDone?.(), [onDone]);
  const src = useSpriteAnimation(def, done);

  return src ? (
    <img
      className="sprite"
      draggable={false}
      src={src}
      alt=""
      aria-hidden="true"
    />
  ) : null;
}
