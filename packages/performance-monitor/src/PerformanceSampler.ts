import { performance } from 'node:perf_hooks';
import type { PerformanceSample, PerformanceSummary } from './types.js';

export interface ProcessMetricsPort {
  cpuUsage(previous?: NodeJS.CpuUsage): NodeJS.CpuUsage;
  memoryUsage(): NodeJS.MemoryUsage;
  resourceUsage(): NodeJS.ResourceUsage;
  activeHandleCount(): number;
  activeRequestCount(): number;
}

const nativePort: ProcessMetricsPort = {
  cpuUsage: (previous) => process.cpuUsage(previous),
  memoryUsage: () => process.memoryUsage(),
  resourceUsage: () => process.resourceUsage(),
  activeHandleCount: () => ((process as unknown as { _getActiveHandles?: () => unknown[] })._getActiveHandles?.().length ?? 0),
  activeRequestCount: () => ((process as unknown as { _getActiveRequests?: () => unknown[] })._getActiveRequests?.().length ?? 0),
};

function percentile(values: readonly number[], fraction: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * fraction))] ?? 0;
}

export class PerformanceSampler {
  private readonly samples: PerformanceSample[] = [];
  private previousCpu: NodeJS.CpuUsage | undefined;
  private previousSampleMs: number | undefined;
  private moveTimes: number[] = [];

  public constructor(private readonly port: ProcessMetricsPort = nativePort, private readonly capacity = 7_200) {}

  public noteWindowMove(monotonicMs = performance.now()): void {
    this.moveTimes.push(monotonicMs);
    if (this.moveTimes.length > 2_000) this.moveTimes = this.moveTimes.slice(-2_000);
  }

  public sample(monotonicMs = performance.now()): PerformanceSample {
    const memory = this.port.memoryUsage();
    const resources = this.port.resourceUsage();
    const cpu = this.port.cpuUsage(this.previousCpu);
    const elapsedMs = this.previousSampleMs === undefined ? 0 : Math.max(1, monotonicMs - this.previousSampleMs);
    const cpuPercent = elapsedMs === 0 ? 0 : ((cpu.user + cpu.system) / 1_000) / elapsedMs * 100;
    this.previousCpu = this.port.cpuUsage();
    this.previousSampleMs = monotonicMs;
    const intervals = this.moveTimes.slice(1).map((value, index) => Math.abs(value - this.moveTimes[index]! - 16.6667));
    const sample: PerformanceSample = {
      monotonicMs,
      processCpuPercent: Number(cpuPercent.toFixed(3)),
      workingSetBytes: resources.maxRSS * 1024,
      privateBytes: memory.rss,
      heapUsedBytes: memory.heapUsed,
      heapTotalBytes: memory.heapTotal,
      externalBytes: memory.external,
      activeHandles: this.port.activeHandleCount(),
      activeRequests: this.port.activeRequestCount(),
      windowMoveCount: this.moveTimes.length,
      windowMoveJitterP95Ms: intervals.length ? Number(percentile(intervals, 0.95).toFixed(3)) : null,
    };
    this.samples.push(sample);
    if (this.samples.length > this.capacity) this.samples.shift();
    return sample;
  }

  public snapshot(): readonly PerformanceSample[] { return [...this.samples]; }

  public summarize(): PerformanceSummary {
    if (!this.samples.length) return { sampleCount: 0, durationMs: 0, cpu: { meanPercent: 0, p95Percent: 0, maxPercent: 0 }, memory: { firstWorkingSetBytes: 0, lastWorkingSetBytes: 0, growthBytes: 0, peakWorkingSetBytes: 0 }, handles: { first: 0, last: 0, growth: 0, peak: 0 }, movement: { count: this.moveTimes.length, jitterP95Ms: null } };
    const first = this.samples[0]!; const last = this.samples[this.samples.length - 1]!;
    const cpu = this.samples.map((sample) => sample.processCpuPercent);
    const memory = this.samples.map((sample) => sample.workingSetBytes);
    const handles = this.samples.map((sample) => sample.activeHandles);
    return {
      sampleCount: this.samples.length,
      durationMs: last.monotonicMs - first.monotonicMs,
      cpu: { meanPercent: Number((cpu.reduce((a, b) => a + b, 0) / cpu.length).toFixed(3)), p95Percent: percentile(cpu, 0.95), maxPercent: Math.max(...cpu) },
      memory: { firstWorkingSetBytes: first.workingSetBytes, lastWorkingSetBytes: last.workingSetBytes, growthBytes: last.workingSetBytes - first.workingSetBytes, peakWorkingSetBytes: Math.max(...memory) },
      handles: { first: first.activeHandles, last: last.activeHandles, growth: last.activeHandles - first.activeHandles, peak: Math.max(...handles) },
      movement: { count: this.moveTimes.length, jitterP95Ms: last.windowMoveJitterP95Ms },
    };
  }

  public reset(): void { this.samples.length = 0; this.moveTimes = []; this.previousCpu = undefined; this.previousSampleMs = undefined; }
}
