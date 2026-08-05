import type { ChainSegment, RuntimeAnimation } from './types';

export type ChainReview = {
  valid: boolean;
  warnings: string[];
  totalDurationMs: number;
};

export function reviewChain(segments: ChainSegment[], animations: Map<string, RuntimeAnimation>): ChainReview {
  const warnings: string[] = [];
  let totalDurationMs = 0;
  let previous: RuntimeAnimation | undefined;
  for (const segment of segments) {
    if (segment.kind === 'animation') {
      const animation = animations.get(segment.animationId);
      if (!animation) {
        warnings.push(`Missing animation: ${segment.animationId}`);
        continue;
      }
      totalDurationMs += (animation.frameCount / Math.max(0.1, animation.fps)) * 1000 * Math.max(1, segment.loops);
      if (previous && previous.posture.end !== animation.posture.start) {
        warnings.push(`Posture bridge required: ${previous.id} (${previous.posture.end}) → ${animation.id} (${animation.posture.start}).`);
      }
      if (previous && previous.prop.state !== 'none' && animation.prop.state === 'none') {
        warnings.push(`Prop removal choreography required after ${previous.id} (${previous.prop.state}).`);
      }
      if (animation.runtimeStatus.includes('quarantine')) warnings.push(`${animation.id} is quarantined.`);
      previous = animation;
      continue;
    }
    totalDurationMs += segment.durationMs;
    if (segment.kind === 'direction' && previous?.direction !== 'none' && previous?.direction !== segment.direction) {
      warnings.push(`Direction change after ${previous.id} needs a neutral or turn hold.`);
    }
  }
  return { valid: warnings.every((warning) => !warning.includes('Missing') && !warning.includes('quarantined')), warnings, totalDurationMs };
}

export function createDefaultChain(character: 'poko' | 'loko'): ChainSegment[] {
  const prefix = character === 'poko' ? 'poko' : 'loko';
  const idle = character === 'poko' ? 'poko_idle_blink' : 'loko_idle_front';
  const walk = character === 'poko' ? 'poko_walk_right' : 'loko_walk_right';
  const activity = character === 'poko' ? 'poko_music' : 'loko_laptop';
  return [
    { id: `${prefix}-1`, kind: 'animation', animationId: idle, loops: 2 },
    { id: `${prefix}-2`, kind: 'hold', durationMs: 300, label: 'notice / intention hold' },
    { id: `${prefix}-3`, kind: 'direction', direction: 'right', durationMs: 180 },
    { id: `${prefix}-4`, kind: 'animation', animationId: walk, loops: 2 },
    { id: `${prefix}-5`, kind: 'neutral', animationId: idle, durationMs: 350 },
    { id: `${prefix}-6`, kind: 'prop_delay', durationMs: 260, label: 'activity setup' },
    { id: `${prefix}-7`, kind: 'animation', animationId: activity, loops: 2 },
    { id: `${prefix}-8`, kind: 'prop_delay', durationMs: 260, label: 'prop-safe exit' },
    { id: `${prefix}-9`, kind: 'animation', animationId: idle, loops: 1 },
  ];
}
