import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[2]??'.');
const modules=path.join(root,'node_modules');
const out=path.join(root,'release','THIRD_PARTY_LICENSE_INVENTORY.json');
fs.mkdirSync(path.dirname(out),{recursive:true});
const records=[];
function inspect(dir,name){
 const packagePath=path.join(dir,'package.json'); if(!fs.existsSync(packagePath))return;
 try{const p=JSON.parse(fs.readFileSync(packagePath,'utf8')); const licenseFiles=fs.readdirSync(dir).filter(f=>/^(licen[cs]e|copying|notice)/i.test(f)); records.push({name:p.name??name,version:p.version??'unknown',license:p.license??'UNSPECIFIED',licenseFiles});}catch{}
}
if(fs.existsSync(modules)) for(const entry of fs.readdirSync(modules)){if(entry.startsWith('.'))continue;const p=path.join(modules,entry);if(entry.startsWith('@'))for(const child of fs.readdirSync(p))inspect(path.join(p,child),`${entry}/${child}`);else inspect(p,entry);}
records.sort((a,b)=>a.name.localeCompare(b.name));
fs.writeFileSync(out,JSON.stringify({generatedAt:new Date().toISOString(),packages:records},null,2));
console.log(`Collected ${records.length} dependency license records.`);
