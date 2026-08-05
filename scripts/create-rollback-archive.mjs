import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
const root=path.resolve(process.argv[2]??'.'),release=path.join(root,'release');const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));const out=path.join(release,`PokoLoko-Rollback-${pkg.version}.zip`);
const staging=path.join(release,'.rollback-staging');fs.rmSync(staging,{recursive:true,force:true});fs.mkdirSync(staging,{recursive:true});
for(const name of ['package.json','package-lock.release.json','RELEASE_NOTES.md','THIRD_PARTY_NOTICES.md','LICENSE','BUILD_HASHES.txt']){const source=name==='BUILD_HASHES.txt'?path.join(release,name):path.join(root,name);if(fs.existsSync(source))fs.copyFileSync(source,path.join(staging,name));}
for(const name of ['win-unpacked']){const source=path.join(release,name);if(fs.existsSync(source))fs.cpSync(source,path.join(staging,name),{recursive:true});}
for(const f of fs.readdirSync(release)){if(f.endsWith('.exe'))fs.copyFileSync(path.join(release,f),path.join(staging,f));}
fs.writeFileSync(path.join(staging,'RESTORE.md'),`# Rollback restoration

1. Uninstall the current PokoLoko build.
2. Run the archived installer, or launch the archived portable executable.
3. User settings are preserved by default in Electron userData.
4. To reset behavior, use Settings → Reset to defaults.
5. Verify BUILD_HASHES.txt before restoration.
`);
const ps=spawnSync('powershell',['-NoProfile','-Command',`Compress-Archive -Path '${staging}\*' -DestinationPath '${out}' -Force`],{stdio:'inherit'});if(ps.status!==0)throw new Error('Rollback archive creation failed.');fs.rmSync(staging,{recursive:true,force:true});console.log(out);
