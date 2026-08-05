import type { RandomSource } from './types.js';

export class SeededRandom implements RandomSource {
  private value: number;
  public constructor(seed: number) { this.value = (seed >>> 0) || 0x6d2b79f5; }
  public nextFloat(): number {
    let t = (this.value += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    this.value = (t ^ (t >>> 14)) >>> 0;
    return this.value / 4294967296;
  }
  public nextInt(maxExclusive: number): number {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) throw new RangeError('maxExclusive must be a positive integer');
    return Math.floor(this.nextFloat() * maxExclusive);
  }
  public state(): number { return this.value >>> 0; }
}

export function randomRange(rng: RandomSource, min: number, max: number): number {
  return Math.round(min + (max - min) * rng.nextFloat());
}
