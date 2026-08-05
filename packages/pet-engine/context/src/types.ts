export type Availability = "available" | "unavailable" | "disabled";
export type ActivityBand = "none" | "light" | "sustained";
export type MouseActivityBand = "none" | "light" | "busy";
export type TimeBand = "morning" | "day" | "evening" | "late_night";
export type InteractionBand = "none" | "light" | "high";

export type ContextPrivacySettings = {
  enabled: boolean;
  typingPresence: boolean;
  mouseActivity: boolean;
  systemIdle: boolean;
  timeOfDay: boolean;
  audioState: boolean;
  fullscreenState: boolean;
  lockAndResume: boolean;
  recentPetInteraction: boolean;
};

export const DEFAULT_CONTEXT_PRIVACY_SETTINGS: ContextPrivacySettings = {
  enabled: false,
  typingPresence: false,
  mouseActivity: true,
  systemIdle: true,
  timeOfDay: true,
  audioState: false,
  fullscreenState: true,
  lockAndResume: true,
  recentPetInteraction: true,
};

export type ContextAvailability = {
  typingPresence: Availability;
  mouseActivity: Availability;
  systemIdle: Availability;
  timeOfDay: Availability;
  audioState: Availability;
  fullscreenState: Availability;
  lockAndResume: Availability;
  recentPetInteraction: Availability;
};

export type RawContextSample = {
  monotonicMs: number;
  wallClockHour: number;
  typingPulse?: boolean;
  cursor?: { x: number; y: number };
  systemIdleSeconds?: number;
  audioPlaying?: boolean;
  fullscreenActive?: boolean;
  locked?: boolean;
};

export type PetContextSnapshot = {
  generation: number;
  sampledAtMonotonicMs: number;
  enabled: boolean;
  typingActivity: ActivityBand;
  mouseActivity: MouseActivityBand;
  systemIdle: boolean;
  systemIdleSeconds: number;
  timeBand: TimeBand;
  audioActive: boolean;
  fullscreenActive: boolean;
  screenLocked: boolean;
  resumedRecently: boolean;
  recentPetInteraction: InteractionBand;
  availability: ContextAvailability;
};

export type ContextChangedEvent = {
  type: "CONTEXT_CHANGED";
  generation: number;
  previous: PetContextSnapshot;
  current: PetContextSnapshot;
  changedFields: Array<keyof PetContextSnapshot>;
  monotonicMs: number;
};

export interface ContextProvider {
  availability(): ContextAvailability;
  sample(monotonicMs: number): RawContextSample;
}

export interface ContextClock {
  monotonicMs(): number;
}
