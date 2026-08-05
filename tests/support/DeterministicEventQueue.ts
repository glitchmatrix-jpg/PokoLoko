export type ScheduledEvent<T> = Readonly<{ atMs: number; sequence: number; value: T }>;
export class DeterministicEventQueue<T> {
  private sequence = 0;
  private readonly events: ScheduledEvent<T>[] = [];
  public enqueue(atMs: number, value: T): void {
    if (!Number.isFinite(atMs)) throw new Error('Event time must be finite.');
    this.events.push({ atMs, sequence: this.sequence++, value });
    this.events.sort((a,b)=>a.atMs-b.atMs || a.sequence-b.sequence);
  }
  public drainThrough(atMs: number): T[] {
    const output:T[]=[];
    while(this.events[0] && this.events[0].atMs<=atMs) output.push(this.events.shift()!.value);
    return output;
  }
  public size(): number { return this.events.length; }
}
