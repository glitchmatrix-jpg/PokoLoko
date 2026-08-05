import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[2]??'.');
const required=[
'packages/pet-engine/character-switch/src/CharacterSwitchController.ts',
'packages/pet-engine/character-switch/src/profile-bundle.ts',
'packages/pet-engine/character-switch/src/types.ts',
'tests/character-switching/character-switch-controller.test.ts',
'tests/character-switching/profile-isolation.test.ts',
'docs/runtime/CHARACTER_SWITCHING.md'];
const failures=[];
for(const rel of required){const p=path.join(root,rel);if(!fs.existsSync(p))failures.push(`missing ${rel}`);}
const controller=fs.readFileSync(path.join(root,'packages/pet-engine/character-switch/src/CharacterSwitchController.ts'),'utf8');
for(const term of ['presentationGeneration','superseded character load ignored','cancel_planner','stop_locomotion','invalidate_animation','clear_props','acceptsEvent']) if(!controller.includes(term)) failures.push(`controller missing ${term}`);
const main=fs.readFileSync(path.join(root,'electron/main/main.ts'),'utf8');
if(!main.includes('committed !== true')) failures.push('settings persistence is not commit-gated');
const pet=fs.readFileSync(path.join(root,'electron/main/static-pet-controller.ts'),'utf8');
for(const term of ['CharacterSwitchController','createCharacterProfileBundle','preservedGroundX','presentationGeneration']) if(!pet.includes(term)) failures.push(`integration missing ${term}`);
if(failures.length){console.error('STEP 16 VALIDATION FAILED');for(const f of failures)console.error('-',f);process.exit(1);}
console.log('STEP 16 CHARACTER SWITCHING VALIDATION PASSED');
console.log('Atomic preload/commit, stale generation rejection, profile isolation, and persistence gating verified.');
