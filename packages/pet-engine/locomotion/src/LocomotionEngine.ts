import type {
  HorizontalBounds,
  LocomotionEvent,
  LocomotionSnapshot,
  LocomotionStartRequest,
  LocomotionTick,
} from './types.js';

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function approach(current: number, target: number, maximumChange: number): number {
  if (current < target) return Math.min(current + maximumChange, target);
  if (current > target) return Math.max(current - maximumChange, target);
  return target;
}

function assertBounds(bounds: HorizontalBounds): void {
  if (!Number.isFinite(bounds.minimumX) || !Number.isFinite(bounds.maximumX)) {
    throw new Error('Locomotion bounds must be finite.');
  }
  if (bounds.minimumX > bounds.maximumX) throw new Error('Locomotion bounds are inverted.');
}

export class LocomotionEngine {
  private snapshot: LocomotionSnapshot | null = null;
  private profile: LocomotionStartRequest['profile'] | null = null;
  private lastTickMs = 0;
  private startMs = 0;

  public start(request: LocomotionStartRequest): LocomotionTick {
    assertBounds(request.bounds);
    if (!Number.isFinite(request.positionX) || !Number.isFinite(request.destinationX)) {
      throw new Error('Locomotion positions must be finite.');
    }
    if (!Number.isFinite(request.monotonicMs)) throw new Error('Monotonic start time must be finite.');

    const positionX = clamp(request.positionX, request.bounds.minimumX, request.bounds.maximumX);
    const destinationX = clamp(request.destinationX, request.bounds.minimumX, request.bounds.maximumX);
    const delta = destinationX - positionX;
    const direction = delta < 0 ? 'left' : 'right';
    this.profile = request.profile;
    this.lastTickMs = request.monotonicMs;
    this.startMs = request.monotonicMs;

    if (Math.abs(delta) <= request.profile.arrivalThresholdPx) {
      this.snapshot = {
        generation: request.generation,
        active: false,
        positionX: destinationX,
        destinationX,
        velocityX: 0,
        speedPxPerSecond: 0,
        direction,
        elapsedMs: 0,
        distanceRemainingPx: 0,
      };
      const edgeEvents = this.edgeEventsAt(destinationX, request.bounds, request.generation, request.monotonicMs);
      return {
        snapshot: this.snapshot,
        events: [...edgeEvents, {
          type: 'DESTINATION_REACHED',
          generation: request.generation,
          positionX: destinationX,
          destinationX,
          monotonicMs: request.monotonicMs,
        }],
      };
    }

    this.snapshot = {
      generation: request.generation,
      active: true,
      positionX,
      destinationX,
      velocityX: 0,
      speedPxPerSecond: 0,
      direction,
      elapsedMs: 0,
      distanceRemainingPx: Math.abs(delta),
    };
    return { snapshot: this.snapshot, events: [] };
  }

  public tick(monotonicMs: number, bounds: HorizontalBounds): LocomotionTick {
    if (!this.snapshot || !this.profile || !this.snapshot.active) {
      if (!this.snapshot) throw new Error('Locomotion has not started.');
      return { snapshot: this.snapshot, events: [] };
    }
    assertBounds(bounds);
    if (!Number.isFinite(monotonicMs)) throw new Error('Monotonic tick time must be finite.');

    const rawDeltaMs = Math.max(0, monotonicMs - this.lastTickMs);
    const deltaMs = Math.min(rawDeltaMs, this.profile.maximumDeltaMs);
    const deltaSeconds = deltaMs / 1000;
    this.lastTickMs = monotonicMs;

    const clampedDestination = clamp(this.snapshot.destinationX, bounds.minimumX, bounds.maximumX);
    const displacement = clampedDestination - this.snapshot.positionX;
    const directionSign = displacement < 0 ? -1 : 1;
    const direction = directionSign < 0 ? 'left' : 'right';
    const distance = Math.abs(displacement);

    if (distance <= this.profile.arrivalThresholdPx) {
      return this.finishAt(clampedDestination, monotonicMs, this.edgeEventsAt(clampedDestination, bounds, this.snapshot.generation, monotonicMs));
    }

    const currentSpeed = Math.abs(this.snapshot.velocityX);
    const brakingLimitedSpeed = Math.sqrt(2 * this.profile.decelerationPxPerSecondSquared * distance);
    const targetSpeed = Math.min(this.profile.maximumSpeedPxPerSecond, brakingLimitedSpeed);
    const rate = targetSpeed < currentSpeed
      ? this.profile.decelerationPxPerSecondSquared
      : this.profile.accelerationPxPerSecondSquared;
    const nextSpeed = approach(currentSpeed, targetSpeed, rate * deltaSeconds);
    const desiredStep = nextSpeed * deltaSeconds;

    if (desiredStep >= distance || distance <= this.profile.arrivalThresholdPx) {
      return this.finishAt(clampedDestination, monotonicMs, this.edgeEventsAt(clampedDestination, bounds, this.snapshot.generation, monotonicMs));
    }

    const proposedPosition = this.snapshot.positionX + directionSign * desiredStep;
    const clampedPosition = clamp(proposedPosition, bounds.minimumX, bounds.maximumX);
    const edgeEvents: LocomotionEvent[] = [];
    if (clampedPosition !== proposedPosition) {
      edgeEvents.push({
        type: 'SCREEN_EDGE_REACHED',
        generation: this.snapshot.generation,
        edge: proposedPosition < bounds.minimumX ? 'left' : 'right',
        positionX: clampedPosition,
        monotonicMs,
      });
    }

    const remaining = Math.abs(clampedDestination - clampedPosition);
    this.snapshot = {
      ...this.snapshot,
      positionX: clampedPosition,
      destinationX: clampedDestination,
      velocityX: directionSign * nextSpeed,
      speedPxPerSecond: nextSpeed,
      direction,
      elapsedMs: Math.max(0, monotonicMs - this.startMs),
      distanceRemainingPx: remaining,
    };

    if (edgeEvents.length > 0 && remaining > this.profile.arrivalThresholdPx) {
      this.snapshot = { ...this.snapshot, active: false, velocityX: 0, speedPxPerSecond: 0 };
    }
    return { snapshot: this.snapshot, events: edgeEvents };
  }


