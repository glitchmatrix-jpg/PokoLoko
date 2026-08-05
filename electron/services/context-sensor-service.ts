import { BrowserWindow, powerMonitor, screen } from "electron";
import { ContextSensor, type ContextAvailability, type ContextPrivacySettings, type ContextProvider, type PetContextSnapshot, type RawContextSample } from "../../packages/pet-engine/context/src/index.js";
import type { Logger } from "./logger.js";

class ElectronContextProvider implements ContextProvider {
  public availability(): ContextAvailability {
    return {
      typingPresence: "unavailable",
      mouseActivity: "available",
      systemIdle: "available",
      timeOfDay: "available",
      audioState: "unavailable",
      fullscreenState: "available",
      lockAndResume: "available",
      recentPetInteraction: "available",
    };
  }

  public sample(monotonicMs: number): RawContextSample {
    const now = new Date();
    return {
      monotonicMs,
      wallClockHour: now.getHours(),
      cursor: screen.getCursorScreenPoint(),
      systemIdleSeconds: powerMonitor.getSystemIdleTime(),
      // Electron can safely identify only PokoLoko's own fullscreen windows here.
      // A future approved platform adapter may provide global fullscreen presence.
      fullscreenActive: BrowserWindow.getAllWindows().some((window) => window.isFullScreen()),
    };
  }
}

export class ContextSensorService {
  private readonly sensor: ContextSensor;
  private timer: NodeJS.Timeout | undefined;
  private unsubscribe: (() => void) | undefined;

  public constructor(private readonly logger: Logger, settings: ContextPrivacySettings) {
    this.sensor = new ContextSensor(new ElectronContextProvider(), { monotonicMs: () => performance.now() }, settings);
  }

  public start(onSnapshot: (snapshot: PetContextSnapshot) => void): void {
    this.stop();
    this.unsubscribe = this.sensor.subscribe((event) => {
      this.logger.debug("Context changed", { fields: event.changedFields, generation: event.generation });
      onSnapshot(event.current);
    });
    if (this.sensor.getSettings().enabled) this.timer = setInterval(() => this.sensor.sampleNow(), 1_000);
    onSnapshot(this.sensor.getSnapshot());
  }

  public stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  public updateSettings(settings: ContextPrivacySettings): PetContextSnapshot {
    const wasEnabled = this.sensor.getSettings().enabled;
    const snapshot = this.sensor.updateSettings(settings);
    const isEnabled = settings.enabled;
    if (!wasEnabled && isEnabled && !this.timer) this.timer = setInterval(() => this.sensor.sampleNow(), 1_000);
    if (wasEnabled && !isEnabled && this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    return snapshot;
  }

  public getSnapshot(): PetContextSnapshot { return this.sensor.getSnapshot(); }
  public notePetInteraction(monotonicMs?: number): void { this.sensor.notePetInteraction(monotonicMs); }
  public noteLock(locked: boolean): void { this.sensor.noteLock(locked); }
  public noteResume(): void { this.sensor.noteResume(); }
}
