import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { inflateSync } from 'node:zlib';

type Manifest = {
  generatedFrom: { archiveSha256: string; canvas: { width: number; height: number } };
  counts: { animations: number; frames: number; mirroredAnimations: number };
  animations: Array<{
    id: string; character: 'poko'|'loko'; frames: string[]; frameCount: number;
    generatedByMirroring: boolean; mirroredFrom: string|null;
    anchor: { ground_x: number; ground_y: number };
    source: { frameSha256: Record<string,string> };
  }>;
};

const PNG = Buffer.from([137,80,78,71,13,10,26,10]);
function sha256(buffer: Buffer): string { return createHash('sha256').update(buffer).digest('hex'); }
function paeth(a:number,b:number,c:number):number { const p=a+b-c, pa=Math.abs(p-a), pb=Math.abs(p-b), pc=Math.abs(p-c); return pa<=pb&&pa<=pc?a:pb<=pc?b:c; }
function parsePng(buffer:Buffer) {
  if (!buffer.subarray(0,8).equals(PNG)) throw new Error('invalid PNG signature');
  let offset=8, width=0, height=0, bitDepth=0, colorType=0; const idat:Buffer[]=[];
  while(offset<buffer.length){ const len=buffer.readUInt32BE(offset); const type=buffer.toString('ascii',offset+4,offset+8); const data=buffer.subarray(offset+8,offset+8+len); offset+=12+len;
    if(type==='IHDR'){ width=data.readUInt32BE(0); height=data.readUInt32BE(4); bitDepth=data[8]??0; colorType=data[9]??0; }
    if(type==='IDAT') idat.push(data); if(type==='IEND') break;
  }
  if(bitDepth!==8||colorType!==6) throw new Error(`expected RGBA8 PNG, got bitDepth=${bitDepth}, colorType=${colorType}`);
  const raw=inflateSync(Buffer.concat(idat)); const stride=width*4; const rows:Buffer[]=[]; let cursor=0;
  for(let y=0;y<height;y++){ const filter=raw[cursor++]!; const src=raw.subarray(cursor,cursor+stride); cursor+=stride; const row=Buffer.alloc(stride); const prior=rows[y-1];
    for(let x=0;x<stride;x++){ const left=x>=4?row[x-4]!:0, up=prior?prior[x]!:0, ul=prior&&x>=4?prior[x-4]!:0; const value=src[x]!; row[x]=filter===0?value:filter===1?(value+left)&255:filter===2?(value+up)&255:filter===3?(value+Math.floor((left+up)/2))&255:filter===4?(value+paeth(left,up,ul))&255:(()=>{throw new Error(`unsupported filter ${filter}`)})(); }
    rows.push(row);
  }
  let transparent=0, visible=0; for(const row of rows) for(let x=3;x<row.length;x+=4){ if(row[x]===0) transparent++; else visible++; }
  return {width,height,transparent,visible};
}

const root=path.resolve(process.argv[2]??process.cwd());
const publicRoot=path.join(root,'public');
const manifestPath=path.join(publicRoot,'assets','runtime','runtime_manifest.json');
const manifest=JSON.parse(await readFile(manifestPath,'utf8')) as Manifest;
const failures:string[]=[]; const ids=new Set<string>(); let frames=0, mirrored=0;
for(const animation of manifest.animations){
  if(ids.has(animation.id)) failures.push(`duplicate animation ID: ${animation.id}`); ids.add(animation.id);
  if(animation.frameCount!==animation.frames.length) failures.push(`${animation.id}: frameCount mismatch`);
  if(animation.generatedByMirroring){ mirrored++; if(!animation.mirroredFrom) failures.push(`${animation.id}: mirrored without source`); }
  if(!Number.isFinite(animation.anchor.ground_x)||!Number.isFinite(animation.anchor.ground_y)) failures.push(`${animation.id}: invalid anchor`);
  for(const [index,url] of animation.frames.entries()){
    const relative=url.replace(/^\//,''); const full=path.join(publicRoot,...relative.split('/')); frames++;
    try { await stat(full); const buffer=await readFile(full); const png=parsePng(buffer);
      if(png.width!==manifest.generatedFrom.canvas.width||png.height!==manifest.generatedFrom.canvas.height) failures.push(`${animation.id}[${index}]: ${png.width}x${png.height}`);
      if(png.transparent===0||png.visible===0) failures.push(`${animation.id}[${index}]: invalid alpha occupancy`);
      const expected=animation.source.frameSha256[path.basename(full)]; if(!expected||sha256(buffer)!==expected) failures.push(`${animation.id}[${index}]: checksum mismatch`);
    } catch(error){ failures.push(`${animation.id}[${index}]: ${error instanceof Error?error.message:String(error)}`); }
  }
}
if(manifest.counts.animations!==manifest.animations.length) failures.push('manifest animation count mismatch');
if(manifest.counts.frames!==frames) failures.push('manifest frame count mismatch');
if(manifest.counts.mirroredAnimations!==mirrored) failures.push('manifest mirrored count mismatch');
if(failures.length){ console.error('Runtime asset validation failed:\n'+failures.map(v=>`- ${v}`).join('\n')); process.exit(1); }
console.log(`Runtime asset validation passed: ${manifest.animations.length} animations, ${frames} RGBA frames, ${mirrored} mirrored sequences.`);