  public retarget(destinationX: number, bounds: HorizontalBounds, monotonicMs: number): LocomotionTick {
    if (!this.snapshot || !this.profile || !this.snapshot.active) {
      throw new Error('Active locomotion is required before retargeting.');
    }
    assertBounds(bounds);
    if (!Number.isFinite(destinationX) || !Number.isFinite(monotonicMs)) {
      throw new Error('Retarget destination and time must be finite.');
    }
    const clampedDestination = clamp(destinationX, bounds.minimumX, bounds.maximumX);
    const displacement = clampedDestination - this.snapshot.positionX;
    const direction = displacement < 0 ? 'left' : 'right';
    this.lastTickMs = monotonicMs;
    if (Math.abs(displacement) <= this.profile.arrivalThresholdPx) {
      this.snapshot = {
        ...this.snapshot,
        active: false,
        positionX: clampedDestination,
        destinationX: clampedDestination,
        velocityX: 0,
        speedPxPerSecond: 0,
        direction,
        distanceRemainingPx: 0,
      };
      return {
        snapshot: this.snapshot,
        events: [
          ...this.edgeEventsAt(clampedDestination, bounds, this.snapshot.generation, monotonicMs),
          {
            type: 'DESTINATION_REACHED',
            generation: this.snapshot.generation,
            positionX: clampedDestination,
            destinationX: clampedDestination,
            monotonicMs,
          },
        ],
      };
    }
    this.snapshot = {
      ...this.snapshot,
      destinationX: clampedDestination,
      direction,
      distanceRemainingPx: Math.abs(displacement),
    };
    return { snapshot: this.snapshot, events: [] };
  }

  public interrupt(reason: string, monotonicMs: number): LocomotionTick | null {
    if (!this.snapshot || !this.snapshot.active) return null;
    this.snapshot = { ...this.snapshot, active: false, velocityX: 0, speedPxPerSecond: 0 };
    return {
      snapshot: this.snapshot,
      events: [{
        type: 'MOVEMENT_INTERRUPTED',
        generation: this.snapshot.generation,
        reason,
        positionX: this.snapshot.positionX,
        monotonicMs,
      }],
    };
  }

  public getSnapshot(): LocomotionSnapshot | null {
    return this.snapshot;
  }

  private edgeEventsAt(
    positionX: number,
    bounds: HorizontalBounds,
    generation: number,
    monotonicMs: number,
  ): LocomotionEvent[] {
    const epsilon = 0.001;
    if (Math.abs(positionX - bounds.minimumX) <= epsilon) {
      return [{ type: 'SCREEN_EDGE_REACHED', generation, edge: 'left', positionX, monotonicMs }];
    }
    if (Math.abs(positionX - bounds.maximumX) <= epsilon) {
      return [{ type: 'SCREEN_EDGE_REACHED', generation, edge: 'right', positionX, monotonicMs }];
    }
    return [];
  }

  private finishAt(positionX: number, monotonicMs: number, events: LocomotionEvent[]): LocomotionTick {
    if (!this.snapshot) throw new Error('Locomotion has not started.');
    this.snapshot = {
      ...this.snapshot,
      active: false,
      positionX,
      destinationX: positionX,
      velocityX: 0,
      speedPxPerSecond: 0,
      elapsedMs: Math.max(0, monotonicMs - this.startMs),
      distanceRemainingPx: 0,
    };
    return {
      snapshot: this.snapshot,
      events: [...events, {
        type: 'DESTINATION_REACHED',
        generation: this.snapshot.generation,
        positionX,
        destinationX: positionX,
        monotonicMs,
      }],
    };
  }
}
