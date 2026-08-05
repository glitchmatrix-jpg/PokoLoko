import { z } from 'zod';

export const surfaceSchema = z.enum(['pet', 'settings', 'diagnostics', 'lab-preview', 'splash', 'onboarding']);
export type Surface = z.infer<typeof surfaceSchema>;

export const characterIdSchema = z.enum(['poko', 'loko']);
export type CharacterId = z.infer<typeof characterIdSchema>;
export const safeIntegerScaleSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type SafeIntegerScale = z.infer<typeof safeIntegerScaleSchema>;
export const locomotionActivityLevelSchema = z.enum(['calm', 'balanced', 'lively']);
export const fullscreenBehaviorSchema = z.enum(['quiet', 'hide', 'unchanged']);
export type FullscreenBehavior = z.infer<typeof fullscreenBehaviorSchema>;
export const interactionPhaseSchema = z.enum(['idle', 'pressed', 'dragged', 'settling']);
export type LocomotionActivityLevel = z.infer<typeof locomotionActivityLevelSchema>;


export const contextPrivacySettingsSchema = z.object({
  enabled: z.boolean(),
  typingPresence: z.boolean(),
  mouseActivity: z.boolean(),
  systemIdle: z.boolean(),
  timeOfDay: z.boolean(),
  audioState: z.boolean(),
  fullscreenState: z.boolean(),
  lockAndResume: z.boolean(),
  recentPetInteraction: z.boolean(),
});
export type ContextPrivacySettings = z.infer<typeof contextPrivacySettingsSchema>;

export const contextSnapshotSchema = z.object({
  generation: z.number().int().nonnegative(),
  sampledAtMonotonicMs: z.number().nonnegative(),
  enabled: z.boolean(),
  typingActivity: z.enum(['none', 'light', 'sustained']),
  mouseActivity: z.enum(['none', 'light', 'busy']),
  systemIdle: z.boolean(),
  systemIdleSeconds: z.number().nonnegative(),
  timeBand: z.enum(['morning', 'day', 'evening', 'late_night']),
  audioActive: z.boolean(),
  fullscreenActive: z.boolean(),
  screenLocked: z.boolean(),
  resumedRecently: z.boolean(),
  recentPetInteraction: z.enum(['none', 'light', 'high']),
  availability: z.object({
    typingPresence: z.enum(['available', 'unavailable', 'disabled']),
    mouseActivity: z.enum(['available', 'unavailable', 'disabled']),
    systemIdle: z.enum(['available', 'unavailable', 'disabled']),
    timeOfDay: z.enum(['available', 'unavailable', 'disabled']),
    audioState: z.enum(['available', 'unavailable', 'disabled']),
    fullscreenState: z.enum(['available', 'unavailable', 'disabled']),
    lockAndResume: z.enum(['available', 'unavailable', 'disabled']),
    recentPetInteraction: z.enum(['available', 'unavailable', 'disabled']),
  }),
});
export type ContextSnapshot = z.infer<typeof contextSnapshotSchema>;

export const pointSchema = z.object({ x: z.number().finite(), y: z.number().finite() });
export const sizeSchema = z.object({ width: z.number().int().positive(), height: z.number().int().positive() });

export const locomotionEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('DESTINATION_REACHED'), generation: z.number().int().nonnegative(), positionX: z.number().finite(), destinationX: z.number().finite(), monotonicMs: z.number().nonnegative() }),
  z.object({ type: z.literal('SCREEN_EDGE_REACHED'), generation: z.number().int().nonnegative(), edge: z.enum(['left', 'right']), positionX: z.number().finite(), monotonicMs: z.number().nonnegative() }),
  z.object({ type: z.literal('MOVEMENT_INTERRUPTED'), generation: z.number().int().nonnegative(), reason: z.string().min(1), positionX: z.number().finite(), monotonicMs: z.number().nonnegative() }),
]);
export type LocomotionEvent = z.infer<typeof locomotionEventSchema>;

