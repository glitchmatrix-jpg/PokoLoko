import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
const root=path.resolve(process.argv[2]??'.'), release=path.join(root,'release'); fs.mkdirSync(release,{recursive:true});
const excluded=new Set(['BUILD_HASHES.txt']);
const files=[]; function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()){if(e.name!=='win-unpacked')walk(p);}else if(!excluded.has(e.name))files.push(p);}}
if(fs.existsSync(release))walk(release);
for(const p of [path.join(root,'package.json'),path.join(root,'public/assets/runtime/runtime_manifest.json'),path.join(root,'archive/source-assets/user-supplied/Poko_Loko_Asset_Pack_v1(1).zip'),path.join(root,'build/pokoloko.ico')])if(fs.existsSync(p))files.push(p);
const lines=[`PokoLoko build hashes generated ${new Date().toISOString()}`,'Algorithm: SHA-256',''];
for(const p of [...new Set(files)].sort()){const h=crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');lines.push(`${h}  ${path.relative(root,p).replaceAll('\\','/')}`)}
fs.writeFileSync(path.join(release,'BUILD_HASHES.txt'),lines.join('
')+'
'); console.log(`Hashed ${files.length} files.`);
