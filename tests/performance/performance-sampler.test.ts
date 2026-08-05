import { describe, expect, it } from 'vitest';
import { PerformanceSampler, type ProcessMetricsPort } from '../../packages/performance-monitor/src/index.js';

function fakePort(): ProcessMetricsPort {
  let cpu = 0; let rss = 100_000_000; let handles = 5;
  return {
    cpuUsage: () => { cpu += 10_000; return { user: cpu, system: 0 }; },
    memoryUsage: () => ({ rss: rss += 1_000_000, heapTotal: 20_000_000, heapUsed: 10_000_000, external: 1_000_000, arrayBuffers: 0 }),
    resourceUsage: () => ({ userCPUTime:0,systemCPUTime:0,maxRSS:Math.floor(rss/1024),sharedMemorySize:0,unsharedDataSize:0,unsharedStackSize:0,minorPageFault:0,majorPageFault:0,swappedOut:0,fsRead:0,fsWrite:0,ipcSent:0,ipcReceived:0,signalsCount:0,voluntaryContextSwitches:0,involuntaryContextSwitches:0 }),
    activeHandleCount: () => handles,
    activeRequestCount: () => 0,
  };
}

describe('PerformanceSampler', () => {
  it('summarizes deterministic CPU, memory, handles, and movement jitter', () => {
    const sampler = new PerformanceSampler(fakePort(), 10);
    sampler.sample(0); sampler.noteWindowMove(0); sampler.noteWindowMove(16.7);
    sampler.sample(1000); sampler.sample(2000);
    const summary = sampler.summarize();
    expect(summary.sampleCount).toBe(3);
    expect(summary.durationMs).toBe(2000);
    expect(summary.memory.growthBytes).toBeGreaterThanOrEqual(0);
    expect(summary.handles.growth).toBe(0);
    expect(summary.movement.count).toBe(2);
  });

  it('keeps a bounded sample history', () => {
    const sampler = new PerformanceSampler(fakePort(), 2);
    sampler.sample(0); sampler.sample(1000); sampler.sample(2000);
    expect(sampler.snapshot()).toHaveLength(2);
  });
});
