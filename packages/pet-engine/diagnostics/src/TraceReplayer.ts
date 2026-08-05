import type { DiagnosticCommand, DiagnosticTrace } from './types.js';
export interface ReplayClock { wait(ms:number): Promise<void>; }
export class TraceReplayer {
  private stopped = false;
  public stop(): void { this.stopped = true; }
  public async replay(trace: DiagnosticTrace, apply:(command:DiagnosticCommand)=>Promise<void>, options:Readonly<{timingScale?:number; maximumEvents?:number}> = {}):Promise<number>{
    this.stopped=false; const events=trace.events.filter((e)=>e.replayCommand).slice(0,options.maximumEvents??200); let count=0; let previous=events[0]?.monotonicMs??0;
    for(const event of events){ if(this.stopped)break; const scale=Math.max(0,options.timingScale??0); const wait=Math.min(1000,Math.max(0,event.monotonicMs-previous)*scale); if(wait>0)await new Promise((r)=>setTimeout(r,wait)); previous=event.monotonicMs; await apply(event.replayCommand!); count+=1; }
    return count;
  }
}
