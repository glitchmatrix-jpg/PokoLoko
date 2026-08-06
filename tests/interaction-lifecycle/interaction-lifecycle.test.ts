import { describe, expect, it } from 'vitest';
import { InteractionLifecycle } from '../../packages/pet-engine/orchestration/src/index.js';

describe('interaction lifecycle', () => {
  it('runs the complete native drag route without accepting duplicates', () => {
    const lifecycle = new InteractionLifecycle();
    lifecycle.press();
    expect(lifecycle.snapshot().state).toBe('pressed');
    lifecycle.transition('dragging', 'threshold');
    lifecycle.transition('carried', 'native-polling');
    const generation = lifecycle.snapshot().generation;
    lifecycle.press('duplicate-down');
    expect(lifecycle.snapshot().generation).toBe(generation);
    lifecycle.transition('landing', 'release');
    lifecycle.transition('idle', 'settled');
    expect(lifecycle.snapshot().state).toBe('idle');
  });

  it('rejects impossible state jumps', () => {
    const lifecycle = new InteractionLifecycle();
    expect(() => lifecycle.transition('landing', 'invalid')).toThrow(/Illegal interaction lifecycle transition/);
  });

  it('restores a click press without entering drag states', () => {
    const lifecycle = new InteractionLifecycle();
    lifecycle.press();
    lifecycle.releaseWithoutDrag();
    expect(lifecycle.snapshot().state).toBe('idle');
  });
});
