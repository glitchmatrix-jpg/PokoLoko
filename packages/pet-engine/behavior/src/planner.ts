import { tuningFor } from '../../tuning/src/index.js';
import { CHARACTER_PROFILES } from './profiles.js';
import { randomRange, SeededRandom } from './random.js';
import type { ActivityId, CandidateScore, PetIntention, PlannerDecision, PlannerInput, RandomSource, ScoreBreakdown, ScreenRegion } from './types.js';

const LEVEL={calm:.7,balanced:1,lively:1.32} as const;
const ACTIVITY_COOLDOWN:Readonly<Record<ActivityId,number>>={drink:180000,eat:360000,laptop:420000,music:360000,peeking:180000,playing_ball:420000,reading:420000};
const lastTime=(input:PlannerInput,key:string)=>[...input.memory.recentActivities].reverse().find(x=>x.id===key)?.completedAtMs;
const recency=(input:PlannerInput,key:string,cooldown:number)=>{const t=lastTime(input,key);if(t===undefined)return 1;const age=input.nowMs-t;if(age<cooldown)return 0;return Math.min(1,.25+(age-cooldown)/cooldown);};
const repeated=(input:PlannerInput,key:string)=>input.memory.recentActivities.at(-1)?.id===key;
const duration=(rng:RandomSource,min:number,max:number,scale:number)=>randomRange(rng,min*scale,max*scale);
function score(base:number, physical:number, context:number, personality:number, drives:number, repetition:number, cooldown:number, activityLevel:number,reasons:string[]):ScoreBreakdown {const finalScore=Math.max(0,base*physical*context*personality*drives*repetition*cooldown*activityLevel);return{base,physical,context,personality,drives,repetition,cooldown,activityLevel,finalScore,reasons};}
function regionChoice(input:PlannerInput,rng:RandomSource):ScreenRegion {const options:(ScreenRegion)[]=['left','center','right'];const recent=input.memory.recentRegions.slice(-2);const available=options.filter(x=>x!==input.currentRegion&&!recent.includes(x));return (available.length?available:options.filter(x=>x!==input.currentRegion))[rng.nextInt(available.length||2)]??'center';}

