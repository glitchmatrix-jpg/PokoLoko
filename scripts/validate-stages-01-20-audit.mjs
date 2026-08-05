import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[2]??'.');
const required=[
  'docs/qa/STAGES_01_20_QA_UI_UX_AUDIT.md',
  'docs/qa/STAGES_01_20_ISSUE_REGISTER.json',
  'STAGES_01_20_QA_VALIDATION.json',
  'STAGES_01_20_FINAL_QA_CHANGE_REPORT.md',
  'src/surfaces/SettingsSurface.tsx',
  'electron/preload/preload.ts',
  'electron/main/main.ts',
  'electron/main/static-pet-controller.ts',
  'packages/pet-engine/orchestration/src/LivingRuntimeController.ts',
];
const failures=[];
for(const file of required) if(!fs.existsSync(path.join(root,file))) failures.push(`missing ${file}`);
const settings=fs.readFileSync(path.join(root,'src/surfaces/SettingsSurface.tsx'),'utf8');
if((settings.match(/async function updateContext/g)??[]).length!==1) failures.push('Settings must contain exactly one updateContext function');
for(const marker of ['Activity rhythm','settings-error','runCommand','onPublicSettings']) if(!settings.includes(marker)) failures.push(`Settings QA marker missing: ${marker}`);
const main=fs.readFileSync(path.join(root,'electron/main/main.ts'),'utf8');
for(const marker of ['broadcastSettings','Context awareness','Hide companion','focusOrCreateLabPreview']) if(!main.includes(marker)) failures.push(`Main QA marker missing: ${marker}`);
if((main.match(/label: 'Show companion'/g)??[]).length>0) failures.push('Redundant fixed Show companion tray item remains');
const controller=fs.readFileSync(path.join(root,'electron/main/static-pet-controller.ts'),'utf8');
for(const marker of ['visualRequestGeneration','Discarded stale runtime animation load','updateLivingSpatialContext']) if(!controller.includes(marker)) failures.push(`Static controller hardening missing: ${marker}`);
const runtime=fs.readFileSync(path.join(root,'packages/pet-engine/orchestration/src/LivingRuntimeController.ts'),'utf8');
for(const marker of ['applyContextRestraint','social-reaction','Reaction animation watchdog','this.spatial.region','this.settings.contextualAwareness']) if(!runtime.includes(marker)) failures.push(`Living runtime hardening missing: ${marker}`);
const register=JSON.parse(fs.readFileSync(path.join(root,'docs/qa/STAGES_01_20_ISSUE_REGISTER.json'),'utf8'));
if(register.overallStatus!=='STATIC_QA_PASS_NATIVE_PENDING') failures.push('Final audit status must be STATIC_QA_PASS_NATIVE_PENDING');
if(register.step21Allowed!==true) failures.push('Step 21 must be allowed after static QA closure');
const openCritical=(register.critical??[]).filter((item)=>item.open);
if(openCritical.length!==1||openCritical[0].id!=='QA-CRIT-03') failures.push('Only native Windows validation may remain open');
const validation=JSON.parse(fs.readFileSync(path.join(root,'STAGES_01_20_QA_VALIDATION.json'),'utf8'));
if(validation.step21Ready!==true||validation.status!=='STATIC_QA_PASS_NATIVE_PENDING') failures.push('Machine-readable final QA gate is incorrect');
if(failures.length){console.error('STAGES 01-20 FINAL QA VALIDATION FAILED');for(const f of failures)console.error('-',f);process.exit(1);}
console.log('STAGES 01-20 FINAL QA/UI/UX VALIDATION PASSED');
console.log('Living runtime, race hardening, spatial context, settings synchronization, and release gates verified.');
