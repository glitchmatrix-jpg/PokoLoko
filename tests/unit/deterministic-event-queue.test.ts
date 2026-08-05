import { describe, expect, it } from 'vitest';
import { DeterministicEventQueue } from '../support/DeterministicEventQueue.js';

describe('deterministic event queue',()=>{
 it('preserves insertion order for equal timestamps',()=>{const q=new DeterministicEventQueue<string>();q.enqueue(10,'a');q.enqueue(5,'early');q.enqueue(10,'b');expect(q.drainThrough(10)).toEqual(['early','a','b']);expect(q.size()).toBe(0);});
});