export class BehaviorPlanner {
  private readonly rng:RandomSource;
  public constructor(seedOrSource:number|RandomSource){this.rng=typeof seedOrSource==='number'?new SeededRandom(seedOrSource):seedOrSource;}
  public decide(input:PlannerInput):PlannerDecision {
    if(input.settings.paused) return {intention:null,seedState:this.rng.state(),candidates:[],reason:'planner-paused'};
    const p=CHARACTER_PROFILES[input.character], level=LEVEL[input.settings.activityLevel], tuning=tuningFor(input.character);
    const candidates:CandidateScore[]=[];
    const add=(key:string,b:ScoreBreakdown,f:(r:RandomSource)=>PetIntention)=>{if(b.finalScore>0)candidates.push({key,breakdown:b,intentionFactory:f});};
    const quiet=input.settings.quietMode||input.context.fullscreenActive||input.context.screenLocked;
    if(input.state==='stable.sleeping') {
      const attention=input.context.recentUserInteraction==='high'?2:1;
      add('wake',score(1,1,attention,1,Math.max(.2,input.mind.energy),1,1,1,['sleeping state allows wake']),r=>({kind:'wake',durationMs:duration(r,800,1800,p.durationScale)}));
    } else {
      add('idle',score(1,1,quiet?1.5:1,p.intentionWeights.idle,.65+input.mind.comfort*.8,repeated(input,'remain_idle')?.65:1,1,input.settings.activityLevel==='lively'?.8:1,['safe neutral option']),r=>{const [min,max]=tuning.behavior.idleHoldMs[input.settings.activityLevel];return {kind:'remain_idle',durationMs:duration(r,min,max,1)};});
      if(!quiet && input.state!=='stable.sitting') add('walk',score(1,1,1,p.intentionWeights.walk,.35+input.mind.energy*.45+input.mind.curiosity*.35+input.mind.boredom*.5,repeated(input,'walk')?.28:1,recency(input,'walk',45000),level,['novelty and boredom support movement']),r=>{const [min,max]=tuning.behavior.walkDurationMs[input.settings.activityLevel];return {kind:'walk',destinationRegion:regionChoice(input,r),durationMs:duration(r,min,max,1)};});
      const sinceWake=input.nowMs-input.memory.lastWakeAtMs;
      const sleepCooldown=sinceWake<tuning.sleep.minimumAwakeAfterWakeMs?0:1;
      add('sleep',score(1,1,input.context.localTimeBand==='late_night'?1.45:input.context.systemIdle?1.2:.8,p.intentionWeights.sleep,Math.max(.05,1-input.mind.energy)*1.5,repeated(input,'sleep')?0:1,sleepCooldown,input.settings.activityLevel==='lively'?.75:1,['energy and time band support rest']),r=>{const [min,max]=tuning.sleep.durationMs[input.settings.activityLevel];return {kind:'sleep',durationMs:duration(r,min,max,1)};});
      if(input.mind.recentAttention>.25 && !quiet) add('social',score(.8,1,1,p.intentionWeights.social,.4+input.mind.sociability+.5*input.mind.recentAttention,repeated(input,'social_reaction')?.2:1,recency(input,'social_reaction',25000),1,['recent attention supports reaction']),r=>({kind:'social_reaction',reaction:input.mind.interruptionLoad>p.interactionSaturation?'annoyed':input.character==='loko'?'subtle':'warm',durationMs:duration(r,900,2400,p.durationScale)}));
      for(const id of input.legalActivities){
        if(quiet && !['reading','laptop','drink'].includes(id)) continue;
        let context=1;const reasons:string[]=[];
        if(id==='laptop'||id==='reading'){context*=input.context.typingActivity==='sustained'?1.8:input.context.typingActivity==='light'?1.25:.8; reasons.push('typing/focus context');}
        if(id==='music'){context*=input.context.audioActive?1.75:.9; reasons.push('audio context');}
        if(id==='playing_ball'||id==='peeking'){context*=input.context.pointerActivity==='busy'?.65:1.1; reasons.push('play context');}
        const drive=id==='reading'||id==='laptop'?.35+input.mind.focus*1.1:id==='playing_ball'||id==='music'?.35+input.mind.playfulness*.9+input.mind.energy*.45:.55+input.mind.boredom*.45;
        const cd=recency(input,id,ACTIVITY_COOLDOWN[id]);
        const integrationMultiplier=input.activityScoreMultipliers?.[id]??1;
        if(integrationMultiplier<=0) continue;
        reasons.push(`integration=${integrationMultiplier.toFixed(2)}`);
        const range=input.activityDurationOverrides?.[id]??[7000,22000] as const;
        add(`activity:${id}`,score(.8,1,context,p.activityWeights[id]*integrationMultiplier,drive,repeated(input,id)?0:1,cd,level,reasons),r=>({kind:'activity',activityId:id,durationMs:duration(r,range[0],range[1],p.durationScale)}));
      }
    }
    candidates.sort((a,b)=>b.breakdown.finalScore-a.breakdown.finalScore);
    if(!candidates.length)return{intention:null,seedState:this.rng.state(),candidates:[],reason:'no-valid-candidate'};
    const total=candidates.reduce((s,c)=>s+c.breakdown.finalScore,0);let roll=this.rng.nextFloat()*total;let winner=candidates.at(-1)!;for(const c of candidates){roll-=c.breakdown.finalScore;if(roll<=0){winner=c;break;}}
    return{intention:winner.intentionFactory(this.rng),seedState:this.rng.state(),candidates:candidates.map(c=>({key:c.key,score:Number(c.breakdown.finalScore.toFixed(4)),reasons:c.breakdown.reasons})),reason:`selected ${winner.key} from ${candidates.length} legal candidates`};
  }
}
