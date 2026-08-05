import type { ActivityId, IntentionKind, ScreenRegion, SessionMemory } from './types.js';
export function createSessionMemory(nowMs=0): SessionMemory { return {recentActivities:[],recentTransitions:[],disturbances:[],recentRegions:[],lastWakeAtMs:nowMs}; }
export function rememberActivity(m:SessionMemory,id:ActivityId|IntentionKind,at:number,interrupted=false):SessionMemory { return {...m,recentActivities:[...m.recentActivities,{id,completedAtMs:at,interrupted}].slice(-12)}; }
export function rememberTransition(m:SessionMemory,id:string):SessionMemory { return {...m,recentTransitions:[...m.recentTransitions,id].slice(-16)}; }
export function rememberRegion(m:SessionMemory,r:ScreenRegion):SessionMemory { return {...m,recentRegions:[...m.recentRegions,r].slice(-8)}; }
export function rememberDisturbance(m:SessionMemory,at:number):SessionMemory { return {...m,disturbances:[...m.disturbances,at].filter(x=>at-x<=300_000).slice(-16)}; }