export const staticPetPresentationSchema = z.object({
  character: characterIdSchema,
  animationId: z.string().min(1),
  frames: z.array(z.string().min(1)).min(1),
  sourceFrameIds: z.array(z.string().min(1)).min(1),
  fps: z.number().positive(),
  playback: z.enum(['forward', 'reverse', 'ping_pong']),
  loop: z.boolean(),
  animationGeneration: z.number().int().nonnegative(),
  canvasSize: z.literal(128),
  scale: safeIntegerScaleSchema,
  spriteOffset: pointSchema,
  anchor: pointSchema,
  bodyCenter: pointSchema.optional(),
  windowSize: sizeSchema,
  displayId: z.string(),
  interaction: z.object({
    phase: interactionPhaseSchema,
    generation: z.number().int().nonnegative(),
    sessionId: z.string().optional(),
    pointerId: z.number().int().optional(),
  }),
  locomotion: z.object({
    state: z.enum(['idle', 'starting', 'walking', 'stopping', 'turning']),
    generation: z.number().int().nonnegative(),
    direction: z.enum(['left', 'right']),
    speedPxPerSecond: z.number().nonnegative(),
    groundX: z.number().finite(),
    destinationX: z.number().finite(),
    activityLevel: locomotionActivityLevelSchema,
  }),
});
export type StaticPetPresentation = z.infer<typeof staticPetPresentationSchema>;


export const livingRuntimeSnapshotSchema = z.object({
  character: characterIdSchema,
  previousMode:z.enum(['idle','walking','activity','reaction','sleeping','dragged','paused']).optional(),
  mode: z.enum(['idle','walking','activity','reaction','sleeping','dragged','paused']),
  activeId: z.string().optional(),
  mind: z.object({
    energy:z.number().min(0).max(1), playfulness:z.number().min(0).max(1), focus:z.number().min(0).max(1),
    sociability:z.number().min(0).max(1), curiosity:z.number().min(0).max(1), comfort:z.number().min(0).max(1),
    boredom:z.number().min(0).max(1), recentAttention:z.number().min(0).max(1),
    mood:z.enum(['content','curious','playful','focused','sleepy','socially_warm','saturated','subdued']),
    wakeDurationMs:z.number().nonnegative(), interruptionLoad:z.number().min(0).max(1),
  }),
  memory: z.object({
    recentActivities:z.array(z.object({id:z.string(),completedAtMs:z.number().nonnegative(),interrupted:z.boolean()})),
    recentTransitions:z.array(z.string()), disturbances:z.array(z.number()), recentRegions:z.array(z.enum(['left','center','right'])),
    lastWakeAtMs:z.number().nonnegative(), lastSleepAtMs:z.number().optional(), lastInteractionAtMs:z.number().optional(),
  }),
  context: contextSnapshotSchema.nullable(),
  generation:z.number().int().nonnegative(),
  lastDecisionReason:z.string().optional(),
  plannerCandidates:z.array(z.object({key:z.string(),score:z.number(),reasons:z.array(z.string())})).optional(),
  nextPlanAtMonotonicMs:z.number().nonnegative().optional(),
  activity:z.object({id:z.string(),phase:z.string(),propVisible:z.boolean(),activePropId:z.string().optional(),pendingInterruption:z.string().optional(),generation:z.number().int().nonnegative()}).optional(),
  sleep:z.object({phase:z.string(),generation:z.number().int().nonnegative(),plannedWakeAtMonotonicMs:z.number().optional()}).optional(),
});
export type LivingRuntimeSnapshot = z.infer<typeof livingRuntimeSnapshotSchema>;


