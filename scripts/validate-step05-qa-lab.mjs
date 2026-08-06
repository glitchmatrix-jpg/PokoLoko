import { readFileSync } from 'node:fs';
const files = {
  contracts: readFileSync('electron/preload/contracts.ts','utf8'),
  controller: readFileSync('electron/main/static-pet-controller.ts','utf8'),
  panel: readFileSync('src/diagnostics/DiagnosticControlPanel.tsx','utf8'),
};
const requiredCommands=['force_drag','force_pickup_landing','interrupt_activity','simulate_missed_completion','move_screen_edge','relocate_display'];
for(const command of requiredCommands){
  for(const [name,text] of Object.entries(files)) if(!text.includes(command)) throw new Error(`${command} missing from ${name}`);
}
for(const field of ['pointerScreen','windowTopLeft','dragDistancePx','dragPhase','watchdog','lastCompletionEvent','behaviorDecisionReason']){
  if(!files.contracts.includes(field)||!files.controller.includes(field)||!files.panel.includes(field)) throw new Error(`QA field missing: ${field}`);
}
console.log('Step 5 QA laboratory structural validation passed.');
