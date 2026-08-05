export type Point = Readonly<{ x: number; y: number }>;
export type Size = Readonly<{ width: number; height: number }>;
export type Rect = Readonly<{ x: number; y: number; width: number; height: number }>;

export type StaticPetLayout = Readonly<{
  canvasSize: 128;
  scale: 1 | 2 | 3;
  margin: number;
  bottomClearance: number;
  anchor: Point;
}>;

export type StaticPetGeometry = Readonly<{
  windowBounds: Rect;
  spriteOffset: Point;
  groundPoint: Point;
}>;


export type GroundXRange = Readonly<{ minimumX: number; maximumX: number }>;

export function computeGroundXRange(workArea: Rect, layout: StaticPetLayout): GroundXRange {
  const spriteSize = layout.canvasSize * layout.scale;
  const width = spriteSize + layout.margin * 2;
  const anchorInWindowX = layout.margin + layout.anchor.x * layout.scale;
  const minimumX = workArea.x + anchorInWindowX;
  const maximumX = workArea.x + workArea.width - (width - anchorInWindowX);
  if (minimumX <= maximumX) return { minimumX, maximumX };
  const center = workArea.x + workArea.width / 2;
  return { minimumX: center, maximumX: center };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function computeStaticPetGeometry(
  workArea: Rect,
  layout: StaticPetLayout,
  preferredGroundX = workArea.x + workArea.width / 2,
): StaticPetGeometry {
  const spriteSize = layout.canvasSize * layout.scale;
  const width = spriteSize + layout.margin * 2;
  const height = spriteSize + layout.margin * 2;
  const anchorInWindowX = layout.margin + layout.anchor.x * layout.scale;
  const anchorInWindowY = layout.margin + layout.anchor.y * layout.scale;
  const { minimumX: minimumGroundX, maximumX: maximumGroundX } = computeGroundXRange(workArea, layout);
  const groundX = minimumGroundX <= maximumGroundX
    ? clamp(preferredGroundX, minimumGroundX, maximumGroundX)
    : workArea.x + workArea.width / 2;
  const groundY = workArea.y + workArea.height - layout.bottomClearance;

  return {
    windowBounds: {
      x: Math.round(groundX - anchorInWindowX),
      y: Math.round(groundY - anchorInWindowY),
      width: Math.round(width),
      height: Math.round(height),
    },
    spriteOffset: { x: layout.margin, y: layout.margin },
    groundPoint: { x: groundX, y: groundY },
  };
}

export function selectNearestWorkArea(point: Point, workAreas: ReadonlyArray<Rect>): Rect {
  if (workAreas.length === 0) throw new Error('At least one work area is required.');
  const distanceSquared = (rect: Rect) => {
    const nearestX = clamp(point.x, rect.x, rect.x + rect.width);
    const nearestY = clamp(point.y, rect.y, rect.y + rect.height);
    return (point.x - nearestX) ** 2 + (point.y - nearestY) ** 2;
  };
  return [...workAreas].sort((a, b) => distanceSquared(a) - distanceSquared(b))[0]!;
}
