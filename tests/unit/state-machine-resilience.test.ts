import { describe, expect, it } from 'vitest';
import { PetStateMachine } from '../../packages/pet-engine/state-machine/src/PetStateMachine.js';

describe('state-machine resilience', () => {
  it('rejects transitions after terminal shutdown with an inspectable reason', () => {
    const machine = new PetStateMachine('poko');

    machine.request({
      requestId: 'shutdown',
      reason: 'test',
      target: { kind: 'shutdown' },
      monotonicMs: 1,
    });

    const result = machine.request({
      requestId: 'bad',
      reason: 'test',
      target: { kind: 'idle', orientation: 'front' },
      monotonicMs: 2,
    });

    expect(result.log.accepted).toBe(false);
    expect(result.log.fallback).toBe('shutdown-is-terminal');
  });

  it('ignores stale completion events', () => {
    const machine = new PetStateMachine('poko');

    const accepted = machine.request({
      requestId: 'boot',
      reason: 'ready',
      target: { kind: 'idle', orientation: 'front' },
      monotonicMs: 1,
    });

    const before = machine.snapshot();

    machine.complete({
      type: 'ANIMATION_COMPLETED',
      generation: accepted.snapshot.generation - 1,
      monotonicMs: 2,
    });

    expect(machine.snapshot()).toEqual(before);
  });

  it('character replacement and forced recovery remove props', () => {
    const machine = new PetStateMachine('loko');

    machine.replaceCharacter('poko', 10);
    expect(machine.snapshot().prop.kind).toBe('none');

    machine.forceRecovery('display-loss', 20);
    expect(machine.snapshot().state).toBe('system.recovering');
    expect(machine.snapshot().prop.kind).toBe('none');
  });
});
