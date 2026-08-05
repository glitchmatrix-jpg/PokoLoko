import { describe, expect, it } from "vitest";
import { ContextSensor, type ContextAvailability, type ContextProvider, type RawContextSample } from "../../packages/pet-engine/context/src/index";

class FakeProvider implements ContextProvider {
  public raw: RawContextSample = { monotonicMs: 0, wallClockHour: 14, cursor: { x: 0, y: 0 }, systemIdleSeconds: 0, typingPulse: false, audioPlaying: false, fullscreenActive: false };
  public availability(): ContextAvailability { return { typingPresence: "available", mouseActivity: "available", systemIdle: "available", timeOfDay: "available", audioState: "available", fullscreenState: "available", lockAndResume: "available", recentPetInteraction: "available" }; }
  public sample(monotonicMs: number): RawContextSample { return { ...this.raw, monotonicMs }; }
}

function setup() {
  let now = 0;
  const provider = new FakeProvider();
  const sensor = new ContextSensor(provider, { monotonicMs: () => now }, { enabled: true, typingPresence: true, audioState: true });
  return { provider, sensor, setNow(value: number) { now = value; } };
}

describe("ContextSensor", () => {
  it("uses hysteresis instead of thrashing typing state", () => {
    const { provider, sensor, setNow } = setup();
    provider.raw.typingPulse = true;
    for (let i = 1; i <= 3; i++) { setNow(i * 1000); sensor.sampleNow(); }
    expect(sensor.getSnapshot().typingActivity).toBe("sustained");
    provider.raw.typingPulse = false;
    setNow(4000); sensor.sampleNow();
    expect(sensor.getSnapshot().typingActivity).not.toBe("none");
    for (let i = 5; i <= 9; i++) { setNow(i * 1000); sensor.sampleNow(); }
    expect(sensor.getSnapshot().typingActivity).toBe("none");
  });

  it("fully clears influence when privacy is disabled", () => {
    const { provider, sensor, setNow } = setup();
    provider.raw.typingPulse = true; provider.raw.audioPlaying = true; provider.raw.fullscreenActive = true;
    for (let i = 1; i <= 4; i++) { setNow(i * 1000); sensor.sampleNow(); }
    sensor.updateSettings({ enabled: false });
    const value = sensor.getSnapshot();
    expect(value.enabled).toBe(false);
    expect(value.typingActivity).toBe("none");
    expect(value.audioActive).toBe(false);
    expect(value.fullscreenActive).toBe(false);
    expect(Object.values(value.availability).every((item) => item === "disabled")).toBe(true);
  });

  it("keeps recent interaction short lived and session local", () => {
    const { sensor, setNow } = setup();
    setNow(1000); sensor.notePetInteraction();
    expect(sensor.getSnapshot().recentPetInteraction).toBe("high");
    setNow(7000); sensor.sampleNow();
    expect(sensor.getSnapshot().recentPetInteraction).toBe("light");
    setNow(25000); sensor.sampleNow();
    expect(sensor.getSnapshot().recentPetInteraction).toBe("none");
  });

  it("treats typing as probability context, not an action command", () => {
    const { provider, sensor, setNow } = setup();
    provider.raw.typingPulse = true;
    for (let i = 1; i <= 4; i++) { setNow(i * 1000); sensor.sampleNow(); }
    const snapshot = sensor.getSnapshot();
    expect(snapshot.typingActivity).toBe("sustained");
    expect("activityId" in snapshot).toBe(false);
  });
});
