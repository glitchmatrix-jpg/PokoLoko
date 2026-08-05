import { BooleanHysteresis, activityBandFromSamples } from "./hysteresis.js";
import {
  DEFAULT_CONTEXT_PRIVACY_SETTINGS,
  type ContextChangedEvent,
  type ContextClock,
  type ContextPrivacySettings,
  type ContextProvider,
  type PetContextSnapshot,
} from "./types.js";

const SAMPLE_HISTORY = 5;
const RESUME_RECENCY_MS = 30_000;
const INTERACTION_HIGH_MS = 4_000;
const INTERACTION_LIGHT_MS = 20_000;

function timeBand(hour: number): PetContextSnapshot["timeBand"] {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "day";
  if (hour >= 18 && hour < 23) return "evening";
  return "late_night";
}

function changedFields(previous: PetContextSnapshot, current: PetContextSnapshot): Array<keyof PetContextSnapshot> {
  const keys = Object.keys(current) as Array<keyof PetContextSnapshot>;
  return keys.filter((key) => JSON.stringify(previous[key]) !== JSON.stringify(current[key]));
}

export class ContextSensor {
  private settings: ContextPrivacySettings;
  private generation = 0;
  private typingSamples: boolean[] = [];
  private mouseSamples: boolean[] = [];
  private lastCursor: { x: number; y: number } | undefined;
  private lastInteractionAt = Number.NEGATIVE_INFINITY;
  private resumedAt = Number.NEGATIVE_INFINITY;
  private locked = false;
  private readonly fullscreenHysteresis = new BooleanHysteresis(2, 3);
  private readonly audioHysteresis = new BooleanHysteresis(2, 3);
  private readonly listeners = new Set<(event: ContextChangedEvent) => void>();
  private snapshot: PetContextSnapshot;

  public constructor(
    private readonly provider: ContextProvider,
    private readonly clock: ContextClock,
    settings: Partial<ContextPrivacySettings> = {},
  ) {
    this.settings = { ...DEFAULT_CONTEXT_PRIVACY_SETTINGS, ...settings };
    const now = this.clock.monotonicMs();
    this.snapshot = this.disabledSnapshot(now);
  }

  public getSnapshot(): PetContextSnapshot { return this.snapshot; }
  public getSettings(): ContextPrivacySettings { return { ...this.settings }; }

