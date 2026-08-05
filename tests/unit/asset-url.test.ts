import { describe, expect, it } from 'vitest';

function resolveAgainst(assetPath: string, base: string): string {
  return new URL(assetPath.replace(/^\/+/, ''), base).toString();
}

describe('runtime asset URL strategy', () => {
  it('resolves assets under the Vite development origin', () => {
    expect(resolveAgainst('/assets/runtime/poko/frame.png', 'http://localhost:5173/?surface=pet'))
      .toBe('http://localhost:5173/assets/runtime/poko/frame.png');
  });

  it('resolves assets beside packaged index.html', () => {
    expect(resolveAgainst('/assets/runtime/poko/frame.png', 'file:///C:/PokoLoko/resources/app.asar/dist/index.html?surface=pet'))
      .toBe('file:///C:/PokoLoko/resources/app.asar/dist/assets/runtime/poko/frame.png');
  });
});
