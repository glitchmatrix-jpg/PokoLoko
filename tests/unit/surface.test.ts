import { describe, expect, it } from 'vitest';
import { readSurface } from '../../src/shared/surface';

describe('readSurface', () => {
  it('defaults to pet', () => expect(readSurface('')).toBe('pet'));
  it('accepts utility surfaces', () => {
    expect(readSurface('?surface=settings')).toBe('settings');
    expect(readSurface('?surface=diagnostics')).toBe('diagnostics');
    expect(readSurface('?surface=lab-preview')).toBe('lab-preview');
  });
  it('rejects unknown surfaces', () => expect(readSurface('?surface=legacy')).toBe('pet'));
});
