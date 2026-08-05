import { describe, expect, it } from 'vitest';
import { ACTIVITY_IDS, PetStateMachine } from '../../packages/pet-engine/state-machine/src/index.js';

describe('legal activity routes', () => {
  for (const activityId of ACTIVITY_IDS) {
    it(`routes ${activityId} through activity entry`, () => {
      const m=new PetStateMachine('poko');
      m.request({requestId:'boot',target:{kind:'idle'},reason:'test',monotonicMs:1});
      const result=m.request({requestId:activityId,target:{kind:'activity',activityId},reason:'test',monotonicMs:2});
      expect(result.log.route).toContain('transition.activity_entry');
      expect(result.log.route).toContain(`activity.${activityId}`);
    });
  }
});
