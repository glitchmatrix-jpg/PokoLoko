export class BooleanHysteresis {
  private trueSamples = 0;
  private falseSamples = 0;
  private value = false;

  public constructor(private readonly enterSamples: number, private readonly exitSamples: number) {}

  public update(raw: boolean): boolean {
    if (raw) {
      this.trueSamples += 1;
      this.falseSamples = 0;
      if (!this.value && this.trueSamples >= this.enterSamples) this.value = true;
    } else {
      this.falseSamples += 1;
      this.trueSamples = 0;
      if (this.value && this.falseSamples >= this.exitSamples) this.value = false;
    }
    return this.value;
  }

  public reset(value = false): void {
    this.value = value;
    this.trueSamples = 0;
    this.falseSamples = 0;
  }
}

export function activityBandFromSamples(samples: readonly boolean[]): "none" | "light" | "sustained" {
  const active = samples.filter(Boolean).length;
  if (active === 0) return "none";
  if (active >= Math.max(2, Math.ceil(samples.length * 0.6))) return "sustained";
  return "light";
}
