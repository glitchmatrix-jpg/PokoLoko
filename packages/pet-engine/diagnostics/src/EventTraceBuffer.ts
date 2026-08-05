import type { DiagnosticCommand, DiagnosticEvent, DiagnosticSeverity, DiagnosticTrace } from './types.js';

const cloneSafe = (value: unknown): unknown => {
  if (value === undefined) return undefined;
  try { return JSON.parse(JSON.stringify(value)); } catch { return String(value); }
};

export class EventTraceBuffer {
  private sequence = 0;
  private events: DiagnosticEvent[] = [];
  public constructor(private readonly capacity = 500, private seed = 0x504f4b4f) {}

  public record(input: Readonly<{ monotonicMs: number; category: DiagnosticEvent['category']; severity?: DiagnosticSeverity; name: string; details?: unknown; replayCommand?: DiagnosticCommand }>): DiagnosticEvent {
    const event: DiagnosticEvent = {
      sequence: ++this.sequence,
      monotonicMs: input.monotonicMs,
      category: input.category,
      severity: input.severity ?? 'info',
      name: input.name,
      ...(input.details === undefined ? {} : { details: cloneSafe(input.details) }),
      ...(input.replayCommand ? { replayCommand: cloneSafe(input.replayCommand) as DiagnosticCommand } : {}),
    };
    this.events.push(event);
    if (this.events.length > this.capacity) this.events.splice(0, this.events.length - this.capacity);
    return event;
  }
  public snapshot(): readonly DiagnosticEvent[] { return this.events.slice(); }
  public clear(): void { this.events = []; }
  public setSeed(seed: number): void { this.seed = seed >>> 0; }
  public exportTrace(): DiagnosticTrace { return { format:'pokoloko-diagnostic-trace', version:1, exportedAtIso:new Date().toISOString(), seed:this.seed, events:this.snapshot() }; }
}
