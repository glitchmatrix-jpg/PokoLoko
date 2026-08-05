import type { ActivityRandomSource } from './types.js';

export class SeededActivityRandom implements ActivityRandomSource {
  private value: number;
  constructor(seed: number) { this.value = seed >>> 0 || 0x9e3779b9; }
  nextFloat(): number {
    let x = this.value;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    this.value = x >>> 0;
    return this.value / 0x1_0000_0000;
  }
  nextInt(maxExclusive: number): number {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) throw new Error('maxExclusive must be a positive integer');
    return Math.floor(this.nextFloat() * maxExclusive);
  }
}
