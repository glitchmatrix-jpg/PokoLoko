import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[2]??'.');
const required=[
 'packages/pet-engine/sleep/src/types.ts','packages/pet-engine/sleep/src/profiles.ts',
 'packages/pet-engine/sleep/src/dailyRhythm.ts','packages/pet-engine/sleep/src/SleepLifecycleController.ts',
 'tests/sleep-wake/sleep-lifecycle.test.ts','tests/sleep-wake/daily-rhythm.test.ts',
 'docs/behavior/SLEEP_AND_DAILY_RHYTHM.md'
];
for(const f of required){if(!fs.existsSync(path.join(root,f)))throw new Error(`Missing ${f}`)}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'public/assets/runtime/runtime_manifest.json'),'utf8'));
const ids=new Set(manifest.animations.map(a=>a.id));
for(const id of ['poko_sleep_transition','poko_sleep_loop_01','poko_sleep_loop_02','loko_sleep_transition','loko_sleep_loop']){
 if(!ids.has(id))throw new Error(`Missing sleep asset ${id}`);
}
const profiles=fs.readFileSync(path.join(root,'packages/pet-engine/sleep/src/profiles.ts'),'utf8');
if(!profiles.includes("primaryLoopAnimationId: 'poko_sleep_loop_02'"))throw new Error('Poko primary quiet loop not locked');
if(!profiles.includes("wakeStrategy: 'lying_hold_then_neutral'"))throw new Error('Loko unsafe reverse wake was not prevented');
const controller=fs.readFileSync(path.join(root,'packages/pet-engine/sleep/src/SleepLifecycleController.ts'),'utf8');
for(const marker of ['stale animation completion','disable_locomotion','SLEEP_DEADLINE_REACHED','SYSTEM_RESUMED','DRAG_STARTED']){
 if(!controller.includes(marker))throw new Error(`Controller missing ${marker}`);
}
console.log('Step 15 sleep/wake validation passed');
console.log('5 authoritative sleep assets verified');
console.log('entry completion, wake recovery, drag, and suspend paths present');
