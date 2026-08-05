import { readFile } from 'node:fs/promises';
import { packagedAssetPath } from './asset-paths.js';

export type CharacterId = 'poko' | 'loko';
export type SafeIntegerScale = 1 | 2 | 3;
export type PlaybackMode = 'forward' | 'reverse' | 'ping_pong';
export type PetDirection = 'left' | 'right' | 'front';

export type StaticPetAsset = Readonly<{
  animationId: string;
  character: CharacterId;
  frames: string[];
  sourceFrameIds: string[];
  fps: number;
  playback: PlaybackMode;
  loop: boolean;
  direction: PetDirection;
  authoredSpeedPxPerSecond: number;
  anchor: { x: number; y: number };
  bodyCenter?: { x: number; y: number };
}>;

type ManifestAnimation = {
  id: string;
  character: CharacterId;
  frames: string[];
  fps: number;
  playback: PlaybackMode;
  loop: boolean;
  direction?: PetDirection | 'none';
  movement?: { recommendedSpeedCssPxPerSecond?: number };
  anchor: { ground_x: number; ground_y: number; body_center_x?: number; body_center_y?: number };
  sourceFrameIds: string[];
};

type RuntimeManifest = { animations: ManifestAnimation[] };

const STATIC_ANIMATION_IDS: Record<CharacterId, string> = {
  poko: 'poko_idle_blink',
  loko: 'loko_idle_front',
};

let cachedManifest: RuntimeManifest | undefined;

async function loadManifest(): Promise<RuntimeManifest> {
  if (cachedManifest) return cachedManifest;
  const manifestPath = packagedAssetPath('assets', 'runtime', 'runtime_manifest.json');
  cachedManifest = JSON.parse(await readFile(manifestPath, 'utf8')) as RuntimeManifest;
  return cachedManifest;
}

export async function loadPetAsset(animationId: string): Promise<StaticPetAsset> {
  const manifest = await loadManifest();
  const animation = manifest.animations.find((entry) => entry.id === animationId);
  if (!animation) throw new Error(`Runtime pet animation is missing: ${animationId}`);
  if (!animation.frames.length) throw new Error(`Runtime pet animation has no frames: ${animationId}`);
  if (animation.frames.length !== animation.sourceFrameIds.length) {
    throw new Error(`Runtime pet source-frame count does not match frame count: ${animationId}`);
  }
  return {
    animationId,
    character: animation.character,
    frames: animation.frames,
    sourceFrameIds: animation.sourceFrameIds,
    fps: animation.fps,
    playback: animation.playback,
    loop: animation.loop,
    direction: animation.direction === 'left' || animation.direction === 'right' || animation.direction === 'front'
      ? animation.direction
      : 'front',
    authoredSpeedPxPerSecond: animation.movement?.recommendedSpeedCssPxPerSecond ?? 45,
    anchor: { x: animation.anchor.ground_x, y: animation.anchor.ground_y },
    ...(animation.anchor.body_center_x !== undefined && animation.anchor.body_center_y !== undefined
      ? { bodyCenter: { x: animation.anchor.body_center_x, y: animation.anchor.body_center_y } }
      : {}),
  };
}

export async function loadStaticPetAsset(character: CharacterId): Promise<StaticPetAsset> {
  return loadPetAsset(STATIC_ANIMATION_IDS[character]);
}

export function walkingAnimationId(character: CharacterId, direction: 'left' | 'right'): string {
  return `${character}_walk_${direction}`;
}

export function walkPreparationAnimationId(character: CharacterId): string | null {
  return character === 'loko' ? 'loko_walk_preparation' : null;
}