  public subscribe(listener: (event: ContextChangedEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public updateSettings(patch: Partial<ContextPrivacySettings>): PetContextSnapshot {
    this.settings = { ...this.settings, ...patch };
    this.generation += 1;
    if (!this.settings.enabled) {
      this.clearEphemeralState();
      this.commit(this.disabledSnapshot(this.clock.monotonicMs()));
    } else {
      this.sampleNow();
    }
    return this.snapshot;
  }

  public notePetInteraction(monotonicMs = this.clock.monotonicMs()): void {
    if (!this.settings.enabled || !this.settings.recentPetInteraction) return;
    this.lastInteractionAt = monotonicMs;
    this.sampleNow();
  }

  public noteLock(locked: boolean, monotonicMs = this.clock.monotonicMs()): void {
    if (!this.settings.enabled || !this.settings.lockAndResume) return;
    this.locked = locked;
    this.sampleNow(monotonicMs);
  }

  public noteResume(monotonicMs = this.clock.monotonicMs()): void {
    if (!this.settings.enabled || !this.settings.lockAndResume) return;
    this.resumedAt = monotonicMs;
    this.sampleNow(monotonicMs);
  }

  public sampleNow(monotonicMs = this.clock.monotonicMs()): PetContextSnapshot {
    if (!this.settings.enabled) return this.snapshot;
    const raw = this.provider.sample(monotonicMs);
    const availability = this.provider.availability();

    this.push(this.typingSamples, Boolean(raw.typingPulse && this.settings.typingPresence), SAMPLE_HISTORY);
    const cursorMoved = raw.cursor && this.lastCursor
      ? Math.hypot(raw.cursor.x - this.lastCursor.x, raw.cursor.y - this.lastCursor.y) >= 2
      : false;
    if (raw.cursor) this.lastCursor = raw.cursor;
    this.push(this.mouseSamples, Boolean(cursorMoved && this.settings.mouseActivity), SAMPLE_HISTORY);

    const typingActivity = this.settings.typingPresence && availability.typingPresence === "available"
      ? activityBandFromSamples(this.typingSamples)
      : "none";
    const mouseBand = this.settings.mouseActivity && availability.mouseActivity === "available"
      ? activityBandFromSamples(this.mouseSamples)
      : "none";
    const mouseActivity = mouseBand === "sustained" ? "busy" : mouseBand;
    const idleSeconds = this.settings.systemIdle && availability.systemIdle === "available"
      ? Math.max(0, raw.systemIdleSeconds ?? 0)
      : 0;
    const interactionAge = monotonicMs - this.lastInteractionAt;
    const recentPetInteraction = !this.settings.recentPetInteraction
      ? "none"
      : interactionAge <= INTERACTION_HIGH_MS ? "high" : interactionAge <= INTERACTION_LIGHT_MS ? "light" : "none";

    const next: PetContextSnapshot = {
      generation: this.generation,
      sampledAtMonotonicMs: monotonicMs,
      enabled: true,
      typingActivity,
      mouseActivity,
      systemIdle: idleSeconds >= 60,
      systemIdleSeconds: idleSeconds,
      timeBand: this.settings.timeOfDay ? timeBand(raw.wallClockHour) : "day",
      audioActive: this.settings.audioState && availability.audioState === "available"
        ? this.audioHysteresis.update(Boolean(raw.audioPlaying)) : false,
      fullscreenActive: this.settings.fullscreenState && availability.fullscreenState === "available"
        ? this.fullscreenHysteresis.update(Boolean(raw.fullscreenActive)) : false,
      screenLocked: this.settings.lockAndResume ? (raw.locked ?? this.locked) : false,
      resumedRecently: this.settings.lockAndResume && monotonicMs - this.resumedAt <= RESUME_RECENCY_MS,
      recentPetInteraction,
      availability,
    };
    this.commit(next);
    return this.snapshot;
  }

  private disabledSnapshot(monotonicMs: number): PetContextSnapshot {
    const availability = this.provider.availability();
    const disabled = Object.fromEntries(Object.keys(availability).map((key) => [key, "disabled"])) as typeof availability;
    return {
      generation: this.generation,
      sampledAtMonotonicMs: monotonicMs,
      enabled: false,
      typingActivity: "none",
      mouseActivity: "none",
      systemIdle: false,
      systemIdleSeconds: 0,
      timeBand: "day",
      audioActive: false,
      fullscreenActive: false,
      screenLocked: false,
      resumedRecently: false,
      recentPetInteraction: "none",
      availability: disabled,
    };
  }

  private commit(next: PetContextSnapshot): void {
    const previous = this.snapshot;
    const fields = changedFields(previous, next).filter((field) => field !== "sampledAtMonotonicMs");
    this.snapshot = next;
    if (fields.length === 0) return;
    const event: ContextChangedEvent = {
      type: "CONTEXT_CHANGED",
      generation: next.generation,
      previous,
      current: next,
      changedFields: fields,
      monotonicMs: next.sampledAtMonotonicMs,
    };
    for (const listener of this.listeners) listener(event);
  }

  private push(items: boolean[], value: boolean, limit: number): void {
    items.push(value);
    if (items.length > limit) items.shift();
  }

  private clearEphemeralState(): void {
    this.typingSamples = [];
    this.mouseSamples = [];
    this.lastCursor = undefined;
    this.lastInteractionAt = Number.NEGATIVE_INFINITY;
    this.resumedAt = Number.NEGATIVE_INFINITY;
    this.locked = false;
    this.audioHysteresis.reset();
    this.fullscreenHysteresis.reset();
  }
}
