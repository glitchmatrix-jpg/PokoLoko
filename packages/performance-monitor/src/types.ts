export type PerformanceSample = Readonly<{
  monotonicMs: number;
  processCpuPercent: number;
  workingSetBytes: number;
  privateBytes: number;
  heapUsedBytes: number;
  heapTotalBytes: number;
  externalBytes: number;
  activeHandles: number;
  activeRequests: number;
  windowMoveCount: number;
  windowMoveJitterP95Ms: number | null;
}>;

export type PerformanceSummary = Readonly<{
  sampleCount: number;
  durationMs: number;
  cpu: Readonly<{ meanPercent: number; p95Percent: number; maxPercent: number }>;
  memory: Readonly<{ firstWorkingSetBytes: number; lastWorkingSetBytes: number; growthBytes: number; peakWorkingSetBytes: number }>;
  handles: Readonly<{ first: number; last: number; growth: number; peak: number }>;
  movement: Readonly<{ count: number; jitterP95Ms: number | null }>;
}>;
