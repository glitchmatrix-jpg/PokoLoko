import { SLEEP_PROFILES } from './profiles.js';
import type { CharacterId, SleepCommand, SleepEvent, SleepResult, SleepSnapshot, WakeTrigger } from './types.js';

function finite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite.`);
}

export class SleepLifecycleController {
  private value: SleepSnapshot;

  public constructor(character: CharacterId, monotonicMs = 0) {
    finite(monotonicMs, 'monotonicMs');
    this.value = {
      character,
      phase: 'awake',
      generation: 0,
      enteredAtMonotonicMs: monotonicMs,
      recoveryTarget: 'stable.idle_front',
    };
  }

  public snapshot(): SleepSnapshot { return this.value; }

  public handle(event: SleepEvent): SleepResult {
    finite(event.monotonicMs, 'monotonicMs');
    const profile = SLEEP_PROFILES[this.value.character];

    switch (event.type) {
      case 'REQUEST_SLEEP': {
        if (this.value.phase !== 'awake') return this.ignored('sleep request requires awake phase');
        const duration = Math.max(profile.minSleepMs, Math.min(profile.maxSleepMs, event.plannedDurationMs));
        const generation = this.value.generation + 1;
        const { wakeTrigger: _oldWakeTrigger, ...withoutWakeTrigger } = this.value;
        this.value = {
          ...withoutWakeTrigger,
          phase: 'entry',
          generation,
          enteredAtMonotonicMs: event.monotonicMs,
          plannedWakeAtMonotonicMs: event.monotonicMs + duration,
          activeAnimationId: profile.entryAnimationId,
        };
        return this.result([
          { kind: 'disable_locomotion', generation },
          { kind: 'request_state', target: 'sleep', reason: `sleep:${event.trigger}`, generation },
          { kind: 'play_animation', animationId: profile.entryAnimationId, generation, playback: 'forward', loop: false },
        ]);
      }
      case 'ANIMATION_COMPLETED': {
        if (event.generation !== this.value.generation) return this.ignored('stale animation completion');
        if (this.value.phase === 'entry' && event.animationId === profile.entryAnimationId) {
          this.value = {
            ...this.value,
            phase: 'sleeping',
            enteredAtMonotonicMs: event.monotonicMs,
            sleepingSinceMonotonicMs: event.monotonicMs,
            activeAnimationId: profile.primaryLoopAnimationId,
          };
          return this.result([
            { kind: 'play_animation', animationId: profile.primaryLoopAnimationId, generation: this.value.generation, loop: true },
            { kind: 'sleep_started', generation: this.value.generation },
          ]);
        }
        if (this.value.phase === 'waking' && event.animationId === profile.entryAnimationId) {
          return this.beginWakeHold(event.monotonicMs);
        }
        return this.ignored('completion does not match active sleep phase');
      }
      case 'SLEEP_DEADLINE_REACHED': {
        if (event.generation !== this.value.generation) return this.ignored('stale sleep deadline');
        if (this.value.phase !== 'sleeping') return this.ignored('sleep deadline requires sleeping phase');
        return this.requestWake('planner', event.monotonicMs);
      }
      case 'REQUEST_WAKE': return this.requestWake(event.trigger, event.monotonicMs);
      case 'DRAG_STARTED': return this.requestWake('drag', event.monotonicMs);
      case 'HOLD_COMPLETED': {
        if (event.generation !== this.value.generation) return this.ignored('stale hold completion');
        if (this.value.phase !== 'wake_hold') return this.ignored('hold completion requires wake hold');
        return this.finishWake(event.monotonicMs);
      }
      case 'PAUSE': {
        if (this.value.phase === 'paused') return this.ignored('already paused');
        this.value = { ...this.value, phase: 'paused', enteredAtMonotonicMs: event.monotonicMs };
        return this.result([]);
      }
      case 'RESUME': {
        if (this.value.phase !== 'paused') return this.ignored('resume requires paused phase');
        return this.recoverAfterLifecycle(event.monotonicMs, 'settings_change');
      }
      case 'SUSPEND': {
        if (this.value.phase === 'suspended') return this.ignored('already suspended');
        const suspendedFrom = this.value.phase;
        this.value = { ...this.value, phase: 'suspended', suspendedFrom, enteredAtMonotonicMs: event.monotonicMs };
        return this.result([]);
      }
      case 'SYSTEM_RESUMED': {
        if (this.value.phase !== 'suspended') return this.ignored('system resume requires suspended phase');
        return this.recoverAfterLifecycle(event.monotonicMs, 'system_resume');
      }
      case 'CHARACTER_CHANGED': {
        const generation = this.value.generation + 1;
        this.value = {
          character: event.character,
          phase: 'recovery',
          generation,
          enteredAtMonotonicMs: event.monotonicMs,
          wakeTrigger: 'character_switch',
          recoveryTarget: 'transition.recovering',
        };
        return this.result([
          { kind: 'disable_locomotion', generation },
          { kind: 'request_state', target: 'idle', reason: 'character-switch-sleep-recovery', generation },
          { kind: 'enable_locomotion', generation },
        ]);
      }
      case 'SHUTDOWN': {
        const generation = this.value.generation + 1;
        this.value = { ...this.value, phase: 'recovery', generation, enteredAtMonotonicMs: event.monotonicMs, wakeTrigger: 'shutdown' };
        return this.result([{ kind: 'request_state', target: 'shutdown', reason: 'shutdown', generation }]);
      }
    }
  }

  private requestWake(trigger: WakeTrigger, monotonicMs: number): SleepResult {
    const profile = SLEEP_PROFILES[this.value.character];
    if (this.value.phase === 'awake' || this.value.phase === 'recovery') return this.ignored('not sleeping');
    if (this.value.phase === 'paused' || this.value.phase === 'suspended') return this.ignored('wake deferred until lifecycle resumes');
    if (this.value.phase === 'waking' || this.value.phase === 'wake_hold') return this.ignored('wake already active');
    const generation = this.value.generation + 1;
    const commands: SleepCommand[] = [
      { kind: 'disable_locomotion', generation },
      { kind: 'request_state', target: trigger === 'drag' ? 'drag' : 'wake', reason: `wake:${trigger}`, generation },
    ];
    if (trigger === 'drag') {
      this.value = { ...this.value, phase: 'recovery', generation, enteredAtMonotonicMs: monotonicMs, wakeTrigger: trigger, recoveryTarget: 'transition.recovering' };
      return this.result(commands);
    }
    if (profile.wakeStrategy === 'reverse_entry_then_hold') {
      this.value = { ...this.value, phase: 'waking', generation, enteredAtMonotonicMs: monotonicMs, wakeTrigger: trigger, activeAnimationId: profile.entryAnimationId };
      commands.push({ kind: 'play_animation', animationId: profile.entryAnimationId, generation, playback: 'reverse', loop: false });
      return this.result(commands);
    }
    this.value = { ...this.value, phase: 'wake_hold', generation, enteredAtMonotonicMs: monotonicMs, wakeTrigger: trigger, activeAnimationId: profile.primaryLoopAnimationId };
    commands.push({ kind: 'hold_frame', animationId: profile.primaryLoopAnimationId, frame: 'first', durationMs: profile.wakeHoldMs, generation });
    return this.result(commands);
  }

  private beginWakeHold(monotonicMs: number): SleepResult {
    const profile = SLEEP_PROFILES[this.value.character];
    this.value = { ...this.value, phase: 'wake_hold', enteredAtMonotonicMs: monotonicMs };
    return this.result([{ kind: 'hold_frame', animationId: profile.entryAnimationId, frame: 'first', durationMs: profile.wakeHoldMs, generation: this.value.generation }]);
  }

  private finishWake(monotonicMs: number): SleepResult {
    const trigger = this.value.wakeTrigger ?? 'planner';
    const sleptMs = Math.max(0, monotonicMs - (this.value.sleepingSinceMonotonicMs ?? monotonicMs));
    const {
      sleepingSinceMonotonicMs: _sleepingSince,
      plannedWakeAtMonotonicMs: _plannedWake,
      activeAnimationId: _activeAnimation,
      wakeTrigger: _wakeTrigger,
      suspendedFrom: _suspendedFrom,
      ...base
    } = this.value;
    this.value = {
      ...base,
      phase: 'awake',
      enteredAtMonotonicMs: monotonicMs,
      recoveryTarget: 'stable.idle_front',
    };
    return this.result([
      { kind: 'request_state', target: 'idle', reason: `wake-complete:${trigger}`, generation: this.value.generation },
      { kind: 'sleep_finished', sleptMs, trigger, generation: this.value.generation },
      { kind: 'enable_locomotion', generation: this.value.generation },
    ]);
  }

  private recoverAfterLifecycle(monotonicMs: number, trigger: WakeTrigger): SleepResult {
    const previous = this.value.suspendedFrom;
    if (previous === 'sleeping' || previous === 'entry' || previous === 'waking' || previous === 'wake_hold') {
      const { suspendedFrom: _suspendedFrom, ...withoutSuspendedFrom } = this.value;
      this.value = { ...withoutSuspendedFrom, phase: previous === 'sleeping' ? 'sleeping' : 'recovery', enteredAtMonotonicMs: monotonicMs };
      if (previous === 'sleeping') {
        const profile = SLEEP_PROFILES[this.value.character];
        return this.result([{ kind: 'play_animation', animationId: profile.primaryLoopAnimationId, generation: this.value.generation, loop: true }]);
      }
      return this.requestWake(trigger, monotonicMs);
    }
    const { suspendedFrom: _suspendedFrom, ...withoutSuspendedFrom } = this.value;
    this.value = { ...withoutSuspendedFrom, phase: 'awake', enteredAtMonotonicMs: monotonicMs };
    return this.result([]);
  }

  private result(commands: readonly SleepCommand[]): SleepResult { return { snapshot: this.value, commands }; }
  private ignored(reason: string): SleepResult { return { snapshot: this.value, commands: [], ignoredReason: reason }; }
}
