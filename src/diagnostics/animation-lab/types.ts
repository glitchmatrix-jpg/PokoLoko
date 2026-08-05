export type CharacterId = 'poko' | 'loko';
export type PlaybackMode = 'forward' | 'reverse' | 'ping_pong';

export type RuntimeAnimation = {
  id: string;
  character: CharacterId;
  category: string;
  lifeRole: string;
  visibleAction: string;
  frames: string[];
  frameCount: number;
  fps: number;
  recommendedFpsRange: [number, number];
  playback: PlaybackMode;
  loop: boolean;
  loopAssessment: string;
  direction: string;
  anchor: { ground_x: number; ground_y: number; body_center_x?: number; body_center_y?: number };
  perFrameAnchors: Array<{
    frame_id: string;
    file: string;
    body_center?: { x: number; y: number } | null;
    ground?: { x: number; y: number } | null;
    contact?: { x: number; y: number } | null;
  }>;
  posture: { start: string; end: string };
  movement: { suitable: boolean; recommendedSpeedCssPxPerSecond: number; signedSpeedCssPxPerSecond: number };
  transitions: { from: string[]; to: string[]; recommendedNextState: string | null };
  prop: { state: string; ownership: string; continuity: unknown };
  interruptionLevel: 'immediate' | 'soft' | 'deferred' | 'locked';
  interruptionRule: string;
  confidence: string;
  knownIssues: string[];
  sourceFrameIds: string[];
  generatedByMirroring: boolean;
  mirroredFrom: string | null;
  runtimeStatus: string;
};

export type RuntimeManifest = {
  counts: { animations: number; frames: number; mirroredAnimations: number };
  animations: RuntimeAnimation[];
};

export type FrameMetrics = {
  frame: number;
  visiblePixels: number;
  bounds: { x: number; y: number; width: number; height: number };
  centroid: { x: number; y: number };
  groundDelta: number;
  centroidDelta: number;
  visibleAreaDeltaRatio: number;
};

export type AnimationMetrics = {
  animationId: string;
  loopSeamScore: number;
  maxGroundDelta: number;
  maxCentroidDelta: number;
  maxAreaDeltaRatio: number;
  verdict: 'stable' | 'review' | 'quarantine';
  frames: FrameMetrics[];
};

export type ChainSegment =
  | { id: string; kind: 'animation'; animationId: string; loops: number }
  | { id: string; kind: 'hold'; durationMs: number; label: string }
  | { id: string; kind: 'neutral'; animationId: string; durationMs: number }
  | { id: string; kind: 'direction'; direction: 'left' | 'right' | 'front'; durationMs: number }
  | { id: string; kind: 'prop_delay'; durationMs: number; label: string };
