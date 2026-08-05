export type Point = Readonly<{ x: number; y: number }>;

export type HorizontalBounds = Readonly<{
  minimumX: number;
  maximumX: number;
}>;

export type ActivityLevel = 'calm' | 'balanced' | 'lively';
export type LocomotionDirection = 'left' | 'right';

export type LocomotionProfile = Readonly<{
  maximumSpeedPxPerSecond: number;
  accelerationPxPerSecondSquared: number;
  decelerationPxPerSecondSquared: number;
  arrivalThresholdPx: number;
  maximumDeltaMs: number;
}>;

export type LocomotionStartRequest = Readonly<{
  generation: number;
  positionX: number;
  destinationX: number;
  bounds: HorizontalBounds;
  profile: LocomotionProfile;
  monotonicMs: number;
}>;

export type LocomotionSnapshot = Readonly<{
  generation: number;
  active: boolean;
  positionX: number;
  destinationX: number;
  velocityX: number;
  speedPxPerSecond: number;
  direction: LocomotionDirection;
  elapsedMs: number;
  distanceRemainingPx: number;
}>;

export type LocomotionEvent =
  | Readonly<{
      type: 'DESTINATION_REACHED';
      generation: number;
      positionX: number;
      destinationX: number;
      monotonicMs: number;
    }>
  | Readonly<{
      type: 'SCREEN_EDGE_REACHED';
      generation: number;
      edge: 'left' | 'right';
      positionX: number;
      monotonicMs: number;
    }>
  | Readonly<{
      type: 'MOVEMENT_INTERRUPTED';
      generation: number;
      reason: string;
      positionX: number;
      monotonicMs: number;
    }>;

export type LocomotionTick = Readonly<{
  snapshot: LocomotionSnapshot;
  events: ReadonlyArray<LocomotionEvent>;
}>;
