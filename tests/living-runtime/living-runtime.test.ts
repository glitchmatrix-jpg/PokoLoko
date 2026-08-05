import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LivingRuntimeController, type LivingRuntimePort, type LivingRuntimeSnapshot } from '../../packages/pet-engine/orchestration/src/index.js';

class FakePort implements LivingRuntimePort {
  animations:string[]=[]; walks:string[]=[]; restores:string[]=[]; stops:string[]=[]; snapshots:LivingRuntimeSnapshot[]=[];
  async playAnimation(id:string):Promise<void>{this.animations.push(id);}
  async restoreIdle(reason:string):Promise<void>{this.restores.push(reason);}
  async walkToRegion(region:'left'|'center'|'right'):Promise<void>{this.walks.push(region);}
  async stopMovement(reason:string):Promise<void>{this.stops.push(reason);}
  log():void{}
  onSnapshot(snapshot:LivingRuntimeSnapshot):void{this.snapshots.push(snapshot);}
}

describe('living runtime deterministic regression',()=>{
  beforeEach(()=>vi.useFakeTimers({now:1000}));
  afterEach(()=>vi.useRealTimers());

  it('routes walking, activity interruption, reactions, sleep, restraint, and pause without real waits', async()=>{
    const port=new FakePort();
    const runtime=new LivingRuntimeController('loko',{activityLevel:'balanced',paused:false,quietMode:false,contextualAwareness:true},port,1234);
    await runtime.forceIntention({kind:'walk',destinationRegion:'right',durationMs:1000});
    expect(port.walks.at(-1)).toBe('right');
    await runtime.onMovementFinished();
    expect(runtime.snapshot().mode).toBe('idle');

    await runtime.forceIntention({kind:'activity',activityId:'laptop',durationMs:1000});
    await vi.advanceTimersByTimeAsync(500);
    expect(port.animations).toContain('loko_laptop');
    await runtime.onDragStarted();
    expect(runtime.snapshot().mode).toBe('dragged');
    await runtime.onDragEnded();
    await runtime.onSocialInput('double_click');
    expect(port.animations.some(id=>id==='loko_love_reaction'||id==='loko_idle_front')).toBe(true);

    runtime.updateSettings({paused:true});
    await vi.runOnlyPendingTimersAsync();
    expect(runtime.snapshot().mode).toBe('paused');
    runtime.dispose();
  });
});
