import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { packagedAssetPath } from './asset-paths.js';
import { Logger } from './logger.js';

type RuntimeManifestSummary = { counts: { animations: number; frames: number }; animations: Array<{ id: string; frames: string[] }> };

export async function validateRuntimeAssetsAtStartup(logger: Logger): Promise<void> {
  if (process.env.NODE_ENV === 'production' && process.env.POKOLOKO_VALIDATE_ASSETS !== '1') return;
  const manifestPath = packagedAssetPath('assets', 'runtime', 'runtime_manifest.json');
  let manifest: RuntimeManifestSummary;
  try { manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as RuntimeManifestSummary; }
  catch (error) { throw new Error(`Runtime asset manifest could not be read at ${manifestPath}`, { cause: error }); }
  const failures: string[] = [];
  for (const animation of manifest.animations) {
    for (const frameUrl of animation.frames) {
      const relative = frameUrl.replace(/^\//, '');
      const framePath = packagedAssetPath(...relative.split('/'));
      try { await readFile(framePath); } catch { failures.push(`${animation.id}: missing ${path.basename(framePath)}`); }
    }
  }
  if (failures.length > 0) throw new Error(`Runtime asset integrity failed:\n${failures.slice(0, 25).join('\n')}`);
  logger.info('Runtime asset startup integrity passed', manifest.counts);
}
