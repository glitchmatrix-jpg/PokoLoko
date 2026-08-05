import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[2]??'.');
const required=['src/diagnostics/animation-lab/AnimationLab.tsx','src/diagnostics/animation-lab/AnimationViewport.tsx','src/diagnostics/animation-lab/TransparentPreview.tsx','src/diagnostics/animation-lab/player.ts','src/diagnostics/animation-lab/transitionComposer.ts','public/assets/diagnostics/animation_metrics.json','docs/visual/ANIMATION_LAB_GUIDE.md','docs/visual/TRANSITION_CHAIN_REVIEWS.md','docs/visual/REJECTED_RUNTIME_SEQUENCES.md'];
const failures=[]; for(const file of required){const full=path.join(root,file);if(!fs.existsSync(full)||fs.statSync(full).size===0)failures.push(`missing or empty: ${file}`);}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'public/assets/runtime/runtime_manifest.json'),'utf8'));
const metrics=JSON.parse(fs.readFileSync(path.join(root,'public/assets/diagnostics/animation_metrics.json'),'utf8'));
for(const animation of manifest.animations){if(!metrics[animation.id])failures.push(`missing metrics: ${animation.id}`);else if(metrics[animation.id].frames.length!==animation.frameCount)failures.push(`metrics frame mismatch: ${animation.id}`);}
const source=required.filter(f=>/\.(ts|tsx)$/.test(f)).map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n') + '\n' + fs.readFileSync(path.join(root,'src/styles.css'),'utf8');
for(const token of ['image-rendering','128','frameAtElapsed','reviewChain','ground','body_center'])if(!source.includes(token))failures.push(`lab capability missing: ${token}`);
if(failures.length){console.error('ANIMATION LAB VALIDATION FAILED\n'+failures.map(x=>`- ${x}`).join('\n'));process.exit(1);}console.log(`ANIMATION LAB VALIDATION PASSED: ${manifest.animations.length} animations and ${manifest.counts.frames} frames covered.`);
