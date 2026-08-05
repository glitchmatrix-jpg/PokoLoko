import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[2] ?? '.');
const required=[
'packages/pet-engine/state-machine/src/types.ts','packages/pet-engine/state-machine/src/stateGraph.ts',
'packages/pet-engine/state-machine/src/routes.ts','packages/pet-engine/state-machine/src/PetStateMachine.ts',
'packages/pet-engine/state-machine/src/index.ts','tests/state-machine/state-machine.test.ts',
'tests/state-machine/transition-matrix.test.ts','docs/runtime/STATE_GRAPH.md','docs/runtime/TRANSITION_FALLBACKS.md'];
const fail=[];
for(const f of required){const p=path.join(root,f);if(!fs.existsSync(p))fail.push(`missing ${f}`);else if(fs.statSync(p).size<100)fail.push(`too short ${f}`)}
const combined=required.filter(f=>fs.existsSync(path.join(root,f))).map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
for(const term of ['ANIMATION_COMPLETED','DESTINATION_REACHED','generation','activity-prop-safe-exit','locked-transition-must-complete','interaction.dragged','system.suspended','transition.activity_exit']) if(!combined.includes(term)) fail.push(`missing concept ${term}`);
if(/setTimeout\s*\(/.test(fs.readFileSync(path.join(root,'packages/pet-engine/state-machine/src/PetStateMachine.ts'),'utf8'))) fail.push('state machine contains setTimeout');
if(fail.length){console.error('STEP 12 VALIDATION FAILED');for(const f of fail)console.error('-',f);process.exit(1)}
console.log('STEP 12 STATE MACHINE VALIDATION PASSED');console.log(`${required.length} implementation/test/document files verified`);