export const diagnosticCommandSchema = z.discriminatedUnion('type', [
  z.object({type:z.literal('force_idle'),durationMs:z.number().positive().optional()}),
  z.object({type:z.literal('force_walk'),region:z.enum(['left','center','right']),durationMs:z.number().positive().optional()}),
  z.object({type:z.literal('force_sleep'),durationMs:z.number().positive().optional()}),
  z.object({type:z.literal('force_wake')}),
  z.object({type:z.literal('force_activity'),activityId:z.enum(['drink','eat','laptop','music','peeking','playing_ball','reading']),durationMs:z.number().positive().optional()}),
  z.object({type:z.literal('force_reaction'),reaction:z.enum(['click','double_click'])}),
  z.object({type:z.literal('play_animation'),animationId:z.string().min(1),loop:z.boolean().optional(),playback:z.enum(['forward','reverse','ping_pong']).optional()}),
  z.object({type:z.literal('move_to'),destinationX:z.number().finite()}),
  z.object({type:z.literal('stop_movement'),reason:z.string().optional()}),
  z.object({type:z.literal('complete_drag')}), z.object({type:z.literal('simulate_display_change')}),
  z.object({type:z.literal('set_character'),character:characterIdSchema}), z.object({type:z.literal('set_paused'),paused:z.boolean()}),
  z.object({type:z.literal('set_seed'),seed:z.number().int().nonnegative().max(0xffffffff)}),
  z.object({type:z.literal('set_context'),patch:z.object({typingActivity:z.enum(['none','light','sustained']).optional(),mouseActivity:z.enum(['none','light','busy']).optional(),systemIdle:z.boolean().optional(),audioActive:z.boolean().optional(),fullscreenActive:z.boolean().optional(),screenLocked:z.boolean().optional(),recentPetInteraction:z.enum(['none','light','high']).optional()})}),
  z.object({type:z.literal('set_mind'),patch:z.record(z.string(),z.number().min(0).max(1))}), z.object({type:z.literal('reset_runtime')}),
]);
export type DiagnosticCommand = z.infer<typeof diagnosticCommandSchema>;

export const diagnosticEventSchema=z.object({sequence:z.number().int().positive(),monotonicMs:z.number().nonnegative(),category:z.enum(['state','planner','animation','locomotion','interaction','activity','sleep','reaction','context','system','diagnostic']),severity:z.enum(['debug','info','warn','error']),name:z.string(),details:z.unknown().optional(),replayCommand:diagnosticCommandSchema.optional()});
export const diagnosticSnapshotSchema=z.object({capturedAtMonotonicMs:z.number().nonnegative(),seed:z.number().int().nonnegative(),runtime:livingRuntimeSnapshotSchema,stateMachine:z.object({character:characterIdSchema,state:z.string(),generation:z.number().int().nonnegative(),enteredAtMonotonicMs:z.number().nonnegative(),direction:z.enum(['left','right','front']),prop:z.object({kind:z.string(),propId:z.string().optional()}),route:z.array(z.string()),routeReason:z.string().optional()}),presentation:staticPetPresentationSchema,windowBounds:z.object({x:z.number(),y:z.number(),width:z.number(),height:z.number()}),display:z.object({id:z.string(),bounds:z.object({x:z.number(),y:z.number(),width:z.number(),height:z.number()}),workArea:z.object({x:z.number(),y:z.number(),width:z.number(),height:z.number()}),scaleFactor:z.number().positive()}),lastAnimationEvent:z.unknown().nullable(),trace:z.array(diagnosticEventSchema)});
export type DiagnosticSnapshot=z.infer<typeof diagnosticSnapshotSchema>;

export const publicSettingsSchema = z.object({
  selectedCharacter: characterIdSchema,
  sizeScale: safeIntegerScaleSchema,
  activityLevel: locomotionActivityLevelSchema,
  walkingSpeed: locomotionActivityLevelSchema,
  paused: z.boolean(),
  quietMode: z.boolean(),
  alwaysOnTop: z.boolean(),
  soundEnabled: z.boolean(),
  launchAtStartup: z.boolean(),
  reducedMotion: z.boolean(),
  fullscreenBehavior: fullscreenBehaviorSchema,
  diagnosticsEnabled: z.boolean(),
  onboardingComplete: z.boolean(),
  splashEnabled: z.boolean(),
  contextAwareness: contextPrivacySettingsSchema,
});
export type PublicSettings = z.infer<typeof publicSettingsSchema>;

export const appInfoSchema = z.object({
  version: z.string(),
  platform: z.string(),
  packaged: z.boolean(),
});
export type AppInfo = z.infer<typeof appInfoSchema>;

