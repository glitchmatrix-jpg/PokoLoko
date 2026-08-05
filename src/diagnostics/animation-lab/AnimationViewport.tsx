import type { CSSProperties } from 'react';
import type { AnimationMetrics, RuntimeAnimation } from './types';

type Props = {
  animation: RuntimeAnimation;
  frameIndex: number;
  scale: number;
  showCanvas: boolean;
  showGround: boolean;
  showBodyCenter: boolean;
  showBounds: boolean;
  mirroredPreview?: boolean;
  metrics?: AnimationMetrics;
  label?: string;
};

export function AnimationViewport({ animation, frameIndex, scale, showCanvas, showGround, showBodyCenter, showBounds, mirroredPreview = false, metrics, label }: Props) {
  const frame = animation.frames[frameIndex] ?? animation.frames[0];
  const anchor = animation.perFrameAnchors[frameIndex] ?? animation.perFrameAnchors[0];
  const metric = metrics?.frames[frameIndex];
  const style = { '--lab-scale': scale } as CSSProperties;
  return (
    <section className="lab-viewport-card">
      <header><strong>{label ?? animation.id}</strong><span>{frameIndex + 1}/{animation.frameCount}</span></header>
      <div className={`lab-stage ${showCanvas ? 'show-canvas' : ''}`} style={style}>
        <div className="sprite-canvas">
          {frame && <img className={mirroredPreview ? 'mirrored' : ''} src={frame} draggable={false} alt={`${animation.id} frame ${frameIndex + 1}`} />}
          {showGround && anchor?.ground && <span className="guide ground" style={{ left: anchor.ground.x, top: anchor.ground.y }} />}
          {showBodyCenter && anchor?.body_center && <span className="guide center" style={{ left: anchor.body_center.x, top: anchor.body_center.y }} />}
          {showBounds && metric && <span className="visible-bounds" style={{ left: metric.bounds.x, top: metric.bounds.y, width: metric.bounds.width, height: metric.bounds.height }} />}
        </div>
      </div>
      <dl className="frame-facts">
        <dt>Source</dt><dd>{animation.sourceFrameIds[frameIndex] ?? '—'}</dd>
        <dt>Posture</dt><dd>{animation.posture.start} → {animation.posture.end}</dd>
        <dt>Prop</dt><dd>{animation.prop.state} · {animation.prop.ownership}</dd>
        <dt>Anchor</dt><dd>{anchor?.ground ? `${anchor.ground.x}, ${anchor.ground.y}` : '—'}</dd>
      </dl>
    </section>
  );
}
