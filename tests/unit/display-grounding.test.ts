import { describe, expect, it } from 'vitest';
import { computeStaticPetGeometry, selectNearestWorkArea } from '../../electron/services/display-grounding';

describe('static desktop grounding', () => {
  it('places the manifest anchor at the work-area ground', () => {
    const result = computeStaticPetGeometry(
      { x: 0, y: 0, width: 1920, height: 1040 },
      { canvasSize: 128, scale: 2, margin: 32, bottomClearance: 2, anchor: { x: 64, y: 112 } },
      960,
    );
    expect(result.windowBounds).toEqual({ x: 800, y: 782, width: 320, height: 320 });
    expect(result.windowBounds.x + result.spriteOffset.x + 64 * 2).toBe(960);
    expect(result.windowBounds.y + result.spriteOffset.y + 112 * 2).toBe(1038);
  });

  it('clamps the pet so its native window remains horizontally reachable', () => {
    const result = computeStaticPetGeometry(
      { x: -1280, y: 0, width: 1280, height: 984 },
      { canvasSize: 128, scale: 1, margin: 16, bottomClearance: 2, anchor: { x: 64, y: 112 } },
      -5000,
    );
    expect(result.windowBounds.x).toBe(-1280);
  });

  it('selects the nearest remaining work area after topology changes', () => {
    const nearest = selectNearestWorkArea(
      { x: -20, y: 500 },
      [
        { x: 0, y: 0, width: 1920, height: 1040 },
        { x: -1920, y: 0, width: 1920, height: 1080 },
      ],
    );
    expect(nearest.x).toBe(-1920);
  });
});
