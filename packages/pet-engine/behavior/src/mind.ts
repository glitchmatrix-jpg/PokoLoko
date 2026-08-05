import { CHARACTER_PROFILES } from './profiles.js';
import type { CharacterId, MindEvent, Mood, PetMind } from './types.js';

const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export function createInitialMind(character: CharacterId): PetMind {
  const b=CHARACTER_PROFILES[character].baseline;
  return {...b,mood:'content',wakeDurationMs:0,interruptionLoad:0};
}

function deriveMood(m: Omit<PetMind,'mood'>): Mood {
  if(m.energy<.25) return 'sleepy';
  if(m.interruptionLoad>.72 || m.recentAttention>.9) return 'saturated';
  if(m.focus>.7 && m.energy>.35) return 'focused';
  if(m.playfulness>.7 && m.energy>.55) return 'playful';
  if(m.curiosity>.72) return 'curious';
  if(m.recentAttention>.5 && m.sociability>.55) return 'socially_warm';
  if(m.comfort<.28) return 'subdued';
  return 'content';
}

export function updateMind(previous: PetMind, event: MindEvent): PetMind {
  let n={...previous};
  if(event.type==='tick') {
    const minutes=Math.min(event.elapsedMs,300_000)/60_000;
    const awake=event.activeKind!=='sleep';
    n.energy=clamp(n.energy + (awake ? -.012*minutes : .12*minutes));
    n.boredom=clamp(n.boredom + (event.activeKind==='remain_idle' ? .035 : -.055)*minutes);
    n.curiosity=clamp(n.curiosity + (event.context.systemIdle ? -.008 : .012)*minutes);
    n.focus=clamp(n.focus + (event.context.typingActivity==='sustained' ? .04 : -.012)*minutes);
    n.playfulness=clamp(n.playfulness + (event.context.audioActive ? .025 : -.006)*minutes);
    n.recentAttention=clamp(n.recentAttention-.09*minutes);
    n.interruptionLoad=clamp(n.interruptionLoad-.045*minutes);
    n.wakeDurationMs=awake?n.wakeDurationMs+event.elapsedMs:n.wakeDurationMs;
  } else if(event.type==='activity_completed') {
    n.boredom=clamp(n.boredom-(event.interrupted?.08:.24));
    n.comfort=clamp(n.comfort+(event.interrupted?-.05:.06));
    n.interruptionLoad=clamp(n.interruptionLoad+(event.interrupted?.18:-.04));
  } else if(event.type==='interaction') {
    n.recentAttention=clamp(n.recentAttention+(event.intensity==='high'?.42:.18));
    n.sociability=clamp(n.sociability+(event.intensity==='high'?.03:.015));
    n.interruptionLoad=clamp(n.interruptionLoad+(event.intensity==='high'?.13:.03));
  } else if(event.type==='woke') {
    n.energy=Math.max(n.energy,.72); n.wakeDurationMs=0; n.curiosity=clamp(n.curiosity+.12);
  } else if(event.type==='slept') {
    n.energy=clamp(n.energy+Math.min(.6,event.elapsedMs/3_600_000*.45)); n.boredom=clamp(n.boredom-.08);
  } else if(event.type==='dragged') {
    n.comfort=clamp(n.comfort-.12); n.interruptionLoad=clamp(n.interruptionLoad+.2); n.recentAttention=clamp(n.recentAttention+.25);
  }
  const { mood: _previousMood, ...withoutMood } = n;
  return {...n,mood:deriveMood(withoutMood)};
}
