import { describe, expect, it } from 'vitest';
import manifest from '../../public/assets/runtime/runtime_manifest.json';
import { createDefaultChain, reviewChain } from '../../src/diagnostics/animation-lab/transitionComposer';
import type { RuntimeAnimation } from '../../src/diagnostics/animation-lab/types';

const map = new Map(manifest.animations.map((item) => [item.id, item as RuntimeAnimation]));
describe('transition composer', () => {
  it('returns deterministic duration and actionable warnings', () => {
    const result = reviewChain(createDefaultChain('loko'), map);
    expect(result.totalDurationMs).toBeGreaterThan(0);
    expect(Array.isArray(result.warnings)).toBe(true);
  });
  it('rejects missing animation references', () => {
    const result = reviewChain([{ id: 'x', kind: 'animation', animationId: 'missing', loops: 1 }], map);
    expect(result.valid).toBe(false);
  });
});