export const windowCommandSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('open_settings') }),
  z.object({ type: z.literal('open_diagnostics') }),
  z.object({type:z.literal('diagnostics_command'),command:diagnosticCommandSchema}),
  z.object({type:z.literal('diagnostics_export_trace')}),
  z.object({type:z.literal('diagnostics_replay_trace')}),
  z.object({ type: z.literal('splash_complete') }),
  z.object({ type: z.literal('complete_onboarding'), character: characterIdSchema, activityLevel: locomotionActivityLevelSchema, contextEnabled: z.boolean() }),
  z.object({ type: z.literal('open_lab_preview'), animationId: z.string().min(1).max(120).optional() }),
  z.object({ type: z.literal('hide_current') }),
  z.object({ type: z.literal('move_pet_to_current_screen') }),
  z.object({ type: z.literal('restart_companion') }),
  z.object({ type: z.literal('set_splash_enabled'), enabled: z.boolean() }),
  z.object({ type: z.literal('set_pet_hit_test'), interactive: z.boolean() }),
  z.object({ type: z.literal('set_static_character'), character: characterIdSchema }),
  z.object({ type: z.literal('set_static_scale'), scale: safeIntegerScaleSchema }),
  z.object({ type: z.literal('set_locomotion_activity_level'), level: locomotionActivityLevelSchema }),
  z.object({ type: z.literal('set_walking_speed'), level: locomotionActivityLevelSchema }),
  z.object({ type: z.literal('set_pet_paused'), paused: z.boolean() }),
  z.object({ type: z.literal('set_quiet_mode'), quiet: z.boolean() }),
  z.object({ type: z.literal('set_always_on_top'), enabled: z.boolean() }),
  z.object({ type: z.literal('set_sound_enabled'), enabled: z.boolean() }),
  z.object({ type: z.literal('set_launch_at_startup'), enabled: z.boolean() }),
  z.object({ type: z.literal('set_reduced_motion'), enabled: z.boolean() }),
  z.object({ type: z.literal('set_fullscreen_behavior'), behavior: fullscreenBehaviorSchema }),
  z.object({ type: z.literal('set_diagnostics_enabled'), enabled: z.boolean() }),
  z.object({ type: z.literal('reset_settings_defaults') }),
  z.object({ type: z.literal('reset_character_behavior'), character: characterIdSchema }),
  z.object({ type: z.literal('set_context_privacy'), settings: contextPrivacySettingsSchema }),
  z.object({ type: z.literal('move_pet_to'), destinationX: z.number().finite() }),
  z.object({ type: z.literal('move_pet_by'), deltaX: z.number().finite().min(-10000).max(10000) }),
  z.object({ type: z.literal('stop_pet_movement'), reason: z.string().min(1).max(120).optional() }),
  z.object({
    type: z.literal('pet_pointer_down'),
    pointerId: z.number().int().nonnegative(),
    button: z.number().int().min(0).max(5),
    screen: pointSchema,
    monotonicMs: z.number().nonnegative(),
  }),
  z.object({
    type: z.literal('pet_pointer_move'),
    pointerId: z.number().int().nonnegative(),
    button: z.number().int().min(0).max(5),
    screen: pointSchema,
    monotonicMs: z.number().nonnegative(),
  }),
  z.object({
    type: z.literal('pet_pointer_up'),
    pointerId: z.number().int().nonnegative(),
    button: z.number().int().min(0).max(5),
    screen: pointSchema,
    monotonicMs: z.number().nonnegative(),
  }),
  z.object({ type: z.literal('pet_pointer_cancel'), reason: z.string().min(1).max(120) }),
  z.object({
    type: z.literal('report_animation_event'),
    event: z.discriminatedUnion('type', [
      z.object({ type: z.literal('FRAME_CHANGED'), animationId: z.string(), generation: z.number().int().nonnegative(), frameIndex: z.number().int().nonnegative(), elapsedMs: z.number().nonnegative(), loopCount: z.number().int().nonnegative(), loopBoundary: z.boolean() }),
      z.object({ type: z.literal('ANIMATION_COMPLETED'), animationId: z.string(), generation: z.number().int().nonnegative(), frameIndex: z.number().int().nonnegative(), elapsedMs: z.number().nonnegative() }),
    ]),
  }),
]);
export type WindowCommand = z.infer<typeof windowCommandSchema>;
