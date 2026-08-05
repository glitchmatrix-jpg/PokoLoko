import { describe, expect, it } from "vitest";
import { BooleanHysteresis, activityBandFromSamples } from "../../packages/pet-engine/context/src/index";

describe("context hysteresis", () => {
  it("requires stable entry and exit samples", () => {
    const value = new BooleanHysteresis(2, 3);
    expect(value.update(true)).toBe(false);
    expect(value.update(true)).toBe(true);
    expect(value.update(false)).toBe(true);
    expect(value.update(false)).toBe(true);
    expect(value.update(false)).toBe(false);
  });

  it("maps short activity histories into coarse bands only", () => {
    expect(activityBandFromSamples([false, false, false])).toBe("none");
    expect(activityBandFromSamples([true, false, false])).toBe("light");
    expect(activityBandFromSamples([true, true, false])).toBe("sustained");
  });
});
