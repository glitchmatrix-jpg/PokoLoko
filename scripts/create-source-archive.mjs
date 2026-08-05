import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
const root=path.resolve(process.argv[2]??'.'),release=path.join(root,'release');fs.mkdirSync(release,{recursive:true});
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));const out=path.join(release,`PokoLoko-Source-${pkg.version}.zip`);
const staging=path.join(release,'.source-staging');fs.rmSync(staging,{recursive:true,force:true});fs.mkdirSync(staging,{recursive:true});
const target=path.join(staging,'PokoLoko');
fs.cpSync(root,target,{recursive:true,filter:(src)=>{const rel=path.relative(root,src).replaceAll('\\','/');return !(rel==='node_modules'||rel.startsWith('node_modules/')||rel==='release'||rel.startsWith('release/')||rel==='dist'||rel.startsWith('dist/')||rel==='dist-electron'||rel.startsWith('dist-electron/'));}});
const ps=spawnSync('powershell',['-NoProfile','-Command',`Compress-Archive -Path '${target}' -DestinationPath '${out}' -Force`],{stdio:'inherit'});if(ps.status!==0)throw new Error('Source archive creation failed.');fs.rmSync(staging,{recursive:true,force:true});console.log(out);
