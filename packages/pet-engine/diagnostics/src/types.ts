export type DiagnosticSeverity = 'debug' | 'info' | 'warn' | 'error';
export type DiagnosticCommand =
  | Readonly<{ type: 'force_idle'; durationMs?: number }>
  | Readonly<{ type: 'force_walk'; region: 'left' | 'center' | 'right'; durationMs?: number }>
  | Readonly<{ type: 'force_sleep'; durationMs?: number }>
  | Readonly<{ type: 'force_wake' }>
  | Readonly<{ type: 'force_activity'; activityId: 'drink'|'eat'|'laptop'|'music'|'peeking'|'playing_ball'|'reading'; durationMs?: number }>
  | Readonly<{ type: 'force_reaction'; reaction: 'click'|'double_click' }>
  | Readonly<{ type: 'play_animation'; animationId: string; loop?: boolean; playback?: 'forward'|'reverse'|'ping_pong' }>
  | Readonly<{ type: 'move_to'; destinationX: number }>
  | Readonly<{ type: 'stop_movement'; reason?: string }>
  | Readonly<{ type: 'complete_drag' }>
  | Readonly<{ type: 'simulate_display_change' }>
  | Readonly<{ type: 'set_character'; character: 'poko'|'loko' }>
  | Readonly<{ type: 'set_paused'; paused: boolean }>
  | Readonly<{ type: 'set_seed'; seed: number }>
  | Readonly<{ type: 'set_context'; patch: Partial<{ typingActivity:'none'|'light'|'sustained'; mouseActivity:'none'|'light'|'busy'; systemIdle:boolean; audioActive:boolean; fullscreenActive:boolean; screenLocked:boolean; recentPetInteraction:'none'|'light'|'high' }> }>
  | Readonly<{ type: 'set_mind'; patch: Partial<Record<'energy'|'playfulness'|'focus'|'sociability'|'curiosity'|'comfort'|'boredom'|'recentAttention'|'interruptionLoad', number>> }>
  | Readonly<{ type: 'reset_runtime' }>;

export type DiagnosticEvent = Readonly<{
  sequence: number;
  monotonicMs: number;
  category: 'state'|'planner'|'animation'|'locomotion'|'interaction'|'activity'|'sleep'|'reaction'|'context'|'system'|'diagnostic';
  severity: DiagnosticSeverity;
  name: string;
  details?: unknown;
  replayCommand?: DiagnosticCommand;
}>;

export type PlannerCandidateDiagnostic = Readonly<{ key: string; score: number; reasons: readonly string[] }>;
export type DiagnosticTrace = Readonly<{
  format: 'pokoloko-diagnostic-trace';
  version: 1;
  exportedAtIso: string;
  seed: number;
  events: readonly DiagnosticEvent[];
}>;
