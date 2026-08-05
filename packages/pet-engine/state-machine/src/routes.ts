import { STATE_DEFINITIONS, isActivityState } from './stateGraph.js';
import type { StateId, StateSnapshot, StateTarget } from './types.js';

function neutralFor(target: StateTarget): StateId {
  return target.kind === 'idle' && target.orientation === 'side' ? 'stable.idle_side' : 'stable.idle_front';
}

function routeFromNeutral(target: StateTarget): StateId[] {
  switch (target.kind) {
    case 'idle': return [neutralFor(target)];
    case 'walk': return ['transition.walk_start', 'movement.walking'];
    case 'sleep': return ['transition.sleep_entry', 'stable.sleeping'];
    case 'wake': return ['transition.waking', 'stable.idle_front'];
    case 'activity': return ['transition.activity_entry', `activity.${target.activityId}`];
    case 'social_reaction': return ['interaction.social_reaction', 'stable.idle_front'];
    case 'drag': return ['interaction.dragged', 'transition.recovering', 'stable.idle_front'];
    case 'pause': return ['system.paused'];
    case 'resume': return ['transition.recovering', 'stable.idle_front'];
    case 'suspend': return ['system.suspended'];
    case 'shutdown': return ['system.shutting_down'];
  }
}

export type ResolvedRoute = Readonly<{ route: StateId[]; fallback?: string }>;

export function resolveRoute(snapshot: StateSnapshot, target: StateTarget): ResolvedRoute {
  const current = snapshot.state;
  if (current === 'system.shutting_down') return { route: [], fallback: 'shutdown-is-terminal' };

  if (target.kind === 'shutdown' || target.kind === 'drag' || target.kind === 'pause' || target.kind === 'suspend') {
    return { route: routeFromNeutral(target) };
  }

  if (current === 'system.booting') {
    if (target.kind === 'idle') return { route: [neutralFor(target)] };
    return { route: ['stable.idle_front', ...routeFromNeutral(target)], fallback: 'boot-via-idle' };
  }

  if (current === 'system.paused' || current === 'system.suspended') {
    if (target.kind !== 'resume') return { route: [], fallback: 'resume-required' };
    return { route: routeFromNeutral(target) };
  }

  if (current === 'interaction.dragged') {
    if (target.kind === 'resume' || target.kind === 'idle') return { route: ['transition.recovering', neutralFor(target.kind === 'idle' ? target : {kind:'idle'})] };
    return { route: [], fallback: 'drag-must-end-before-request' };
  }

  const currentDefinition = STATE_DEFINITIONS[current];
  if (!currentDefinition.stable && currentDefinition.interruption === 'locked') {
    return { route: [], fallback: 'locked-transition-must-complete' };
  }

  if (isActivityState(current)) {
    if (target.kind === 'activity' && current === `activity.${target.activityId}`) return { route: [] };
    const afterExit: StateId[] = ['transition.activity_exit', 'stable.idle_front'];
    if (target.kind === 'idle') return { route: [...afterExit.slice(0,1), neutralFor(target)], fallback:'activity-prop-safe-exit' };
    return { route: [...afterExit, ...routeFromNeutral(target)], fallback: 'activity-prop-safe-exit' };
  }

  if (current === 'stable.sleeping') {
    if (target.kind === 'sleep') return { route: [] };
    if (target.kind === 'wake' || target.kind === 'idle') return { route: ['transition.waking', neutralFor(target.kind === 'idle' ? target : {kind:'idle'})] };
    return { route: ['transition.waking', 'stable.idle_front', ...routeFromNeutral(target)], fallback: 'wake-before-action' };
  }

  if (current === 'movement.walking') {
    if (target.kind === 'walk') return { route: ['movement.walking'] };
    if (target.kind === 'idle') return { route: ['transition.walk_stop', neutralFor(target)] };
    return { route: ['transition.walk_stop', 'stable.idle_side', 'transition.neutral_bridge', 'stable.idle_front', ...routeFromNeutral(target)], fallback: 'stop-and-neutralize' };
  }

  if (current === 'stable.idle_side' && (target.kind === 'sleep' || target.kind === 'activity' || target.kind === 'social_reaction')) {
    return { route: ['transition.neutral_bridge', 'stable.idle_front', ...routeFromNeutral(target)], fallback: 'front-neutral-routing' };
  }

  if (target.kind === 'walk' && current === 'stable.idle_front') {
    return { route: ['transition.neutral_bridge', 'stable.idle_side', ...routeFromNeutral(target)], fallback: 'side-neutral-routing' };
  }

  const route = routeFromNeutral(target);
  if (route.length === 1 && route[0] === current) return { route: [] };
  return { route };
}
