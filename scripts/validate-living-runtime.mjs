import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root=path.resolve(process.argv[2]??'.');
const required=[
 'packages/pet-engine/orchestration/src/LivingRuntimeController.ts',
 'packages/pet-engine/orchestration/src/types.ts',
 'tests/living-runtime/living-runtime.test.ts',
 'docs/runtime/LIVING_RUNTIME_ORCHESTRATION.md',
 'docs/qa/STAGES_01_20_5_INTEGRATION_AUDIT.md'
];
const failures=[];
for(const rel of required){if(!fs.existsSync(path.join(root,rel)))failures.push(`missing ${rel}`);}
const controller=fs.readFileSync(path.join(root,'electron/main/static-pet-controller.ts'),'utf8');
for(const term of ['LivingRuntimeController','updateContext(snapshot','onSocialInput','onDragStarted','onMovementFinished','onAnimationEvent']) if(!controller.includes(term)) failures.push(`StaticPetController missing integration: ${term}`);
const runtime=fs.readFileSync(path.join(root,'packages/pet-engine/orchestration/src/LivingRuntimeController.ts'),'utf8');
for(const term of ['BehaviorPlanner','updateMind','ActivityController','SleepLifecycleController','SocialInteractionController','buildPlannerOverlay']) if(!runtime.includes(term)) failures.push(`Living runtime missing system: ${term}`);
const main=fs.readFileSync(path.join(root,'electron/main/main.ts'),'utf8');
for(const term of ['staticPet?.updateContext(effective)','set_pet_paused','set_quiet_mode','pet:get-living-runtime']) if(!main.includes(term)) failures.push(`main integration missing: ${term}`);
const register=JSON.parse(fs.readFileSync(path.join(root,'docs/qa/STAGES_01_20_ISSUE_REGISTER.json'),'utf8'));
for(const id of ['QA-CRIT-01','QA-CRIT-02']) if(register.critical.find((x)=>x.id===id)?.open!==false) failures.push(`${id} not closed`);
if(register.step21Allowed!==true) failures.push('Step 21 gate remains closed');
if(failures.length){console.error('STEP 20.5 VALIDATION FAILED');for(const f of failures)console.error('-',f);process.exit(1);}
console.log('Step 20.5 living-runtime structural validation passed');
