import type { ActivityId, StateDefinition, StateId } from './types.js';

const activityDefinition = (id: ActivityId): StateDefinition => ({
  id: `activity.${id}`,
  family: 'activity',
  posture: id === 'music' ? 'standing_front' : id === 'peeking' ? 'edge_peeking' : id === 'playing_ball' ? 'standing_side' : 'prop_held',
  stable: true,
  interruption: id === 'playing_ball' || id === 'music' ? 'soft' : 'deferred',
  completionEvent: 'ANIMATION_COMPLETED',
  propPolicy: id === 'peeking' || id === 'music' ? 'allowed' : 'required',
});

export const STATE_DEFINITIONS: Readonly<Record<StateId, StateDefinition>> = {
  'system.booting': { id:'system.booting', family:'system', posture:'none', stable:false, interruption:'immediate', propPolicy:'none' },
  'system.paused': { id:'system.paused', family:'system', posture:'preserved', stable:true, interruption:'immediate', propPolicy:'allowed' },
  'system.suspended': { id:'system.suspended', family:'system', posture:'preserved', stable:true, interruption:'immediate', propPolicy:'allowed' },
  'system.recovering': { id:'system.recovering', family:'system', posture:'unknown', stable:false, interruption:'immediate', completionEvent:'RECOVERY_COMPLETED', propPolicy:'none' },
  'system.shutting_down': { id:'system.shutting_down', family:'system', posture:'none', stable:true, interruption:'locked', propPolicy:'none' },
  'stable.idle_front': { id:'stable.idle_front', family:'stable', posture:'standing_front', stable:true, interruption:'immediate', propPolicy:'none' },
  'stable.idle_side': { id:'stable.idle_side', family:'stable', posture:'standing_side', stable:true, interruption:'immediate', propPolicy:'none' },
  'stable.sitting': { id:'stable.sitting', family:'stable', posture:'sitting', stable:true, interruption:'immediate', propPolicy:'none' },
  'stable.sleeping': { id:'stable.sleeping', family:'stable', posture:'lying_sleep', stable:true, interruption:'soft', propPolicy:'none' },
  'transition.neutral_bridge': { id:'transition.neutral_bridge', family:'transition', posture:'neutral', stable:false, interruption:'locked', completionEvent:'ANIMATION_COMPLETED', propPolicy:'none' },
  'transition.walk_start': { id:'transition.walk_start', family:'transition', posture:'standing_side_ready', stable:false, interruption:'locked', completionEvent:'ANIMATION_COMPLETED', propPolicy:'none' },
  'transition.walk_stop': { id:'transition.walk_stop', family:'transition', posture:'standing_side', stable:false, interruption:'locked', completionEvent:'ANIMATION_COMPLETED', propPolicy:'none' },
  'transition.turning': { id:'transition.turning', family:'transition', posture:'standing_side', stable:false, interruption:'locked', completionEvent:'ANIMATION_COMPLETED', propPolicy:'none' },
  'transition.sleep_entry': { id:'transition.sleep_entry', family:'transition', posture:'standing_to_sleep', stable:false, interruption:'locked', completionEvent:'ANIMATION_COMPLETED', propPolicy:'none' },
  'transition.waking': { id:'transition.waking', family:'transition', posture:'sleep_to_neutral', stable:false, interruption:'locked', completionEvent:'ANIMATION_COMPLETED', propPolicy:'none' },
  'transition.activity_entry': { id:'transition.activity_entry', family:'transition', posture:'activity_setup', stable:false, interruption:'locked', completionEvent:'ANIMATION_COMPLETED', propPolicy:'allowed' },
  'transition.activity_exit': { id:'transition.activity_exit', family:'transition', posture:'activity_cleanup', stable:false, interruption:'locked', completionEvent:'ANIMATION_COMPLETED', propPolicy:'allowed' },
  'transition.recovering': { id:'transition.recovering', family:'transition', posture:'neutral_recovery', stable:false, interruption:'immediate', completionEvent:'RECOVERY_COMPLETED', propPolicy:'none' },
  'movement.walking': { id:'movement.walking', family:'movement', posture:'standing_side', stable:false, interruption:'immediate', completionEvent:'DESTINATION_REACHED', propPolicy:'none' },
  'interaction.dragged': { id:'interaction.dragged', family:'interaction', posture:'dragged', stable:false, interruption:'immediate', completionEvent:'DRAG_ENDED', propPolicy:'none' },
  'interaction.social_reaction': { id:'interaction.social_reaction', family:'interaction', posture:'standing_front', stable:false, interruption:'soft', completionEvent:'ANIMATION_COMPLETED', propPolicy:'none' },
  'activity.drink': activityDefinition('drink'),
  'activity.eat': activityDefinition('eat'),
  'activity.laptop': activityDefinition('laptop'),
  'activity.music': activityDefinition('music'),
  'activity.peeking': activityDefinition('peeking'),
  'activity.playing_ball': activityDefinition('playing_ball'),
  'activity.reading': activityDefinition('reading'),
};

export function isActivityState(id: StateId): id is `activity.${ActivityId}` {
  return id.startsWith('activity.');
}
