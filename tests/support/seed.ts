export function deterministicSequence(seed: number, count: number): number[] {
  let state=seed>>>0; const values:number[]=[];
  for(let i=0;i<count;i+=1){ state=(Math.imul(state,1664525)+1013904223)>>>0; values.push(state/4294967296); }
  return values;
}
