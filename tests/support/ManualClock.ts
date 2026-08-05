export class ManualClock {
  private valueMs: number;
  public constructor(startMs = 0) { this.valueMs = startMs; }
  public now = (): number => this.valueMs;
  public set(valueMs: number): void {
    if (!Number.isFinite(valueMs) || valueMs < this.valueMs) throw new Error('ManualClock cannot move backwards.');
    this.valueMs = valueMs;
  }
  public advance(deltaMs: number): number {
    if (!Number.isFinite(deltaMs) || deltaMs < 0) throw new Error('ManualClock delta must be non-negative.');
    this.valueMs += deltaMs;
    return this.valueMs;
  }
}
