import type { InteractionLifecycleSnapshot } from './InteractionLifecycle.js';
import type { PetContextSnapshot } from '../../context/src/index.js';
import type { ActivityLevel, CharacterId, PetMind, SessionMemory } from '../../behavior/src/index.js';

export type LivingRuntimeMode = 'idle' | 'walking' | 'activity' | 'reaction' | 'sleeping' | 'dragged' | 'paused';
export type LivingRuntimeSnapshot = Readonly<{
  previousMode?: LivingRuntimeMode;
  character: CharacterId;
  mode: LivingRuntimeMode;
  activeId?: string;
  mind: PetMind;
  memory: SessionMemory;
  context: PetContextSnapshot | null;
  generation: number;
  interaction: InteractionLifecycleSnapshot;
  lastDecisionReason?: string;
  plannerCandidates?: readonly Readonly<{ key: string; score: number; reasons: readonly string[] }>[];
  nextPlanAtMonotonicMs?: number;
  activity?: Readonly<{ id: string; phase: string; propVisible: boolean; activePropId?: string; pendingInterruption?: string; generation: number }>;
  sleep?: Readonly<{ phase: string; generation: number; plannedWakeAtMonotonicMs?: number }>;
}>;

export type LivingRuntimeSettings = Readonly<{ activityLevel: ActivityLevel; paused: boolean; quietMode: boolean; contextualAwareness: boolean }>;
export type LivingSpatialContext = Readonly<{ region: 'left'|'center'|'right'; nearEdge: boolean }>;

export interface LivingRuntimePort {
  playAnimation(animationId: string, options?: Readonly<{ loop?: boolean; playback?: 'forward'|'reverse'|'ping_pong' }>): Promise<void>;
  restoreIdle(reason: string): Promise<void>;
  walkToRegion(region: 'left'|'center'|'right'): Promise<void>;
  stopMovement(reason: string): Promise<void>;
  log(message: string, details?: unknown): void;
  onSnapshot(snapshot: LivingRuntimeSnapshot): void;
}
